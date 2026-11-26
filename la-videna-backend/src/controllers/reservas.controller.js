// la-videna-backend/src/controllers/reservas.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/canchas -> Lee las canchas desde PostgreSQL
export const listarCanchas = async (req, res) => {
    try {
        const canchas = await prisma.cancha.findMany({
            where: { estado_operativo: 'ACTIVA' },
            orderBy: { id_cancha: 'asc' }
        });
        res.json({ success: true, data: canchas });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Error al consultar las canchas en PostgreSQL.',
            detalle: error.message
        });
    }
};

// GET /api/v1/reservas -> Lee todas las reservas reales con estructura completa para PortalReservas
export const listarReservas = async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany({
            include: {
                usuario: true,
                cancha: true
            },
            orderBy: { creado_en: 'desc' }
        });

        const formateadas = reservas.map((r) => {
            const precioTotal = Number(r.precio_total || 0);
            const duracion = Number(r.duracion_horas || 1);
            const horaNum = parseInt(String(r.hora_inicio || '00:00').split(':')[0], 10);
            const esNoche = horaNum >= 18 || horaNum < 6;

            return {
                id: r.id_reserva,
                codigo: r.codigo_ticket,
                estado: r.estado,
                cliente: {
                    nombreCompleto: r.usuario?.nombre_completo || 'Cliente',
                    telefono: r.usuario?.telefono || '900000000'
                },
                detallesReserva: {
                    instalacionId: r.cancha?.codigo_interno || 'futsal1',
                    instalacionNombre: r.cancha?.nombre || 'Cancha La Videna',
                    fechaProgramada: r.fecha_programada,
                    horaInicio: r.hora_inicio,
                    horaFin: r.hora_fin,
                    duracionHoras: duracion,
                    inicioTimestamp: Number(r.inicio_timestamp),
                    finTimestamp: Number(r.fin_timestamp)
                },
                facturacion: {
                    desgloseHoras: {
                        horasDia: esNoche ? 0 : duracion,
                        horasNoche: esNoche ? duracion : 0
                    },
                    horasDia: esNoche ? 0 : duracion,
                    horasNoche: esNoche ? duracion : 0,
                    costoDia: esNoche ? 0 : precioTotal,
                    costoNoche: esNoche ? precioTotal : 0,
                    precioTotal: precioTotal,
                    moneda: 'PEN'
                },
                auditoria: {
                    fechaCreacion: r.creado_en,
                    fechaCreacionFormateada: new Date(r.creado_en).toLocaleString('es-PE')
                }
            };
        });

        res.json({ success: true, data: formateadas });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Error al obtener las reservas desde PostgreSQL.',
            detalle: error.message
        });
    }
};

// POST /api/v1/reservas -> Valida cruces de horario en BD y guarda la reserva
export const crearReserva = async (req, res) => {
    try {
        const body = req.body;
        const d = body?.detallesReserva;
        const c = body?.cliente;
        const f = body?.facturacion;

        if (!d || !c || !f || !d.instalacionId || !d.fechaProgramada || !d.horaInicio) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'Datos incompletos para procesar la reserva.'
            });
        }

        // Validar que la fecha y hora de inicio no estén en el pasado (hora local Perú UTC-5)
        const fechaHoraInicio = new Date(`${d.fechaProgramada}T${d.horaInicio}:00-05:00`);
        if (isNaN(fechaHoraInicio.getTime()) || fechaHoraInicio.getTime() < Date.now() - 2 * 60 * 1000) {
            return res.status(400).json({
                success: false,
                error: 'PAST_DATETIME',
                message: 'No es posible registrar una reserva en una fecha u hora que ya pasó.'
            });
        }

        // 1. Buscar la cancha en PostgreSQL por su código ('futsal1', 'futsal2', 'voley-basquet')
        const canchaDB = await prisma.cancha.findUnique({
            where: { codigo_interno: d.instalacionId }
        });

        if (!canchaDB) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: `La cancha '${d.instalacionId}' no existe en la base de datos.`
            });
        }

        // 2. Verificar cruce de horario directamente en PostgreSQL
        const nuevoInicio = BigInt(d.inicioTimestamp);
        const nuevoFin = BigInt(d.finTimestamp);

        const conflicto = await prisma.reserva.findFirst({
            where: {
                id_cancha: canchaDB.id_cancha,
                estado: { not: 'CANCELADA' },
                AND: [
                    { inicio_timestamp: { lt: nuevoFin } },
                    { fin_timestamp: { gt: nuevoInicio } }
                ]
            }
        });

        if (conflicto) {
            return res.status(409).json({
                success: false,
                error: 'SCHEDULE_CONFLICT',
                message: `Cruce de horario con la reserva ${conflicto.codigo_ticket} (${conflicto.hora_inicio} - ${conflicto.hora_fin}).`
            });
        }

        // 3. Buscar o registrar automáticamente al cliente en la tabla usuarios
        let usuarioDB = await prisma.usuario.findFirst({
            where: { telefono: c.telefono }
        });

        if (!usuarioDB) {
            usuarioDB = await prisma.usuario.create({
                data: {
                    nombre_completo: c.nombreCompleto,
                    telefono: c.telefono,
                    rol: 'CLIENTE'
                }
            });
        }

        // 4. Insertar la reserva definitiva en la tabla reservas
        const reservaGuardada = await prisma.reserva.create({
            data: {
                codigo_ticket: String(body.codigo || `VID-${Date.now()}`).slice(0, 25),
                id_usuario: usuarioDB.id_usuario,
                id_cancha: canchaDB.id_cancha,
                fecha_programada: d.fechaProgramada,
                hora_inicio: d.horaInicio,
                hora_fin: d.horaFin,
                duracion_horas: d.duracionHoras,
                inicio_timestamp: nuevoInicio,
                fin_timestamp: nuevoFin,
                precio_total: f.precioTotal,
                estado: body.estado || 'CONFIRMADA'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Reserva guardada exitosamente en PostgreSQL.',
            data: { ...body, id: reservaGuardada.id_reserva }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Error interno al guardar la reserva en PostgreSQL.',
            detalle: error.message
        });
    }
};

// DELETE /api/v1/reservas/:id -> Elimina la reserva de PostgreSQL
export const eliminarReserva = async (req, res) => {
    try {
        const idNum = Number(req.params.id);
        await prisma.reserva.delete({
            where: { id_reserva: idNum }
        });
        res.json({ success: true, message: 'Reserva eliminada de PostgreSQL.' });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'NOT_FOUND',
            message: 'No se encontró la reserva solicitada para eliminar.'
        });
    }
};
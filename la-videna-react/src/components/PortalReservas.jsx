
import { useAuth } from '../context/AuthContext';
import { useState, useMemo, useEffect } from 'react';
import {
    REGEX_CELULAR_PERU,
    obtenerFechaLocalISO,
    calcularCotizacion,
    generarUrlWhatsApp,
    imprimirTicketReserva
} from '../utils/motorReservas';

const DURACIONES_RAPIDAS = [1, 1.5, 2, 3];

export default function PortalReservas({
    reservas,
    canchaActiva,
    setCanchaActiva,
    pestanaActiva,
    setPestanaActiva,
    onAgregarReserva,
    onEliminarReserva,
    onVaciarReservas
}) {

    const { usuario } = useAuth();

    const reservasVisibles = !usuario
        ? []
        : usuario.rol === 'ADMIN'
            ? reservas
            : reservas.filter(
                (r) =>
                    r.cliente?.telefono === usuario.telefono ||
                    r.cliente?.nombreCompleto?.toLowerCase() === usuario.nombreCompleto?.toLowerCase()
            );

    const hoyISO = useMemo(() => obtenerFechaLocalISO(), []);

    const [nombre, setNombre] = useState('');
    const [celular, setCelular] = useState('');
    const [fecha, setFecha] = useState(hoyISO);
    const [horaInicio, setHoraInicio] = useState('19:00');
    const [duracion, setDuracion] = useState(2);
    const [comentarios, setComentarios] = useState('');
    const [ultimaCreada, setUltimaCreada] = useState(null);

    const [filtroFecha, setFiltroFecha] = useState(hoyISO);
    const [filtroCancha, setFiltroCancha] = useState('todas');

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombreCompleto || '');
            setCelular(usuario.telefono || '');
        }
    }, [usuario]);

    const manejarCambioCelular = (e) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 9);
        setCelular(soloNumeros);
    };

    const estadoCelular = useMemo(() => {
        if (celular.length === 0) {
            return { valido: false, claseInput: '', claseTexto: 'texto-validacion', mensaje: 'Debe iniciar con 9 y tener 9 dígitos.' };
        }
        if (!celular.startsWith('9')) {
            return { valido: false, claseInput: 'input-error', claseTexto: 'texto-validacion error', mensaje: '✖ En Perú los celulares deben empezar con el número 9.' };
        }
        if (celular.length < 9) {
            return { valido: false, claseInput: 'input-error', claseTexto: 'texto-validacion error', mensaje: `Faltan ${9 - celular.length} dígito(s) (${celular.length}/9).` };
        }
        return { valido: true, claseInput: 'input-valido', claseTexto: 'texto-validacion valido', mensaje: '✔ Número de celular peruano válido.' };
    }, [celular]);

    const cotizacion = useMemo(() => {
        return calcularCotizacion(canchaActiva, fecha, horaInicio, parseFloat(duracion), reservas);
    }, [canchaActiva, fecha, horaInicio, duracion, reservas]);

    // 1. Validación de hora pasada para hoy
    const ahora = new Date();
    const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const esFechaPasada = Boolean(fecha && horaInicio && fecha === hoyISO && horaInicio < horaActualStr);

    const manejarSubmit = (e) => {

        if (fecha < hoyISO || (fecha === hoyISO && horaInicio < horaActualStr)) {
            alert('No puedes realizar una reserva en una fecha u hora que ya pasó.');
            return;
        }
        e.preventDefault();
        if (!nombre.trim() || !REGEX_CELULAR_PERU.test(celular) || !cotizacion || cotizacion.conflicto) {
            alert('Por favor verifica que todos los datos sean válidos y que no exista cruce de horario.');
            return;
        }

        const codigoCorto = 'VID-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const nuevaReserva = {
            id: crypto.randomUUID(),
            codigo: codigoCorto,
            cliente: {
                nombreCompleto: nombre.trim(),
                telefono: celular
            },
            detallesReserva: {
                instalacionId: canchaActiva,
                instalacionNombre: cotizacion.nombreCancha,
                fechaProgramada: fecha,
                horaInicio,
                horaFin: cotizacion.horaFinFormateada,
                terminaDiaSiguiente: cotizacion.cruzoMedianoche,
                duracionHoras: parseFloat(duracion),
                inicioTimestamp: cotizacion.inicioTimestamp,
                finTimestamp: cotizacion.finTimestamp,
                notasAdicionales: comentarios.trim() || 'Ninguna'
            },
            facturacion: {
                tarifaPorHora: { dia: cotizacion.tarifaDia, noche: cotizacion.tarifaNoche },
                desgloseHoras: { horasDia: cotizacion.horasDia, horasNoche: cotizacion.horasNoche },
                subtotales: { dia: cotizacion.subtotalDia, noche: cotizacion.subtotalNoche },
                precioTotal: cotizacion.precioTotal,
                modalidadPago: '100% Pago Total',
                moneda: 'PEN'
            },
            estado: 'Pago Total (100%) por Validar',
            auditoria: { fechaCreacion: new Date().toISOString() }
        };

        onAgregarReserva(nuevaReserva);
        setUltimaCreada(nuevaReserva);
        setFiltroFecha(fecha);
    };

    const reservasOcupacion = useMemo(() => {
        return reservas
            .filter((r) => r.detallesReserva.fechaProgramada === filtroFecha)
            .filter((r) => filtroCancha === 'todas' || r.detallesReserva.instalacionId === filtroCancha)
            .sort((a, b) => a.detallesReserva.inicioTimestamp - b.detallesReserva.inicioTimestamp);
    }, [reservas, filtroFecha, filtroCancha]);

    const sumaTotalAcumulada = useMemo(() => {
        return reservas.reduce((acc, r) => acc + r.facturacion.precioTotal, 0);
    }, [reservas]);

    return (
        <section className="seccion seccion-gris" id="reservas" aria-labelledby="titulo-reservas">
            <div className="contenedor">
                <h2 className="titulo-seccion" id="titulo-reservas">Portal de Reservas</h2>
                <p className="subtitulo-seccion">Cotiza tu partido en tiempo real, verifica cruces de horario y gestiona tus alquileres.</p>

                <div className="portal-reservas" id="formulario-reserva">
                    <div className="tabs-barra" role="tablist">
                        <button
                            type="button"
                            className={`tab-boton ${pestanaActiva === 'cotizar' ? 'activo' : ''}`}
                            onClick={() => setPestanaActiva('cotizar')}
                        >
                            <span>⚡ 1. Cotizar y Reservar</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-boton ${pestanaActiva === 'ocupacion' ? 'activo' : ''}`}
                            onClick={() => setPestanaActiva('ocupacion')}
                        >
                            <span>📅 2. Horarios Ocupados</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-boton ${pestanaActiva === 'historial' ? 'activo' : ''}`}
                            onClick={() => setPestanaActiva('historial')}
                        >
                            <span>📋 3. Mis Reservas</span>
                            <span className="tab-contador">{reservasVisibles.length}</span>
                        </button>
                    </div>

                    {pestanaActiva === 'cotizar' && (
                        <div className="tab-panel activo">
                            <div className="cabecera-reserva">
                                <h3 className="titulo-grupo">Configura tu partido</h3>
                                <div className="insignias-horario">
                                    <span className="insignia insignia-dia">☀ Turno Día: 06:00 a 17:59</span>
                                    <span className="insignia insignia-noche">☾ Turno Noche: 18:00 a 05:59</span>
                                </div>
                            </div>

                            <div className="checkout-grid">
                                <form className="formulario" onSubmit={manejarSubmit} noValidate>
                                    <div className="campo campo-completo">
                                        <label htmlFor="nombre">Nombre completo del responsable</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej.: Julio César Rondán"
                                            required
                                        />
                                    </div>

                                    <div className="campo">
                                        <label htmlFor="celular">WhatsApp / Celular (9 dígitos)</label>
                                        <input
                                            type="tel"
                                            id="celular"
                                            className={estadoCelular.claseInput}
                                            value={celular}
                                            onChange={manejarCambioCelular}
                                            inputMode="numeric"
                                            maxLength={9}
                                            placeholder="Ej.: 982494280"
                                            required
                                        />
                                        <small className={estadoCelular.claseTexto}>{estadoCelular.mensaje}</small>
                                    </div>

                                    <div className="campo">
                                        <label htmlFor="tipo-cancha">Instalación deportiva</label>
                                        <select
                                            id="tipo-cancha"
                                            value={canchaActiva}
                                            onChange={(e) => { setCanchaActiva(e.target.value); setUltimaCreada(null); }}
                                            required
                                        >
                                            <option value="">Selecciona una cancha</option>
                                            <option value="futsal1">Cancha de Futsal 1 (Día S/30 · Noche S/60)</option>
                                            <option value="futsal2">Cancha de Futsal 2 (Día S/30 · Noche S/60)</option>
                                            <option value="voley-basquet">Vóley y Básquet (Día S/30 · Noche S/35)</option>
                                        </select>
                                    </div>

                                    <div className="campo">
                                        <label htmlFor="fecha">Fecha del partido</label>
                                        <input
                                            type="date"
                                            id="fecha"
                                            min={hoyISO}
                                            value={fecha}
                                            onChange={(e) => { setFecha(e.target.value); setUltimaCreada(null); }}
                                            required
                                        />
                                    </div>

                                    <div className="campo">
                                        <label htmlFor="hora-inicio">Hora de inicio (Atención 24h)</label>
                                        <input
                                            type="time"
                                            id="hora-inicio"
                                            min={fecha === hoyISO ? horaActualStr : undefined}
                                            value={horaInicio}
                                            onChange={(e) => { setHoraInicio(e.target.value); setUltimaCreada(null); }}
                                            required
                                        />
                                    </div>

                                    <div className="campo campo-completo">
                                        <label htmlFor="duracion">Duración del alquiler (horas)</label>
                                        <div className="selector-duracion">
                                            <div className="chips-duracion">
                                                {DURACIONES_RAPIDAS.map((h) => (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        className={`chip-hora ${parseFloat(duracion) === h ? 'activo' : ''}`}
                                                        onClick={() => setDuracion(h)}
                                                    >
                                                        {h}h
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="number"
                                                id="duracion"
                                                min="1"
                                                max="24"
                                                step="0.5"
                                                value={duracion}
                                                onChange={(e) => setDuracion(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="campo campo-completo">
                                        <label htmlFor="comentarios">Notas o requerimientos <span className="opcional">(opcional)</span></label>
                                        <textarea
                                            id="comentarios"
                                            rows="2"
                                            value={comentarios}
                                            onChange={(e) => setComentarios(e.target.value)}
                                            placeholder="Ej.: Campeonato relámpago, préstamo de chalecos..."
                                        />
                                    </div>

                                    {cotizacion?.conflicto && (
                                        <div className="alerta-conflicto campo-completo">
                                            ⚠ Cruce de horario: Esta cancha ya está reservada de {cotizacion.conflicto.detallesReserva.horaInicio} a {cotizacion.conflicto.detallesReserva.horaFin} ({cotizacion.conflicto.cliente.nombreCompleto}).
                                        </div>
                                    )}

                                    {esFechaPasada && (
                                        <div className="alerta-conflicto campo-completo">
                                            ⚠ Horario inválido: No puedes reservar a las {horaInicio} porque esa hora ya pasó hoy (son las {horaActualStr}).
                                        </div>
                                    )}

                                    <div className="campo-completo">
                                        <button
                                            className="boton boton-primario boton-completo"
                                            type="submit"
                                            disabled={!cotizacion || Boolean(cotizacion.conflicto) || esFechaPasada}
                                        >
                                            Confirmar y registrar reserva
                                        </button>
                                    </div>
                                </form>

                                <aside className="ticket-resumen" aria-live="polite">
                                    <div className="ticket-cabecera">
                                        <span className="ticket-tag">Cotización en tiempo real</span>
                                        <h4>{cotizacion ? cotizacion.nombreCancha : 'Selecciona una cancha'}</h4>
                                        <p>
                                            {cotizacion
                                                ? `Tarifa por hora: Día S/ ${cotizacion.tarifaDia} · Noche S/ ${cotizacion.tarifaNoche}`
                                                : 'Completa cancha, hora y duración (mín. 1h)'}
                                        </p>
                                    </div>

                                    <div className="ticket-cuerpo">
                                        <div className="ticket-fila">
                                            <span>Estado del horario</span>
                                            <strong className={!cotizacion ? '' : cotizacion.conflicto ? 'estado-ocupado' : 'estado-libre'}>
                                                {!cotizacion ? 'Pendiente' : cotizacion.conflicto ? 'Horario Ocupado' : '✔ Disponible'}
                                            </strong>
                                        </div>
                                        <div className="ticket-fila">
                                            <span>Fecha programada</span>
                                            <strong>{fecha ? fecha.split('-').reverse().join('/') : '--/--/----'}</strong>
                                        </div>
                                        <div className="ticket-fila">
                                            <span>Horario calculado</span>
                                            <strong>
                                                {cotizacion
                                                    ? `${horaInicio} a ${cotizacion.horaFinFormateada}${cotizacion.cruzoMedianoche ? ' (+1 día)' : ''}`
                                                    : '--:-- a --:--'}
                                            </strong>
                                        </div>
                                        <div className="ticket-fila">
                                            <span>Horas Turno Día (☀)</span>
                                            <strong>
                                                {cotizacion
                                                    ? `${cotizacion.horasDia} h × S/ ${cotizacion.tarifaDia} = S/ ${cotizacion.subtotalDia.toFixed(2)}`
                                                    : '0 h (S/ 0.00)'}
                                            </strong>
                                        </div>
                                        <div className="ticket-fila">
                                            <span>Horas Turno Noche (☾)</span>
                                            <strong>
                                                {cotizacion
                                                    ? `${cotizacion.horasNoche} h × S/ ${cotizacion.tarifaNoche} = S/ ${cotizacion.subtotalNoche.toFixed(2)}`
                                                    : '0 h (S/ 0.00)'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="ticket-total">
                                        <span>Pago Total (100%)</span>
                                        <strong className="precio-gigante">
                                            S/ {cotizacion ? cotizacion.precioTotal.toFixed(2) : '0.00'}
                                        </strong>
                                    </div>

                                    {ultimaCreada && (
                                        <div className="alerta-exito">
                                            <strong>✔ ¡Reserva {ultimaCreada.codigo} registrada!</strong><br />
                                            Monto total a cancelar (100%): <strong>S/ {ultimaCreada.facturacion.precioTotal.toFixed(2)}</strong>.<br />
                                            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <a
                                                    href={generarUrlWhatsApp(ultimaCreada)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-whatsapp-card"
                                                >
                                                    📲 Enviar pago total por WhatsApp
                                                </a>
                                                <button
                                                    type="button"
                                                    className="btn-imprimir-card"
                                                    onClick={() => imprimirTicketReserva(ultimaCreada)}
                                                >
                                                    🖨️ Descargar Ticket PDF
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </aside>
                            </div>
                        </div>
                    )}

                    {pestanaActiva === 'ocupacion' && (
                        <div className="tab-panel activo">
                            <div className="cabecera-reserva">
                                <div>
                                    <h3 className="titulo-grupo">Horarios reservados del día</h3>
                                    <p className="texto-suave-pequeno">Revisa qué bloques ya están ocupados antes de agendar tu encuentro.</p>
                                </div>
                                <div className="filtros-ocupacion">
                                    <input
                                        type="date"
                                        className="input-filtro"
                                        value={filtroFecha}
                                        onChange={(e) => setFiltroFecha(e.target.value)}
                                    />
                                    <select
                                        className="input-filtro"
                                        value={filtroCancha}
                                        onChange={(e) => setFiltroCancha(e.target.value)}
                                    >
                                        <option value="todas">Todas las canchas</option>
                                        <option value="futsal1">Cancha de Futsal 1</option>
                                        <option value="futsal2">Cancha de Futsal 2</option>
                                        <option value="voley-basquet">Vóley y Básquet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="lista-ocupacion">
                                {reservasOcupacion.length === 0 ? (
                                    <div className="estado-vacio">
                                        <p>🎉 Todas las instalaciones están 100% libres en la fecha seleccionada ({filtroFecha.split('-').reverse().join('/')}).</p>
                                    </div>
                                ) : (
                                    reservasOcupacion.map((r) => (
                                        <div className="bloque-ocupado" key={r.id}>
                                            <div>
                                                <strong>{r.detallesReserva.instalacionNombre}</strong>
                                                <p className="texto-suave-pequeno">Reservado por: {r.cliente.nombreCompleto} · Código: {r.codigo}</p>
                                            </div>
                                            <span className="insignia insignia-noche">
                                                ⏰ {r.detallesReserva.horaInicio} a {r.detallesReserva.horaFin}
                                                {r.detallesReserva.terminaDiaSiguiente ? ' (+1d)' : ''}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {pestanaActiva === 'historial' && (
                        <div className="tab-panel activo">
                            {!usuario ? (
                                <div className="estado-vacio" style={{ padding: '2.5rem 1.5rem', border: '1px dashed #0f6b2e', borderRadius: '12px' }}>
                                    <h3 style={{ marginBottom: '0.5rem', color: '#0e1a14' }}>🔒 Inicia sesión para ver tus reservas</h3>
                                    <p>
                                        Por privacidad, el historial de reservas solo es visible para usuarios autenticados. Usa el botón <strong>"Iniciar Sesión / Registrarse"</strong> en la barra superior.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="cabecera-reserva">
                                        <div>
                                            <h3 className="titulo-grupo">
                                                {usuario.rol === 'ADMIN' ? 'Todas las reservas del complejo (Admin)' : 'Mis reservas guardadas'}
                                            </h3>
                                            <p className="texto-suave-pequeno">Descarga tu ticket PDF o envía tu comprobante de pago del 100% por WhatsApp.</p>
                                        </div>
                                        <div className="resumen-metricas-historial">
                                            <span className="insignia insignia-dia">
                                                Total acumulado (100%): S/ {reservasVisibles.reduce((acc, r) => acc + Number(r.facturacion?.precioTotal ?? 0), 0).toFixed(2)}
                                            </span>
                                            {usuario.rol === 'ADMIN' && reservasVisibles.length > 0 && (
                                                <button type="button" className="boton-peligro-borde" onClick={onVaciarReservas}>
                                                    Vaciar todo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rejilla-historial">
                                        {reservasVisibles.length === 0 ? (
                                            <div className="estado-vacio">
                                                <p>Aún no tienes reservas registradas con tu cuenta ({usuario.telefono}).</p>
                                            </div>
                                        ) : (
                                            [...reservasVisibles].reverse().map((r) => {
                                                const hDia = r.facturacion?.desgloseHoras?.horasDia ?? r.facturacion?.horasDia ?? 0;
                                                const hNoche = r.facturacion?.desgloseHoras?.horasNoche ?? r.facturacion?.horasNoche ?? 0;
                                                const total = Number(r.facturacion?.precioTotal ?? 0);

                                                return (
                                                    <article className="tarjeta-reserva-guardada" key={r.id}>
                                                        <div>
                                                            <div className="reserva-encabezado">
                                                                <h4>{r.detallesReserva?.instalacionNombre || 'Instalación'}</h4>
                                                                <span className="codigo-reserva">{r.codigo}</span>
                                                            </div>
                                                            <div className="reserva-datos">
                                                                <p><strong>Cliente:</strong> {r.cliente?.nombreCompleto} ({r.cliente?.telefono})</p>
                                                                <p><strong>Fecha:</strong> {r.detallesReserva?.fechaProgramada?.split('-').reverse().join('/')} · <strong>Horario:</strong> {r.detallesReserva?.horaInicio} a {r.detallesReserva?.horaFin}</p>
                                                                <p><strong>Desglose ({r.detallesReserva?.duracionHoras}h):</strong> ☀ Día {hDia}h | ☾ Noche {hNoche}h</p>
                                                                <p><strong>Estado:</strong> {r.estado}</p>
                                                            </div>
                                                        </div>
                                                        <div className="reserva-acciones">
                                                            <strong className="historial-precio">S/ {total.toFixed(2)}</strong>
                                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn-imprimir-card"
                                                                    onClick={() => imprimirTicketReserva(r)}
                                                                >
                                                                    🖨️ Ticket
                                                                </button>
                                                                <a
                                                                    href={generarUrlWhatsApp(r)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn-whatsapp-card"
                                                                >
                                                                    WhatsApp
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    className="boton-peligro-borde"
                                                                    onClick={() => onEliminarReserva(r.id)}
                                                                >
                                                                    Anular
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <aside className="pago">
                    <h3>Pago total para confirmar reserva (100%)</h3>
                    <p>Toda reserva se confirma con el pago del 100% del monto cotizado vía Yape o Plin al número oficial <strong>982 494 280</strong>.</p>
                </aside>
            </div>
        </section>
    );
}
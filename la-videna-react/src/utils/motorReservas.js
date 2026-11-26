export const STORAGE_KEY = 'videna_reservas_v1';
export const WHATSAPP_COMPLEJO = '51982494280';
export const REGEX_CELULAR_PERU = /^9\d{8}$/;

export const CANCHAS = {
    'futsal1': {
        id: 'futsal1',
        nombre: 'Cancha de Futsal 1',
        categoria: 'Futsal',
        descripcion: 'Cancha de futsal techada con césped sintético y líneas de juego marcadas.',
        imagen: '/img/futsal1.jpg',
        claseImg: 'img-futsal1',
        dia: 30,
        noche: 60
    },
    'futsal2': {
        id: 'futsal2',
        nombre: 'Cancha de Futsal 2',
        categoria: 'Futsal',
        descripcion: 'Cancha de futsal techada con césped sintético y líneas de juego marcadas.',
        imagen: '/img/futsal2.jpg',
        claseImg: 'img-futsal2',
        dia: 30,
        noche: 60
    },
    'voley-basquet': {
        id: 'voley-basquet',
        nombre: 'Cancha de Vóley y Básquet',
        categoria: 'Vóley y básquet',
        descripcion: 'Cancha múltiple habilitada tanto para partidos de vóley como de básquet.',
        imagen: '/img/voley_basquet.jpg',
        claseImg: 'img-voley',
        dia: 30,
        noche: 35,
        esAncha: true
    }
};

export const obtenerFechaLocalISO = () => {
    const hoy = new Date();
    const offsetMs = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy.getTime() - offsetMs).toISOString().split('T')[0];
};

export const convertirATimestamp = (fechaStr, horaStr) => {
    return new Date(`${fechaStr}T${horaStr}:00`).getTime();
};

export const verificarConflictoHorario = (canchaId, fechaStr, horaInicioStr, duracionHoras, reservasActivas) => {
    const nuevoInicioMs = convertirATimestamp(fechaStr, horaInicioStr);
    const nuevoFinMs = nuevoInicioMs + (duracionHoras * 3600000);

    return reservasActivas.find((res) => {
        if (res.detallesReserva.instalacionId !== canchaId) return false;
        const resInicioMs = res.detallesReserva.inicioTimestamp;
        const resFinMs = res.detallesReserva.finTimestamp;
        return (nuevoInicioMs < resFinMs) && (nuevoFinMs > resInicioMs);
    });
};

export const calcularCotizacion = (tipoCancha, fecha, horaInicio, duracionNum, reservasActivas = []) => {
    if (!CANCHAS[tipoCancha] || !fecha || !horaInicio || isNaN(duracionNum) || duracionNum < 1) {
        return null;
    }

    const configCancha = CANCHAS[tipoCancha];
    const [h, m] = horaInicio.split(':').map(Number);
    let relojActual = h + (m / 60);
    let horasRestantes = duracionNum;
    let horasDia = 0;
    let horasNoche = 0;
    let precioTotal = 0;
    let cruzoMedianoche = false;

    while (horasRestantes > 0) {
        const esDia = (relojActual >= 6 && relojActual < 18);
        const tarifaHora = esDia ? configCancha.dia : configCancha.noche;
        const bloque = Math.min(0.5, horasRestantes);

        precioTotal += tarifaHora * bloque;
        if (esDia) horasDia += bloque;
        else horasNoche += bloque;

        relojActual += bloque;
        horasRestantes -= bloque;

        if (relojActual >= 24) {
            relojActual -= 24;
            cruzoMedianoche = true;
        }
    }

    const horaFinEntera = Math.floor(relojActual);
    const minutosFin = Math.round((relojActual - horaFinEntera) * 60);
    const horaFinFormateada = `${String(horaFinEntera).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;

    const inicioTimestamp = convertirATimestamp(fecha, horaInicio);
    const finTimestamp = inicioTimestamp + (duracionNum * 3600000);
    const conflicto = verificarConflictoHorario(tipoCancha, fecha, horaInicio, duracionNum, reservasActivas) || null;

    return {
        nombreCancha: configCancha.nombre,
        tarifaDia: configCancha.dia,
        tarifaNoche: configCancha.noche,
        horaFinFormateada,
        cruzoMedianoche,
        horasDia,
        horasNoche,
        subtotalDia: horasDia * configCancha.dia,
        subtotalNoche: horasNoche * configCancha.noche,
        precioTotal,
        inicioTimestamp,
        finTimestamp,
        conflicto
    };
};

export const generarUrlWhatsApp = (reserva) => {
    const d = reserva.detallesReserva || {};
    const f = reserva.facturacion || {};
    const hDia = f.desgloseHoras?.horasDia ?? f.horasDia ?? 0;
    const hNoche = f.desgloseHoras?.horasNoche ?? f.horasNoche ?? 0;
    const subDia = Number(f.subtotales?.dia ?? f.costoDia ?? 0);
    const subNoche = Number(f.subtotales?.noche ?? f.costoNoche ?? 0);
    const total = Number(f.precioTotal ?? 0);

    const mensaje =
        `Hola *Complejo Deportivo La Videna*, envío mi solicitud de reserva para validación de pago total:\n\n` +
        `▪ *Código:* ${reserva.codigo}\n` +
        `▪ *Responsable:* ${reserva.cliente?.nombreCompleto || 'Cliente'} (${reserva.cliente?.telefono || ''})\n` +
        `▪ *Cancha:* ${d.instalacionNombre || 'Cancha'}\n` +
        `▪ *Fecha:* ${(d.fechaProgramada || '').split('-').reverse().join('/')}\n` +
        `▪ *Horario:* ${d.horaInicio || ''} a ${d.horaFin || ''}${d.terminaDiaSiguiente ? ' (día siguiente)' : ''} (${d.duracionHoras || 1}h)\n` +
        `▪ *Desglose:* Día ${hDia}h (S/ ${subDia.toFixed(2)}) | Noche ${hNoche}h (S/ ${subNoche.toFixed(2)})\n` +
        `▪ *MONTO TOTAL A PAGAR (100%):* S/ ${total.toFixed(2)}\n\n` +
        `Adjunto el comprobante de Yape/Plin por el monto total para confirmar mi cancha.`;

    return `https://wa.me/${WHATSAPP_COMPLEJO}?text=${encodeURIComponent(mensaje)}`;
};

export const imprimirTicketReserva = (reserva) => {
    const d = reserva.detallesReserva || {};
    const f = reserva.facturacion || {};
    const configCancha = CANCHAS[d.instalacionId] || { dia: 30, noche: 60 };
    const hDia = f.desgloseHoras?.horasDia ?? f.horasDia ?? 0;
    const hNoche = f.desgloseHoras?.horasNoche ?? f.horasNoche ?? 0;
    const tarifaDia = f.tarifaPorHora?.dia ?? configCancha.dia;
    const tarifaNoche = f.tarifaPorHora?.noche ?? configCancha.noche;
    const subDia = Number(f.subtotales?.dia ?? f.costoDia ?? (hDia * tarifaDia));
    const subNoche = Number(f.subtotales?.noche ?? f.costoNoche ?? (hNoche * tarifaNoche));
    const total = Number(f.precioTotal ?? 0);

    const fechaFormateada = (d.fechaProgramada || '').split('-').reverse().join('/');
    const fechaEmision = reserva.auditoria?.fechaCreacion
        ? new Date(reserva.auditoria.fechaCreacion).toLocaleString('es-PE')
        : new Date().toLocaleString('es-PE');

    const ventanaImpresion = window.open('', '_blank', 'width=420,height=680');
    if (!ventanaImpresion) {
        alert('Por favor permite las ventanas emergentes en tu navegador para descargar el comprobante.');
        return;
    }

    const htmlComprobante = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Voucher_${reserva.codigo}_La_Videna</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Courier New', Courier, monospace; background: #f4f6f5; color: #111; padding: 20px; display: flex; justify-content: center; }
                .ticket { background: #fff; width: 100%; max-width: 340px; padding: 22px 18px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .encabezado { text-align: center; border-bottom: 2px dashed #222; padding-bottom: 12px; margin-bottom: 12px; }
                .encabezado h1 { font-size: 1.15rem; text-transform: uppercase; letter-spacing: 1px; }
                .encabezado p { font-size: 0.78rem; color: #444; margin-top: 3px; }
                .codigo-box { text-align: center; background: #0e1a14; color: #ffd23f; font-weight: bold; font-size: 1.05rem; padding: 6px; margin: 10px 0; letter-spacing: 2px; }
                .fila { display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 6px; gap: 8px; }
                .fila strong { text-align: right; }
                .separador { border-top: 1px dashed #888; margin: 10px 0; }
                .total-fila { display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: bold; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 8px 0; margin: 10px 0; }
                .pie { text-align: center; font-size: 0.75rem; color: #444; margin-top: 14px; line-height: 1.4; }
                .acciones-no-print { margin-top: 16px; display: flex; gap: 8px; }
                .btn { flex: 1; padding: 10px; font-family: sans-serif; font-weight: bold; font-size: 0.82rem; border: none; border-radius: 6px; cursor: pointer; }
                .btn-print { background: #0f6b2e; color: #fff; }
                .btn-close { background: #e0e0e0; color: #222; }
                @media print {
                    body { background: #fff; padding: 0; }
                    .ticket { box-shadow: none; border: none; max-width: 100%; }
                    .acciones-no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="encabezado">
                    <h1>Complejo Deportivo La Videna</h1>
                    <p>Remiato, Puerto Maldonado 17001</p>
                    <p>Yape / Plin / WhatsApp: 982 494 280</p>
                </div>
                <div class="codigo-box">RESERVA: ${reserva.codigo}</div>
                <div class="fila"><span>Emisión:</span><strong>${fechaEmision}</strong></div>
                <div class="fila"><span>Cliente:</span><strong>${reserva.cliente?.nombreCompleto || 'Cliente'}</strong></div>
                <div class="fila"><span>Celular:</span><strong>${reserva.cliente?.telefono || ''}</strong></div>
                <div class="separador"></div>
                <div class="fila"><span>Instalación:</span><strong>${d.instalacionNombre || 'Cancha'}</strong></div>
                <div class="fila"><span>Fecha de juego:</span><strong>${fechaFormateada}</strong></div>
                <div class="fila"><span>Horario:</span><strong>${d.horaInicio || ''} a ${d.horaFin || ''}${d.terminaDiaSiguiente ? ' (+1d)' : ''}</strong></div>
                <div class="fila"><span>Duración total:</span><strong>${d.duracionHoras || 1} hora(s)</strong></div>
                <div class="separador"></div>
                <div class="fila"><span>Turno Día (${hDia}h × S/${tarifaDia}):</span><strong>S/ ${subDia.toFixed(2)}</strong></div>
                <div class="fila"><span>Turno Noche (${hNoche}h × S/${tarifaNoche}):</span><strong>S/ ${subNoche.toFixed(2)}</strong></div>
                <div class="total-fila"><span>PAGO TOTAL (100%):</span><span>S/ ${total.toFixed(2)}</span></div>
                <div class="fila"><span>Modalidad:</span><strong>Cancelación Total (100%)</strong></div>
                <div class="fila"><span>Estado:</span><strong>${reserva.estado}</strong></div>
                <div class="fila"><span>Notas:</span><strong>${d.notasAdicionales || 'Ninguna'}</strong></div>
                <div class="pie">Presenta este voucher junto con tu comprobante de Yape/Plin al ingresar a la cancha.</div>
                <div class="acciones-no-print">
                    <button class="btn btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="btn btn-close" onclick="window.close()">Cerrar</button>
                </div>
            </div>
            <script>window.onload = () => { setTimeout(() => window.print(), 250); };<\/script>
        </body>
        </html>
    `;

    ventanaImpresion.document.open();
    ventanaImpresion.document.write(htmlComprobante);
    ventanaImpresion.document.close();
};
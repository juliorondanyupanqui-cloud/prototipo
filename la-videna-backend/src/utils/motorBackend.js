export const CANCHAS = {
    'futsal1': {
        id: 'futsal1',
        nombre: 'Cancha de Futsal 1',
        categoria: 'Futsal',
        descripcion: 'Cancha de futsal techada con césped sintético y líneas de juego marcadas.',
        imagen: '/img/futsal1.jpg',
        dia: 30,
        noche: 60
    },
    'futsal2': {
        id: 'futsal2',
        nombre: 'Cancha de Futsal 2',
        categoria: 'Futsal',
        descripcion: 'Cancha de futsal techada con césped sintético y líneas de juego marcadas.',
        imagen: '/img/futsal2.jpg',
        dia: 30,
        noche: 60
    },
    'voley-basquet': {
        id: 'voley-basquet',
        nombre: 'Cancha de Vóley y Básquet',
        categoria: 'Vóley y básquet',
        descripcion: 'Cancha múltiple habilitada tanto para partidos de vóley como de básquet.',
        imagen: '/img/voley_basquet.jpg',
        dia: 30,
        noche: 35
    }
};

export const convertirATimestamp = (fechaStr, horaStr) => {
    return new Date(`${fechaStr}T${horaStr}:00`).getTime();
};

export const verificarConflictoHorario = (canchaId, fechaStr, horaInicioStr, duracionHoras, reservasActivas) => {
    const nuevoInicioMs = convertirATimestamp(fechaStr, horaInicioStr);
    const nuevoFinMs = nuevoInicioMs + (duracionHoras * 3600000);

    return reservasActivas.find((res) => {
        if (res.detallesReserva?.instalacionId !== canchaId) return false;
        const resInicioMs = res.detallesReserva.inicioTimestamp;
        const resFinMs = res.detallesReserva.finTimestamp;
        return (nuevoInicioMs < resFinMs) && (nuevoFinMs > resInicioMs);
    });
};

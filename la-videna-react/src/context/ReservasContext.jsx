// la-videna-react/src/context/ReservasContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { STORAGE_KEY } from '../utils/motorReservas';
import { ReservasService } from '../services/api';

const ReservasContext = createContext();

export function ReservasProvider({ children }) {
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [canchaActiva, setCanchaActiva] = useState('futsal1');
    const [pestanaActiva, setPestanaActiva] = useState('cotizar');

    // 1. Cargar reservas reales desde PostgreSQL al iniciar
    useEffect(() => {
        const cargarReservasIniciales = async () => {
            const datos = await ReservasService.obtenerTodas();
            setReservas(datos);
            setCargando(false);
        };
        cargarReservasIniciales();
    }, []);

    // 2. Guardar respaldo en LocalStorage SOLO después de haber cargado
    useEffect(() => {
        if (!cargando) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
        }
    }, [reservas, cargando]);

    const manejarSeleccionCancha = (idCancha) => {
        setCanchaActiva(idCancha);
        setPestanaActiva('cotizar');
    };

    const agregarReserva = async (nueva) => {
        const guardada = await ReservasService.crear(nueva);
        setReservas((prev) => [guardada, ...prev]);
        Swal.fire({
            icon: 'success',
            title: '¡Reserva Registrada!',
            text: `Código de ticket: ${guardada.codigo}`,
            confirmButtonColor: '#0f6b2e'
        });
    };

    const eliminarReserva = async (id) => {
        await ReservasService.eliminar(id);
        setReservas((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
            icon: 'info',
            title: 'Reserva eliminada',
            text: 'El horario ha quedado libre nuevamente.',
            confirmButtonColor: '#0f6b2e'
        });
    };

    const vaciarReservas = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar todas las reservas?',
            text: 'Se borrarán los registros de la base de datos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            for (const item of reservas) {
                await ReservasService.eliminar(item.id);
            }
            setReservas([]);
            Swal.fire('Historial limpio', 'Se eliminaron todas las reservas.', 'success');
        }
    };

    return (
        <ReservasContext.Provider
            value={{
                reservas,
                canchaActiva,
                setCanchaActiva,
                pestanaActiva,
                setPestanaActiva,
                manejarSeleccionCancha,
                agregarReserva,
                eliminarReserva,
                vaciarReservas
            }}
        >
            {children}
        </ReservasContext.Provider>
    );
}

export const useReservas = () => useContext(ReservasContext);
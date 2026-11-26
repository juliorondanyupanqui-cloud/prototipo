import { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AuthService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('videna_token'));

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('videna_usuario');
        if (usuarioGuardado && token) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await AuthService.login({ email, password });
        localStorage.setItem('videna_token', res.token);
        localStorage.setItem('videna_usuario', JSON.stringify(res.usuario));
        setToken(res.token);
        setUsuario(res.usuario);
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido, ${res.usuario.nombreCompleto}!`,
            text: `Sesión iniciada como ${res.usuario.rol}`,
            timer: 1800,
            showConfirmButton: false
        });
    };

    const registrar = async (datos) => {
        const res = await AuthService.registrar(datos);
        localStorage.setItem('videna_token', res.token);
        localStorage.setItem('videna_usuario', JSON.stringify(res.usuario));
        setToken(res.token);
        setUsuario(res.usuario);
        Swal.fire({
            icon: 'success',
            title: '¡Cuenta creada!',
            text: 'Ya puedes gestionar tus reservas en La Videna.',
            timer: 1800,
            showConfirmButton: false
        });
    };

    const cerrarSesion = () => {
        localStorage.removeItem('videna_token');
        localStorage.removeItem('videna_usuario');
        setToken(null);
        setUsuario(null);
        Swal.fire({
            icon: 'info',
            title: 'Sesión cerrada',
            timer: 1400,
            showConfirmButton: false
        });
    };

    return (
        <AuthContext.Provider value={{ usuario, token, login, registrar, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
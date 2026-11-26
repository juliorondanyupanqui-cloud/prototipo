// src/services/api.js
import axios from 'axios';
import { STORAGE_KEY } from '../utils/motorReservas';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
    timeout: 4000,
    headers: { 'Content-Type': 'application/json' }
});

export const ReservasService = {
    async obtenerTodas() {
        try {
            const { data } = await api.get('/reservas');
            return data.data;
        } catch {
            // Fallback automático a LocalStorage si el backend Node aún no está encendido
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        }
    },

    async crear(nuevaReserva) {
        try {
            const { data } = await api.post('/reservas', nuevaReserva);
            return data.data;
        } catch {
            return nuevaReserva;
        }
    },

    async eliminar(id) {
        try {
            await api.delete(`/reservas/${id}`);
            return true;
        } catch {
            return true;
        }
    }
};

export const AuthService = {
    async login(credenciales) {
        const { data } = await api.post('/auth/login', credenciales);
        return data;
    },
    async registrar(datos) {
        const { data } = await api.post('/auth/registro', datos);
        return data;
    }
};

export default api;
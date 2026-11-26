import { Router } from 'express';
import {
    listarCanchas,
    listarReservas,
    crearReserva,
    eliminarReserva
} from '../controllers/reservas.controller.js';

const router = Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Complejo Deportivo La Videna | Reservas 24h activa',
        endpoints: ['/api/v1/canchas', '/api/v1/reservas']
    });
});

router.get('/canchas', listarCanchas);
router.get('/reservas', listarReservas);
router.post('/reservas', crearReserva);
router.delete('/reservas/:id', eliminarReserva);

export default router;

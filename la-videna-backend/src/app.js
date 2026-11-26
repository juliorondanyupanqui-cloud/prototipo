import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reservasRoutes from './routes/reservas.routes.js';
import authRoutes from './routes/auth.routes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/v1', reservasRoutes);

app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor Backend La Videna corriendo en http://localhost:${PORT}/api/v1`);
});

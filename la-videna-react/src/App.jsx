import { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CatalogoCanchas from './components/CatalogoCanchas';
import PortalReservas from './components/PortalReservas';
import ModalAuth from './components/ModalAuth.jsx';
import { useReservas } from './context/ReservasContext.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
    const {
        reservas,
        canchaActiva,
        setCanchaActiva,
        pestanaActiva,
        setPestanaActiva,
        manejarSeleccionCancha,
        agregarReserva,
        eliminarReserva,
        vaciarReservas
    } = useReservas();

    const { usuario, cerrarSesion } = useAuth();
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
    const navigate = useNavigate();

    // Al elegir una cancha en el catálogo, selecciona la cancha y navega a /reservas
    const seleccionarYNavegar = (idCancha) => {
        manejarSeleccionCancha(idCancha);
        navigate('/reservas');
    };

    return (
        <>
            {/* Barra superior de Autenticación */}
            <div style={{
                background: '#0a140f',
                color: '#fff',
                padding: '0.5rem 1.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.88rem'
            }}>
                {usuario ? (
                    <>
                        <span>
                            👤 <strong>{usuario.nombreCompleto}</strong> ({usuario.rol})
                        </span>
                        <button
                            type="button"
                            onClick={cerrarSesion}
                            style={{
                                background: '#c62828',
                                color: '#fff',
                                border: 'none',
                                padding: '0.35rem 0.85rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setModalAuthAbierto(true)}
                        style={{
                            background: '#0f6b2e',
                            color: '#fff',
                            border: '1px solid #1db954',
                            padding: '0.38rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🔐 Iniciar Sesión / Registrarse
                    </button>
                )}
            </div>

            <Header />

            <main id="contenido">
                <Routes>
                    {/* RUTA INICIO (/) */}
                    <Route path="/" element={
                        <>
                            <section className="portada" id="inicio">
                                <img className="portada-imagen" src="/img/portada.jpg" alt="Cancha techada Complejo Deportivo La Videna" />
                                <div className="contenedor portada-contenido">
                                    <p className="portada-etiqueta">Futsal · Vóley · Básquet · Atención 24 Horas</p>
                                    <h1>Complejo Deportivo La Videna</h1>
                                    <p className="portada-frase">Reúne a tu equipo, sal a la cancha y disfruta del deporte con sana competencia.</p>
                                    <div className="portada-botones">
                                        <Link className="boton boton-primario" to="/canchas">Elegir cancha</Link>
                                        <Link className="boton boton-secundario" to="/reservas">Cotizar reserva</Link>
                                    </div>
                                </div>
                            </section>
                            <CatalogoCanchas onSeleccionarCancha={seleccionarYNavegar} />
                        </>
                    } />

                    {/* RUTA CATÁLOGO DE CANCHAS (/canchas) */}
                    <Route path="/canchas" element={
                        <CatalogoCanchas onSeleccionarCancha={seleccionarYNavegar} />
                    } />

                    {/* RUTA TARIFAS (/tarifas) */}
                    <Route path="/tarifas" element={
                        <section className="seccion" id="tarifas">
                            <div className="contenedor">
                                <h2 className="titulo-seccion">Tarifas y Horarios</h2>
                                <p className="subtitulo-seccion">Precios por hora de alquiler según el turno (Atención continua las 24 horas).</p>
                                <div className="tabla-contenedor">
                                    <table className="tabla-tarifas">
                                        <thead>
                                            <tr>
                                                <th>Instalación</th>
                                                <th>☀ Día (06:00 a 17:59)</th>
                                                <th>☾ Noche (18:00 a 05:59)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><th>Cancha de Futsal 1</th><td>S/ 30</td><td>S/ 60</td></tr>
                                            <tr><th>Cancha de Futsal 2</th><td>S/ 30</td><td>S/ 60</td></tr>
                                            <tr><th>Cancha de Vóley y Básquet</th><td>S/ 30</td><td>S/ 35</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="nota"><strong>Regla de turnos (24 horas):</strong> El <strong>Turno Día</strong> rige desde las 06:00 a.m. hasta las 05:59 p.m. El <strong>Turno Noche</strong> inicia a las 06:00 p.m. y culmina a las 05:59 a.m. del día siguiente.</p>
                            </div>
                        </section>
                    } />

                    {/* RUTA PORTAL DE RESERVAS (/reservas) */}
                    <Route path="/reservas" element={
                        <PortalReservas
                            reservas={reservas}
                            canchaActiva={canchaActiva}
                            setCanchaActiva={setCanchaActiva}
                            pestanaActiva={pestanaActiva}
                            setPestanaActiva={setPestanaActiva}
                            onAgregarReserva={agregarReserva}
                            onEliminarReserva={eliminarReserva}
                            onVaciarReservas={vaciarReservas}
                        />
                    } />

                    {/* RUTA CONTACTO (/contacto) */}
                    <Route path="/contacto" element={
                        <section className="seccion seccion-gris" id="contacto">
                            <div className="contenedor">
                                <h2 className="titulo-seccion">Contacto</h2>
                                <div className="rejilla-contacto">
                                    <article className="dato"><h3>Dirección</h3><address>Remiato, Puerto Maldonado 17001</address></article>
                                    <article className="dato"><h3>Teléfono</h3><p><a className="enlace-contacto" href="tel:+51982494280">982 494 280</a></p></article>
                                    <article className="dato"><h3>WhatsApp</h3><p><a className="enlace-contacto" href="https://wa.me/51982494280" target="_blank" rel="noopener noreferrer">982 494 280</a></p></article>
                                    <article className="dato"><h3>Redes sociales</h3><a className="enlace-contacto" href="https://www.facebook.com/profile.php?id=100064537675764&locale=es_LA" target="_blank" rel="noopener noreferrer">Nuestro Facebook</a></article>
                                </div>
                            </div>
                        </section>
                    } />

                    {/* Cualquier ruta desconocida redirige al inicio */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <footer className="pie">
                <div className="contenedor pie-contenido">
                    <p className="pie-marca">Complejo Deportivo La Videna</p>
                    <p className="pie-derechos">© 2026 Complejo Deportivo La Videna. Todos los derechos reservados.</p>
                </div>
            </footer>

            <ModalAuth abierto={modalAuthAbierto} alCerrar={() => setModalAuthAbierto(false)} />
        </>
    );
}
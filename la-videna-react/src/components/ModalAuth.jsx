import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function ModalAuth({ abierto, alCerrar }) {
    const { login, registrar } = useAuth();
    const [esRegistro, setEsRegistro] = useState(false);
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    if (!abierto) return null;

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            if (esRegistro) {
                await registrar({ nombreCompleto, telefono, email, password });
            } else {
                await login(email, password);
            }
            alCerrar();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de autenticación',
                text: error.response?.data?.message || 'Verifica tus credenciales.'
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
            <div style={{
                background: '#fff', borderRadius: '12px', maxWidth: '400px', width: '100%',
                padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#0e1a14' }}>
                        {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h3>
                    <button onClick={alCerrar} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
                </div>

                <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {esRegistro && (
                        <>
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={nombreCompleto}
                                onChange={(e) => setNombreCompleto(e.target.value)}
                                required
                                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="tel"
                                placeholder="Celular / WhatsApp (9 dígitos)"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                pattern="^9\d{8}$"
                                required
                                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    />

                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            background: '#0f6b2e', color: '#fff', padding: '0.8rem', border: 'none',
                            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem'
                        }}
                    >
                        {cargando ? 'Procesando...' : (esRegistro ? 'Registrarme' : 'Ingresar')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                    {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                    <button
                        type="button"
                        onClick={() => setEsRegistro(!esRegistro)}
                        style={{ background: 'none', border: 'none', color: '#0f6b2e', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {esRegistro ? 'Inicia sesión' : 'Regístrate aquí'}
                    </button>
                </p>
            </div>
        </div>
    );
}
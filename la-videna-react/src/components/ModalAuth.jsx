import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { REGEX_CELULAR_PERU } from '../utils/motorReservas';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const estiloInput = { padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc' };
const estiloInputError = { ...estiloInput, border: '2px solid #c0392b' };
const estiloError = { color: '#c0392b', fontSize: '0.82rem', marginTop: '-0.5rem' };

export default function ModalAuth({ abierto, alCerrar }) {
    const { login, registrar } = useAuth();
    const [esRegistro, setEsRegistro] = useState(false);

    // ---------- React Hook Form (S17) ----------
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        mode: 'onTouched',
        defaultValues: { nombreCompleto: '', telefono: '', email: '', password: '' }
    });

    // Al cambiar entre "Iniciar sesión" y "Registrarse" se limpian valores y errores
    useEffect(() => {
        reset();
    }, [esRegistro, reset]);

    if (!abierto) return null;

    const onSubmit = async (datos) => {
        try {
            if (esRegistro) {
                await registrar(datos);
            } else {
                await login(datos.email, datos.password);
            }
            reset();
            alCerrar();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de autenticación',
                text: error.response?.data?.message || 'Verifica tus credenciales.'
            });
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
                    <button type="button" onClick={alCerrar} aria-label="Cerrar" style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {esRegistro && (
                        <>
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                aria-label="Nombre completo"
                                aria-invalid={errors.nombreCompleto ? 'true' : 'false'}
                                style={errors.nombreCompleto ? estiloInputError : estiloInput}
                                {...register('nombreCompleto', {
                                    required: 'El nombre es obligatorio.',
                                    validate: (v) => v.trim().length >= 3 || 'Escribe al menos 3 letras.'
                                })}
                            />
                            {errors.nombreCompleto && <small role="alert" style={estiloError}>✖ {errors.nombreCompleto.message}</small>}

                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={9}
                                placeholder="Celular / WhatsApp (9 dígitos)"
                                aria-label="Celular"
                                aria-invalid={errors.telefono ? 'true' : 'false'}
                                style={errors.telefono ? estiloInputError : estiloInput}
                                {...register('telefono', {
                                    required: 'El celular es obligatorio.',
                                    pattern: { value: REGEX_CELULAR_PERU, message: 'Debe iniciar con 9 y tener 9 dígitos.' }
                                })}
                            />
                            {errors.telefono && <small role="alert" style={estiloError}>✖ {errors.telefono.message}</small>}
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        aria-label="Correo electrónico"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        style={errors.email ? estiloInputError : estiloInput}
                        {...register('email', {
                            required: 'El correo es obligatorio.',
                            pattern: { value: REGEX_EMAIL, message: 'Escribe un correo válido (ej.: nombre@correo.com).' }
                        })}
                    />
                    {errors.email && <small role="alert" style={estiloError}>✖ {errors.email.message}</small>}

                    <input
                        type="password"
                        placeholder="Contraseña"
                        aria-label="Contraseña"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        style={errors.password ? estiloInputError : estiloInput}
                        {...register('password', {
                            required: 'La contraseña es obligatoria.',
                            // Solo al registrarse se exige un mínimo de longitud
                            minLength: esRegistro
                                ? { value: 6, message: 'Mínimo 6 caracteres.' }
                                : undefined
                        })}
                    />
                    {errors.password && <small role="alert" style={estiloError}>✖ {errors.password.message}</small>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            background: '#0f6b2e', color: '#fff', padding: '0.8rem', border: 'none',
                            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem'
                        }}
                    >
                        {isSubmitting ? 'Procesando...' : (esRegistro ? 'Registrarme' : 'Ingresar')}
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

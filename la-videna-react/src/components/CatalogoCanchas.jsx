import { CANCHAS } from '../utils/motorReservas';

export default function CatalogoCanchas({ onSeleccionarCancha }) {
    const canchasFutsal = [CANCHAS.futsal1, CANCHAS.futsal2];
    const canchaVoley = CANCHAS['voley-basquet'];

    return (
        <section className="seccion seccion-gris" id="canchas" aria-labelledby="titulo-canchas">
            <div className="contenedor">
                <h2 className="titulo-seccion" id="titulo-canchas">Nuestras canchas</h2>
                <p className="subtitulo-seccion">Conoce las instalaciones disponibles y selecciona una para cotizar tu reserva al instante.</p>

                <h3 className="titulo-grupo">Canchas de futsal</h3>
                <div className="rejilla-canchas">
                    {canchasFutsal.map((cancha) => (
                        <article className="tarjeta" key={cancha.id}>
                            <div className="tarjeta-imagen">
                                <img className={cancha.claseImg} src={cancha.imagen} loading="lazy" alt={cancha.nombre} />
                                <span className="etiqueta">{cancha.categoria}</span>
                            </div>
                            <div className="tarjeta-cuerpo">
                                <h4>{cancha.nombre}</h4>
                                <p>{cancha.descripcion}</p>
                                <ul className="precios">
                                    <li><span className="precio-turno">☀ Día</span><span className="precio-valor">S/ {cancha.dia}</span></li>
                                    <li><span className="precio-turno">☾ Noche</span><span className="precio-valor">S/ {cancha.noche}</span></li>
                                </ul>
                                <a
                                    href="#formulario-reserva"
                                    className="boton boton-primario boton-completo"
                                    style={{ marginTop: '1rem' }}
                                    onClick={() => onSeleccionarCancha(cancha.id)}
                                >
                                    Reservar {cancha.nombre.replace('Cancha de ', '')}
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                <h3 className="titulo-grupo">Vóley y básquet</h3>
                <article className="tarjeta tarjeta-ancha">
                    <div className="tarjeta-imagen">
                        <img className={canchaVoley.claseImg} src={canchaVoley.imagen} loading="lazy" alt={canchaVoley.nombre} />
                        <span className="etiqueta">{canchaVoley.categoria}</span>
                    </div>
                    <div className="tarjeta-cuerpo">
                        <h4>{canchaVoley.nombre}</h4>
                        <p>{canchaVoley.descripcion}</p>
                        <ul className="precios">
                            <li><span className="precio-turno">☀ Día</span><span className="precio-valor">S/ {canchaVoley.dia}</span></li>
                            <li><span className="precio-turno">☾ Noche</span><span className="precio-valor">S/ {canchaVoley.noche}</span></li>
                        </ul>
                        <a
                            href="#formulario-reserva"
                            className="boton boton-primario boton-completo"
                            style={{ marginTop: '1rem' }}
                            onClick={() => onSeleccionarCancha(canchaVoley.id)}
                        >
                            Reservar Vóley / Básquet
                        </a>
                    </div>
                </article>
            </div>
        </section>
    );
}
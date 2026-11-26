import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Header() {
    const [menuAbierto, setMenuAbierto] = useState(false);

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <header className="encabezado">
            <div className="contenedor barra">
                <Link className="marca" to="/" onClick={cerrarMenu}>
                    <span className="marca-pequena">Complejo Deportivo</span>
                    <span className="marca-nombre">La Videna</span>
                </Link>

                <input
                    type="checkbox"
                    id="menu-toggle"
                    className="menu-check"
                    checked={menuAbierto}
                    onChange={(e) => setMenuAbierto(e.target.checked)}
                />
                <label htmlFor="menu-toggle" className="menu-boton" aria-label="Abrir o cerrar el menú">
                    <span className="menu-icono" aria-hidden="true"></span>
                </label>

                <nav className="menu" aria-label="Navegación principal">
                    <ul>
                        <li><NavLink to="/" end onClick={cerrarMenu}>Inicio</NavLink></li>
                        <li><NavLink to="/canchas" onClick={cerrarMenu}>Canchas</NavLink></li>
                        <li><NavLink to="/tarifas" onClick={cerrarMenu}>Tarifas</NavLink></li>
                        <li><NavLink to="/reservas" onClick={cerrarMenu}>Reservas</NavLink></li>
                        <li><NavLink to="/contacto" onClick={cerrarMenu}>Contacto</NavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
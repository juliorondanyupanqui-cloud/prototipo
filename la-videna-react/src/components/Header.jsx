import { useState } from 'react';

export default function Header() {
    const [menuAbierto, setMenuAbierto] = useState(false);

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <header className="encabezado">
            <div className="contenedor barra">
                <a className="marca" href="#inicio" onClick={cerrarMenu}>
                    <span className="marca-pequena">Complejo Deportivo</span>
                    <span className="marca-nombre">La Videna</span>
                </a>

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
                        <li><a href="#inicio" onClick={cerrarMenu}>Inicio</a></li>
                        <li><a href="#canchas" onClick={cerrarMenu}>Canchas</a></li>
                        <li><a href="#tarifas" onClick={cerrarMenu}>Tarifas</a></li>
                        <li><a href="#reservas" onClick={cerrarMenu}>Reservas</a></li>
                        <li><a href="#contacto" onClick={cerrarMenu}>Contacto</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
import React from 'react';
import { Link } from 'react-router-dom';
import './PiePagina.css';

const PiePagina: React.FC = () => (
  <footer className="footer">
    <div className="footer__cuerpo contenedor">
      <div className="footer__col footer__col--logo">
        <span className="footer__logo">ARV</span>
        <p className="footer__desc">Piezas únicas seleccionadas a mano. Moda circular con historia y carácter.</p>
      </div>
      <div className="footer__col">
        <h4>Tienda</h4>
        <ul>
          <li><Link to="/catalogo">Todo el catálogo</Link></li>
          <li><Link to="/catalogo?era=90s">Colección 90s</Link></li>
          <li><Link to="/catalogo?era=80s">Colección 80s</Link></li>
          <li><Link to="/catalogo?era=70s">Colección 70s</Link></li>
        </ul>
      </div>
      <div className="footer__col">
        <h4>Cuenta</h4>
        <ul>
          <li><Link to="/login">Iniciar sesión</Link></li>
          <li><Link to="/registro">Registrarse</Link></li>
          <li><Link to="/mis-pedidos">Mis pedidos</Link></li>
          <li><Link to="/carrito">Mi carrito</Link></li>
        </ul>
      </div>
      <div className="footer__col">
        <h4>Contacto</h4>
        <p>hola@arv.mx</p>
        <p>+52 55 0000 0000</p>
        <p>Ciudad de México</p>
      </div>
    </div>
    <div className="footer__inferior contenedor">
      <p>© {new Date().getFullYear()} ARV — Todos los derechos reservados</p>
      <p>Moda circular · Hecho en México</p>
    </div>
  </footer>
);

export default PiePagina;

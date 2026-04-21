import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAutenticacion, useCarrito } from '../../contextos/Contextos';
import './Navegacion.css';

const MENU = {
  mujer: [
    { label: 'Novedades',    q: 'mujer' },
    { label: 'Vestidos',     q: 'vestidos' },
    { label: 'Camisas',      q: 'camisas' },
    { label: 'Pantalones',   q: 'pantalones' },
    { label: 'Chamarras',    q: 'chamarras' },
    { label: 'Sudaderas',    q: 'sudaderas' },
    { label: 'Sacos',        q: 'sacos' },
    { label: 'Bolsas',       q: 'bolsas' },
    { label: 'Joyería',      q: 'joyeria' },
    { label: 'Perfumes',     q: 'perfumes' },
  ],
  hombre: [
    { label: 'Novedades',    q: 'hombre' },
    { label: 'Camisas',      q: 'camisas' },
    { label: 'Pantalones',   q: 'pantalones' },
    { label: 'Chamarras',    q: 'chamarras' },
    { label: 'Sudaderas',    q: 'sudaderas' },
    { label: 'Sacos',        q: 'sacos' },
    { label: 'Sobrecamisas', q: 'sobrecamisas' },
    { label: 'Perfumes',     q: 'perfumes' },
  ],
};

const Navegacion: React.FC = () => {
  const { usuario, cerrarSesion, estaAutenticado, esAdmin } = useAutenticacion();
  const { totalItems } = useCarrito();
  const navegar = useNavigate();

  const [megaMenu, setMegaMenu] = useState<'mujer' | 'hombre' | null>(null);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const manejarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navegar(`/catalogo?q=${encodeURIComponent(busqueda)}`);
      setBusqueda(''); setBusquedaAbierta(false);
    }
  };

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
        onMouseLeave={() => setMegaMenu(null)}>

        {/* Anuncio */}
        <div className="nav__anuncio">
          <span>Envío gratis en compras mayores a $999 · Nueva colección disponible</span>
        </div>

        <div className="nav__cuerpo">
          {/* Izquierda */}
          <div className="nav__izq">
            <button className="nav__hamburguesa" onClick={() => setMenuMovil(!menuMovil)}>
              {menuMovil ? <X size={18}/> : <span className="nav__ham-ico"><span/><span/><span/></span>}
            </button>
            <ul className="nav__menu">
              <li onMouseEnter={() => setMegaMenu('mujer')} onMouseLeave={() => {}}>
                <button className={`nav__menu-btn ${megaMenu === 'mujer' ? 'activo' : ''}`}>
                  Mujer <ChevronDown size={10}/>
                </button>
              </li>
              <li onMouseEnter={() => setMegaMenu('hombre')} onMouseLeave={() => {}}>
                <button className={`nav__menu-btn ${megaMenu === 'hombre' ? 'activo' : ''}`}>
                  Hombre <ChevronDown size={10}/>
                </button>
              </li>
              <li onMouseEnter={() => setMegaMenu(null)}>
                <Link to="/catalogo" className="nav__menu-btn">Todo</Link>
              </li>
            </ul>
          </div>

          {/* Logo */}
          <Link to="/" className="nav__logo" onClick={() => setMegaMenu(null)}>ARV</Link>

          {/* Derecha */}
          <div className="nav__der">
            {busquedaAbierta ? (
              <form onSubmit={manejarBusqueda} className="nav__busqueda-form">
                <input autoFocus placeholder="Buscar piezas..." value={busqueda}
                  onChange={e => setBusqueda(e.target.value)} />
                <button type="button" onClick={() => setBusquedaAbierta(false)}><X size={14}/></button>
              </form>
            ) : (
              <button className="nav__icono" onClick={() => setBusquedaAbierta(true)}>
                <Search size={17}/>
              </button>
            )}

            {estaAutenticado ? (
              <div className="nav__usuario-wrap">
                <button className="nav__icono" onClick={() => setMenuUsuario(!menuUsuario)}>
                  <User size={17}/>
                </button>
                {menuUsuario && (
                  <div className="nav__dropdown">
                    <span className="nav__dropdown-nombre">{usuario?.nombre}</span>
                    <Link to="/mis-pedidos" onClick={() => setMenuUsuario(false)}>Mis Pedidos</Link>
                    {esAdmin && <Link to="/admin" onClick={() => setMenuUsuario(false)}>
                      <Settings size={12}/> Panel Admin
                    </Link>}
                    <button onClick={() => { cerrarSesion(); navegar('/'); setMenuUsuario(false); }}>
                      <LogOut size={12}/> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav__icono"><User size={17}/></Link>
            )}

            <Link to="/carrito" className="nav__icono nav__icono--carrito">
              <ShoppingBag size={17}/>
              {totalItems > 0 && <span className="nav__badge">{totalItems}</span>}
            </Link>
          </div>
        </div>

        {/* Mega menú */}
        {megaMenu && (
          <div className="nav__mega">
            <div className="nav__mega-inner contenedor">
              <div className="nav__mega-titulo">
                {megaMenu === 'mujer' ? 'Mujer' : 'Hombre'}
              </div>
              <ul className="nav__mega-lista">
                {MENU[megaMenu].map(item => (
                  <li key={item.q}>
                    <Link to={`/catalogo?q=${item.q}`}
                      onClick={() => setMegaMenu(null)}
                      className="nav__mega-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="nav__mega-img">
                <img
                  src={megaMenu === 'mujer'
                    ? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'}
                  alt={megaMenu}
                />
                <div className="nav__mega-img-label">
                  <span>Nueva colección</span>
                  <Link to={`/catalogo?q=${megaMenu}`} onClick={() => setMegaMenu(null)}>
                    Ver todo →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Menú móvil */}
      {menuMovil && (
        <div className="nav__movil">
          <div className="nav__movil-seccion">
            <span>Mujer</span>
            {MENU.mujer.map(i => (
              <Link key={i.q} to={`/catalogo?q=${i.q}`} onClick={() => setMenuMovil(false)}>{i.label}</Link>
            ))}
          </div>
          <div className="nav__movil-seccion">
            <span>Hombre</span>
            {MENU.hombre.map(i => (
              <Link key={i.q} to={`/catalogo?q=${i.q}`} onClick={() => setMenuMovil(false)}>{i.label}</Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navegacion;

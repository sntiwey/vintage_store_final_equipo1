import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import { useAutenticacion } from '../contextos/Contextos';
import PaginaDashboard from './admin/PaginaDashboard';
import PaginaPedidosAdmin from './admin/PaginaPedidosAdmin';
import PaginaProductosAdmin from './admin/PaginaProductosAdmin';
import '../estilos/admin.css';

const navItems = [
  { to: '/admin',          label: 'Dashboard',  ico: <LayoutDashboard size={16}/> },
  { to: '/admin/pedidos',  label: 'Pedidos',    ico: <ShoppingBag size={16}/> },
  { to: '/admin/productos',label: 'Productos',  ico: <Package size={16}/> },
];

const PaginaAdmin: React.FC = () => {
  const { usuario, cerrarSesion } = useAutenticacion();
  const location = useLocation();
  const navegar = useNavigate();
  const [sidebarMovil, setSidebarMovil] = useState(false);

  const salir = () => { cerrarSesion(); navegar('/'); };
  const iniciales = usuario?.nombre?.slice(0,2).toUpperCase() || 'AD';

  const paginaActual = navItems.find(n => n.to === location.pathname)?.label || 'Admin';

  return (
    <div className="adm">
      {/* Sidebar */}
      <aside className={`adm__sidebar ${sidebarMovil ? 'abierto' : ''}`}>
        <div className="adm__sidebar-logo">
          <span className="adm__sidebar-logo-texto">ARV</span>
          <span className="adm__sidebar-logo-sub">Panel Admin</span>
        </div>
        <nav className="adm__sidebar-nav">
          <div className="adm__sidebar-seccion">Principal</div>
          {navItems.map(item => (
            <Link key={item.to} to={item.to}
              className={`adm__nav-item ${location.pathname === item.to ? 'activo' : ''}`}
              onClick={() => setSidebarMovil(false)}>
              {item.ico}
              <span>{item.label}</span>
              {location.pathname === item.to && <ChevronRight size={12} style={{ marginLeft:'auto', opacity:0.5 }}/>}
            </Link>
          ))}
          <div className="adm__sidebar-seccion" style={{ marginTop: 16 }}>Tienda</div>
          <Link to="/" className="adm__nav-item" target="_blank">
            <span style={{ fontSize:'0.9rem' }}>↗</span>
            <span>Ver Tienda</span>
          </Link>
        </nav>
        <div className="adm__sidebar-footer">
          <div className="adm__sidebar-usuario">
            <div className="adm__sidebar-avatar">{iniciales}</div>
            <div className="adm__sidebar-user-info">
              <span className="adm__sidebar-user-nombre">{usuario?.nombre}</span>
              <span className="adm__sidebar-user-rol">Administrador</span>
            </div>
            <button className="adm__sidebar-salir" onClick={salir} title="Cerrar sesión"><LogOut size={15}/></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="adm__main">
        <div className="adm__topbar">
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <button className="adm__topbar-btn" style={{ display:'none' }} onClick={() => setSidebarMovil(!sidebarMovil)}>
              {sidebarMovil ? <X size={18}/> : <Menu size={18}/>}
            </button>
            <span className="adm__topbar-titulo">ARV / {paginaActual}</span>
          </div>
          <div className="adm__topbar-acciones">
            <span style={{ fontSize:'0.78rem', color:'#a8a29e' }}>Bienvenido, <strong style={{ color:'#0f0f0e' }}>{usuario?.nombre}</strong></span>
          </div>
        </div>

        <div className="adm__contenido">
          <Routes>
            <Route index element={<PaginaDashboard />} />
            <Route path="pedidos" element={<PaginaPedidosAdmin />} />
            <Route path="productos" element={<PaginaProductosAdmin />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default PaginaAdmin;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProveedorAutenticacion, ProveedorCarrito, useAutenticacion } from './contextos/Contextos';
import Navegacion from './componentes/comunes/Navegacion';
import PiePagina from './componentes/comunes/PiePagina';
import PaginaInicio from './paginas/PaginaInicio';
import PaginaCatalogo from './paginas/PaginaCatalogo';
import { PaginaLogin, PaginaRegistro } from './paginas/PaginasAutenticacion';
import PaginaCarrito from './paginas/PaginaCarrito';
import PaginaMisPedidos from './paginas/PaginaMisPedidos';
import PaginaAdmin from './paginas/PaginaAdmin';
import './estilos/global.css';

// ── Rutas protegidas ──────────────────────────────────────────
const RutaProtegida: React.FC<{ children: React.ReactNode; soloAdmin?: boolean }> = ({
  children, soloAdmin = false,
}) => {
  const { estaAutenticado, esAdmin } = useAutenticacion();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Layout tienda (con nav y footer) ─────────────────────────
const LayoutTienda: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navegacion />
    {children}
    <PiePagina />
  </>
);

// ── App ───────────────────────────────────────────────────────
const Aplicacion: React.FC = () => (
  <BrowserRouter>
    <ProveedorAutenticacion>
      <ProveedorCarrito>
        <Routes>
          {/* Tienda normal */}
          <Route path="/" element={<LayoutTienda><PaginaInicio /></LayoutTienda>} />
          <Route path="/catalogo" element={<LayoutTienda><PaginaCatalogo /></LayoutTienda>} />
          <Route path="/login"    element={<LayoutTienda><PaginaLogin /></LayoutTienda>} />
          <Route path="/registro" element={<LayoutTienda><PaginaRegistro /></LayoutTienda>} />
          <Route path="/carrito"  element={<LayoutTienda><RutaProtegida><PaginaCarrito /></RutaProtegida></LayoutTienda>} />
          <Route path="/mis-pedidos" element={<LayoutTienda><RutaProtegida><PaginaMisPedidos /></RutaProtegida></LayoutTienda>} />

          {/* Panel admin (sin nav/footer de tienda) */}
          <Route path="/admin/*" element={<RutaProtegida soloAdmin><PaginaAdmin /></RutaProtegida>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', system-ui, sans-serif",
              background: '#0f0f0e',
              color: '#fafaf9',
              border: '1px solid #292524',
              borderRadius: '6px',
              fontSize: '0.82rem',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </ProveedorCarrito>
    </ProveedorAutenticacion>
  </BrowserRouter>
);

export default Aplicacion;

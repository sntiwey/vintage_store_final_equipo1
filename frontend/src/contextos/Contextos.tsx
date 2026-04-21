import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario, Carrito } from '../tipos/tipos';
import { servicioCarrito } from '../servicios/serviciosApi';

// ============================================================
//  Contexto de Autenticación
// ============================================================
interface ContextoAutenticacion {
  usuario: Usuario | null;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
  esAdmin: boolean;
}

const ContextoAuth = createContext<ContextoAutenticacion>({} as ContextoAutenticacion);

export const ProveedorAutenticacion = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const iniciarSesion = (nuevoUsuario: Usuario) => {
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <ContextoAuth.Provider value={{
      usuario,
      iniciarSesion,
      cerrarSesion,
      estaAutenticado: !!usuario,
      esAdmin: usuario?.rol === 'ADMIN',
    }}>
      {children}
    </ContextoAuth.Provider>
  );
};

export const useAutenticacion = () => useContext(ContextoAuth);

// ============================================================
//  Contexto de Carrito
// ============================================================
interface ContextoCarrito {
  carrito: Carrito | null;
  cargando: boolean;
  recargarCarrito: () => Promise<void>;
  totalItems: number;
}

const ContextoCarritoCtx = createContext<ContextoCarrito>({} as ContextoCarrito);

export const ProveedorCarrito = ({ children }: { children: ReactNode }) => {
  const { estaAutenticado } = useAutenticacion();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cargando, setCargando] = useState(false);

  const recargarCarrito = async () => {
    if (!estaAutenticado) return;
    setCargando(true);
    try {
      const datos = await servicioCarrito.obtener();
      setCarrito(datos);
    } catch {
      setCarrito(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (estaAutenticado) recargarCarrito();
    else setCarrito(null);
  }, [estaAutenticado]);

  return (
    <ContextoCarritoCtx.Provider value={{
      carrito,
      cargando,
      recargarCarrito,
      totalItems: carrito?.totalItems ?? 0,
    }}>
      {children}
    </ContextoCarritoCtx.Provider>
  );
};

export const useCarrito = () => useContext(ContextoCarritoCtx);

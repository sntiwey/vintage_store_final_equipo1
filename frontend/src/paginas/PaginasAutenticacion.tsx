import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { servicioAutenticacion } from '../servicios/serviciosApi';
import { useAutenticacion } from '../contextos/Contextos';
import toast from 'react-hot-toast';
import './Autenticacion.css';

// ── Login ────────────────────────────────────────────────────
export const PaginaLogin: React.FC = () => {
  const navegar = useNavigate();
  const { iniciarSesion } = useAutenticacion();
  const [datos, setDatos] = useState({ correo: '', contrasena: '' });
  const [cargando, setCargando] = useState(false);

  const cambio = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos(p => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const u = await servicioAutenticacion.iniciarSesion(datos);
      iniciarSesion(u);
      toast.success(`Bienvenido, ${u.nombre}`);
      navegar(u.rol === 'ADMIN' ? '/admin' : '/');
    } catch {
      toast.error('Correo o contraseña incorrectos');
    } finally { setCargando(false); }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">ARV</div>
        <h1 className="auth__titulo">Iniciar sesión</h1>
        <p className="auth__sub">Accede a tu cuenta para continuar</p>

        <form onSubmit={enviar} className="auth__form">
          <div className="campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" name="correo" type="email"
              value={datos.correo} onChange={cambio}
              placeholder="tu@correo.com" required autoComplete="email" />
          </div>
          <div className="campo">
            <label htmlFor="contrasena">Contraseña</label>
            <input id="contrasena" name="contrasena" type="password"
              value={datos.contrasena} onChange={cambio}
              placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <button type="submit" className="boton boton-primario auth__boton" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth__link">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>

      {/* Lado visual */}
      <div className="auth__visual">
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80" alt="ARV" />
        <div className="auth__visual-overlay">
          <p className="auth__visual-cita">"La moda es el arte de vivir en el momento."</p>
        </div>
      </div>
    </div>
  );
};

// ── Registro ─────────────────────────────────────────────────
export const PaginaRegistro: React.FC = () => {
  const navegar = useNavigate();
  const { iniciarSesion } = useAutenticacion();
  const [datos, setDatos] = useState({ nombre:'', apellido:'', correo:'', contrasena:'', telefono:'' });
  const [cargando, setCargando] = useState(false);

  const cambio = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos(p => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const u = await servicioAutenticacion.registrar(datos);
      iniciarSesion(u);
      toast.success('¡Cuenta creada!');
      navegar('/');
    } catch {
      toast.error('Error al crear la cuenta');
    } finally { setCargando(false); }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">ARV</div>
        <h1 className="auth__titulo">Crear cuenta</h1>
        <p className="auth__sub">Únete y descubre piezas únicas</p>

        <form onSubmit={enviar} className="auth__form">
          <div className="auth__fila">
            <div className="campo">
              <label>Nombre</label>
              <input name="nombre" value={datos.nombre} onChange={cambio} placeholder="Tu nombre" required />
            </div>
            <div className="campo">
              <label>Apellido</label>
              <input name="apellido" value={datos.apellido} onChange={cambio} placeholder="Tu apellido" required />
            </div>
          </div>
          <div className="campo">
            <label>Correo electrónico</label>
            <input name="correo" type="email" value={datos.correo} onChange={cambio} placeholder="tu@correo.com" required />
          </div>
          <div className="campo">
            <label>Contraseña</label>
            <input name="contrasena" type="password" value={datos.contrasena} onChange={cambio} placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="campo">
            <label>Teléfono (opcional)</label>
            <input name="telefono" value={datos.telefono} onChange={cambio} placeholder="+52 55 0000 0000" />
          </div>
          <button type="submit" className="boton boton-primario auth__boton" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth__link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>

      <div className="auth__visual">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80" alt="ARV" />
        <div className="auth__visual-overlay">
          <p className="auth__visual-cita">"Cada prenda cuenta una historia."</p>
        </div>
      </div>
    </div>
  );
};

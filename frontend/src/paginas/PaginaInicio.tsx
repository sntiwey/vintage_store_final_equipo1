import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from '../tipos/tipos';
import { servicioProducto } from '../servicios/serviciosApi';
import TarjetaProducto from '../componentes/catalogo/TarjetaProducto';
import './Inicio.css';

// ── Pantalla de bienvenida ────────────────────────────────────
const Intro: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [fase, setFase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setFase(1), 400);
    const t2 = setTimeout(() => setFase(2), 1400);
    const t3 = setTimeout(() => setFase(3), 2200);
    const t4 = setTimeout(() => { setFase(4); setTimeout(onDone, 600); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  return (
    <div className={`intro ${fase >= 4 ? 'intro--salir' : ''}`}>
      <div className={`intro__logo ${fase >= 1 ? 'visible' : ''}`}>ARV</div>
      <div className={`intro__linea ${fase >= 2 ? 'visible' : ''}`}/>
      <p className={`intro__sub ${fase >= 3 ? 'visible' : ''}`}>
        Moda circular · Piezas únicas · Hecho en México
      </p>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────
const PaginaInicio: React.FC = () => {
  const [destacados, setDestacados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarIntro, setMostrarIntro] = useState(() => !sessionStorage.getItem('arv_intro'));

  useEffect(() => {
    servicioProducto.destacados().then(setDestacados).finally(() => setCargando(false));
  }, []);

  const cerrarIntro = () => {
    sessionStorage.setItem('arv_intro', '1');
    setMostrarIntro(false);
  };

  return (
    <>
      {mostrarIntro && <Intro onDone={cerrarIntro} />}

      <main className="inicio">

        {/* ── Hero split ── */}
        <section className="inicio__hero">
          <div className="inicio__hero-mitad inicio__hero-mitad--izq">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85"
              alt="Mujer ARV"
            />
            <div className="inicio__hero-overlay"/>
            <div className="inicio__hero-texto">
              <p className="inicio__hero-eyebrow">Nueva colección</p>
              <h2 className="inicio__hero-titulo">Mujer</h2>
              <Link to="/catalogo?q=mujer" className="inicio__hero-cta">Descubrir →</Link>
            </div>
          </div>
          <div className="inicio__hero-mitad inicio__hero-mitad--der">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85"
              alt="Hombre ARV"
            />
            <div className="inicio__hero-overlay"/>
            <div className="inicio__hero-texto">
              <p className="inicio__hero-eyebrow">Nueva colección</p>
              <h2 className="inicio__hero-titulo">Hombre</h2>
              <Link to="/catalogo?q=hombre" className="inicio__hero-cta">Descubrir →</Link>
            </div>
          </div>
        </section>

        {/* ── Manifiesto ── */}
        <section className="inicio__manifiesto">
          <div className="inicio__manifiesto-inner">
            <p className="inicio__manifiesto-eyebrow">Nuestra filosofía</p>
            <h2 className="inicio__manifiesto-titulo">
              Cada prenda tiene<br /><em>una sola historia.</em>
            </h2>
            <p className="inicio__manifiesto-desc">
              Seleccionamos piezas vintage de los 70s, 80s y 90s con criterio editorial.
              Calidad verificada, autenticidad garantizada, moda que respeta el planeta.
            </p>
          </div>
        </section>

        {/* ── Categorías ── */}
        <section className="inicio__cats">
          {[
            { label: 'Chamarras',  q: 'chamarras',  img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
            { label: 'Pantalones', q: 'pantalones', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
            { label: 'Camisas',    q: 'camisas',    img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
            { label: 'Accesorios', q: 'accesorios', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
          ].map(c => (
            <Link key={c.q} to={`/catalogo?q=${c.q}`} className="inicio__cat">
              <img src={c.img} alt={c.label} />
              <div className="inicio__cat-label">{c.label}</div>
            </Link>
          ))}
        </section>

        {/* ── Destacados ── */}
        <section className="inicio__destacados">
          <div className="inicio__seccion-header contenedor">
            <div>
              <p className="inicio__seccion-eyebrow">Selección editorial</p>
              <h2 className="inicio__seccion-titulo">Piezas destacadas</h2>
            </div>
            <Link to="/catalogo" className="inicio__ver-todo">Ver colección completa →</Link>
          </div>
          {cargando ? (
            <div className="cargando"><div className="spinner"/></div>
          ) : (
            <div className="cuadricula-productos fade-up">
              {destacados.slice(0, 8).map(p => <TarjetaProducto key={p.id} producto={p} />)}
            </div>
          )}
        </section>

        {/* ── Banner eras ── */}
        <section className="inicio__eras">
          {[
            { era: '70s', label: 'Los Setenta', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
            { era: '80s', label: 'Los Ochenta', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80' },
            { era: '90s', label: 'Los Noventa', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80' },
          ].map(({ era, label, img }) => (
            <Link key={era} to={`/catalogo?era=${era}`} className="inicio__era">
              <img src={img} alt={label} />
              <div className="inicio__era-overlay"/>
              <div className="inicio__era-info">
                <span className="inicio__era-eyebrow">Colección</span>
                <span className="inicio__era-titulo">{label}</span>
                <span className="inicio__era-cta">Explorar →</span>
              </div>
            </Link>
          ))}
        </section>

        {/* ── Valores ── */}
        <section className="inicio__valores">
          {[
            { ico: '✦', titulo: 'Piezas únicas', desc: 'Cada prenda seleccionada a mano. Sin repetidos.' },
            { ico: '◎', titulo: 'Calidad verificada', desc: 'Revisamos autenticidad y condición antes de publicar.' },
            { ico: '→', titulo: 'Envío a México', desc: 'Empaque cuidadoso. Gratis en compras +$999.' },
          ].map(v => (
            <div key={v.titulo} className="inicio__valor">
              <span className="inicio__valor-ico">{v.ico}</span>
              <strong>{v.titulo}</strong>
              <p>{v.desc}</p>
            </div>
          ))}
        </section>

        {/* ── CTA final ── */}
        <section className="inicio__cta">
          <div className="inicio__cta-inner">
            <p className="inicio__cta-eyebrow">Colección limitada</p>
            <h2 className="inicio__cta-titulo">Cada pieza tiene<br /><em>una sola oportunidad.</em></h2>
            <p className="inicio__cta-sub">Si te enamora, no la dejes ir.</p>
            <Link to="/catalogo" className="boton boton-primario" style={{ background: '#fff', color: '#0a0a0a', borderColor: '#fff' }}>
              Ver Catálogo
            </Link>
          </div>
        </section>

      </main>
    </>
  );
};

export default PaginaInicio;

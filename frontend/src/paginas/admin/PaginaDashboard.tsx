import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { EstadisticasDashboard, VentasPorDia } from '../../tipos/tipos';
import { servicioAdmin } from '../../servicios/serviciosApi';

// ── Mini gráfica SVG inline ──────────────────────────────────
const GraficaLinea: React.FC<{ datos: VentasPorDia[]; dias: number; onDias: (d: number) => void }> = ({ datos, dias, onDias }) => {
  if (!datos.length) return <div className="adm__chart-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'#a8a29e' }}>Sin datos</div>;

  const W = 900; const H = 180; const PAD = { t: 20, r: 20, b: 30, l: 50 };
  const maxVal = Math.max(...datos.map(d => d.ingresos), 1);
  const pts = datos.map((d, i) => ({
    x: PAD.l + (i / (datos.length - 1 || 1)) * (W - PAD.l - PAD.r),
    y: PAD.t + (1 - d.ingresos / maxVal) * (H - PAD.t - PAD.b),
    d,
  }));
  const linea = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${linea} L${pts[pts.length-1].x},${H-PAD.b} L${pts[0].x},${H-PAD.b} Z`;

  const fmtFecha = (f: string) => { const d = new Date(f); return d.toLocaleDateString('es-MX', { weekday: 'short' }).slice(0,3); };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
        <div>
          <div className="adm__chart-titulo">Ventas e ingresos</div>
          <div className="adm__chart-subtitulo">Rendimiento por período</div>
        </div>
        <div className="adm__chart-tabs">
          {[7, 14, 30].map(d => (
            <button key={d} className={`adm__chart-tab ${dias === d ? 'activo' : ''}`} onClick={() => onDias(d)}>
              {d === 7 ? '7 días' : d === 14 ? '2 semanas' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      <div className="adm__chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="adm__chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradChart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02"/>
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0,0.25,0.5,0.75,1].map(p => (
            <line key={p} x1={PAD.l} y1={PAD.t + p*(H-PAD.t-PAD.b)} x2={W-PAD.r} y2={PAD.t + p*(H-PAD.t-PAD.b)} stroke="#e5e5e3" strokeWidth="1"/>
          ))}
          {/* Y labels */}
          {[0,0.5,1].map(p => (
            <text key={p} x={PAD.l-6} y={PAD.t + (1-p)*(H-PAD.t-PAD.b)+4} textAnchor="end" className="adm__chart-eje-x">
              ${((maxVal*p)/1000).toFixed(0)}k
            </text>
          ))}
          <path d={area} className="adm__chart-area"/>
          <path d={linea} className="adm__chart-linea"/>
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" className="adm__chart-punto">
              <title>${p.d.ingresos.toFixed(2)} — {p.d.pedidos} pedidos</title>
            </circle>
          ))}
          {/* X labels */}
          {pts.filter((_, i) => i % Math.ceil(datos.length / 7) === 0).map((p, i) => (
            <text key={i} x={p.x} y={H - 4} textAnchor="middle" className="adm__chart-eje-x">{fmtFecha(p.d.fecha)}</text>
          ))}
        </svg>
      </div>
    </div>
  );
};

// ── Dashboard principal ──────────────────────────────────────
const PaginaDashboard: React.FC = () => {
  const [stats, setStats] = useState<EstadisticasDashboard | null>(null);
  const [ventas, setVentas] = useState<VentasPorDia[]>([]);
  const [dias, setDias] = useState(7);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [s, v] = await Promise.all([servicioAdmin.estadisticas(), servicioAdmin.ventasPorDia(dias)]);
      setStats(s); setVentas(v);
    } finally { setCargando(false); }
  }, [dias]);

  useEffect(() => { cargar(); }, [cargar]);

  const kpis = stats ? [
    { label: 'Ventas Totales', valor: `$${stats.ventasTotales.toLocaleString('es-MX', {minimumFractionDigits:2})}`, delta: null, icono: <DollarSign size={20}/>, color: 'azul' },
    { label: 'Total Pedidos', valor: stats.totalPedidos, delta: `${stats.pedidosHoy} hoy`, icono: <ShoppingBag size={20}/>, color: 'verde' },
    { label: 'Productos', valor: stats.totalProductos, delta: `${stats.productosStockBajo} stock bajo`, icono: <Package size={20}/>, color: 'naranja' },
    { label: 'Clientes', valor: stats.totalUsuarios, delta: null, icono: <Users size={20}/>, color: 'morado' },
  ] : [];

  const estadosPedido = stats ? [
    { label: 'Pendientes', val: stats.pedidosPendientes, color: '#d97706' },
    { label: 'Enviados',   val: stats.pedidosEnviados,   color: '#3b82f6' },
    { label: 'Entregados', val: stats.pedidosEntregados, color: '#16a34a' },
    { label: 'Cancelados', val: stats.pedidosCancelados, color: '#dc2626' },
  ] : [];

  if (cargando) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12, color:'#a8a29e', fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>
      <div className="adm__spin" style={{ width:20, height:20, border:'2px solid #e5e5e3', borderTopColor:'#0f0f0e', borderRadius:'50%' }}/>
      Cargando dashboard
    </div>
  );

  return (
    <div>
      <div className="adm__page-header">
        <h1 className="adm__page-titulo">Dashboard</h1>
        <p className="adm__page-subtitulo">Resumen operativo · ARV Tienda Vintage</p>
      </div>

      {/* KPIs */}
      <div className="adm__kpis">
        {kpis.map(k => (
          <div key={k.label} className="adm__kpi">
            <div>
              <div className="adm__kpi-label">{k.label}</div>
              <div className="adm__kpi-valor">{k.valor}</div>
              {k.delta && <div className="adm__kpi-delta pos"><ArrowUpRight size={12}/>{k.delta}</div>}
            </div>
            <div className={`adm__kpi-icono ${k.color}`}>{k.icono}</div>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      <div className="adm__chart-card">
        <GraficaLinea datos={ventas} dias={dias} onDias={d => { setDias(d); setCargando(false); }} />
      </div>

      {/* Grid 2 cols */}
      <div className="adm__grid-2" style={{ gap: 20 }}>

        {/* Estados de pedidos */}
        <div className="adm__tabla-card">
          <div className="adm__tabla-header">
            <div>
              <div className="adm__tabla-titulo">Estado de Pedidos</div>
              <div style={{ fontSize:'0.75rem', color:'#a8a29e', marginTop: 2 }}>Distribución actual</div>
            </div>
            <Link to="/admin/pedidos" className="adm__btn adm__btn-secundario" style={{ fontSize:'0.72rem' }}>Ver todos →</Link>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            {estadosPedido.map(e => {
              const total = stats!.totalPedidos || 1;
              const pct = Math.round((e.val / total) * 100);
              return (
                <div key={e.label} style={{ marginBottom: 14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom: 5 }}>
                    <span style={{ color:'#0f0f0e', fontWeight:500 }}>{e.label}</span>
                    <span style={{ color:'#78716c' }}>{e.val} <span style={{ color:'#a8a29e' }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 5, background: '#f5f5f4', borderRadius: 3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: e.color, borderRadius: 3, transition:'width 0.5s ease' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas stock */}
        <div className="adm__tabla-card">
          <div className="adm__tabla-header">
            <div>
              <div className="adm__tabla-titulo">Alertas de Inventario</div>
              <div style={{ fontSize:'0.75rem', color:'#a8a29e', marginTop: 2 }}>{stats?.productosStockBajo} productos con stock bajo</div>
            </div>
            <Link to="/admin/productos" className="adm__btn adm__btn-secundario" style={{ fontSize:'0.72rem' }}>Gestionar →</Link>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            {(stats?.productosStockBajo || 0) > 0 ? (
              <div style={{ display:'flex', gap: 10, alignItems:'flex-start', background:'#fffbeb', borderRadius: 8, padding: 14 }}>
                <AlertTriangle size={16} style={{ color:'#d97706', flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:500, color:'#92400e' }}>Stock bajo detectado</div>
                  <div style={{ fontSize:'0.75rem', color:'#b45309', marginTop: 4 }}>{stats?.productosStockBajo} productos con 2 piezas o menos. Considera reabastecer.</div>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', gap: 10, alignItems:'flex-start', background:'#f0fdf4', borderRadius: 8, padding: 14 }}>
                <TrendingUp size={16} style={{ color:'#16a34a', flexShrink: 0, marginTop: 2 }}/>
                <div style={{ fontSize:'0.82rem', color:'#14532d' }}>Inventario en buen estado. Sin alertas activas.</div>
              </div>
            )}
            <div style={{ marginTop: 16, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
              {[
                { l: 'Total productos', v: stats?.totalProductos },
                { l: 'Pedidos pendientes', v: stats?.pedidosPendientes },
                { l: 'Ventas hoy', v: `$${(stats?.ventasHoy || 0).toFixed(2)}` },
                { l: 'Pedidos hoy', v: stats?.pedidosHoy },
              ].map(item => (
                <div key={item.l} style={{ background:'#fafaf9', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontSize:'0.66rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#a8a29e', marginBottom: 3 }}>{item.l}</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:600, color:'#0f0f0e' }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaDashboard;

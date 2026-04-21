import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2, RefreshCw, X } from 'lucide-react';
import type { ResumenPedidoAdmin } from '../../tipos/tipos';
import { servicioAdmin } from '../../servicios/serviciosApi';
import toast from 'react-hot-toast';

import MapaRastreo from '../../componentes/admin/MapaRastreo';

const ESTADOS = ['PENDIENTE','PAGADO','ENVIADO','ENTREGADO','CANCELADO'];
const ESTADOS_SIGUIENTE: Record<string, string[]> = {
  PENDIENTE:  ['PAGADO','CANCELADO'],
  PAGADO:     ['ENVIADO','CANCELADO'],
  ENVIADO:    ['ENTREGADO','CANCELADO'],
  ENTREGADO:  [],
  CANCELADO:  [],
};

const PaginaPedidosAdmin: React.FC = () => {
  const [pedidos, setPedidos] = useState<ResumenPedidoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPags, setTotalPags] = useState(1);
  const [pagina, setPagina] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalPedido, setModalPedido] = useState<ResumenPedidoAdmin | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await servicioAdmin.listarPedidos(pagina, 10, filtro || undefined);
      setPedidos(data.content);
      setTotal(data.totalElements);
      setTotalPags(data.totalPages);
    } finally { setCargando(false); }
  }, [pagina, filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (id: number, estado: string) => {
    setCambiandoEstado(true);
    try {
      const actualizado = await servicioAdmin.cambiarEstadoPedido(id, estado);
      toast.success(`Estado cambiado a ${estado}`);
      if (modalPedido?.id === id) setModalPedido(actualizado);
      cargar();
    } catch { toast.error('Error al cambiar estado'); }
    finally { setCambiandoEstado(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este pedido definitivamente?')) return;
    try {
      await servicioAdmin.eliminarPedido(id);
      toast.success('Pedido eliminado');
      setModalPedido(null);
      cargar();
    } catch { toast.error('Error al eliminar'); }
  };

  const pedidosFiltrados = pedidos.filter(p =>
    !busqueda ||
    p.numeroPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clienteCorreo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Contadores por estado
  const contadores = ESTADOS.reduce((acc, e) => ({ ...acc, [e]: pedidos.filter(p => p.estado === e).length }), {} as Record<string, number>);

  return (
    <div>
      <div className="adm__page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="adm__page-titulo">Pedidos</h1>
          <p className="adm__page-subtitulo">Gestión y seguimiento de todos los pedidos</p>
        </div>
        <button className="adm__btn adm__btn-secundario" onClick={cargar}><RefreshCw size={14}/> Actualizar</button>
      </div>

      {/* KPI mini */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {[
          { l: 'Total hoy', v: total, color:'#0f0f0e' },
          { l: 'Pendientes', v: contadores.PENDIENTE || 0, color:'#d97706' },
          { l: 'Enviados',   v: contadores.ENVIADO   || 0, color:'#3b82f6' },
          { l: 'Entregados', v: contadores.ENTREGADO || 0, color:'#16a34a' },
          { l: 'Cancelados', v: contadores.CANCELADO || 0, color:'#dc2626' },
        ].map(k => (
          <div key={k.l} style={{ background:'#fff', border:'1px solid #e5e5e3', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:'0.66rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#a8a29e', marginBottom:4 }}>{k.l}</div>
            <div style={{ fontSize:'1.5rem', fontWeight:700, color: k.color }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="adm__tabla-card">
        <div className="adm__tabla-header">
          <div className="adm__filtros">
            <button className={`adm__filtro ${!filtro ? 'activo' : ''}`} onClick={() => { setFiltro(''); setPagina(0); }}>Todos</button>
            {ESTADOS.map(e => (
              <button key={e} className={`adm__filtro ${filtro === e ? 'activo' : ''}`} onClick={() => { setFiltro(e); setPagina(0); }}>
                {e.charAt(0)+e.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="adm__buscar">
            <Search size={14}/>
            <input placeholder="Buscar pedido, cliente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            {busqueda && <button onClick={() => setBusqueda('')} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', color:'#a8a29e', padding:0 }}><X size={12}/></button>}
          </div>
        </div>

        {cargando ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#a8a29e' }}>
            <div className="adm__spin" style={{ width:20, height:20, border:'2px solid #e5e5e3', borderTopColor:'#3b82f6', borderRadius:'50%', margin:'0 auto 10px' }}/>
            Cargando pedidos...
          </div>
        ) : (
          <table className="adm__tabla">
            <thead>
              <tr>
                <th># Pedido</th>
                <th>Cliente</th>
                <th>Ciudad</th>
                <th>Items</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr><td colSpan={8} className="adm__tabla-vacio">No se encontraron pedidos</td></tr>
              ) : pedidosFiltrados.map(p => (
                <tr key={p.id} style={{ cursor:'pointer' }} onClick={() => setModalPedido(p)}>
                  <td><span style={{ color:'#3b82f6', fontWeight:500, fontSize:'0.82rem' }}>{p.numeroPedido}</span></td>
                  <td>
                    <div style={{ fontWeight:500, fontSize:'0.82rem' }}>{p.clienteNombre}</div>
                    <div style={{ fontSize:'0.72rem', color:'#a8a29e' }}>{p.clienteCorreo}</div>
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'#78716c' }}>{p.ciudad || '—'}</td>
                  <td style={{ fontSize:'0.82rem' }}>{p.totalItems} piezas</td>
                  <td><span className={`adm__estado ${p.estado}`}>{p.estado.charAt(0)+p.estado.slice(1).toLowerCase()}</span></td>
                  <td style={{ fontWeight:600 }}>${p.total.toFixed(2)}</td>
                  <td style={{ fontSize:'0.78rem', color:'#a8a29e' }}>{p.creadoEn}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="adm__btn-icon peligro" title="Eliminar" onClick={() => eliminar(p.id)}><Trash2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="adm__paginacion">
          <span className="adm__pag-info">Mostrando {pedidosFiltrados.length} de {total} pedidos</span>
          <div className="adm__pag-botones">
            <button className="adm__pag-btn" disabled={pagina === 0} onClick={() => setPagina(p => p-1)}><ChevronLeft size={14}/></button>
            {Array.from({ length: Math.min(totalPags, 5) }, (_, i) => (
              <button key={i} className={`adm__pag-btn ${i === pagina ? 'activo' : ''}`} onClick={() => setPagina(i)}>{i+1}</button>
            ))}
            <button className="adm__pag-btn" disabled={pagina >= totalPags-1} onClick={() => setPagina(p => p+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {/* Modal detalle pedido */}
      {modalPedido && (
        <div className="adm__modal-fondo" onClick={() => setModalPedido(null)}>
          <div className="adm__modal" onClick={e => e.stopPropagation()}>
            <div className="adm__modal-head">
              <h3>Pedido {modalPedido.numeroPedido}</h3>
              <button className="adm__modal-cerrar" onClick={() => setModalPedido(null)}><X size={16}/></button>
            </div>
            <div className="adm__modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                {[
                  { l: 'Cliente', v: modalPedido.clienteNombre },
                  { l: 'Correo',  v: modalPedido.clienteCorreo },
                  { l: 'Dirección', v: modalPedido.direccion || '—' },
                  { l: 'Ciudad', v: modalPedido.ciudad || '—' },
                  { l: 'Total', v: `$${modalPedido.total.toFixed(2)}` },
                  { l: 'Fecha', v: modalPedido.creadoEn },
                ].map(f => (
                  <div key={f.l} style={{ background:'#fafaf9', borderRadius:6, padding:'10px 12px' }}>
                    <div style={{ fontSize:'0.66rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#a8a29e', marginBottom:2 }}>{f.l}</div>
                    <div style={{ fontSize:'0.85rem', fontWeight:500, color:'#0f0f0e' }}>{f.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:8, fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#a8a29e' }}>Estado actual</div>
              <span className={`adm__estado ${modalPedido.estado}`} style={{ marginBottom:16, display:'inline-flex' }}>
                {modalPedido.estado.charAt(0)+modalPedido.estado.slice(1).toLowerCase()}
              </span>
              {ESTADOS_SIGUIENTE[modalPedido.estado]?.length > 0 && (
                <div>
                  <div style={{ margin:'16px 0 10px', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#a8a29e' }}>Cambiar estado a</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {ESTADOS_SIGUIENTE[modalPedido.estado].map(e => (
                      <button key={e} className="adm__btn adm__btn-secundario" disabled={cambiandoEstado}
                        onClick={() => cambiarEstado(modalPedido.id, e)}>
                        {e.charAt(0)+e.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <MapaRastreo
                numeroPedido={modalPedido.numeroPedido}
                estado={modalPedido.estado}
              />
            </div>
            <div className="adm__modal-footer">
              <button className="adm__btn adm__btn-secundario" onClick={() => setModalPedido(null)}>Cerrar</button>
              <button className="adm__btn" style={{ background:'#fef2f2', color:'#dc2626', borderColor:'#fecaca' }}
                onClick={() => eliminar(modalPedido.id)}>
                <Trash2 size={14}/> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaPedidosAdmin;

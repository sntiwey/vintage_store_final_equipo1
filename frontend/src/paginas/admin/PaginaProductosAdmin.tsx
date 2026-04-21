import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Package, Star, AlertTriangle } from 'lucide-react';
import type { Producto } from '../../tipos/tipos';
import { servicioProducto } from '../../servicios/serviciosApi';
import toast from 'react-hot-toast';

const VACIO = { nombre:'',descripcion:'',precio:'',precioOferta:'',stock:'',talla:'',color:'',marca:'',era:'',condicion:'BUENO' as 'EXCELENTE'|'BUENO'|'REGULAR',imagenUrl:'',categoriaId:'',destacado:false };

const PaginaProductosAdmin: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [panel, setPanel] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<any>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => { setCargando(true); try { const d = await servicioProducto.listar(0,100); setProductos(d.content); } finally { setCargando(false); } };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => { setEditando(null); setForm(VACIO); setPanel(true); };
  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({ nombre:p.nombre, descripcion:p.descripcion||'', precio:p.precio.toString(), precioOferta:p.precioOferta?.toString()||'', stock:p.stock.toString(), talla:p.talla||'', color:p.color||'', marca:p.marca||'', era:p.era||'', condicion:p.condicion||'BUENO', imagenUrl:p.imagenUrl||'', categoriaId:p.categoriaId?.toString()||'', destacado:p.destacado });
    setPanel(true);
  };
  const cambio = (e: React.ChangeEvent<any>) => { const {name,value,type,checked}=e.target; setForm((p:any)=>({...p,[name]:type==='checkbox'?checked:value})); };
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true);
    const datos = { ...form, precio:parseFloat(form.precio), precioOferta:form.precioOferta?parseFloat(form.precioOferta):null, stock:parseInt(form.stock), categoriaId:form.categoriaId?parseInt(form.categoriaId):null, condicion:form.condicion||'BUENO', color:form.color||null };
    try {
      if (editando) { await servicioProducto.actualizar(editando.id, datos); toast.success('Actualizado'); }
      else { await servicioProducto.crear(datos); toast.success('Creado'); }
      setPanel(false); cargar();
    } catch { toast.error('Error al guardar'); } finally { setGuardando(false); }
  };
  const eliminar = async (id: number) => {
    if (!confirm('¿Desactivar este producto?')) return;
    try { await servicioProducto.eliminar(id); toast.success('Desactivado'); cargar(); } catch { toast.error('Error'); }
  };

  const filtrados = productos.filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.marca||'').toLowerCase().includes(busqueda.toLowerCase()));
  const stats = { total:productos.length, destacados:productos.filter(p=>p.destacado).length, stockBajo:productos.filter(p=>p.stock<=2).length };

  return (
    <div>
      <div className="adm__page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1 className="adm__page-titulo">Productos</h1><p className="adm__page-subtitulo">Gestión de inventario</p></div>
        <button className="adm__btn adm__btn-primario" onClick={abrirCrear}><Plus size={14}/> Nuevo Producto</button>
      </div>

      <div className="adm__kpis" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:20 }}>
        {[
          { l:'Total productos', v:stats.total, ico:<Package size={18}/>, color:'azul' },
          { l:'Destacados', v:stats.destacados, ico:<Star size={18}/>, color:'naranja' },
          { l:'Stock bajo', v:stats.stockBajo, ico:<AlertTriangle size={18}/>, color:'rojo' },
        ].map(k=>(
          <div key={k.l} className="adm__kpi">
            <div><div className="adm__kpi-label">{k.l}</div><div className="adm__kpi-valor">{k.v}</div></div>
            <div className={`adm__kpi-icono ${k.color}`}>{k.ico}</div>
          </div>
        ))}
      </div>

      <div className="adm__tabla-card">
        <div className="adm__tabla-header">
          <div className="adm__tabla-titulo">Inventario</div>
          <div className="adm__buscar"><Search size={14}/><input placeholder="Nombre o marca..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div>
        </div>
        {cargando ? <div style={{padding:48,textAlign:'center',color:'#a8a29e'}}>Cargando...</div> : (
          <table className="adm__tabla">
            <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Era</th><th>Talla</th><th>Dest.</th><th></th></tr></thead>
            <tbody>
              {filtrados.length===0 ? <tr><td colSpan={7} className="adm__tabla-vacio">Sin productos</td></tr> : filtrados.map(p=>(
                <tr key={p.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      {p.imagenUrl ? <img src={p.imagenUrl} alt={p.nombre} style={{width:40,height:50,objectFit:'cover',borderRadius:4,flexShrink:0}}/> : <div style={{width:40,height:50,background:'#f5f5f4',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',color:'#a8a29e',flexShrink:0}}><Package size={14}/></div>}
                      <div><div style={{fontWeight:500,fontSize:'0.82rem'}}>{p.nombre}</div>{p.marca&&<div style={{fontSize:'0.72rem',color:'#a8a29e'}}>{p.marca}</div>}</div>
                    </div>
                  </td>
                  <td><span style={{fontWeight:500}}>${p.precio.toFixed(2)}</span>{p.precioOferta&&<span style={{color:'#dc2626',fontSize:'0.78rem'}}> / ${p.precioOferta.toFixed(2)}</span>}</td>
                  <td><span style={{fontWeight:600,color:p.stock===0?'#dc2626':p.stock<=2?'#d97706':'#16a34a'}}>{p.stock===0?'Agotado':p.stock}</span></td>
                  <td style={{fontSize:'0.78rem',color:'#78716c'}}>{p.era||'—'}</td>
                  <td style={{fontSize:'0.78rem'}}>{p.talla||'—'}</td>
                  <td>{p.destacado?<Star size={14} style={{color:'#d97706'}} fill="#d97706"/>:<span style={{color:'#e5e5e3'}}>—</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="adm__btn-icon" onClick={()=>abrirEditar(p)} title="Editar"><Pencil size={13}/></button>
                      <button className="adm__btn-icon peligro" onClick={()=>eliminar(p.id)} title="Eliminar"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Panel lateral */}
      {panel && (
        <div className="adm__modal-fondo" onClick={()=>setPanel(false)}>
          <div className="adm__modal" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
            <div className="adm__modal-head"><h3>{editando?'Editar Producto':'Nuevo Producto'}</h3><button className="adm__modal-cerrar" onClick={()=>setPanel(false)}><X size={16}/></button></div>
            <form onSubmit={guardar}>
              <div className="adm__modal-body">
                {form.imagenUrl && <img src={form.imagenUrl} alt="preview" style={{width:'100%',height:160,objectFit:'cover',borderRadius:8,marginBottom:16}}/>}
                <div className="adm__grid-2">
                  <div className="adm__campo"><label>Nombre *</label><input name="nombre" value={form.nombre} onChange={cambio} required/></div>
                  <div className="adm__campo"><label>Marca</label><input name="marca" value={form.marca} onChange={cambio} placeholder="Levi's..."/></div>
                </div>
                <div className="adm__campo"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={cambio} rows={2}/></div>
                <div className="adm__grid-3">
                  <div className="adm__campo"><label>Precio *</label><input name="precio" type="number" step="0.01" value={form.precio} onChange={cambio} required/></div>
                  <div className="adm__campo"><label>Oferta</label><input name="precioOferta" type="number" step="0.01" value={form.precioOferta} onChange={cambio}/></div>
                  <div className="adm__campo"><label>Stock *</label><input name="stock" type="number" value={form.stock} onChange={cambio} required/></div>
                </div>
                <div className="adm__grid-3">
                  <div className="adm__campo"><label>Era</label><select name="era" value={form.era} onChange={cambio}><option value="">—</option>{['60s','70s','80s','90s','2000s'].map(e=><option key={e} value={e}>{e}</option>)}</select></div>
                  <div className="adm__campo"><label>Talla</label><select name="talla" value={form.talla} onChange={cambio}><option value="">—</option>{['XS','S','M','L','XL','XXL','28','30','32','34','Única'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="adm__campo"><label>Condición</label><select name="condicion" value={form.condicion} onChange={cambio}><option value="EXCELENTE">Excelente</option><option value="BUENO">Bueno</option><option value="REGULAR">Regular</option></select></div>
                </div>
                <div className="adm__campo"><label>Categoría</label><select name="categoriaId" value={form.categoriaId} onChange={cambio}><option value="">—</option><option value="1">Camisetas</option><option value="2">Camisas</option><option value="3">Pantalones</option><option value="4">Accesorios</option><option value="5">Abrigos</option></select></div>
                <div className="adm__grid-2">
                  <div className="adm__campo"><label>Color</label><input name="color" value={form.color} onChange={cambio} placeholder="Negro, Azul..."/></div>
                  <div className="adm__campo"><label>URL Imagen</label><input name="imagenUrl" value={form.imagenUrl} onChange={cambio} placeholder="https://..."/></div>
                </div>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.78rem',fontWeight:500,cursor:'pointer',marginTop:4}}>
                  <input type="checkbox" name="destacado" checked={form.destacado} onChange={cambio} style={{width:15,height:15,accentColor:'#d97706'}}/>
                  Marcar como destacado
                </label>
              </div>
              <div className="adm__modal-footer">
                <button type="button" className="adm__btn adm__btn-secundario" onClick={()=>setPanel(false)}>Cancelar</button>
                <button type="submit" className="adm__btn adm__btn-primario" disabled={guardando}>{guardando?'Guardando...':editando?'Actualizar':'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PaginaProductosAdmin;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import type { Pedido } from '../tipos/tipos';
import { servicioPedido } from '../servicios/serviciosApi';
import './MisPedidos.css';

const COLOR_ESTADO: Record<string, string> = {
  PENDIENTE: '#d97706', PAGADO: '#16a34a',
  ENVIADO: '#3b82f6', ENTREGADO: '#16a34a', CANCELADO: '#dc2626',
};

const PaginaMisPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    servicioPedido.misPedidos().then(setPedidos).finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="cargando"><div className="spinner"/><span>Cargando pedidos</span></div>;

  return (
    <main className="mis-pedidos contenedor">
      <div className="mis-pedidos__encabezado">
        <h1>Mis Pedidos</h1>
      </div>

      {pedidos.length === 0 ? (
        <div className="mis-pedidos__vacio">
          <Package size={52} strokeWidth={1}/>
          <h2>Sin pedidos aún</h2>
          <p>Cuando realices una compra aparecerá aquí</p>
          <Link to="/catalogo" className="boton boton-primario">Explorar Catálogo</Link>
        </div>
      ) : (
        <div className="mis-pedidos__lista">
          {pedidos.map(p => (
            <div key={p.id} className="mis-pedidos__tarjeta">
              <div className="mis-pedidos__head">
                <div>
                  <span className="mis-pedidos__num">Pedido #{p.id}</span>
                  <span className="mis-pedidos__fecha">
                    {new Date(p.creadoEn).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })}
                  </span>
                </div>
                <span className="mis-pedidos__estado" style={{ background: COLOR_ESTADO[p.estado] }}>
                  {p.estado.charAt(0) + p.estado.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="mis-pedidos__items">
                {p.items.map((item, i) => (
                  <div key={i} className="mis-pedidos__item">
                    <span className="mis-pedidos__item-nombre">{item.productoNombre}</span>
                    <span className="mis-pedidos__item-qty">×{item.cantidad}</span>
                    <span className="mis-pedidos__item-precio">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mis-pedidos__pie">
                <span>📍 {p.direccion}{p.ciudad ? `, ${p.ciudad}` : ''}</span>
                <strong>${p.total.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default PaginaMisPedidos;

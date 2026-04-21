import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCarrito } from '../contextos/Contextos';
import { servicioCarrito, servicioPedido } from '../servicios/serviciosApi';
import FormularioEnvio from '../componentes/carrito/FormularioEnvio';
import type { SolicitudPedido } from '../tipos/tipos';
import toast from 'react-hot-toast';
import './Carrito.css';

const ENVIO_VACIO: SolicitudPedido = {
  direccion: '', colonia: '', ciudad: '', estado: '',
  codigoPostal: '', referencias: '', lat: '', lng: '',
};

const PaginaCarrito: React.FC = () => {
  const { carrito, recargarCarrito, cargando } = useCarrito();
  const navegar = useNavigate();
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [envio, setEnvio] = useState<SolicitudPedido>(ENVIO_VACIO);

  const eliminar = async (id: number) => {
    setEliminando(id);
    try { await servicioCarrito.eliminarItem(id); await recargarCarrito(); }
    catch { toast.error('Error al eliminar'); }
    finally { setEliminando(null); }
  };

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const p = await servicioPedido.crear(envio);
      await recargarCarrito();
      toast.success(`Pedido #${p.id} confirmado`);
      navegar('/mis-pedidos');
    } catch { toast.error('Error al confirmar el pedido'); }
    finally { setProcesando(false); }
  };

  if (cargando) return <div className="cargando"><div className="spinner"/><span>Cargando carrito</span></div>;

  const vacio = !carrito || carrito.items.length === 0;

  return (
    <main className="carrito contenedor">
      <div className="carrito__encabezado">
        <h1>Carrito</h1>
        {!vacio && <span className="carrito__count">{carrito!.totalItems} {carrito!.totalItems === 1 ? 'pieza' : 'piezas'}</span>}
      </div>

      {vacio ? (
        <div className="carrito__vacio">
          <ShoppingBag size={52} strokeWidth={1}/>
          <h2>Tu carrito está vacío</h2>
          <p>Descubre piezas únicas de otra época</p>
          <Link to="/catalogo" className="boton boton-primario">Explorar Catálogo</Link>
        </div>
      ) : (
        <div className="carrito__cuerpo">
          {/* Items */}
          <div className="carrito__items">
            {carrito!.items.map(item => (
              <div key={item.id} className="carrito__item">
                <div className="carrito__item-img">
                  {item.imagenUrl
                    ? <img src={item.imagenUrl} alt={item.productoNombre}/>
                    : <div className="carrito__item-placeholder">ARV</div>}
                </div>
                <div className="carrito__item-info">
                  <h3 className="carrito__item-nombre">{item.productoNombre}</h3>
                  <p className="carrito__item-meta">Cantidad: {item.cantidad}</p>
                  <p className="carrito__item-meta precio">${item.precio.toFixed(2)} c/u</p>
                </div>
                <div className="carrito__item-der">
                  <strong className="precio">${item.subtotal.toFixed(2)}</strong>
                  <button className="carrito__eliminar" onClick={() => eliminar(item.id)} disabled={eliminando === item.id}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <aside className="carrito__resumen">
            <h2 className="carrito__resumen-titulo">Resumen</h2>
            <div className="carrito__resumen-linea">
              <span>Subtotal ({carrito!.totalItems} piezas)</span>
              <span>${carrito!.total.toFixed(2)}</span>
            </div>
            <div className="carrito__resumen-linea carrito__envio">
              <span>Envío</span>
              <span>{carrito!.total >= 999 ? 'Gratis' : 'Por calcular'}</span>
            </div>
            <div className="carrito__resumen-linea carrito__total">
              <strong>Total</strong>
              <strong>${carrito!.total.toFixed(2)}</strong>
            </div>

            {!checkout ? (
              <button className="boton boton-primario carrito__cta" onClick={() => setCheckout(true)}>
                Continuar <ArrowRight size={14}/>
              </button>
            ) : (
              <FormularioEnvio
                envio={envio}
                onChange={(nuevo: SolicitudPedido) => setEnvio(nuevo)}
                onConfirmar={confirmar}
                procesando={procesando}
              />
            )}

            {carrito!.total < 999 && (
              <p className="carrito__promo">
                Agrega ${(999 - carrito!.total).toFixed(2)} más para envío gratis
              </p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
};

export default PaginaCarrito;

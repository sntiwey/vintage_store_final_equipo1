import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Producto } from '../../tipos/tipos';
import { servicioCarrito } from '../../servicios/serviciosApi';
import { useAutenticacion, useCarrito } from '../../contextos/Contextos';
import toast from 'react-hot-toast';
import './TarjetaProducto.css';

const TarjetaProducto: React.FC<{ producto: Producto }> = ({ producto }) => {
  const { estaAutenticado } = useAutenticacion();
  const { recargarCarrito } = useCarrito();
  const [agregando, setAgregando] = useState(false);

  const tieneOferta = producto.precioOferta != null && producto.precioOferta < producto.precio;
  const precio = tieneOferta ? producto.precioOferta! : producto.precio;

  const agregar = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!estaAutenticado) { toast.error('Inicia sesión para agregar'); return; }
    setAgregando(true);
    try { await servicioCarrito.agregar(producto.id, 1); await recargarCarrito(); toast.success('Agregado'); }
    catch { toast.error('Error al agregar'); }
    finally { setAgregando(false); }
  };

  return (
    <Link to={`/producto/${producto.id}`} className="tarjeta">
      <div className="tarjeta__img-wrap">
        {producto.imagenUrl
          ? <img src={producto.imagenUrl} alt={producto.nombre} className="tarjeta__img" />
          : <div className="tarjeta__img-placeholder">ARV</div>
        }
        <div className="tarjeta__tags">
          {tieneOferta && <span className="tag tag-rojo">Sale</span>}
          {producto.era && <span className="tag tag-era">{producto.era}</span>}
        </div>
        <button className="tarjeta__agregar" onClick={agregar} disabled={agregando || producto.stock === 0}>
          <ShoppingBag size={13} />
          {producto.stock === 0 ? 'Agotado' : agregando ? '...' : 'Agregar'}
        </button>
      </div>
      <div className="tarjeta__info">
        {producto.categoriaNombre && <span className="tarjeta__cat">{producto.categoriaNombre}</span>}
        <h3 className="tarjeta__nombre">{producto.nombre}</h3>
        <div className="tarjeta__pie">
          <div className="tarjeta__precios">
            <span className={`precio ${tieneOferta ? 'precio-oferta' : ''}`}>${precio.toFixed(2)}</span>
            {tieneOferta && <span className="precio precio-original">${producto.precio.toFixed(2)}</span>}
          </div>
          {producto.talla && <span className="tarjeta__talla">T.{producto.talla}</span>}
        </div>
      </div>
    </Link>
  );
};
export default TarjetaProducto;

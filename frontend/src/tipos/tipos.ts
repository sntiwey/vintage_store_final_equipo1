// ============================================================
//  Tipos del dominio - Tienda Vintage
// ============================================================

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  stock: number;
  talla?: string;
  color?: string;
  marca?: string;
  era?: string;
  condicion?: 'EXCELENTE' | 'BUENO' | 'REGULAR';
  imagenUrl?: string;
  destacado: boolean;
  categoriaNombre?: string;
  categoriaId?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
}

export interface Usuario {
  correo: string;
  nombre: string;
  rol: string;
  token: string;
}

export interface ItemCarrito {
  id: number;
  productoId: number;
  productoNombre: string;
  imagenUrl?: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Carrito {
  id: number;
  items: ItemCarrito[];
  total: number;
  totalItems: number;
}

export interface ItemPedido {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  total: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
  direccion: string;
  ciudad: string;
  creadoEn: string;
  items: ItemPedido[];
}

export interface PaginaRespuesta<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface SolicitudRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono?: string;
}

export interface SolicitudLogin {
  correo: string;
  contrasena: string;
}

export interface SolicitudPedido {
  direccion: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  referencias?: string;
  lat?: string;
  lng?: string;
}

// ── Tipos Admin ──────────────────────────────────────────────
export interface EstadisticasDashboard {
  ventasTotales: number;
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosEnviados: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
  totalProductos: number;
  productosStockBajo: number;
  totalUsuarios: number;
  ventasHoy: number;
  pedidosHoy: number;
}

export interface VentasPorDia {
  fecha: string;
  ingresos: number;
  pedidos: number;
}

export interface ResumenPedidoAdmin {
  id: number;
  numeroPedido: string;
  clienteNombre: string;
  clienteCorreo: string;
  total: number;
  estado: string;
  direccion: string;
  ciudad: string;
  creadoEn: string;
  totalItems: number;
}

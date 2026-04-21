import clienteHttp from './clienteHttp';
import type {
  Producto, Categoria, Carrito, Pedido,
  PaginaRespuesta, SolicitudRegistro, SolicitudLogin,
  Usuario, SolicitudPedido
} from '../tipos/tipos';

// ============================================================
//  Servicio de Autenticación
// ============================================================
export const servicioAutenticacion = {
  registrar: async (datos: SolicitudRegistro): Promise<Usuario> => {
    const { data } = await clienteHttp.post('/autenticacion/registrar', datos);
    return { correo: data.correo, nombre: data.nombre, rol: data.rol, token: data.token };
  },

  iniciarSesion: async (datos: SolicitudLogin): Promise<Usuario> => {
    const { data } = await clienteHttp.post('/autenticacion/login', datos);
    return { correo: data.correo, nombre: data.nombre, rol: data.rol, token: data.token };
  },
};

// ============================================================
//  Servicio de Productos
// ============================================================
export const servicioProducto = {
  listar: async (pagina = 0, tamano = 12): Promise<PaginaRespuesta<Producto>> => {
    const { data } = await clienteHttp.get(`/productos?pagina=${pagina}&tamano=${tamano}`);
    return data;
  },

  destacados: async (): Promise<Producto[]> => {
    const { data } = await clienteHttp.get('/productos/destacados');
    return data;
  },

  obtenerPorId: async (id: number): Promise<Producto> => {
    const { data } = await clienteHttp.get(`/productos/${id}`);
    return data;
  },

  buscar: async (termino: string, pagina = 0): Promise<PaginaRespuesta<Producto>> => {
    const { data } = await clienteHttp.get(`/productos/buscar?q=${termino}&pagina=${pagina}`);
    return data;
  },

  // Admin
  crear: async (producto: Partial<Producto>): Promise<Producto> => {
    const { data } = await clienteHttp.post('/admin/productos', producto);
    return data;
  },

  actualizar: async (id: number, producto: Partial<Producto>): Promise<Producto> => {
    const { data } = await clienteHttp.put(`/admin/productos/${id}`, producto);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await clienteHttp.delete(`/admin/productos/${id}`);
  },
};

// ============================================================
//  Servicio de Categorías
// ============================================================
export const servicioCategoria = {
  listar: async (): Promise<Categoria[]> => {
    const { data } = await clienteHttp.get('/categorias');
    return data;
  },
};

// ============================================================
//  Servicio de Carrito
// ============================================================
export const servicioCarrito = {
  obtener: async (): Promise<Carrito> => {
    const { data } = await clienteHttp.get('/carrito');
    return data;
  },

  agregar: async (productoId: number, cantidad: number): Promise<Carrito> => {
    const { data } = await clienteHttp.post('/carrito/agregar', { productoId, cantidad });
    return data;
  },

  eliminarItem: async (itemId: number): Promise<Carrito> => {
    const { data } = await clienteHttp.delete(`/carrito/item/${itemId}`);
    return data;
  },
};

// ============================================================
//  Servicio de Pedidos
// ============================================================
export const servicioPedido = {
  crear: async (datos: SolicitudPedido): Promise<Pedido> => {
    const { data } = await clienteHttp.post('/pedidos', datos);
    return data;
  },

  misPedidos: async (): Promise<Pedido[]> => {
    const { data } = await clienteHttp.get('/pedidos/mis-pedidos');
    return data;
  },
};

// ── Servicio Admin ─────────────────────────────────────────
export const servicioAdmin = {
  estadisticas: async () => {
    const { data } = await clienteHttp.get('/admin/estadisticas');
    return data;
  },
  ventasPorDia: async (dias = 7) => {
    const { data } = await clienteHttp.get(`/admin/estadisticas/ventas?dias=${dias}`);
    return data;
  },
  listarPedidos: async (pagina = 0, tamano = 10, estado?: string) => {
    const params = new URLSearchParams({ pagina: String(pagina), tamano: String(tamano) });
    if (estado) params.append('estado', estado);
    const { data } = await clienteHttp.get(`/admin/pedidos?${params}`);
    return data;
  },
  cambiarEstadoPedido: async (id: number, estado: string) => {
    const { data } = await clienteHttp.put(`/admin/pedidos/${id}/estado`, { estado });
    return data;
  },
  eliminarPedido: async (id: number) => {
    await clienteHttp.delete(`/admin/pedidos/${id}`);
  },
};

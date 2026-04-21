package com.tiendavintage.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DtosAdmin {

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class EstadisticasDashboard {
        private BigDecimal ventasTotales;
        private Long totalPedidos;
        private Long pedidosPendientes;
        private Long pedidosEnviados;
        private Long pedidosEntregados;
        private Long pedidosCancelados;
        private Long totalProductos;
        private Long productosStockBajo;
        private Long totalUsuarios;
        private BigDecimal ventasHoy;
        private Long pedidosHoy;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class VentasPorDia {
        private String fecha;
        private BigDecimal ingresos;
        private Long pedidos;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class ProductoMasVendido {
        private Long productoId;
        private String nombre;
        private String imagenUrl;
        private Long cantidadVendida;
        private BigDecimal ingresoGenerado;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class ResumenPedidoAdmin {
        private Long id;
        private String numeroPedido;
        private String clienteNombre;
        private String clienteCorreo;
        private BigDecimal total;
        private String estado;
        private String direccion;
        private String ciudad;
        private String creadoEn;
        private Integer totalItems;
    }

    @Data
    public static class SolicitudCambioEstado {
        private String estado;
    }
}

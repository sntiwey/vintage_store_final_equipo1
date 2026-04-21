package com.tiendavintage.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DtosPedido {

    @Data
    public static class SolicitudPedido {
        @NotBlank private String direccion;
        private String colonia;
        @NotBlank private String ciudad;
        private String estado;
        @NotBlank private String codigoPostal;
        private String referencias;
        private String lat;
        private String lng;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class RespuestaPedido {
        private Long id;
        private BigDecimal total;
        private String estado;
        private String direccion;
        private String colonia;
        private String ciudad;
        private String estadoRepublica;
        private String codigoPostal;
        private LocalDateTime creadoEn;
        private List<ItemPedidoDto> items;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class ItemPedidoDto {
        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}

package com.tiendavintage.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class DtosCarrito {

    @Data
    public static class SolicitudAgregarItem {
        @NotNull private Long productoId;
        @NotNull @Min(1) private Integer cantidad;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class RespuestaCarrito {
        private Long id;
        private List<ItemCarritoDto> items;
        private BigDecimal total;
        private Integer totalItems;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class ItemCarritoDto {
        private Long id;
        private Long productoId;
        private String productoNombre;
        private String imagenUrl;
        private BigDecimal precio;
        private Integer cantidad;
        private BigDecimal subtotal;
    }
}

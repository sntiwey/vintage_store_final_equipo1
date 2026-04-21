package com.tiendavintage.dto;

import com.tiendavintage.modelos.Producto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

public class DtosProducto {

    @Data
    public static class SolicitudProducto {
        @NotBlank private String nombre;
        private String descripcion;
        @NotNull @Positive private BigDecimal precio;
        private BigDecimal precioOferta;
        @NotNull @Min(0) private Integer stock;
        private String talla;
        private String color;
        private String marca;
        private String era;
        private Producto.Condicion condicion;
        private String imagenUrl;
        private Long categoriaId;
        private Boolean destacado;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class RespuestaProducto {
        private Long id;
        private String nombre;
        private String descripcion;
        private BigDecimal precio;
        private BigDecimal precioOferta;
        private Integer stock;
        private String talla;
        private String color;
        private String marca;
        private String era;
        private String condicion;
        private String imagenUrl;
        private Boolean destacado;
        private String categoriaNombre;
        private Long categoriaId;
    }
}

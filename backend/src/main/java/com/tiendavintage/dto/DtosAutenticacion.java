package com.tiendavintage.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class DtosAutenticacion {

    @Data
    public static class SolicitudRegistro {
        @NotBlank(message = "El nombre es obligatorio")
        private String nombre;
        @NotBlank(message = "El apellido es obligatorio")
        private String apellido;
        @Email(message = "Correo inválido") @NotBlank
        private String correo;
        @Size(min = 6, message = "Mínimo 6 caracteres")
        private String contrasena;
        private String telefono;
    }

    @Data
    public static class SolicitudLogin {
        @NotBlank private String correo;
        @NotBlank private String contrasena;
    }

    @Data @AllArgsConstructor
    public static class RespuestaToken {
        private String token;
        private String tipo;
        private String correo;
        private String nombre;
        private String rol;
    }
}

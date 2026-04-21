package com.tiendavintage.controladores;

import com.tiendavintage.dto.DtosAutenticacion.*;
import com.tiendavintage.servicios.ServicioAutenticacion;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/autenticacion")
public class ControladorAutenticacion {

    private final ServicioAutenticacion servicioAutenticacion;

    public ControladorAutenticacion(ServicioAutenticacion servicioAutenticacion) {
        this.servicioAutenticacion = servicioAutenticacion;
    }

    @PostMapping("/registrar")
    public ResponseEntity<RespuestaToken> registrar(
            @Valid @RequestBody SolicitudRegistro solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(servicioAutenticacion.registrar(solicitud));
    }

    @PostMapping("/login")
    public ResponseEntity<RespuestaToken> login(
            @Valid @RequestBody SolicitudLogin solicitud) {
        return ResponseEntity.ok(servicioAutenticacion.iniciarSesion(solicitud));
    }
}

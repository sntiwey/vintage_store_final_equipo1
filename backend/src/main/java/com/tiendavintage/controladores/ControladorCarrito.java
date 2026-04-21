package com.tiendavintage.controladores;

import com.tiendavintage.dto.DtosCarrito.*;
import com.tiendavintage.servicios.ServicioCarrito;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrito")
public class ControladorCarrito {

    private final ServicioCarrito servicioCarrito;

    public ControladorCarrito(ServicioCarrito servicioCarrito) {
        this.servicioCarrito = servicioCarrito;
    }

    @GetMapping
    public ResponseEntity<RespuestaCarrito> obtener(
            @AuthenticationPrincipal UserDetails usuario) {
        return ResponseEntity.ok(
            servicioCarrito.obtenerCarrito(usuario.getUsername()));
    }

    @PostMapping("/agregar")
    public ResponseEntity<RespuestaCarrito> agregar(
            @AuthenticationPrincipal UserDetails usuario,
            @Valid @RequestBody SolicitudAgregarItem solicitud) {
        return ResponseEntity.ok(
            servicioCarrito.agregarItem(usuario.getUsername(), solicitud));
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<RespuestaCarrito> eliminar(
            @AuthenticationPrincipal UserDetails usuario,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(
            servicioCarrito.eliminarItem(usuario.getUsername(), itemId));
    }
}

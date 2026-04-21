package com.tiendavintage.controladores;

import com.tiendavintage.dto.DtosPedido.*;
import com.tiendavintage.servicios.ServicioPedido;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
public class ControladorPedido {

    private final ServicioPedido servicioPedido;

    public ControladorPedido(ServicioPedido servicioPedido) {
        this.servicioPedido = servicioPedido;
    }

    @PostMapping
    public ResponseEntity<RespuestaPedido> crear(
            @AuthenticationPrincipal UserDetails usuario,
            @Valid @RequestBody SolicitudPedido solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(servicioPedido.crearDesdeCarrito(usuario.getUsername(), solicitud));
    }

    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<RespuestaPedido>> misPedidos(
            @AuthenticationPrincipal UserDetails usuario) {
        return ResponseEntity.ok(
            servicioPedido.misPedidos(usuario.getUsername()));
    }
}

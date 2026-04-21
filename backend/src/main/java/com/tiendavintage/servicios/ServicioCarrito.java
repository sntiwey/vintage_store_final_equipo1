package com.tiendavintage.servicios;

import com.tiendavintage.dto.DtosCarrito.*;
import com.tiendavintage.excepciones.ExcepcionNoEncontrado;
import com.tiendavintage.modelos.*;
import com.tiendavintage.repositorios.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServicioCarrito {

    private final RepositorioCarrito   repositorioCarrito;
    private final RepositorioUsuario   repositorioUsuario;
    private final RepositorioProducto  repositorioProducto;

    public ServicioCarrito(RepositorioCarrito repositorioCarrito,
                            RepositorioUsuario repositorioUsuario,
                            RepositorioProducto repositorioProducto) {
        this.repositorioCarrito  = repositorioCarrito;
        this.repositorioUsuario  = repositorioUsuario;
        this.repositorioProducto = repositorioProducto;
    }

    public RespuestaCarrito obtenerCarrito(String correo) {
        Usuario usuario = buscarUsuario(correo);
        Carrito carrito = repositorioCarrito.findByUsuarioId(usuario.getId())
            .orElseGet(() -> repositorioCarrito.save(
                Carrito.builder().usuario(usuario).build()));
        return mapear(carrito);
    }

    public RespuestaCarrito agregarItem(String correo, SolicitudAgregarItem solicitud) {
        Usuario usuario = buscarUsuario(correo);
        Carrito carrito = repositorioCarrito.findByUsuarioId(usuario.getId())
            .orElseGet(() -> repositorioCarrito.save(
                Carrito.builder().usuario(usuario).build()));

        Producto producto = repositorioProducto.findById(solicitud.getProductoId())
            .orElseThrow(() -> new ExcepcionNoEncontrado(
                "Producto no encontrado: " + solicitud.getProductoId()));

        carrito.getItems().stream()
            .filter(i -> i.getProducto().getId().equals(solicitud.getProductoId()))
            .findFirst()
            .ifPresentOrElse(
                item -> item.setCantidad(item.getCantidad() + solicitud.getCantidad()),
                () -> carrito.getItems().add(
                    CarritoItem.builder()
                        .carrito(carrito)
                        .producto(producto)
                        .cantidad(solicitud.getCantidad())
                        .build())
            );

        return mapear(repositorioCarrito.save(carrito));
    }

    public RespuestaCarrito eliminarItem(String correo, Long itemId) {
        Usuario usuario = buscarUsuario(correo);
        Carrito carrito = repositorioCarrito.findByUsuarioId(usuario.getId())
            .orElseThrow(() -> new ExcepcionNoEncontrado("Carrito no encontrado"));
        carrito.getItems().removeIf(i -> i.getId().equals(itemId));
        return mapear(repositorioCarrito.save(carrito));
    }

    private Usuario buscarUsuario(String correo) {
        return repositorioUsuario.findByCorreo(correo)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Usuario no encontrado: " + correo));
    }

    private RespuestaCarrito mapear(Carrito carrito) {
        List<ItemCarritoDto> items = carrito.getItems().stream().map(i -> {
            BigDecimal precio = i.getProducto().getPrecioOferta() != null
                ? i.getProducto().getPrecioOferta()
                : i.getProducto().getPrecio();
            return new ItemCarritoDto(
                i.getId(),
                i.getProducto().getId(),
                i.getProducto().getNombre(),
                i.getProducto().getImagenUrl(),
                precio,
                i.getCantidad(),
                precio.multiply(BigDecimal.valueOf(i.getCantidad())));
        }).collect(Collectors.toList());

        BigDecimal total = items.stream()
            .map(ItemCarritoDto::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
            .mapToInt(ItemCarritoDto::getCantidad).sum();

        return new RespuestaCarrito(carrito.getId(), items, total, totalItems);
    }
}

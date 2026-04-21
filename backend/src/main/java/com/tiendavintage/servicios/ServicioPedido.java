package com.tiendavintage.servicios;

import com.tiendavintage.dto.DtosPedido.*;
import com.tiendavintage.excepciones.ExcepcionNegocio;
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
public class ServicioPedido {

    private final RepositorioPedido  repositorioPedido;
    private final RepositorioCarrito repositorioCarrito;
    private final RepositorioUsuario repositorioUsuario;

    public ServicioPedido(RepositorioPedido repositorioPedido,
                           RepositorioCarrito repositorioCarrito,
                           RepositorioUsuario repositorioUsuario) {
        this.repositorioPedido  = repositorioPedido;
        this.repositorioCarrito = repositorioCarrito;
        this.repositorioUsuario = repositorioUsuario;
    }

    public RespuestaPedido crearDesdeCarrito(String correo, SolicitudPedido solicitud) {
        Usuario usuario = repositorioUsuario.findByCorreo(correo)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Usuario no encontrado"));

        Carrito carrito = repositorioCarrito.findByUsuarioId(usuario.getId())
            .orElseThrow(() -> new ExcepcionNegocio("El carrito está vacío"));

        if (carrito.getItems().isEmpty()) {
            throw new ExcepcionNegocio("El carrito está vacío");
        }

        Pedido pedido = Pedido.builder()
            .usuario(usuario)
            .direccion(solicitud.getDireccion())
            .colonia(solicitud.getColonia())
            .ciudad(solicitud.getCiudad())
            .estadoRepublica(solicitud.getEstado())
            .codigoPostal(solicitud.getCodigoPostal())
            .referencias(solicitud.getReferencias())
            .lat(solicitud.getLat())
            .lng(solicitud.getLng())
            .estado(Pedido.EstadoPedido.PENDIENTE)
            .total(BigDecimal.ZERO)
            .build();

        List<PedidoItem> items = carrito.getItems().stream().map(ci -> {
            BigDecimal precio = ci.getProducto().getPrecioOferta() != null
                ? ci.getProducto().getPrecioOferta()
                : ci.getProducto().getPrecio();
            return PedidoItem.builder()
                .pedido(pedido)
                .producto(ci.getProducto())
                .cantidad(ci.getCantidad())
                .precioUnitario(precio)
                .build();
        }).collect(Collectors.toList());

        BigDecimal total = items.stream()
            .map(i -> i.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(i.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        pedido.setItems(items);
        pedido.setTotal(total);

        Pedido guardado = repositorioPedido.save(pedido);
        carrito.getItems().clear();
        repositorioCarrito.save(carrito);

        return mapear(guardado);
    }

    public List<RespuestaPedido> misPedidos(String correo) {
        Usuario usuario = repositorioUsuario.findByCorreo(correo)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Usuario no encontrado"));
        return repositorioPedido
            .findByUsuarioIdOrderByCreadoEnDesc(usuario.getId())
            .stream().map(this::mapear).collect(Collectors.toList());
    }

    private RespuestaPedido mapear(Pedido p) {
        List<ItemPedidoDto> items = p.getItems().stream().map(i ->
            new ItemPedidoDto(
                i.getProducto().getNombre(),
                i.getCantidad(),
                i.getPrecioUnitario(),
                i.getPrecioUnitario().multiply(BigDecimal.valueOf(i.getCantidad())))
        ).collect(Collectors.toList());

        return new RespuestaPedido(
            p.getId(), p.getTotal(), p.getEstado().name(),
            p.getDireccion(), p.getColonia(), p.getCiudad(),
            p.getEstadoRepublica(), p.getCodigoPostal(),
            p.getCreadoEn(), items);
    }
}

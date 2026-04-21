package com.tiendavintage.servicios;

import com.tiendavintage.dto.DtosAdmin.*;
import com.tiendavintage.dto.DtosPedido.*;
import com.tiendavintage.excepciones.ExcepcionNegocio;
import com.tiendavintage.excepciones.ExcepcionNoEncontrado;
import com.tiendavintage.modelos.Pedido;
import com.tiendavintage.repositorios.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ServicioAdmin {

    private final RepositorioPedido  repositorioPedido;
    private final RepositorioProducto repositorioProducto;
    private final RepositorioUsuario repositorioUsuario;

    public ServicioAdmin(RepositorioPedido repositorioPedido,
                          RepositorioProducto repositorioProducto,
                          RepositorioUsuario repositorioUsuario) {
        this.repositorioPedido  = repositorioPedido;
        this.repositorioProducto = repositorioProducto;
        this.repositorioUsuario  = repositorioUsuario;
    }

    // ── Dashboard KPIs ──────────────────────────────────────
    public EstadisticasDashboard obtenerEstadisticas() {
        List<Pedido> todos = repositorioPedido.findAll();

        BigDecimal ventasTotales = todos.stream()
            .filter(p -> p.getEstado() != Pedido.EstadoPedido.CANCELADO)
            .map(Pedido::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime inicioDia = LocalDateTime.now().toLocalDate().atStartOfDay();
        List<Pedido> hoy = todos.stream()
            .filter(p -> p.getCreadoEn() != null && p.getCreadoEn().isAfter(inicioDia))
            .collect(Collectors.toList());

        BigDecimal ventasHoy = hoy.stream()
            .filter(p -> p.getEstado() != Pedido.EstadoPedido.CANCELADO)
            .map(Pedido::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new EstadisticasDashboard(
            ventasTotales,
            (long) todos.size(),
            contarPorEstado(todos, Pedido.EstadoPedido.PENDIENTE),
            contarPorEstado(todos, Pedido.EstadoPedido.ENVIADO),
            contarPorEstado(todos, Pedido.EstadoPedido.ENTREGADO),
            contarPorEstado(todos, Pedido.EstadoPedido.CANCELADO),
            repositorioProducto.count(),
            repositorioProducto.findAll().stream().filter(p -> p.getStock() <= 2 && p.getActivo()).count(),
            repositorioUsuario.count(),
            ventasHoy,
            (long) hoy.size()
        );
    }

    // ── Ventas por día (últimos 7 días) ─────────────────────
    public List<VentasPorDia> ventasPorDia(int dias) {
        LocalDateTime desde = LocalDateTime.now().minusDays(dias);
        List<Pedido> pedidos = repositorioPedido.findAll().stream()
            .filter(p -> p.getCreadoEn() != null && p.getCreadoEn().isAfter(desde)
                      && p.getEstado() != Pedido.EstadoPedido.CANCELADO)
            .collect(Collectors.toList());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, List<Pedido>> porDia = pedidos.stream()
            .collect(Collectors.groupingBy(p -> p.getCreadoEn().format(fmt)));

        List<VentasPorDia> resultado = new ArrayList<>();
        for (int i = dias - 1; i >= 0; i--) {
            String fecha = LocalDateTime.now().minusDays(i).format(fmt);
            List<Pedido> delDia = porDia.getOrDefault(fecha, Collections.emptyList());
            BigDecimal ingresos = delDia.stream().map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
            resultado.add(new VentasPorDia(fecha, ingresos, (long) delDia.size()));
        }
        return resultado;
    }

    // ── Todos los pedidos para admin ─────────────────────────
    public Page<ResumenPedidoAdmin> listarPedidos(int pagina, int tamano, String estado) {
        Pageable paginacion = PageRequest.of(pagina, tamano, Sort.by("creadoEn").descending());
        Page<Pedido> pagePedidos;

        if (estado != null && !estado.isBlank()) {
            Pedido.EstadoPedido estadoEnum = Pedido.EstadoPedido.valueOf(estado.toUpperCase());
            pagePedidos = repositorioPedido.findByEstadoOrderByCreadoEnDesc(estadoEnum, paginacion);
        } else {
            pagePedidos = repositorioPedido.findAllByOrderByCreadoEnDesc(paginacion);
        }

        return pagePedidos.map(this::mapearPedido);
    }

    // ── Cambiar estado de pedido ─────────────────────────────
    @Transactional
    public ResumenPedidoAdmin cambiarEstado(Long id, String nuevoEstado) {
        Pedido pedido = repositorioPedido.findById(id)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Pedido no encontrado: " + id));

        try {
            pedido.setEstado(Pedido.EstadoPedido.valueOf(nuevoEstado.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ExcepcionNegocio("Estado inválido: " + nuevoEstado);
        }
        return mapearPedido(repositorioPedido.save(pedido));
    }

    // ── Eliminar pedido ──────────────────────────────────────
    @Transactional
    public void eliminarPedido(Long id) {
        if (!repositorioPedido.existsById(id)) {
            throw new ExcepcionNoEncontrado("Pedido no encontrado: " + id);
        }
        repositorioPedido.deleteById(id);
    }

    private long contarPorEstado(List<Pedido> pedidos, Pedido.EstadoPedido estado) {
        return pedidos.stream().filter(p -> p.getEstado() == estado).count();
    }

    private ResumenPedidoAdmin mapearPedido(Pedido p) {
        String nombre = p.getUsuario() != null
            ? p.getUsuario().getNombre() + " " + p.getUsuario().getApellido()
            : "—";
        String correo = p.getUsuario() != null ? p.getUsuario().getCorreo() : "—";
        String fecha = p.getCreadoEn() != null
            ? p.getCreadoEn().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            : "—";
        return new ResumenPedidoAdmin(
            p.getId(),
            "ARV-" + String.format("%04d", p.getId()),
            nombre, correo, p.getTotal(),
            p.getEstado().name(),
            p.getDireccion(), p.getCiudad(),
            fecha,
            p.getItems() != null ? p.getItems().size() : 0
        );
    }
}

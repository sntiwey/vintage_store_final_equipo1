package com.tiendavintage.controladores;

import com.tiendavintage.dto.DtosAdmin.*;
import com.tiendavintage.dto.DtosProducto.*;
import com.tiendavintage.servicios.ServicioAdmin;
import com.tiendavintage.servicios.ServicioProducto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class ControladorAdmin {

    private final ServicioProducto servicioProducto;
    private final ServicioAdmin    servicioAdmin;

    public ControladorAdmin(ServicioProducto servicioProducto,
                             ServicioAdmin servicioAdmin) {
        this.servicioProducto = servicioProducto;
        this.servicioAdmin    = servicioAdmin;
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasDashboard> estadisticas() {
        return ResponseEntity.ok(servicioAdmin.obtenerEstadisticas());
    }

    @GetMapping("/estadisticas/ventas")
    public ResponseEntity<List<VentasPorDia>> ventasPorDia(
            @RequestParam(defaultValue = "7") int dias) {
        return ResponseEntity.ok(servicioAdmin.ventasPorDia(dias));
    }

    @GetMapping("/pedidos")
    public ResponseEntity<Page<ResumenPedidoAdmin>> listarPedidos(
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @RequestParam(required = false)    String estado) {
        return ResponseEntity.ok(servicioAdmin.listarPedidos(pagina, tamano, estado));
    }

    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<ResumenPedidoAdmin> cambiarEstado(
            @PathVariable Long id,
            @RequestBody SolicitudCambioEstado solicitud) {
        return ResponseEntity.ok(servicioAdmin.cambiarEstado(id, solicitud.getEstado()));
    }

    @DeleteMapping("/pedidos/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        servicioAdmin.eliminarPedido(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/productos")
    public ResponseEntity<RespuestaProducto> crearProducto(
            @Valid @RequestBody SolicitudProducto solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(servicioProducto.crear(solicitud));
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<RespuestaProducto> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody SolicitudProducto solicitud) {
        return ResponseEntity.ok(servicioProducto.actualizar(id, solicitud));
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        servicioProducto.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

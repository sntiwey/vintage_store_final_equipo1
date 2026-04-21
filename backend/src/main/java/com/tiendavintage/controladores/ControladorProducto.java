package com.tiendavintage.controladores;

import com.tiendavintage.dto.DtosProducto.*;
import com.tiendavintage.servicios.ServicioProducto;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/productos")
public class ControladorProducto {

    private final ServicioProducto servicioProducto;

    public ControladorProducto(ServicioProducto servicioProducto) {
        this.servicioProducto = servicioProducto;
    }

    @GetMapping
    public ResponseEntity<Page<RespuestaProducto>> listar(
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "12") int tamano) {
        return ResponseEntity.ok(servicioProducto.listar(pagina, tamano));
    }

    @GetMapping("/destacados")
    public ResponseEntity<List<RespuestaProducto>> destacados() {
        return ResponseEntity.ok(servicioProducto.listarDestacados());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RespuestaProducto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(servicioProducto.obtenerPorId(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<RespuestaProducto>> buscar(
            @RequestParam String q,
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "12") int tamano) {
        return ResponseEntity.ok(servicioProducto.buscar(q, pagina, tamano));
    }
}

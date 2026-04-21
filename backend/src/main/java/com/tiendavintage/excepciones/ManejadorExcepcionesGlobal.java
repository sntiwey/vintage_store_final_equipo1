package com.tiendavintage.excepciones;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ManejadorExcepcionesGlobal {

    @ExceptionHandler(ExcepcionNoEncontrado.class)
    public ResponseEntity<Map<String, Object>> manejarNoEncontrado(ExcepcionNoEncontrado ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(respuesta(ex.getMessage(), 404));
    }

    @ExceptionHandler(ExcepcionNegocio.class)
    public ResponseEntity<Map<String, Object>> manejarNegocio(ExcepcionNegocio ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(respuesta(ex.getMessage(), 400));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.toList());
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("errores", errores);
        cuerpo.put("codigo", 400);
        cuerpo.put("momento", LocalDateTime.now().toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
    }

    private static final Logger log = LoggerFactory.getLogger(ManejadorExcepcionesGlobal.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarGeneral(Exception ex) {
        log.error("Error interno: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(respuesta(ex.getMessage(), 500));
    }

    private Map<String, Object> respuesta(String mensaje, int codigo) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("mensaje", mensaje);
        cuerpo.put("codigo", codigo);
        cuerpo.put("momento", LocalDateTime.now().toString());
        return cuerpo;
    }
}

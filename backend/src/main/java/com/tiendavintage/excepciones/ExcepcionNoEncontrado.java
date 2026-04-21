package com.tiendavintage.excepciones;

public class ExcepcionNoEncontrado extends RuntimeException {
    public ExcepcionNoEncontrado(String mensaje) {
        super(mensaje);
    }
}

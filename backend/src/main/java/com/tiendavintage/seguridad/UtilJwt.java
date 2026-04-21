package com.tiendavintage.seguridad;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class UtilJwt {

    private static final Logger logger = LoggerFactory.getLogger(UtilJwt.class);

    @Value("${jwt.secreto}")
    private String secreto;

    @Value("${jwt.expiracion}")
    private long expiracion;

    private Key obtenerClave() {
        return Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(UserDetails detallesUsuario) {
        return Jwts.builder()
            .setSubject(detallesUsuario.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiracion))
            .signWith(obtenerClave(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String obtenerCorreoDelToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(obtenerClave())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public boolean validarToken(String token, UserDetails detallesUsuario) {
        try {
            String correo = obtenerCorreoDelToken(token);
            return correo.equals(detallesUsuario.getUsername()) && !estaExpirado(token);
        } catch (JwtException e) {
            logger.warn("Token JWT inválido: {}", e.getMessage());
            return false;
        }
    }

    private boolean estaExpirado(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(obtenerClave())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getExpiration()
            .before(new Date());
    }
}

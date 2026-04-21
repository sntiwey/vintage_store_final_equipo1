package com.tiendavintage.seguridad;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class FiltroAutenticacionJwt extends OncePerRequestFilter {

    private final UtilJwt utilJwt;
    private final ServicioDetallesUsuario servicioDetallesUsuario;

    public FiltroAutenticacionJwt(UtilJwt utilJwt,
                                   ServicioDetallesUsuario servicioDetallesUsuario) {
        this.utilJwt = utilJwt;
        this.servicioDetallesUsuario = servicioDetallesUsuario;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest solicitud,
                                    HttpServletResponse respuesta,
                                    FilterChain cadenaFiltros)
            throws ServletException, IOException {

        String encabezado = solicitud.getHeader("Authorization");
        String token  = null;
        String correo = null;

        if (encabezado != null && encabezado.startsWith("Bearer ")) {
            token = encabezado.substring(7);
            try {
                correo = utilJwt.obtenerCorreoDelToken(token);
            } catch (Exception ignored) {}
        }

        if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails detalles = servicioDetallesUsuario.loadUserByUsername(correo);
            if (utilJwt.validarToken(token, detalles)) {
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        detalles, null, detalles.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(solicitud));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        cadenaFiltros.doFilter(solicitud, respuesta);
    }
}

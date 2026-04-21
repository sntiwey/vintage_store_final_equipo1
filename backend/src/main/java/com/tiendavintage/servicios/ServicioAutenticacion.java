package com.tiendavintage.servicios;

import com.tiendavintage.dto.DtosAutenticacion.*;
import com.tiendavintage.excepciones.ExcepcionNegocio;
import com.tiendavintage.modelos.Rol;
import com.tiendavintage.modelos.Usuario;
import com.tiendavintage.repositorios.RepositorioRol;
import com.tiendavintage.repositorios.RepositorioUsuario;
import com.tiendavintage.seguridad.UtilJwt;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioAutenticacion {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioRol repositorioRol;
    private final PasswordEncoder codificador;
    private final AuthenticationManager gestorAutenticacion;
    private final UtilJwt utilJwt;
    private final UserDetailsService servicioDetalles;

    public ServicioAutenticacion(RepositorioUsuario repositorioUsuario,
                                  RepositorioRol repositorioRol,
                                  PasswordEncoder codificador,
                                  AuthenticationManager gestorAutenticacion,
                                  UtilJwt utilJwt,
                                  UserDetailsService servicioDetalles) {
        this.repositorioUsuario  = repositorioUsuario;
        this.repositorioRol      = repositorioRol;
        this.codificador         = codificador;
        this.gestorAutenticacion = gestorAutenticacion;
        this.utilJwt             = utilJwt;
        this.servicioDetalles    = servicioDetalles;
    }

    @Transactional
    public RespuestaToken registrar(SolicitudRegistro solicitud) {
        if (repositorioUsuario.existsByCorreo(solicitud.getCorreo())) {
            throw new ExcepcionNegocio("El correo ya está registrado");
        }
        Rol rolCliente = repositorioRol.findByNombre("CLIENTE")
            .orElseThrow(() -> new ExcepcionNegocio("Rol CLIENTE no encontrado"));

        Usuario usuario = Usuario.builder()
            .nombre(solicitud.getNombre())
            .apellido(solicitud.getApellido())
            .correo(solicitud.getCorreo())
            .contrasena(codificador.encode(solicitud.getContrasena()))
            .telefono(solicitud.getTelefono())
            .rol(rolCliente)
            .activo(true)
            .build();

        repositorioUsuario.save(usuario);
        return construirToken(usuario);
    }

    public RespuestaToken iniciarSesion(SolicitudLogin solicitud) {
        gestorAutenticacion.authenticate(
            new UsernamePasswordAuthenticationToken(
                solicitud.getCorreo(), solicitud.getContrasena()));
        Usuario usuario = repositorioUsuario
            .findByCorreo(solicitud.getCorreo()).orElseThrow();
        return construirToken(usuario);
    }

    private RespuestaToken construirToken(Usuario usuario) {
        UserDetails detalles = servicioDetalles.loadUserByUsername(usuario.getCorreo());
        String token = utilJwt.generarToken(detalles);
        return new RespuestaToken(token, "Bearer",
            usuario.getCorreo(), usuario.getNombre(),
            usuario.getRol().getNombre());
    }
}

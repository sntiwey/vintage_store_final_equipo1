package com.tiendavintage.seguridad;

import com.tiendavintage.modelos.Usuario;
import com.tiendavintage.repositorios.RepositorioUsuario;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class ServicioDetallesUsuario implements UserDetailsService {

    private final RepositorioUsuario repositorioUsuario;

    public ServicioDetallesUsuario(RepositorioUsuario repositorioUsuario) {
        this.repositorioUsuario = repositorioUsuario;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = repositorioUsuario.findByCorreo(correo)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correo));

        return User.builder()
            .username(usuario.getCorreo())
            .password(usuario.getContrasena())
            .authorities(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre()))
            .disabled(!usuario.getActivo())
            .build();
    }
}

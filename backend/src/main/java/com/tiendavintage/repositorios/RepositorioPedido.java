package com.tiendavintage.repositorios;

import com.tiendavintage.modelos.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepositorioPedido extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);
    Page<Pedido> findAllByOrderByCreadoEnDesc(Pageable pageable);
    Page<Pedido> findByEstadoOrderByCreadoEnDesc(Pedido.EstadoPedido estado, Pageable pageable);
}

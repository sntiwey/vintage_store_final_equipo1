package com.tiendavintage.repositorios;

import com.tiendavintage.modelos.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepositorioProducto extends JpaRepository<Producto, Long> {

    Page<Producto> findByActivoTrue(Pageable pageable);

    List<Producto> findByDestacadoTrueAndActivoTrue();

    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.marca) LIKE LOWER(CONCAT('%', :termino, '%')))")
    Page<Producto> buscarPorTermino(@Param("termino") String termino, Pageable pageable);
}

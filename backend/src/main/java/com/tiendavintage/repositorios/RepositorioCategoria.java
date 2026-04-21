package com.tiendavintage.repositorios;

import com.tiendavintage.modelos.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepositorioCategoria extends JpaRepository<Categoria, Long> {
    List<Categoria> findByActivoTrue();
}

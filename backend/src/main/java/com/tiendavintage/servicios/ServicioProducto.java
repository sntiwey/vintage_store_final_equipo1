package com.tiendavintage.servicios;

import com.tiendavintage.dto.DtosProducto.*;
import com.tiendavintage.excepciones.ExcepcionNoEncontrado;
import com.tiendavintage.modelos.Categoria;
import com.tiendavintage.modelos.Producto;
import com.tiendavintage.repositorios.RepositorioCategoria;
import com.tiendavintage.repositorios.RepositorioProducto;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicioProducto {

    private final RepositorioProducto repositorioProducto;
    private final RepositorioCategoria repositorioCategoria;

    public ServicioProducto(RepositorioProducto repositorioProducto,
                             RepositorioCategoria repositorioCategoria) {
        this.repositorioProducto  = repositorioProducto;
        this.repositorioCategoria = repositorioCategoria;
    }

    public Page<RespuestaProducto> listar(int pagina, int tamano) {
        Pageable paginacion = PageRequest.of(pagina, tamano,
            Sort.by("creadoEn").descending());
        return repositorioProducto.findByActivoTrue(paginacion)
            .map(this::mapear);
    }

    public List<RespuestaProducto> listarDestacados() {
        return repositorioProducto.findByDestacadoTrueAndActivoTrue()
            .stream().map(this::mapear).collect(Collectors.toList());
    }

    public RespuestaProducto obtenerPorId(Long id) {
        return repositorioProducto.findById(id)
            .map(this::mapear)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Producto no encontrado: " + id));
    }

    public Page<RespuestaProducto> buscar(String termino, int pagina, int tamano) {
        Pageable paginacion = PageRequest.of(pagina, tamano);
        return repositorioProducto.buscarPorTermino(termino, paginacion)
            .map(this::mapear);
    }

    @Transactional
    public RespuestaProducto crear(SolicitudProducto solicitud) {
        Categoria categoria = resolverCategoria(solicitud.getCategoriaId());
        Producto producto = Producto.builder()
            .nombre(solicitud.getNombre())
            .descripcion(solicitud.getDescripcion())
            .precio(solicitud.getPrecio())
            .precioOferta(solicitud.getPrecioOferta())
            .stock(solicitud.getStock())
            .talla(solicitud.getTalla())
            .color(solicitud.getColor())
            .marca(solicitud.getMarca())
            .era(solicitud.getEra())
            .condicion(solicitud.getCondicion())
            .imagenUrl(solicitud.getImagenUrl())
            .destacado(Boolean.TRUE.equals(solicitud.getDestacado()))
            .categoria(categoria)
            .activo(true)
            .build();
        return mapear(repositorioProducto.save(producto));
    }

    @Transactional
    public RespuestaProducto actualizar(Long id, SolicitudProducto solicitud) {
        Producto producto = repositorioProducto.findById(id)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Producto no encontrado: " + id));

        producto.setNombre(solicitud.getNombre());
        producto.setDescripcion(solicitud.getDescripcion());
        producto.setPrecio(solicitud.getPrecio());
        producto.setPrecioOferta(solicitud.getPrecioOferta());
        producto.setStock(solicitud.getStock());
        producto.setTalla(solicitud.getTalla());
        producto.setColor(solicitud.getColor());
        producto.setMarca(solicitud.getMarca());
        producto.setEra(solicitud.getEra());
        producto.setCondicion(solicitud.getCondicion());
        producto.setImagenUrl(solicitud.getImagenUrl());
        producto.setDestacado(Boolean.TRUE.equals(solicitud.getDestacado()));

        if (solicitud.getCategoriaId() != null) {
            producto.setCategoria(resolverCategoria(solicitud.getCategoriaId()));
        }
        return mapear(repositorioProducto.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = repositorioProducto.findById(id)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Producto no encontrado: " + id));
        producto.setActivo(false);
        repositorioProducto.save(producto);
    }

    private Categoria resolverCategoria(Long categoriaId) {
        if (categoriaId == null) return null;
        return repositorioCategoria.findById(categoriaId)
            .orElseThrow(() -> new ExcepcionNoEncontrado("Categoría no encontrada: " + categoriaId));
    }

    private RespuestaProducto mapear(Producto p) {
        RespuestaProducto r = new RespuestaProducto();
        r.setId(p.getId());
        r.setNombre(p.getNombre());
        r.setDescripcion(p.getDescripcion());
        r.setPrecio(p.getPrecio());
        r.setPrecioOferta(p.getPrecioOferta());
        r.setStock(p.getStock());
        r.setTalla(p.getTalla());
        r.setColor(p.getColor());
        r.setMarca(p.getMarca());
        r.setEra(p.getEra());
        r.setCondicion(p.getCondicion() != null ? p.getCondicion().name() : null);
        r.setImagenUrl(p.getImagenUrl());
        r.setDestacado(p.getDestacado());
        if (p.getCategoria() != null) {
            r.setCategoriaNombre(p.getCategoria().getNombre());
            r.setCategoriaId(p.getCategoria().getId());
        }
        return r;
    }
}

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Producto, PaginaRespuesta } from '../tipos/tipos';
import { servicioProducto } from '../servicios/serviciosApi';
import TarjetaProducto from '../componentes/catalogo/TarjetaProducto';
import './Catalogo.css';

const ERAS = ['70s', '80s', '90s', '2000s'];

const PaginaCatalogo: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [resultado, setResultado] = useState<PaginaRespuesta<Producto> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(0);

  const termino = params.get('q') || '';
  const era     = params.get('era') || '';

  useEffect(() => {
    setCargando(true);
    setPagina(0);
  }, [termino, era]);

  useEffect(() => {
    setCargando(true);
    const cargar = termino
      ? servicioProducto.buscar(termino, pagina)
      : servicioProducto.listar(pagina);
    cargar.then(setResultado).finally(() => setCargando(false));
  }, [termino, era, pagina]);

  const titulo = termino ? `"${termino}"` : era ? `Colección ${era}` : 'Todo el catálogo';

  return (
    <main className="catalogo">
      {/* Header */}
      <div className="catalogo__header">
        <div className="catalogo__header-izq">
          <h1 className="catalogo__titulo">{titulo}</h1>
          {resultado && (
            <span className="catalogo__conteo">{resultado.totalElements} piezas</span>
          )}
        </div>
        {(termino || era) && (
          <button className="catalogo__limpiar" onClick={() => setParams({})}>
            <X size={13} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros de era */}
      <div className="catalogo__filtros-wrap">
        <div className="catalogo__filtros">
          <button
            className={`catalogo__filtro ${!era ? 'activo' : ''}`}
            onClick={() => setParams(termino ? { q: termino } : {})}
          >Todo</button>
          {ERAS.map(e => (
            <button
              key={e}
              className={`catalogo__filtro ${era === e ? 'activo' : ''}`}
              onClick={() => setParams({ era: e })}
            >{e}</button>
          ))}
        </div>
        <div className="catalogo__ordenar">
          <SlidersHorizontal size={14} />
          <span>Ordenar: Más recientes</span>
        </div>
      </div>

      {/* Grid */}
      {cargando ? (
        <div className="cargando">
          <div className="spinner" />
          <span>Cargando colección</span>
        </div>
      ) : resultado?.content.length === 0 ? (
        <div className="catalogo__vacio">
          <p>No encontramos piezas para esta búsqueda.</p>
          <button className="boton boton-secundario" onClick={() => setParams({})}>
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="cuadricula-productos fade-up">
          {resultado?.content.map(p => (
            <TarjetaProducto key={p.id} producto={p} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {resultado && resultado.totalPages > 1 && (
        <div className="catalogo__paginacion">
          <button
            className="catalogo__pag-btn"
            disabled={pagina === 0}
            onClick={() => setPagina(p => p - 1)}
          >← Anterior</button>
          <div className="catalogo__pag-nums">
            {Array.from({ length: resultado.totalPages }, (_, i) => (
              <button
                key={i}
                className={`catalogo__pag-num ${i === pagina ? 'activo' : ''}`}
                onClick={() => setPagina(i)}
              >{i + 1}</button>
            ))}
          </div>
          <button
            className="catalogo__pag-btn"
            disabled={pagina >= resultado.totalPages - 1}
            onClick={() => setPagina(p => p + 1)}
          >Siguiente →</button>
        </div>
      )}
    </main>
  );
};

export default PaginaCatalogo;

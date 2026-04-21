import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search } from 'lucide-react';
import type { SolicitudPedido } from '../../tipos/tipos';

interface Sugerencia {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string; house_number?: string; suburb?: string;
    neighbourhood?: string; city?: string; town?: string;
    village?: string; state?: string; postcode?: string;
  };
}

interface Props {
  envio: SolicitudPedido;
  onChange: (envio: SolicitudPedido) => void;
  onConfirmar: (e: React.FormEvent) => void;
  procesando: boolean;
}

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];

const FormularioEnvio: React.FC<Props> = ({ envio, onChange, onConfirmar, procesando }) => {
  const refMapa = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.Marker | null>(null);
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [buscando, setBuscando] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envioRef = useRef(envio);
  envioRef.current = envio;

  const colocarMarcador = useCallback((mapa: L.Map, lat: number, lng: number) => {
    if (marcadorRef.current) marcadorRef.current.remove();
    marcadorRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:26px;height:26px;background:#0a0a0a;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
        iconSize: [26, 26], iconAnchor: [13, 26],
      }),
    }).addTo(mapa);
    mapa.setView([lat, lng], 15);
  }, []);

  const rellenarDesdeAddress = useCallback((
    address: Sugerencia['address'], lat: number, lng: number
  ) => {
    const calle = [address.road, address.house_number].filter(Boolean).join(' ');
    onChange({
      ...envioRef.current,
      direccion:   calle                                              || envioRef.current.direccion,
      colonia:     address.suburb || address.neighbourhood           || envioRef.current.colonia,
      ciudad:      address.city   || address.town || address.village || envioRef.current.ciudad,
      estado:      address.state                                     || envioRef.current.estado,
      codigoPostal: address.postcode                                 || envioRef.current.codigoPostal,
      lat: String(lat), lng: String(lng),
    });
  }, [onChange]);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!refMapa.current || mapaRef.current) return;
    const mapa = L.map(refMapa.current, { zoomControl: true, attributionControl: false })
      .setView(MEXICO_CENTER, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

    mapa.on('click', async (e: L.LeafletMouseEvent) => {
      colocarMarcador(mapa, e.latlng.lat, e.latlng.lng);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await res.json();
        if (data?.address) rellenarDesdeAddress(data.address, e.latlng.lat, e.latlng.lng);
        else onChange({ ...envioRef.current, lat: String(e.latlng.lat), lng: String(e.latlng.lng) });
      } catch {
        onChange({ ...envioRef.current, lat: String(e.latlng.lat), lng: String(e.latlng.lng) });
      }
    });

    mapaRef.current = mapa;
    return () => { mapa.remove(); mapaRef.current = null; };
  }, [colocarMarcador, rellenarDesdeAddress, onChange]);

  // Autocompletado con debounce
  const buscarSugerencias = useCallback((texto: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (texto.length < 4) { setSugerencias([]); return; }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texto)}&countrycodes=mx&format=json&addressdetails=1&limit=6`,
          { headers: { 'Accept-Language': 'es' } }
        );
        setSugerencias(await res.json());
      } catch { setSugerencias([]); }
      finally { setBuscando(false); }
    }, 450);
  }, []);

  const seleccionarSugerencia = (s: Sugerencia) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    if (mapaRef.current) colocarMarcador(mapaRef.current, lat, lng);
    rellenarDesdeAddress(s.address, lat, lng);
    setSugerencias([]);
  };

  const campo = (
    label: string, key: keyof SolicitudPedido,
    opts?: { placeholder?: string; required?: boolean }
  ) => (
    <div className="campo">
      <label>{label}</label>
      <input
        required={opts?.required}
        placeholder={opts?.placeholder || ''}
        value={(envio[key] as string) || ''}
        onChange={e => onChange({ ...envio, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <form onSubmit={onConfirmar} className="envio-form">
      <p className="envio-form__titulo">Datos de envío</p>

      {/* Buscador */}
      <div className="envio-form__buscador">
        <div className="envio-form__buscar-wrap">
          <Search size={13} className="envio-form__buscar-ico" />
          <input
            placeholder="Busca tu dirección en México..."
            onChange={e => buscarSugerencias(e.target.value)}
            className="envio-form__buscar-input"
          />
          {buscando && <div className="spinner" style={{ width: 12, height: 12, flexShrink: 0 }} />}
        </div>
        {sugerencias.length > 0 && (
          <ul className="envio-form__sugerencias">
            {sugerencias.map((s, i) => (
              <li key={i} onClick={() => seleccionarSugerencia(s)}>
                <MapPin size={11} style={{ flexShrink: 0, color: '#b0aca8', marginTop: 2 }} />
                <span>{s.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mapa */}
      <div className="envio-form__mapa-wrap">
        <div ref={refMapa} className="envio-form__mapa" />
        <p className="envio-form__mapa-hint">
          <MapPin size={11} /> Haz clic en el mapa para marcar tu ubicación exacta
        </p>
      </div>

      {/* Campos del formulario */}
      <div className="envio-form__campos">
        {campo('Calle y número *', 'direccion', { required: true, placeholder: 'Av. Insurgentes 123' })}
        {campo('Colonia', 'colonia', { placeholder: 'Roma Norte' })}
        <div className="envio-form__fila">
          {campo('Ciudad *', 'ciudad', { required: true, placeholder: 'Ciudad de México' })}
          {campo('Estado *', 'estado', { required: true, placeholder: 'CDMX' })}
        </div>
        <div className="envio-form__fila">
          {campo('Código Postal *', 'codigoPostal', { required: true, placeholder: '06600' })}
          {campo('Referencias', 'referencias', { placeholder: 'Entre calles, color de fachada...' })}
        </div>
        {envio.lat && (
          <p className="envio-form__coords">
            <MapPin size={11} /> Pin colocado · {parseFloat(envio.lat).toFixed(5)}, {parseFloat(envio.lng!).toFixed(5)}
          </p>
        )}
      </div>

      <button type="submit" className="boton boton-primario carrito__cta" disabled={procesando}>
        {procesando ? 'Procesando...' : 'Confirmar Pedido'}
      </button>
    </form>
  );
};

export default FormularioEnvio;

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Package, Truck, CheckCircle, MapPin, Clock } from 'lucide-react';

// Ruta simulada CDMX → Guadalajara
const RUTA: [number, number][] = [
  [19.4326, -99.1332],
  [19.5800, -99.6000],
  [19.7500, -100.2500],
  [20.1000, -101.0500],
  [20.4000, -101.9000],
  [20.6597, -103.3496],
];

const PASOS = [
  { label: 'Confirmado',   icono: <CheckCircle size={13}/>, color: '#16a34a' },
  { label: 'Preparando',   icono: <Package size={13}/>,     color: '#d97706' },
  { label: 'En camino',    icono: <Truck size={13}/>,       color: '#3b82f6' },
  { label: 'Entregado',    icono: <MapPin size={13}/>,      color: '#7c3aed' },
];

const PASO_POR_ESTADO: Record<string, number> = {
  PENDIENTE: 0, PAGADO: 1, ENVIADO: 2, ENTREGADO: 3, CANCELADO: 0,
};

interface Props { numeroPedido: string; estado: string; }

const MapaRastreo: React.FC<Props> = ({ numeroPedido, estado }) => {
  const refDiv = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.CircleMarker | null>(null);
  const [progreso, setProgreso] = useState(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pasoActivo = PASO_POR_ESTADO[estado] ?? 0;

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!refDiv.current || mapaRef.current) return;

    const mapa = L.map(refDiv.current, { zoomControl: true, attributionControl: false }).setView(
      [20.0, -101.2], 6
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

    // Ruta punteada
    L.polyline(RUTA, { color: '#3b82f6', weight: 3, opacity: 0.45, dashArray: '6 6' }).addTo(mapa);

    // Marcador origen
    L.circleMarker(RUTA[0], { radius: 8, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1, weight: 2 })
      .bindTooltip('Origen: CDMX', { permanent: false }).addTo(mapa);

    // Marcador destino
    L.circleMarker(RUTA[RUTA.length - 1], { radius: 8, color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 1, weight: 2 })
      .bindTooltip('Destino: Guadalajara', { permanent: false }).addTo(mapa);

    // Marcador paquete
    marcadorRef.current = L.circleMarker(RUTA[0], {
      radius: 10, color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3,
    }).bindTooltip(`📦 ${numeroPedido}`, { permanent: true, direction: 'top', offset: [0, -12] }).addTo(mapa);

    mapaRef.current = mapa;

    return () => { mapa.remove(); mapaRef.current = null; };
  }, [numeroPedido]);

  // Animación solo cuando está ENVIADO
  useEffect(() => {
    if (estado !== 'ENVIADO' || !marcadorRef.current) return;

    const TOTAL = 300;
    let paso = 0;

    const animar = () => {
      paso++;
      const t = Math.min(paso / TOTAL, 1);
      const segmentos = RUTA.length - 1;
      const segIdx = Math.min(Math.floor(t * segmentos), segmentos - 1);
      const segT = t * segmentos - segIdx;

      const [lat1, lng1] = RUTA[segIdx];
      const [lat2, lng2] = RUTA[segIdx + 1];
      const lat = lat1 + (lat2 - lat1) * segT;
      const lng = lng1 + (lng2 - lng1) * segT;

      marcadorRef.current?.setLatLng([lat, lng]);
      setProgreso(Math.round(t * 100));

      if (paso < TOTAL) animRef.current = setTimeout(animar, 60);
    };

    animRef.current = setTimeout(animar, 400);
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [estado]);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a8a29e', marginBottom: 12 }}>
        Rastreo — {numeroPedido}
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        {PASOS.map((p, i) => (
          <React.Fragment key={p.label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= pasoActivo ? p.color : '#e5e5e3',
                color: i <= pasoActivo ? '#fff' : '#a8a29e',
                transition: 'background 0.3s',
              }}>{p.icono}</div>
              <span style={{ fontSize: '0.6rem', color: i <= pasoActivo ? '#0f0f0e' : '#a8a29e', fontWeight: i === pasoActivo ? 600 : 400, textAlign: 'center' }}>
                {p.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div style={{ height: 2, flex: 1, marginBottom: 18, background: i < pasoActivo ? '#3b82f6' : '#e5e5e3', transition: 'background 0.3s' }}/>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Barra progreso */}
      {estado === 'ENVIADO' && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#78716c', marginBottom: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11}/> Simulando ruta en tiempo real</span>
            <span>{progreso}%</span>
          </div>
          <div style={{ height: 4, background: '#e5e5e3', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progreso}%`, background: '#3b82f6', borderRadius: 2, transition: 'width 0.08s linear' }}/>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div ref={refDiv} style={{ width: '100%', height: 280, borderRadius: 8, border: '1px solid #e5e5e3', overflow: 'hidden', zIndex: 0 }}/>
      <div style={{ fontSize: '0.62rem', color: '#a8a29e', marginTop: 5, textAlign: 'center' }}>
        Ruta simulada · CDMX → Guadalajara · © OpenStreetMap
      </div>
    </div>
  );
};

export default MapaRastreo;

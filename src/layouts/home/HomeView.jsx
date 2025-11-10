// src/layouts/home/HomeView.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeView() {
  const navigate = useNavigate();

  // Defaults
  const ciudad = 'Río Cuarto, Córdoba, Argentina'; // Fijo, no editable
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [huespedes, setHuespedes] = useState(2);

  // min dates
  const hoyISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  useEffect(() => {
    if (!desde) setDesde(hoyISO);
  }, [hoyISO, desde]);

  const minHasta = useMemo(() => {
    if (!desde) return hoyISO;
    const d = new Date(desde);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [desde, hoyISO]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!desde || !hasta) return alert('Elegí fecha de inicio y fin');
    if (new Date(hasta) <= new Date(desde)) return alert('La fecha de salida debe ser posterior a la de entrada');
    if (huespedes < 1) return alert('Ingresá al menos 1 huésped');

    const params = new URLSearchParams({
      ciudad,
      desde,
      hasta,
      huespedes: String(huespedes),
    }).toString();

    navigate(`/habitaciones?${params}`);
  };

  return (
    <div className="hero">
      <div className="hero__overlay" />
      <div className="hero__content">
        <h1 className="hero__title">Encontrá tu habitación en Río Cuarto</h1>
        <p className="hero__subtitle">Elegí fechas y personas, y te mostramos disponibilidad.</p>

        <form className="searchBar" onSubmit={onSubmit}>
          <div className="searchBar__field">
            <label className="label">Destino</label>
            <input
              className="input"
              value={ciudad}
              readOnly
              disabled
              style={{ 
                cursor: 'not-allowed',
                fontWeight: '500'
              }}
              title="Destino fijo del hotel"
            />
          </div>

          <div className="searchBar__field">
            <label className="label">Entrada</label>
            <input
              className="input"
              type="date"
              value={desde}
              min={hoyISO}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>

          <div className="searchBar__field">
            <label className="label">Salida</label>
            <input
              className="input"
              type="date"
              value={hasta}
              min={minHasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>

          <div className="searchBar__field">
            <label className="label">Huéspedes</label>
            <input
              className="input"
              type="number"
              min={1}
              value={huespedes}
              onChange={(e) => setHuespedes(Number(e.target.value))}
            />
          </div>

          <button className="btn searchBar__btn" type="submit">Buscar</button>
        </form>
      </div>
    </div>
  );
}

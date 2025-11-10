import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getReservationsByUser, cancelReservation } from '../../services/reservations';
import { exportReservaToPdf } from '../../utils/ExportToPdf';
import { formatPriceSimple } from '../../utils/formatters';

export default function MyReservations() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const myUserId = user?.id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const cargar = async () => {
    if (!myUserId) return;
    setLoading(true); setMsg('');
    try {
      const res = await getReservationsByUser(myUserId);
      setRows(res.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [myUserId]);

  const cancelar = async (id) => {
    if (!confirm('¿Seguro que querés cancelar esta reserva?')) return;
    try { 
      await cancelReservation(id); 
      await cargar();
      setMsg('Reserva cancelada exitosamente');
    } catch(e){ 
      setMsg('Error al cancelar la reserva'); 
    }
  };

  const exportarPDF = (reserva) => {
    try {
      exportReservaToPdf(reserva, user);
      setMsg('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setMsg('Error al generar el PDF');
    }
  };

  const formatearFecha = (fecha) => {
    try {
      // Usar fecha local para consistencia
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch (error) {
      return fecha; // Fallback si hay error
    }
  };

  const calcularNoches = (inicio, fin) => {
    try {
      const fechaInicio = new Date(inicio + 'T00:00:00');
      const fechaFin = new Date(fin + 'T00:00:00');
      const diffTime = fechaFin.getTime() - fechaInicio.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="h2">Mis Reservas</h2>
        <button 
          className="btn primary"
          onClick={() => navigate('/habitaciones')}
        >
          ➕ Hacer Nueva Reserva
        </button>
      </div>

      {msg && (
        <div className={`card ${msg.includes('Error') ? 'error' : 'success'}`} style={{ 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: msg.includes('Error') ? 'var(--error-bg)' : 'var(--success-bg)',
          border: `1px solid ${msg.includes('Error') ? 'var(--error)' : 'var(--success)'}`
        }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Cargando tus reservas...</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>No tienes reservas aún</h3>
          <p style={{ margin: '0 0 24px 0', opacity: 0.8 }}>
            ¡Es el momento perfecto para planificar tu próxima estadía!
          </p>
          <button 
            className="btn primary"
            onClick={() => navigate('/habitaciones')}
          >
            🔍 Explorar Habitaciones
          </button>
        </div>
      ) : (
        <div className="gridCards">
          {rows.map(r => {
            const noches = calcularNoches(r.fecha_inicio, r.fecha_fin);
            const isActive = r.estado === 'confirmada';
            
            return (
              <div key={r.id} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>
                      Habitación #{r.habitacion?.numero_habitacion}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
                      {r.habitacion?.tipo}
                    </p>
                  </div>
                  <span className={`badge ${isActive ? 'success' : 'error'}`}>
                    {isActive ? 'Confirmada' : 'Cancelada'}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>Check-in:</strong>
                    <span style={{ marginLeft: '8px' }}>{formatearFecha(r.fecha_inicio)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>Check-out:</strong>
                    <span style={{ marginLeft: '8px' }}>{formatearFecha(r.fecha_fin)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>Duración:</strong>
                    <span style={{ marginLeft: '8px' }}>{noches} noche{noches > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--panel)', 
                  borderRadius: '6px', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--primary)' }}>
                    Total: {formatPriceSimple(r.total)}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    Reserva ID: {r.id}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <button 
                    className="btn secondary"
                    style={{ width: '100%' }}
                    onClick={() => exportarPDF(r)}
                  >
                    Descargar PDF
                  </button>
                  {isActive && (
                    <button 
                      className="btn danger"
                      style={{ width: '100%' }}
                      onClick={() => cancelar(r.id)}
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>

                {!isActive && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    opacity: 0.6, 
                    fontSize: '14px' 
                  }}>
                    Esta reserva fue cancelada
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// src/layouts/rooms/RoomsPage.jsx
import { useEffect, useMemo, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRooms } from '../../services/rooms';
import { createReservation } from '../../services/reservations';
import { AuthContext } from '../../context/AuthContext';
import { formatPriceSimple } from '../../utils/formatters';

const useQuery = () => new URLSearchParams(useLocation().search);

// Modal de confirmación estético
function ConfirmationModal({ data, onClose }) {
  const { room, fechaInicio, fechaFin, noches, total } = data;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'all 0.3s ease-out'
        }}
      >
        {/* Icono de éxito */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          transform: 'scale(1)',
          transition: 'transform 0.3s ease-out'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </div>

        <h2 style={{ 
          color: '#1f2937', 
          margin: '0 0 8px', 
          fontSize: '28px', 
          fontWeight: '700' 
        }}>
          ¡Reserva Confirmada!
        </h2>

        <p style={{ 
          color: '#6b7280', 
          margin: '0 0 32px', 
          fontSize: '16px' 
        }}>
          Tu reserva ha sido procesada exitosamente
        </p>

        {/* Detalles de la reserva */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '24px',
          margin: '0 0 32px',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Habitación</span>
            <span style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              #{room.numero_habitacion} - {room.tipo}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Fechas</span>
            <span style={{ color: '#1f2937', fontSize: '16px' }}>
              {fechaInicio} al {fechaFin}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>Duración</span>
            <span style={{ color: '#1f2937', fontSize: '16px' }}>
              {noches} noche{noches > 1 ? 's' : ''}
            </span>
          </div>

          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#6b7280', fontSize: '16px' }}>Total pagado:</span>
            <span style={{ 
              color: '#10b981', 
              fontSize: '24px', 
              fontWeight: '700' 
            }}>
              ${total}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Ver Mis Reservas
        </button>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const { user, rol, autenticado } = useContext(AuthContext);

  const ciudad = q.get('ciudad') || 'Río Cuarto, Córdoba, Argentina';
  const desde = q.get('desde') || '';
  const hasta = q.get('hasta') || '';
  const huespedes = Number(q.get('huespedes') || 1);

  const rango = useMemo(() => {
    if (!desde || !hasta) return 'Fechas: elegí un rango';
    return `Del ${desde} al ${hasta}`;
    // si querés, dale formato lindo con Intl.DateTimeFormat
  }, [desde, hasta]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Cargar habitaciones del backend
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRooms();
        setRows(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Error al cargar habitaciones');
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleReserve = (room) => {
    if (!autenticado) {
      navigate('/inicio-sesion');
      return;
    }

    if (!user.documento_identidad || !user.telefono) {
      alert('Necesitas completar tu perfil (DNI y teléfono) antes de hacer una reserva. Ve a tu perfil para actualizarlo.');
      navigate('/perfil');
      return;
    }

    setSelectedRoom(room);
    setShowReserveModal(true);
  };

  const goToMyReservations = () => {
    if (rol === 'cliente') {
      navigate('/reservas/mis-reservas');
    } else {
      navigate('/reservas/por-usuario');
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="h2">Habitaciones Disponibles</h2>
        {autenticado && (
          <button 
            className="btn primary"
            onClick={goToMyReservations}
          >
            {rol === 'cliente' ? 'Mis Reservas' : 'Ver Todas las Reservas'}
          </button>
        )}
      </div>

      <div className="cardDesc" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '24px' }}>
        <span className="pill">{ciudad}</span>
        <span className="pill">{rango}</span>
        <span className="pill">{huespedes} huésped{huespedes > 1 ? 'es' : ''}</span>
      </div>

      {!autenticado && (
        <div className="card" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Inicia sesión para reservar</h3>
          <p style={{ margin: '0 0 16px 0' }}>Para hacer una reserva necesitas tener una cuenta. Es rápido y fácil.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn primary"
              onClick={() => navigate('/inicio-sesion')}
            >
              Iniciar Sesión
            </button>
            <button 
              className="btn ghost"
              onClick={() => navigate('/registro')}
            >
              Registrarse
            </button>
          </div>
        </div>
      )}

      {error && <div className="notice" style={{ color: 'red' }}>{error}</div>}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Cargando habitaciones...</div>
        </div>
      ) : (
        rows.length === 0
          ? <div className="cardDesc">No hay habitaciones disponibles</div>
          : (
            <div className="gridCards">
              {rows.map(r => (
                <div key={r.id} className="card" style={{ position: 'relative' }}>
                  <div className="cardTitle">
                    Habitación #{r.numero_habitacion}
                    <div style={{ fontSize: '14px', opacity: 0.8, fontWeight: 'normal' }}>
                      {r.tipo}
                    </div>
                  </div>
                  
                  <div style={{ margin: '16px 0' }}>
                    <div className="cardDesc" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--primary)' }}>
                      {formatPriceSimple(r.precio_noche)} / noche
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <span className={`badge ${r.disponible ? 'success' : 'error'}`}>
                      {r.disponible ? 'Disponible' : 'Ocupada'}
                    </span>
                  </div>

                  {r.disponible && (
                    <button 
                      className="btn primary"
                      style={{ width: '100%' }}
                      onClick={() => handleReserve(r)}
                    >
                      Reservar Ahora
                    </button>
                  )}

                  {!r.disponible && (
                    <button 
                      className="btn ghost"
                      style={{ width: '100%' }}
                      disabled
                    >
                      No disponible
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
      )}

      {showReserveModal && selectedRoom && (
        <ReserveModal 
          room={selectedRoom}
          onClose={() => setShowReserveModal(false)}
          defaultDates={{ desde, hasta }}
          defaultGuests={huespedes}
          onConfirm={(data) => {
            setConfirmData(data);
            setShowConfirmModal(true);
            setShowReserveModal(false);
          }}
        />
      )}

      {showConfirmModal && confirmData && (
        <ConfirmationModal 
          data={confirmData}
          onClose={() => {
            setShowConfirmModal(false);
            navigate('/reservas/mis-reservas');
          }}
        />
      )}
    </div>
  );
}

// Modal de reserva simple
function ReserveModal({ room, onClose, defaultDates, defaultGuests, onConfirm }) {
  const [fechaInicio, setFechaInicio] = useState(defaultDates.desde || '');
  const [fechaFin, setFechaFin] = useState(defaultDates.hasta || '');
  const [numHuespedes, setNumHuespedes] = useState(defaultGuests || 1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Calcular precio total y noches con manejo correcto de fechas
  const calcularNochesYTotal = () => {
    if (!fechaInicio || !fechaFin) return { noches: 0, total: 0 };
    
    // Crear fechas sin UTC para evitar problemas de zona horaria local
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T00:00:00');
    
    // Validar fechas
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
      return { noches: 0, total: 0 };
    }
    
    const diffTime = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = noches * Number(room.precio_noche);
    
    return { noches: noches > 0 ? noches : 0, total: total > 0 ? total : 0 };
  };

  const { noches, total } = calcularNochesYTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona las fechas de entrada y salida');
      return;
    }

    // Validaciones mejoradas con manejo correcto de fechas
    const inicioObj = new Date(fechaInicio + 'T00:00:00');
    const finObj = new Date(fechaFin + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (isNaN(inicioObj.getTime()) || isNaN(finObj.getTime())) {
      alert('Las fechas seleccionadas no son válidas');
      return;
    }

    if (finObj <= inicioObj) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    if (inicioObj < hoy) {
      alert('No se pueden hacer reservas en fechas pasadas');
      return;
    }

    if (noches > 365) {
      alert('No se pueden hacer reservas por más de un año');
      return;
    }

    if (noches === 0) {
      alert('Debe seleccionar al menos una noche de estadía');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        id_habitacion: room.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
        // Nota: num_huespedes no está en el modelo actual
        // Nota: id_cliente se toma automáticamente del token JWT
        // Nota: estado se establece como 'confirmada' por defecto en el backend
      };

      console.log('Creando reserva:', reservationData);
      
      const result = await createReservation(reservationData);
      
      console.log('Reserva creada exitosamente:', result);
      
      // Cerrar modal y mostrar mensaje de éxito
      onClose();
      
      // Formatear fechas para el mensaje
      const formatFecha = (fecha) => {
        try {
          return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          });
        } catch {
          return fecha;
        }
      };
      
      // Mostrar modal de confirmación personalizado
      onConfirm({
        room,
        fechaInicio: formatFecha(fechaInicio),
        fechaFin: formatFecha(fechaFin),
        noches,
        total: total.toFixed(0)
      });
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Error desconocido';
      alert('Error al realizar la reserva: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Reservar Habitación</h2>
          <button 
            className="btn ghost"
            onClick={onClose}
            style={{ padding: '8px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--panel)', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Habitación #{room.numero_habitacion}</h3>
          <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>{room.tipo}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', color: 'var(--primary)' }}>
              {formatPriceSimple(room.precio_noche)} por noche
            </p>
            {noches > 0 && (
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--success)' }}>
                Total: {formatPriceSimple(total)} ({noches} noche{noches > 1 ? 's' : ''})
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Fecha de entrada
              </label>
              <input
                className="input"
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  // Si la fecha de salida es anterior o igual a la nueva fecha de entrada, limpiarla
                  if (fechaFin && e.target.value >= fechaFin) {
                    setFechaFin('');
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Fecha de salida
              </label>
              <input
                className="input"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio ? 
                  (() => {
                    const nextDay = new Date(fechaInicio);
                    nextDay.setDate(nextDay.getDate() + 1);
                    return nextDay.toISOString().split('T')[0];
                  })() : 
                  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
                max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                disabled={!fechaInicio}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Número de huéspedes
              </label>
              <input
                className="input"
                type="number"
                value={numHuespedes}
                onChange={(e) => setNumHuespedes(Number(e.target.value))}
                min={1}
                max={6}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button 
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn primary"
              disabled={loading || !fechaInicio || !fechaFin || noches <= 0}
              style={{ flex: 1 }}
            >
              {loading ? 'Reservando...' : 
               (!fechaInicio || !fechaFin || noches <= 0) ? 'Completa las fechas' : 
               'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

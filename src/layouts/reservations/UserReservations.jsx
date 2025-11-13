import { useEffect, useMemo, useState } from 'react';
import { listReservations, deleteReservation, updateReservation } from '../../services/reservations';
import { listClients } from '../../services/clients';
import { getRooms } from '../../services/rooms';
import { formatDNI, formatPriceSimple } from '../../utils/formatters';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function UserReservations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [detailReservation, setDetailReservation] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [editForm, setEditForm] = useState({
    id_cliente: '',
    id_habitacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    total: '',
    estado: 'confirmada',
    observaciones: ''
  });

  // filtros
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('todos'); // 'todos' | 'confirmada' | 'cancelada'

  const cargar = async (params = {}) => {
    setLoading(true); setMsg('');
    try {
      const res = await listReservations(params);
      setRows(res.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const onBuscar = async (e) => {
    e?.preventDefault();
    const params = { q: q.trim() };
    // si es 'todos', NO mandamos estado
    if (estado && estado !== 'todos') params.estado = estado;
    await cargar(params);
  };

  const onLimpiar = async () => {
    setQ(''); setEstado('todos');
    await cargar();
  };

  const cargarClientesYHabitaciones = async () => {
    try {
      const [clientesRes, habitacionesRes] = await Promise.all([
        listClients(),
        getRooms()
      ]);
      setClientes(clientesRes.data || []);
      setHabitaciones(habitacionesRes.data || []);
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
  };

  const abrirEditar = async (reserva) => {
    await cargarClientesYHabitaciones();
    setEditingReservation(reserva);
    setEditForm({
      id_cliente: reserva.id_cliente.toString(),
      id_habitacion: reserva.id_habitacion.toString(),
      fecha_inicio: reserva.fecha_inicio,
      fecha_fin: reserva.fecha_fin,
      total: reserva.total.toString(),
      estado: reserva.estado,
      observaciones: reserva.observaciones || ''
    });
    setShowEditModal(true);
  };

  const cerrarEditar = () => {
    setShowEditModal(false);
    setEditingReservation(null);
    setEditForm({
      id_cliente: '',
      id_habitacion: '',
      fecha_inicio: '',
      fecha_fin: '',
      total: '',
      estado: 'confirmada',
      observaciones: ''
    });
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar DEFINITIVAMENTE esta reserva?\n\nEsta acción NO SE PUEDE DESHACER.\nLa reserva se eliminará completamente del sistema.')) return;
    try { 
      await deleteReservation(id); 
      await onBuscar(); 
      setMsg('Reserva eliminada definitivamente');
    }
    catch { setMsg('Error al eliminar reserva'); }
  };

  const abrirDetalle = (reserva) => {
    setDetailReservation(reserva);
    setShowDetailModal(true);
  };

  const cerrarDetalle = () => {
    setShowDetailModal(false);
    setDetailReservation(null);
  };

  // Calcular precio automáticamente cuando cambian fechas o habitación
  useEffect(() => {
    if (!showEditModal || !editForm.fecha_inicio || !editForm.fecha_fin || !editForm.id_habitacion) {
      return;
    }

    const habitacionSeleccionada = habitaciones.find(h => h.id === parseInt(editForm.id_habitacion));
    if (!habitacionSeleccionada) return;

    const inicio = new Date(editForm.fecha_inicio + 'T00:00:00');
    const fin = new Date(editForm.fecha_fin + 'T00:00:00');

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
      return;
    }

    const diffTime = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = noches * Number(habitacionSeleccionada.precio_noche);

    if (noches > 0 && total > 0) {
      setEditForm(prev => ({ ...prev, total: total.toString() }));
    }
  }, [editForm.fecha_inicio, editForm.fecha_fin, editForm.id_habitacion, showEditModal, habitaciones]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    
    try {
      const dataToSend = {
        ...editForm,
        id_cliente: parseInt(editForm.id_cliente),
        id_habitacion: parseInt(editForm.id_habitacion),
        total: parseFloat(editForm.total)
      };
      
      await updateReservation(editingReservation.id, dataToSend);
      setMsg('Reserva actualizada exitosamente');
      cerrarEditar();
      await onBuscar();
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al actualizar reserva');
    }
  };

  const totalResultados = rows.length;
  const resumen = useMemo(() => {
    const conf = rows.filter(r => r.estado === 'confirmada').length;
    const canc = rows.filter(r => r.estado === 'cancelada').length;
    return { conf, canc };
  }, [rows]);

  return (
    <div className="page">
      <h2 className="h2">Reservas (Gestión)</h2>

      <form onSubmit={onBuscar} style={{ display:'flex', gap:8, margin:'12px 0 16px' }}>
        <input
          className="input"
          placeholder="Buscar: Nombre, Email, DNI, Habitación..."
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <select className="select" value={estado} onChange={(e)=>setEstado(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button className="btn" type="submit">Buscar</button>
        <button className="btn secondary" type="button" onClick={onLimpiar}>Limpiar</button>
      </form>

      <div className="cardDesc" style={{ marginBottom: 8 }}>
        {totalResultados} resultado(s) · <span className="badge ok">Confirmadas: {resumen.conf}</span> · <span className="badge warn">Canceladas: {resumen.canc}</span>
      </div>

      {msg && <div className="notice">{msg}</div>}

      {loading ? <div>Cargando...</div> : (
        rows.length === 0 ? <div className="cardDesc">Sin resultados</div> : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Habitación</th>
                  <th>Fechas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const nombre = r?.usuario?.nombre || '-';
                  const hab = r?.habitacion ? `#${r.habitacion.numero_habitacion}` : '-';
                  const estadoPretty = r.estado ? cap(r.estado) : '-';
                  return (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{nombre}</td>
                      <td>{hab}</td>
                      <td>{r.fecha_inicio} → {r.fecha_fin}</td>
                      <td>
                        {r.estado === 'confirmada'
                          ? <span className="badge ok">{estadoPretty}</span>
                          : <span className="badge warn">{estadoPretty}</span>}
                      </td>
                      <td style={{ display:'flex', gap:8 }}>
                        {/* Botón Ver Detalle */}
                        <button 
                          type="button" 
                          onClick={()=>abrirDetalle(r)}
                          style={{
                            padding: '6px 12px',
                            minWidth: '40px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Ver detalles"
                        >
                          <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>

                        {/* Botón Editar - siempre visible para admin/empleado */}
                        <button 
                          type="button" 
                          onClick={()=>abrirEditar(r)}
                          style={{
                            padding: '6px 12px',
                            minWidth: '80px',
                            backgroundColor: '#0d6efd',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>

                        {/* Botón Eliminar */}
                        <button 
                          type="button" 
                          onClick={()=>eliminar(r.id)}
                          style={{
                            padding: '6px 12px',
                            minWidth: '80px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal de Detalle */}
      {showDetailModal && detailReservation && (
        <div
          onClick={cerrarDetalle}
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
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-content"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '24px' }}>
                Detalle de Reserva #{detailReservation.id}
              </h3>
              <button
                onClick={cerrarDetalle}
                className="modal-close"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Información del Cliente */}
                <div className="modal-detail-grid" style={{ backgroundColor: 'var(--panel-2)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '16px', color: 'var(--text)' }}>Cliente</h4>
                  <div style={{ display: 'grid', gap: '8px', color: 'var(--text)' }}>
                    <div><strong>Nombre:</strong> {detailReservation.usuario?.nombre || '-'}</div>
                    <div><strong>Email:</strong> {detailReservation.usuario?.email || '-'}</div>
                    <div><strong>DNI:</strong> {formatDNI(detailReservation.usuario?.documento_identidad || '')}</div>
                    <div><strong>Teléfono:</strong> {detailReservation.usuario?.telefono || '-'}</div>
                  </div>
                </div>

                {/* Información de la Habitación */}
                <div className="modal-detail-grid" style={{ backgroundColor: 'var(--panel-2)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '16px', color: 'var(--text)' }}>Habitación</h4>
                  <div style={{ display: 'grid', gap: '8px', color: 'var(--text)' }}>
                    <div><strong>Número:</strong> #{detailReservation.habitacion?.numero_habitacion || '-'}</div>
                    <div><strong>Tipo:</strong> {cap(detailReservation.habitacion?.tipo || '-')}</div>
                    <div><strong>Precio/Noche:</strong> {formatPriceSimple(detailReservation.habitacion?.precio_noche || 0)}</div>
                    <div>
                      <strong>Disponibilidad:</strong> {' '}
                      <span className={`badge ${detailReservation.habitacion?.disponible ? 'success' : 'danger'}`}>
                        {detailReservation.habitacion?.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información de la Reserva */}
                <div className="modal-detail-grid" style={{ backgroundColor: 'var(--panel-2)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '16px', color: 'var(--text)' }}>Reserva</h4>
                  <div style={{ display: 'grid', gap: '8px', color: 'var(--text)' }}>
                    <div><strong>Fecha de Inicio:</strong> {detailReservation.fecha_inicio}</div>
                    <div><strong>Fecha de Fin:</strong> {detailReservation.fecha_fin}</div>
                    <div>
                      <strong>Estado:</strong> {' '}
                      <span className={`badge ${detailReservation.estado === 'confirmada' ? 'ok' : 'warn'}`}>
                        {cap(detailReservation.estado)}
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', marginTop: '8px' }}>
                      <strong>Total:</strong> <span style={{ color: 'var(--success)', fontWeight: '700' }}>{formatPriceSimple(detailReservation.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {detailReservation.observaciones && (
                  <div className="modal-detail-grid" style={{ backgroundColor: 'var(--panel-2)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '16px', color: 'var(--text)' }}>Observaciones</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{detailReservation.observaciones}</p>
                  </div>
                )}

                {/* Fechas del sistema */}
                <div className="modal-detail-grid" style={{ backgroundColor: 'var(--panel-2)', fontSize: '12px' }}>
                  <div style={{ color: 'var(--text-muted)' }}><strong>Creada:</strong> {new Date(detailReservation.createdAt).toLocaleString('es-AR')}</div>
                  <div style={{ color: 'var(--text-muted)' }}><strong>Actualizada:</strong> {new Date(detailReservation.updatedAt).toLocaleString('es-AR')}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={cerrarDetalle}
                className="btn primary"
                style={{ minWidth: '120px' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editingReservation && (
        <div
          onClick={cerrarEditar}
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
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px' }}>
              Editar Reserva #{editingReservation.id}
            </h3>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="id_cliente" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Cliente *
                </label>
                <select
                  id="id_cliente"
                  value={editForm.id_cliente}
                  onChange={(e) => setEditForm(prev => ({ ...prev, id_cliente: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="id_habitacion" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Habitación *
                </label>
                <select
                  id="id_habitacion"
                  value={editForm.id_habitacion}
                  onChange={(e) => setEditForm(prev => ({ ...prev, id_habitacion: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="">Seleccionar habitación</option>
                  {habitaciones.map(hab => (
                    <option key={hab.id} value={hab.id}>
                      #{hab.numero_habitacion} - {hab.tipo} (${formatPriceSimple(hab.precio_noche)}/noche)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="fecha_inicio" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  id="fecha_inicio"
                  value={editForm.fecha_inicio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="fecha_fin" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  id="fecha_fin"
                  value={editForm.fecha_fin}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="total" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Precio Total *
                </label>
                <input
                  type="number"
                  id="total"
                  value={editForm.total}
                  onChange={(e) => setEditForm(prev => ({ ...prev, total: e.target.value }))}
                  required
                  min="0"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  El precio se calcula automáticamente al cambiar las fechas o habitación
                </small>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="estado" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Estado *
                </label>
                <select
                  id="estado"
                  value={editForm.estado}
                  onChange={(e) => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="observaciones" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  value={editForm.observaciones}
                  onChange={(e) => setEditForm(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows="3"
                  placeholder="Notas adicionales sobre la reserva..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cerrarEditar}
                  className="btn ghost"
                  style={{ minWidth: '100px' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn primary" style={{ minWidth: '100px' }}>
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

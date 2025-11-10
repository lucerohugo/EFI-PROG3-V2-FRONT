import { useEffect, useMemo, useState } from 'react';
import { listReservations, updateReservationStatus, cancelReservation, deleteReservation } from '../../services/reservations';
import { formatDNI, formatPriceSimple } from '../../utils/formatters';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function UserReservations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

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

  const actualizarEstado = async (id, nuevo) => {
    try { await updateReservationStatus(id, nuevo); await onBuscar(); }
    catch { setMsg('Error al actualizar'); }
  };

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar?')) return;
    try { await cancelReservation(id); await onBuscar(); }
    catch { setMsg('Error al cancelar'); }
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
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>DNI</th>
                  <th>Hab.</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const nombre = r?.usuario?.nombre || '-';
                  const email = r?.usuario?.email || '-';
                  const dni = r?.usuario?.documento_identidad || '';
                  const hab = r?.habitacion ? `#${r.habitacion.numero_habitacion} (${r.habitacion.tipo})` : '-';
                  const estadoPretty = r.estado ? cap(r.estado) : '-';
                  return (
                    <tr key={r.id}>
                      <td>{nombre}</td>
                      <td>{email}</td>
                      <td>{formatDNI(dni)}</td>
                      <td>{hab}</td>
                      <td>{r.fecha_inicio}</td>
                      <td>{r.fecha_fin}</td>
                      <td>{formatPriceSimple(r.total)}</td>
                      <td>
                        {r.estado === 'confirmada'
                          ? <span className="badge ok">{estadoPretty}</span>
                          : <span className="badge warn">{estadoPretty}</span>}
                      </td>
                      <td style={{ display:'flex', gap:8 }}>
                        {/* Si está CONFIRMADA: mostrar Cancelar + Eliminar */}
                        {r.estado === 'confirmada' && (
                          <>
                            <button 
                              type="button" 
                              onClick={()=>actualizarEstado(r.id, 'cancelada')}
                              style={{
                                padding: '6px 12px',
                                minWidth: '80px',
                                backgroundColor: '#06a3a9aa',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              Cancelar
                            </button>
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
                          </>
                        )}
                        
                        {/* Si está CANCELADA: mostrar Confirmar + Eliminar */}
                        {r.estado === 'cancelada' && (
                          <>
                            <button 
                              type="button" 
                              onClick={()=>actualizarEstado(r.id, 'confirmada')}
                              style={{
                                padding: '6px 12px',
                                minWidth: '80px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              Confirmar
                            </button>
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
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../services/rooms';
import { formatPriceSimple } from '../../utils/formatters';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    numero_habitacion: '',
    tipo: 'individual',
    precio_noche: '',
    disponible: true,
    url_imagen: '',
  });

  const loadRooms = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await getRooms();
      setRooms(res.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        numero_habitacion: room.numero_habitacion,
        tipo: room.tipo,
        precio_noche: room.precio_noche,
        disponible: room.disponible,
        url_imagen: room.url_imagen || '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        numero_habitacion: '',
        tipo: 'individual',
        precio_noche: '',
        disponible: true,
        url_imagen: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      numero_habitacion: '',
      tipo: 'individual',
      precio_noche: '',
      disponible: true,
      url_imagen: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
        setMsg('Habitación actualizada exitosamente');
      } else {
        await createRoom(formData);
        setMsg('Habitación creada exitosamente');
      }
      handleCloseModal();
      await loadRooms();
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al guardar habitación');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta habitación?')) return;

    try {
      await deleteRoom(id);
      setMsg('Habitación eliminada exitosamente');
      await loadRooms();
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al eliminar habitación');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="h2">Administración de Habitaciones</h2>
          <p className="cardDesc">Gestiona las habitaciones del hotel</p>
        </div>
        <button className="btn primary" onClick={() => handleOpenModal()}>
          + Nueva Habitación
        </button>
      </div>

      {msg && <div className="notice">{msg}</div>}

      {loading ? (
        <div>Cargando...</div>
      ) : rooms.length === 0 ? (
        <div className="cardDesc">No hay habitaciones registradas</div>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Precio/Noche</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>#{room.numero_habitacion}</td>
                  <td style={{ textTransform: 'capitalize' }}>{room.tipo}</td>
                  <td>{formatPriceSimple(room.precio_noche)}</td>
                  <td>
                    <span className={`badge ${room.disponible ? 'success' : 'danger'}`}>
                      {room.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn primary"
                      onClick={() => handleOpenModal(room)}
                      style={{ marginRight: '8px' }}
                    >
                      Editar
                    </button>
                    <button className="btn danger" onClick={() => handleDelete(room.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}</h3>
              <button onClick={handleCloseModal} className="btn modal-close-btn" aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-field">
                <label className="label">
                  Número de Habitación <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="numero_habitacion"
                  value={formData.numero_habitacion}
                  onChange={handleChange}
                  className="input"
                  placeholder="101"
                  required
                  min="1"
                />
              </div>

              <div className="form-field">
                <label className="label">
                  Tipo de Habitación <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="select"
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="doble">Doble</option>
                  <option value="matrimonial">Matrimonial</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

              <div className="form-field">
                <label className="label">
                  Precio por Noche <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="precio_noche"
                  value={formData.precio_noche}
                  onChange={handleChange}
                  className="input"
                  placeholder="5000"
                  required
                  min="0"
                  step="1"
                />
                <small className="form-helper-text">
                  Precio en pesos argentinos
                </small>
              </div>

              <div className="form-field">
                <label className="label">URL de la Imagen</label>
                <input
                  type="url"
                  name="url_imagen"
                  value={formData.url_imagen}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="form-helper-text">
                  Opcional: enlace a imagen de la habitación
                </small>
              </div>

              <div className="form-field">
                <label className="form-field-inline">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  Disponible
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn">
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  {editingRoom ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

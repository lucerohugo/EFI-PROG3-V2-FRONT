import { useEffect, useState } from 'react';
import { listUsers, updateUserRole, deleteUser, updateUser } from '../../services/users';
import { formatDNI, formatCellAR } from '../../utils/formatters';

const ROLES = ['admin', 'empleado', 'cliente'];

export default function RolesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    documento_identidad: '',
    telefono: '',
    edad: '',
    rol: 'cliente'
  });

  const cargar = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await listUsers();
      const data = res.data || res?.users || [];
      setRows(data);
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      documento_identidad: user.documento_identidad || '',
      telefono: user.telefono || '',
      edad: user.edad || '',
      rol: user.rol || 'cliente'
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      email: '',
      documento_identidad: '',
      telefono: '',
      edad: '',
      rol: 'cliente'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Preparar payload solo con campos que cambiaron
      const payload = {};
      
      if (formData.nombre !== editingUser.nombre) payload.nombre = formData.nombre;
      if (formData.email !== editingUser.email) payload.email = formData.email;
      if (formData.documento_identidad !== (editingUser.documento_identidad || '')) {
        payload.documento_identidad = formData.documento_identidad;
      }
      if (formData.telefono !== (editingUser.telefono || '')) {
        payload.telefono = formData.telefono;
      }
      if (formData.edad !== (editingUser.edad || '')) {
        payload.edad = formData.edad ? parseInt(formData.edad) : null;
      }
      
      // Actualizar datos del usuario si hay cambios
      if (Object.keys(payload).length > 0) {
        await updateUser(editingUser.id, payload);
      }
      
      // Actualizar rol si cambió
      if (formData.rol !== editingUser.rol) {
        await updateUserRole(editingUser.id, formData.rol);
      }
      
      setMsg('Usuario actualizado exitosamente');
      closeEditModal();
      await cargar();
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  const onDelete = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?\n\nEsta acción eliminará también:\n- Su perfil de cliente (si tiene)\n- Todas sus reservas\n- Su cuenta completa\n\n¡NO SE PUEDE DESHACER!`)) {
      return;
    }
    
    try {
      await deleteUser(id);
      setMsg('Usuario eliminado exitosamente');
      await cargar();
    } catch (e) {
      const m = e?.response?.data?.message;
      setMsg(m || 'Error al eliminar usuario');
    }
  };

  return (
    <div className="page">
      <h2 className="h2">Gestión de Usuarios</h2>
      <p className="cardDesc">Administra los roles y permisos de los usuarios del sistema</p>

      {msg && <div className="notice">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        rows.length === 0 ? <div className="cardDesc">No hay usuarios</div> : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.rol === 'admin' ? 'success' : u.rol === 'empleado' ? 'warning' : 'info'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-icon-only" 
                          onClick={() => openDetailModal(u)}
                          title="Ver detalles"
                          aria-label="Ver detalles del usuario"
                        >
                          <svg className="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className="btn" onClick={() => openEditModal(u)}>Editar</button>
                        <button className="btn danger" onClick={() => onDelete(u.id, u.nombre)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal de Detalle */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Usuario</h3>
              <button onClick={closeDetailModal} className="btn modal-close-btn" aria-label="Cerrar">✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4 className="modal-section-title">Usuario</h4>
                <div className="modal-detail-grid">
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">ID:</span>
                    <span className="modal-detail-value">{selectedUser.id}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Nombre:</span>
                    <span className="modal-detail-value">{selectedUser.nombre}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Email:</span>
                    <span className="modal-detail-value">{selectedUser.email}</span>
                  </div>
                  {selectedUser.documento_identidad && (
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">DNI:</span>
                      <span className="modal-detail-value">{formatDNI(selectedUser.documento_identidad)}</span>
                    </div>
                  )}
                  {selectedUser.telefono && (
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Teléfono:</span>
                      <span className="modal-detail-value">{formatCellAR(selectedUser.telefono)}</span>
                    </div>
                  )}
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Rol:</span>
                    <span className={`badge ${selectedUser.rol === 'admin' ? 'success' : selectedUser.rol === 'empleado' ? 'warning' : 'info'}`}>
                      {selectedUser.rol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button onClick={closeEditModal} className="btn modal-close-btn" aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label className="label">
                    Nombre Completo <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="label">
                    Email <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="label">DNI</label>
                  <input
                    type="text"
                    name="documento_identidad"
                    value={formData.documento_identidad}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="12345678"
                    maxLength="8"
                  />
                  <small className="form-helper-text">
                    Solo números, sin puntos ni espacios
                  </small>
                </div>

                <div className="form-field">
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="+54 351 1234567"
                  />
                </div>

                <div className="form-field">
                  <label className="label">Edad</label>
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="18"
                    min="18"
                    max="120"
                  />
                </div>

                <div className="form-field">
                  <label className="label">
                    Rol <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="select"
                    required
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  <small className="form-helper-text">
                    <strong>Admin:</strong> Acceso total | <strong>Empleado:</strong> Gestiona reservas | <strong>Cliente:</strong> Solo sus reservas
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeEditModal} className="btn">Cancelar</button>
                <button type="submit" className="btn primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

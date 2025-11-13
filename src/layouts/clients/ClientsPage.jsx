import { useEffect, useState } from 'react';
import { listClients, deleteClient, updateClient } from '../../services/clients';
import { formatDNI, formatCellAR } from '../../utils/formatters';

export default function ClientsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    documento_identidad: '',
    telefono: ''
  });



  const cargar = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await listClients();
      setRows(res.data || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);



  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente? Esta acción eliminará también todas sus reservas.')) return;
    try { 
      await deleteClient(id); 
      await cargar(); 
      setMsg('Cliente eliminado exitosamente');
    } catch(e) { 
      setMsg('Error al eliminar cliente'); 
    }
  };

  const openDetailModal = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedClient(null);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      nombre: client.nombre || '',
      email: client.email || '',
      documento_identidad: client.documento_identidad || '',
      telefono: client.telefono || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingClient(null);
    setFormData({ nombre: '', email: '', documento_identidad: '', telefono: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      await updateClient(editingClient.id, formData);
      setMsg('Cliente actualizado exitosamente');
      closeEditModal();
      await cargar();
    } catch (error) {
      setMsg(error?.response?.data?.message || 'Error al actualizar cliente');
    }
  };

  return (
    <div className="page">
      <h2 className="h2">Gestión de Clientes</h2>
      <p className="cardDesc">Administra los clientes del hotel</p>



      {msg && <div className="notice">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        rows.length === 0 ? <div className="cardDesc">No hay clientes registrados</div> : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.telefono ? formatCellAR(user.telefono) : 'Sin teléfono'}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-icon-only" 
                          onClick={() => openDetailModal(user)}
                          title="Ver detalles"
                          aria-label="Ver detalles del cliente"
                        >
                          <svg className="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className="btn" onClick={() => openEditModal(user)}>Editar</button>
                        <button className="btn danger" onClick={() => onDelete(user.id)}>Eliminar</button>
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
      {showDetailModal && selectedClient && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Cliente</h3>
              <button onClick={closeDetailModal} className="btn modal-close-btn" aria-label="Cerrar">✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4 className="modal-section-title">Cliente</h4>
                <div className="modal-detail-grid">
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">ID:</span>
                    <span className="modal-detail-value">{selectedClient.id}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Nombre:</span>
                    <span className="modal-detail-value">{selectedClient.nombre}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Email:</span>
                    <span className="modal-detail-value">{selectedClient.email}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">DNI:</span>
                    <span className="modal-detail-value">
                      {selectedClient.documento_identidad ? formatDNI(selectedClient.documento_identidad) : 'Sin DNI'}
                    </span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Teléfono:</span>
                    <span className="modal-detail-value">
                      {selectedClient.telefono ? formatCellAR(selectedClient.telefono) : 'Sin teléfono'}
                    </span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Rol:</span>
                    <span className={`badge ${selectedClient.rol === 'admin' ? 'success' : selectedClient.rol === 'empleado' ? 'warning' : 'info'}`}>
                      {selectedClient.rol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editingClient && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cliente</h3>
              <button onClick={closeEditModal} className="btn modal-close-btn" aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="form-field">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
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
                />
              </div>

              <div className="form-field">
                <label className="label">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="1234567890"
                />
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

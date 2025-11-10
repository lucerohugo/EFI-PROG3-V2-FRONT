import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, actualizarPerfil } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    edad: user?.edad || '',
    documento_identidad: user?.documento_identidad || '',
    telefono: user?.telefono || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await actualizarPerfil(formData);
      setMessage('Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error al actualizar el perfil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      edad: user?.edad || '',
      documento_identidad: user?.documento_identidad || '',
      telefono: user?.telefono || ''
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '64px 32px' }}>
          <h2>Acceso denegado</h2>
          <p>Debes iniciar sesión para ver tu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="h2" style={{ margin: 0 }}>Mi Perfil</h1>
          {!editing && (
            <button 
              className="btn primary"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
          )}
        </div>

        {message && (
          <div className={`card ${message.includes('Error') ? 'error' : 'success'}`} style={{ marginBottom: '24px', padding: '16px' }}>
            <strong>{message.includes('Error') ? 'Error:' : 'Éxito:'}</strong> {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            
            {/* Nombre */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Nombre completo
              </label>
              {editing ? (
                <input
                  className="input"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '6px' }}>
                  {user.nombre}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Email
              </label>
              {editing ? (
                <input
                  className="input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '6px' }}>
                  {user.email}
                </div>
              )}
            </div>

            {/* DNI */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Documento de Identidad
              </label>
              {editing ? (
                <input
                  className="input"
                  type="text"
                  value={formData.documento_identidad}
                  onChange={(e) => setFormData({...formData, documento_identidad: e.target.value})}
                  placeholder="Ej: 12345678"
                  maxLength={8}
                  pattern="\\d{7,8}"
                  title="DNI debe tener 7 u 8 dígitos"
                  required
                />
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '6px' }}>
                  {user.documento_identidad || 'No especificado'}
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Teléfono
              </label>
              {editing ? (
                <input
                  className="input"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="Ej: 351-123-4567"
                  required
                />
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '6px' }}>
                  {user.telefono || 'No especificado'}
                </div>
              )}
            </div>

            {/* Edad */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Edad
              </label>
              {editing ? (
                <input
                  className="input"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({...formData, edad: e.target.value})}
                  min={1}
                  max={120}
                  required
                />
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '6px' }}>
                  {user.edad} años
                </div>
              )}
            </div>

            {/* Rol */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Rol en el sistema
              </label>
              <div style={{ padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '6px' }}>
                <span className={`badge ${user.rol === 'admin' ? 'primary' : user.rol === 'empleado' ? 'warning' : 'success'}`}>
                  {user.rol === 'admin' ? 'Administrador' : 
                   user.rol === 'empleado' ? 'Empleado' : 
                   'Cliente'}
                </span>
              </div>
            </div>

          </div>

          {/* Botones de acción */}
          {editing && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button 
                type="button"
                className="btn ghost"
                onClick={handleCancel}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="btn primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>

        {/* Información adicional */}
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: 'var(--panel)', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Información importante</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Mantén tus datos actualizados para facilitar las reservas</li>
            <li>El DNI y teléfono son necesarios para procesar reservas</li>
            <li>Tu email se usa para confirmaciones y notificaciones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
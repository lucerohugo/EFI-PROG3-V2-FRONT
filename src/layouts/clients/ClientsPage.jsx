import { useEffect, useState } from 'react';
import { listClients, deleteClient } from '../../services/clients';
import { formatDNI, formatCellAR } from '../../utils/formatters';

export default function ClientsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');



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
                  <th>ID</th><th>Nombre</th><th>Email</th><th>DNI</th><th>Teléfono</th><th>Rol</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.documento_identidad ? formatDNI(user.documento_identidad) : 'Sin DNI'}</td>
                    <td>{user.telefono ? formatCellAR(user.telefono) : 'Sin teléfono'}</td>
                    <td>
                      <span className={`badge ${user.rol === 'admin' ? 'success' : user.rol === 'empleado' ? 'warning' : 'info'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td>
                      <button className="btn danger" onClick={()=>onDelete(user.id)} type="button">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

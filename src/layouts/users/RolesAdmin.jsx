import { useEffect, useState } from 'react';
import { listUsers, updateUserRole, deleteUser } from '../../services/users';

const ROLES = ['admin', 'empleado', 'cliente'];

export default function RolesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState({}); // id -> rol seleccionado

  const cargar = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await listUsers();
      const data = res.data || res?.users || []; // por si tu backend devuelve otra key
      setRows(data);
      // estado local de selects:
      const initial = {};
      data.forEach(u => { initial[u.id] = u.rol; });
      setEditing(initial);
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const onChangeRol = (id, rol) => {
    setEditing(prev => ({ ...prev, [id]: rol }));
  };

  const onSave = async (id) => {
    const nuevoRol = editing[id];
    if (!ROLES.includes(nuevoRol)) {
      setMsg('Rol inválido');
      return;
    }
    try {
      await updateUserRole(id, nuevoRol);
      setMsg('Rol actualizado');
      await cargar();
    } catch (e) {
      const m = e?.response?.data?.message;
      setMsg(m || 'Error al actualizar rol');
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
      <h2 className="h2">Gestión de roles</h2>

      {msg && <div className="notice">{msg}</div>}
      {loading ? <div>Cargando...</div> : (
        rows.length === 0 ? <div className="cardDesc">No hay usuarios</div> : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Email</th><th>Rol actual</th><th>Cambiar a</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td><span className="badge">{u.rol}</span></td>
                    <td>
                      <select
                        className="select"
                        value={editing[u.id] ?? u.rol}
                        onChange={(e)=>onChangeRol(u.id, e.target.value)}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ display:'flex', gap:8 }}>
                      <button className="btn" onClick={()=>onSave(u.id)} type="button">Guardar</button>
                      <button className="btn danger" onClick={()=>onDelete(u.id, u.nombre)} type="button">Eliminar</button>
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

import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const linkClass = ({ isActive }) => `navlink${isActive ? ' active' : ''}`;

export default function Navbar() {
  const { user, rol, autenticado, cerrarSesion } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    cerrarSesion();
    navigate('/inicio-sesion');
  };

  return (
    <header className="header">
      <div className="brand">Hotelify</div>
      <nav className="nav">
        <NavLink to="/" className={linkClass}>Inicio</NavLink>
        <NavLink to="/habitaciones" className={linkClass}>Habitaciones</NavLink>

        {rol === 'cliente' && (
          <NavLink to="/reservas/mis-reservas" className={linkClass}>Mis Reservas</NavLink>
        )}

        {(rol === 'admin' || rol === 'empleado') && (
          <>
            <NavLink to="/reservas/por-usuario" className={linkClass}>Reservas</NavLink>
            <NavLink to="/clientes" className={linkClass}>Clientes</NavLink>
          </>
        )}

        {rol === 'admin' && (
          <>
            <NavLink to="/admin/habitaciones" className={linkClass}>Admin Habitaciones</NavLink>
            <NavLink to="/usuarios/roles" className={linkClass}>Usuarios</NavLink>
          </>
        )}
      </nav>

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
        {autenticado ? (
          <>
            <NavLink to="/perfil" className={linkClass} title="Ver perfil">
              {user?.nombre} <small>({rol})</small>
            </NavLink>
            <button onClick={logout} className="btn ghost">Salir</button>
          </>
        ) : (
          <>
            <NavLink to="/inicio-sesion" className={linkClass}>Ingresar</NavLink>
            <NavLink to="/registro" className={linkClass}>Registrarse</NavLink>
          </>
        )}
      </div>
    </header>
  );
}

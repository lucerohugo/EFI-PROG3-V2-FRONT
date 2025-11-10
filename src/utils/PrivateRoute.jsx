import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ roles = [], children }) {
  const auth = useContext(AuthContext);
  const autenticado = Boolean(auth?.token && auth?.user);
  const rol = auth?.user?.rol;

  if (!autenticado) return <Navigate to="/inicio-sesion" replace />;
  if (roles.length > 0 && !roles.includes(rol)) return <Navigate to="/" replace />;

  return children || <Outlet />;
}

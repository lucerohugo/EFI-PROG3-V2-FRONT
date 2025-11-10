import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles = [], children }) {
  const { autenticado, rol } = useAuth();

  if (!autenticado) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

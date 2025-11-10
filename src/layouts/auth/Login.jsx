import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@hotel.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await iniciarSesion(email, password);
      navigate('/rooms');
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2>Ingresar</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
            style={{ width:'100%', padding:8 }} placeholder="tu@correo.com" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
            style={{ width:'100%', padding:8 }} placeholder="********" />
        </div>
        {error && <div style={{ color:'crimson', marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ padding:'8px 12px' }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p style={{ marginTop:12, color:'#666' }}>
        Tip: probá admin <code>admin@hotel.com</code> / <code>admin123</code> o logueá tu cliente.
      </p>
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/auth';
import { updateUser as apiUpdateUser } from '../services/users';

export const AuthContext = createContext(null);

// decode JWT -> payload.user
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.user || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token && !user) {
      const u = decodeToken(token);
      if (u) {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      }
    }
  }, [token]);

  const iniciarSesion = async (email, password) => {
    const res = await apiLogin(email, password);
    const t = res?.token;
    if (t) {
      const u = decodeToken(t);
      setToken(t);
      setUser(u);
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    }
    return res;
  };

  const registrar = async (payload) => {
    try {
      const res = await apiRegister(payload);
      // Después del registro exitoso, hacer login automático
      if (res) {
        return await iniciarSesion(payload.email, payload.password);
      }
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = registrar; // Alias para compatibilidad

  const actualizarPerfil = async (userData) => {
    try {
      // Importar la función de actualización
      const { updateUser } = await import('../services/users');
      const res = await updateUser(user.id, userData);
      
      // Actualizar el usuario en el estado y localStorage
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return res;
    } catch (error) {
      throw error;
    }
  };

  const cerrarSesion = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(
    () => ({
      token,
      user,
      rol: user?.rol || null,
      iniciarSesion,
      registrar,
      register, // Añadir el alias
      actualizarPerfil,
      cerrarSesion,
      autenticado: Boolean(token && user),
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

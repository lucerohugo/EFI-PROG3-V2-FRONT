import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthForm.css';

export default function LoginForm() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();
  
  const [formData, setFormData] = useState({
    email: 'admin@hotel.com',
    password: 'admin123',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Validación en tiempo real
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email es requerido';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
        return '';
      case 'password':
        if (!value) return 'Contraseña es requerida';
        if (value.length < 4) return 'Mínimo 4 caracteres';
        return '';
      default:
        return '';
    }
  };

  // Actualizar errores cuando cambia el formulario
  useEffect(() => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (touched[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await iniciarSesion(formData.email, formData.password);
      navigate('/habitaciones');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al iniciar sesión';
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa a tu cuenta del hotel</p>
        </div>

        <form onSubmit={onSubmitLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input 
              id="email"
              name="email" 
              type="email" 
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.email ? 'error' : ''} ${touched.email && !errors.email ? 'valid' : ''}`}
              placeholder="ejemplo@hotel.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input 
              id="password"
              name="password" 
              type="password" 
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.password ? 'error' : ''} ${touched.password && !errors.password ? 'valid' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || Object.keys(errors).length > 0} 
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="demo-credentials">
            <p><strong>Credenciales de prueba:</strong></p>
            <p>👤 Admin: <code>admin@hotel.com</code> / <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

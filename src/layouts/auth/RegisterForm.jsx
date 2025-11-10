import { useContext, useState, useEffect } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import './AuthForm.css';

const RegisterForm = () => {
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    edad: "",
    documento_identidad: "",
    telefono: "",
  })

  // Validación en tiempo real
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'Nombre es requerido';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        return '';
      case 'email':
        if (!value) return 'Email es requerido';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
        return '';
      case 'password':
        if (!value) return 'Contraseña es requerida';
        if (value.length < 6) return 'Mínimo 6 caracteres';
        return '';
      case 'edad':
        const edad = parseInt(value);
        if (!value) return 'Edad es requerida';
        if (isNaN(edad) || edad < 18 || edad > 99) return 'Edad entre 18-99 años';
        return '';
      case 'documento_identidad':
        if (!value) return 'DNI es requerido';
        if (!/^\d{7,8}$/.test(value.replace(/\D/g, ''))) return 'DNI: 7-8 dígitos';
        return '';
      case 'telefono':
        if (!value) return 'Teléfono es requerido';
        if (value.replace(/\D/g, '').length < 10) return 'Teléfono inválido';
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
  }

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
      nombre: true,
      email: true,
      password: true,
      edad: true,
      documento_identidad: true,
      telefono: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return;
    
    setLoading(true)
    setErrors({})
    
    try {
      const dataToSend = {
        ...formData,
        edad: parseInt(formData.edad)
      }
      
      const result = await register(dataToSend)
      navigate('/habitaciones')
      
    } catch (err) {
      let errorMessage = 'Error al registrarse';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p>Registrate para reservar habitaciones</p>
        </div>
        
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre completo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tu nombre completo"
              className={`form-input ${errors.nombre ? 'error' : ''} ${touched.nombre && !errors.nombre ? 'valid' : ''}`}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

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
              placeholder="tu@email.com"
              className={`form-input ${errors.email ? 'error' : ''} ${touched.email && !errors.email ? 'valid' : ''}`}
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
              placeholder="Mínimo 6 caracteres"
              className={`form-input ${errors.password ? 'error' : ''} ${touched.password && !errors.password ? 'valid' : ''}`}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edad" className="form-label">
                Edad
              </label>
              <input
                id="edad"
                name="edad"
                type="number"
                value={formData.edad}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="25"
                min="18"
                max="99"
                className={`form-input ${errors.edad ? 'error' : ''} ${touched.edad && !errors.edad ? 'valid' : ''}`}
              />
              {errors.edad && <span className="error-message">{errors.edad}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="documento_identidad" className="form-label">
                DNI
              </label>
              <input
                id="documento_identidad"
                name="documento_identidad"
                type="text"
                value={formData.documento_identidad}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="12345678"
                className={`form-input ${errors.documento_identidad ? 'error' : ''} ${touched.documento_identidad && !errors.documento_identidad ? 'valid' : ''}`}
              />
              {errors.documento_identidad && <span className="error-message">{errors.documento_identidad}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="351-123-4567"
              className={`form-input ${errors.telefono ? 'error' : ''} ${touched.telefono && !errors.telefono ? 'valid' : ''}`}
            />
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
          </div>

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || Object.keys(errors).filter(key => key !== 'submit').length > 0}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm

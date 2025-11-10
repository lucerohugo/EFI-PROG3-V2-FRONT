import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './layouts/home/index';

import { AuthProvider } from './context/AuthContext';
import LoginForm from './layouts/auth/LoginForm';
import RegisterForm from './layouts/auth/RegisterForm';

import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';

import Navbar from './components/Navbar';
import RolesAdmin from './layouts/users/RolesAdmin';

import RoomsRoutes from './layouts/rooms';
import ClientsRoutes from './layouts/clients';
import ReservationsRoutes from './layouts/reservations';
import UserProfile from './layouts/users/UserProfile';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Fragment>
          <Navbar />
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Públicas */}
            <Route element={<PublicRoute />}>
              <Route path="/inicio-sesion" element={<LoginForm />} />
              <Route path="/registro" element={<RegisterForm />} />
            </Route>

            {/* Privadas (autenticado) */}
            <Route element={<PrivateRoute />}>
              {/* Perfil: todos los usuarios autenticados */}
              <Route path="/perfil" element={<UserProfile />} />
              
              {/* Habitaciones: todos los roles autenticados */}
              <Route path="/habitaciones/*" element={<RoomsRoutes />} />

              {/* Reservas: contiene subrutas (cliente/admin-emp) */}
              <Route path="/reservas/*" element={<ReservationsRoutes />} />
            </Route>

            {/* Clientes: solo admin o empleado */}
            <Route
              path="/clientes/*"
              element={
                <PrivateRoute roles={['admin', 'empleado']}>
                  <ClientsRoutes />
                </PrivateRoute>
              }
            />

            {/* Roles: solo admin */}
            <Route
              path="/usuarios/roles"
              element={
                <PrivateRoute roles={['admin']}>
                  <RolesAdmin />
                </PrivateRoute>
              }
            />
          </Routes>
        </Fragment>
      </AuthProvider>
    </Router>
  );
}

export default App;

import api from './api';

// Listado completo (admin/empleado), acepta filtros { q, estado }
export async function listReservations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/reservations${qs ? `?${qs}` : ''}`);
  return data; // { status, data: [...] }
}

// Cliente crea su reserva
export async function createReservation(payload) {
  const { data } = await api.post('/reservations', payload);
  return data; // { message, data }
}

// Ver reservas por id_usuario (cliente: las suyas / admin-emp: cualquiera)
export async function getReservationsByUser(id_usuario) {
  const { data } = await api.get(`/reservations/${id_usuario}`);
  return data; // { status, data: [...] }
}

// Admin/Emp actualiza estado
export async function updateReservationStatus(id, estado) {
  const { data } = await api.put(`/reservations/${id}`, { estado });
  return data;
}

// Cancelar (cliente suya / admin-emp cualquiera)
export async function cancelReservation(id) {
  const { data } = await api.delete(`/reservations/${id}`);
  return data;
}

// Actualizar reserva completa
export async function updateReservation(id, payload) {
  const { data } = await api.put(`/reservations/${id}`, payload);
  return data;
}

// Eliminar reserva completamente (solo para admins desde el frontend)
export async function deleteReservation(id) {
  const { data } = await api.delete(`/reservations/${id}`);
  return data;
}

import api from './api';

export async function listUsers() {
  const { data } = await api.get('/clients/all-users');
  return data; // { status, data: [...] } o { data: [...] } según tu backend
}

export async function updateUserRole(id, rol) {
  const { data } = await api.put(`/clients/${id}/rol`, { rol });
  return data; // { message, data }
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/clients/${id}`);
  return data; // { message, data }
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/auth/profile/${id}`, payload);
  return data; // { message, data }
}

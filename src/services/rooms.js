import api from './api';

export async function getRooms(params = {}) {
  const { data } = await api.get('/rooms', { params });
  return data; // { status, data: [...] }
}

export async function getRoomById(id) {
  const { data } = await api.get(`/rooms/${id}`);
  return data;
}

export async function createRoom(payload) {
  const { data } = await api.post('/rooms', payload);
  return data;
}

export async function updateRoom(id, payload) {
  const { data } = await api.put(`/rooms/${id}`, payload);
  return data;
}

export async function deleteRoom(id) {
  const { data } = await api.delete(`/rooms/${id}`);
  return data;
}

import { Routes, Route } from 'react-router-dom';
import MyReservations from './MyReservations.jsx';
import UserReservations from './UserReservations.jsx';

export default function ReservationsRoutes() {
  return (
    <Routes>
      <Route path="mis-reservas" element={<MyReservations />} />
      <Route path="por-usuario" element={<UserReservations />} />
    </Routes>
  );
}

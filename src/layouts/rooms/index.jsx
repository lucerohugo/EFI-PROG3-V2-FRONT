import { Routes, Route } from 'react-router-dom';
import RoomsPage from './RoomsPage.jsx';

export default function RoomsRoutes() {
  return (
    <Routes>
      <Route index element={<RoomsPage />} />
    </Routes>
  );
}

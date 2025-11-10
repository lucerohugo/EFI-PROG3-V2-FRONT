import { Routes, Route } from 'react-router-dom';
import ClientsPage from './ClientsPage.jsx';

export default function ClientsRoutes() {
  return (
    <Routes>
      <Route index element={<ClientsPage />} />
    </Routes>
  );
}

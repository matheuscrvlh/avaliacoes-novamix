// REACT
import { Routes, Route } from 'react-router-dom';


// PAGES
import AvaliacaoPage from "@/pages/public/AvaliacaoPage";
import DashboardPage from "@/pages/admin/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<AvaliacaoPage />} />
      <Route path='/dashboard' element={<DashboardPage />} />
    </Routes>
  );
}

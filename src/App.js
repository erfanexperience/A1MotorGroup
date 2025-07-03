import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layouts/AdminLayout';
import AdminAuth from './pages/admin-pages/AdminAuth';
import Inventory from './pages/Inventory';
import AddVehicle from './pages/admin-pages/AddVehicle';
import Home from './pages/Home';
import CarDetailsV2 from './pages/CarDetailsV2';
import GlobalStyles from './styles/GlobalStyles';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import SellYourCar from './pages/SellYourCar';
import Financing from './pages/Financing';
import AdminInventory from './pages/admin-pages/Inventory';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import TestPage from './pages/TestPage';

function App() {
  return (
    <Router>
      <AdminAuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/car/:id" element={<CarDetailsV2 />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sell" element={<SellYourCar />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/financing" element={<Financing />} />
        <Route path="/test" element={<TestPage />} />
        
        {/* Admin Login Route (unprotected) */}
        <Route path="/admin/login" element={<AdminAuth />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
        <Route index element={<Navigate to="/admin/inventory" replace />} />
          <Route path="inventory" element={<AdminInventory />} />
        <Route path="inventory/edit/:vin" element={<AddVehicle />} />
      </Route>
      </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;

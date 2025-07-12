import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrackPackagePage from './pages/TrackPackagePage';
import NotFoundPage from './pages/NotFoundPage'; // A simple 404 page
import AdminDashboardPage from './pages/AdminDashboardPage';
import CourierDashboardPage from './pages/CourierDashboardPage';
import Header from './components/Header'; // We'll create this soon
import Footer from './components/Footer'; // We'll create this soon

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header /> {/* Global Header */}
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<TrackPackagePage />} /> {/* Public tracking form */}
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/courier-dashboard" element={<CourierDashboardPage />} />
            {/* Add more protected routes here later, e.g., /admin/packages, /courier/my-packages */}

            {/* Catch-all for 404 pages */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer /> {/* Global Footer */}
      </div>
    </Router>
  );
}

export default App;
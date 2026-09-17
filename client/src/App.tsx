import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NoiseOverlay } from './components/layout/NoiseOverlay';
import { MouseTrailPointer } from './components/ui/MouseTrailPointer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MeetingPage } from './pages/MeetingPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { PricingPage } from './pages/PricingPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <SocketProvider>
          {/* Custom smooth mouse trails pointer animation */}
          <MouseTrailPointer />

          {/* Persistent fixed SVG fractal-noise texture overlay */}
          <NoiseOverlay />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/meeting/:meetingId" element={<MeetingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </HashRouter>
  );
};

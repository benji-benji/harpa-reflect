import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import EntryList from './pages/EntryList';
import EntryDetail from './pages/EntryDetail';
import JournalFlow from './pages/JournalFlow';
import MockupsPage from './mockups/MockupsPage';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/mockups" element={<MockupsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><EntryList /></ProtectedRoute>} />
          <Route path="/journal/new" element={<ProtectedRoute><JournalFlow /></ProtectedRoute>} />
          <Route path="/entries/:id" element={<ProtectedRoute><EntryDetail /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

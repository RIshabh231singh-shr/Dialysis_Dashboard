import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import PatientsList from './pages/PatientsList';
import PatientInfo from './pages/PatientInfo';
import AddSession from './pages/AddSession';
import SessionInfo from './pages/SessionInfo';
import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import store from './store';
import { fetchActiveSessions } from './slices/sessionSlice';
import './index.css';

const Settings = () => (
  <div className="flex h-screen items-center justify-center text-text-secondary w-full">
    Settings Page (Coming Soon)
  </div>
);

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchActiveSessions());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-blue-500/30">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patient/:id" element={<PatientInfo />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/add-session/:patientId" element={<AddSession />} />
        <Route path="/session/:id" element={<SessionInfo />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;

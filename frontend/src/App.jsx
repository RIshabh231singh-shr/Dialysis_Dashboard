import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import PatientsList from './pages/PatientsList';
import PatientInfo from './pages/PatientInfo';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-blue-500/30">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patient/:id" element={<PatientInfo />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

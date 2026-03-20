import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utility/axiosInstance';
import { Loader2, ArrowLeft, PlusCircle, Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const PatientInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'COMPLETED', 'IN_PROGRESS', 'SCHEDULED'

    // Redux Global state tracker
    const activeSessions = useSelector((state) => state.session.activeSessions);
    const hasActiveSession = !!activeSessions[id];

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Fetch patient details and their sessions concurrently
                const [patientRes, sessionsRes] = await Promise.all([
                    api.get(`/patient/${id}`),
                    api.get(`/session/patient/${id}`)
                ]);

                if (patientRes.data.success) {
                    setPatient(patientRes.data.data);
                }
                if (sessionsRes.data.success) {
                    setSessions(sessionsRes.data.data);
                }
            } catch (err) {
                console.error("Error fetching patient info:", err);
                setError('Failed to load patient information. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPatientData();
        }
    }, [id]);

    const filteredSessions = useMemo(() => {
        if (filter === 'ALL') return sessions;
        return sessions.filter(s => s.status === filter);
    }, [sessions, filter]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'SCHEDULED': return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', label: 'Scheduled' };
            case 'IN_PROGRESS': return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', label: 'In Progress' };
            case 'COMPLETED': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', label: 'Completed' };
            default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20', label: status };
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                    <p className="text-text-secondary">Loading patient profile...</p>
                </main>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center">
                    <AlertTriangle size={48} className="text-accent-red mb-4" />
                    <h2 className="text-xl font-bold text-text-primary mb-2">Error</h2>
                    <p className="text-text-secondary mb-6">{error || 'Patient not found.'}</p>
                    <button onClick={() => navigate('/patients')} className="px-6 py-2 bg-accent-blue text-white rounded-lg font-medium">
                        Return to Patients List
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <header>
                        <button 
                            onClick={() => navigate('/patients')}
                            className="flex items-center gap-2 text-text-secondary hover:text-accent-blue transition-colors text-sm mb-6 group"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            Back to Patients List
                        </button>
                        <div className="flex items-center justify-between">
                            <h1 className="text-[2rem] font-bold text-text-primary leading-tight flex items-center gap-4">
                                {patient.name}
                                {hasActiveSession && (
                                    <span className="flex h-3.5 w-3.5 relative ml-1" title="Session In Progress">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                                    </span>
                                )}
                                <span className="bg-accent-red/10 text-accent-red px-3 py-1 rounded-lg text-sm font-bold tracking-wider align-middle">
                                    {patient.bloodGroup}
                                </span>
                            </h1>
                        </div>
                    </header>

                    {/* Patient Overview Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg-secondary border border-border-color rounded-2xl p-8 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        
                        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                            <Activity className="text-accent-blue" size={20} />
                            Patient Vitals & Info
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="flex flex-col">
                                <span className="text-text-secondary text-xs uppercase tracking-wider mb-1">Age / Gender</span>
                                <span className="text-text-primary font-medium text-[0.95rem]">{patient.age} yrs • {patient.gender}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-text-secondary text-xs uppercase tracking-wider mb-1">Father's Name</span>
                                <span className="text-text-primary font-medium text-[0.95rem]">{patient.fatherName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-text-secondary text-xs uppercase tracking-wider mb-1">Dry Weight</span>
                                <span className="text-text-primary font-medium text-[0.95rem]">{patient.dryWeight} kg</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-text-secondary text-xs uppercase tracking-wider mb-1">Hospital Unit</span>
                                <span className="text-text-primary font-medium text-[0.95rem]">{patient.hospitalUnit}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sessions Section */}
                    <div className="pt-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-text-primary">Dialysis Sessions</h2>
                            <button 
                                onClick={() => navigate(`/add-session/${id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-semibold hover:bg-accent-blue-hover transition-colors shadow-lg shadow-accent-blue/20"
                            >
                                <PlusCircle size={16} />
                                New Session
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['ALL', 'COMPLETED', 'IN_PROGRESS', 'SCHEDULED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === f 
                                        ? 'bg-white/10 text-white border border-white/20' 
                                        : 'bg-bg-secondary text-text-secondary border border-border-color hover:text-text-primary hover:bg-white/5'
                                    }`}
                                >
                                    {f === 'SCHEDULED' ? 'Not Started' : f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Session List */}
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-16 bg-bg-secondary border border-dashed border-border-color rounded-2xl"
                                >
                                    <Clock className="mx-auto text-text-secondary mb-4 opacity-50" size={48} />
                                    <h3 className="text-lg font-medium text-text-primary mb-2">No sessions till now</h3>
                                    <p className="text-text-secondary mb-6 max-w-sm mx-auto">This patient hasn't had any dialysis sessions logged yet. Create a new session to get started.</p>
                                    <button 
                                        onClick={() => navigate(`/add-session/${id}`)}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-xl font-semibold hover:bg-accent-blue hover:text-white transition-all"
                                    >
                                        <PlusCircle size={18} />
                                        Add Session
                                    </button>
                                </motion.div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="text-center py-12 bg-bg-secondary/50 rounded-2xl border border-dashed border-border-color text-text-secondary">
                                    No sessions matching the selected filter.
                                </div>
                            ) : (
                                filteredSessions.map((session, index) => {
                                    const statusStyle = getStatusStyles(session.status);
                                    const dateObj = new Date(session.sessionDate);
                                    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                                    const hasAnomalies = session.anomalies && session.anomalies.length > 0;

                                    return (
                                        <motion.div 
                                            key={session._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center justify-between transition-all duration-300 hover:border-accent-blue/40 cursor-pointer group"
                                            onClick={() => navigate(`/session/${session._id}`)} // For later expansion
                                        >
                                            <div className="flex items-center gap-8 md:gap-16">
                                                {/* Date */}
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-text-secondary uppercase tracking-wider mb-1">Date</span>
                                                    <span className="text-sm font-semibold text-text-primary whitespace-nowrap">{formattedDate}</span>
                                                </div>

                                                {/* Pre/Post Weight */}
                                                <div className="hidden sm:flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-text-secondary uppercase tracking-wider mb-1">Pre-Wt</span>
                                                        <span className="text-sm font-medium text-text-primary">{session.preWeight || '-'} kg</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-text-secondary uppercase tracking-wider mb-1">Post-Wt</span>
                                                        <span className="text-sm font-medium text-text-primary">{session.postWeight || '-'} kg</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Anomalies Indication */}
                                                <div className="w-[180px]">
                                                    {['COMPLETED', 'IN_PROGRESS'].includes(session.status) && (
                                                        hasAnomalies ? (
                                                            <div className="flex items-center gap-2 text-accent-red bg-accent-red/10 border border-accent-red/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                                <AlertTriangle size={14} />
                                                                {session.anomalies.length} Anomal{session.anomalies.length > 1 ? 'ies' : 'y'} detected
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-lg text-xs font-medium">
                                                                <CheckCircle2 size={14} />
                                                                No Anomalies
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-4">
                                                {activeSessions[patient._id] === session._id && (
                                                    <span className="flex h-3 w-3 relative" title="Active in Real-Time">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                                    </span>
                                                )}
                                                <div className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border`}>
                                                    {statusStyle.label}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientInfo;

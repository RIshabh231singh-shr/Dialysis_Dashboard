import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '../components/Sidebar';
import api from '../utility/axiosInstance';
import { Loader2, ArrowLeft, Play, Square, FileEdit, Activity, AlertTriangle, CheckCircle2, HeartPulse, Scale, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addActiveSession, removeActiveSession, fetchActiveSessions } from '../slices/sessionSlice';

// Zod schema for Post-Dialysis Form Validation
const updateSchema = z.object({
    postWeight: z.coerce.number().min(0, 'Weight must be non-negative'),
    systolic: z.coerce.number().min(50, 'Min 50').max(250, 'Max 250').optional().or(z.literal('')),
    diastolic: z.coerce.number().min(30, 'Min 30').max(150, 'Max 150').optional().or(z.literal('')),
    notes: z.string().max(500, 'Max 500 characters').optional()
});

const SessionInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    // Global active sessions map
    const activeSessions = useSelector(state => state.session.activeSessions);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(updateSchema),
        defaultValues: { postWeight: '', systolic: '', diastolic: '', notes: '' }
    });

    const fetchSessionData = async () => {
        try {
            const response = await api.get(`/session/${id}`);
            if (response.data.success) {
                setSession(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch session', err);
            setError('Failed to load session tracking info.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionData();
        // Fallback to fetch active sessions if arrived here directly mapped
        dispatch(fetchActiveSessions());
    }, [id, dispatch]);

    const handleStartSession = async () => {
        try {
            setActionLoading(true);
            const res = await api.patch(`/session/${id}/start`);
            if (res.data.success) {
                dispatch(addActiveSession({ patientId: session.patientId._id, sessionId: id }));
                fetchSessionData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error starting session');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!window.confirm("Are you sure you want to end this session?")) return;
        try {
            setActionLoading(true);
            const res = await api.patch(`/session/${id}/end`);
            if (res.data.success) {
                dispatch(removeActiveSession({ patientId: session.patientId._id }));
                fetchSessionData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error ending session');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateSession = async (data) => {
        try {
            setActionLoading(true);
            const payload = { postWeight: Number(data.postWeight) };
            if (data.systolic && data.diastolic) {
                payload.postBP = { systolic: Number(data.systolic), diastolic: Number(data.diastolic) };
            }
            if (data.notes) payload.notes = data.notes;

            const res = await api.patch(`/session/${id}/update`, payload);
            if (res.data.success) {
                setShowUpdateForm(false);
                fetchSessionData(); // This refetches, showing anomalies!
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating post-dialysis data');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading || !session) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                    <p className="text-text-secondary">Loading Session Telemetry...</p>
                </main>
            </div>
        );
    }

    const { patientId: patient, status, anomalies } = session;
    const isAnotherSessionRunning = activeSessions[patient._id] && activeSessions[patient._id] !== id;
    const dateStr = new Date(session.sessionDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const hasAnomalies = anomalies && anomalies.length > 0;
    const isFinalized = status === 'COMPLETED' && session.postWeight !== undefined;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <div className="max-w-5xl mx-auto space-y-8 pb-12">
                    {/* Header */}
                    <header>
                        <button 
                            onClick={() => navigate(`/patient/${patient._id}`)}
                            className="flex items-center gap-2 text-text-secondary hover:text-accent-blue transition-colors text-sm mb-6 group"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            Back to Patient
                        </button>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold text-text-primary leading-tight">Session Tracker</h1>
                                <p className="text-text-secondary mt-1 max-w-xl">
                                    Patient: <span className="text-white font-medium">{patient.name}</span> | Date: {dateStr}
                                </p>
                            </div>
                            {/* Status Badge */}
                            <div>
                                {status === 'SCHEDULED' && <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-lg font-bold tracking-widest text-sm uppercase">Scheduled</span>}
                                {status === 'IN_PROGRESS' && (
                                    <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-lg font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                        In Progress
                                    </span>
                                )}
                                {status === 'COMPLETED' && <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-lg font-bold tracking-widest text-sm uppercase text-center block">Completed</span>}
                            </div>
                        </div>
                    </header>

                    {/* Anomalies Alert Banner */}
                    <AnimatePresence>
                        {isFinalized && hasAnomalies && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                            >
                                <h3 className="text-accent-red font-bold flex items-center gap-2 text-lg mb-4">
                                    <AlertTriangle size={22} /> Attention: Post-Dialysis Anomalies Detected
                                </h3>
                                <ul className="space-y-3">
                                    {anomalies.map((anom, idx) => (
                                        <li key={idx} className="flex gap-4 items-start bg-bg-primary/50 p-3 rounded-lg border border-accent-red/10">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                                                anom.severity === 'HIGH' ? 'bg-red-500/20 text-red-500' : 
                                                anom.severity === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {anom.severity}
                                            </span>
                                            <p className="text-text-primary text-sm leading-relaxed">{anom.message}</p>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                        {isFinalized && !hasAnomalies && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                            >
                                <CheckCircle2 className="text-green-500" size={24} />
                                <span className="text-green-500 font-medium">Session finalized successfully. No vitals anomalies flagged by system.</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Pre-Dialysis Block */}
                        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 relative overflow-hidden">
                            <Activity className="absolute -right-6 -bottom-6 text-white/5 opacity-5" size={140} />
                            <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-text-secondary"/> Pre-Dialysis Vitals
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Pre Weight</span>
                                        <div className="flex items-center gap-2 font-medium text-lg text-white">
                                            <Scale size={16} className="text-accent-blue" />
                                            {session.preWeight} <span className="text-sm text-text-secondary">kg</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Blood Pressure</span>
                                        <div className="flex items-center gap-2 font-medium text-lg text-white">
                                            <HeartPulse size={16} className="text-accent-red" />
                                            {session.preBP?.systolic ? `${session.preBP.systolic}/${session.preBP.diastolic}` : '--/--'}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div>
                                        <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Unit / Machine</span>
                                        <span className="font-medium text-white">{session.hospitalUnit} • {session.dialysisMachineId}</span>
                                    </div>
                                    {session.startTime && (
                                        <div>
                                            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Started At</span>
                                            <span className="font-medium text-white flex items-center gap-1">
                                                <Clock size={14} className="text-green-400"/>
                                                {new Date(session.startTime).toLocaleTimeString([], {timeStyle: 'short'})}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Post-Dialysis Block */}
                        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 relative">
                            <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-text-secondary"/> Post-Dialysis Vitals
                            </h3>
                            
                            {!isFinalized ? (
                                <div className="h-32 flex flex-col items-center justify-center text-center text-text-secondary border-t border-dashed border-border-color mt-4 pt-4">
                                    <p className="text-sm">Post metrics will appear here after session finalization.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Post Weight</span>
                                            <div className="flex items-center gap-2 font-medium text-lg text-white">
                                                <Scale size={16} className="text-green-400" />
                                                {session.postWeight} <span className="text-sm text-text-secondary">kg</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Blood Pressure</span>
                                            <div className="flex items-center gap-2 font-medium text-lg text-white">
                                                <HeartPulse size={16} className="text-green-400" />
                                                {session.postBP?.systolic ? `${session.postBP.systolic}/${session.postBP.diastolic}` : '--/--'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div>
                                            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Total Duration</span>
                                            <span className="font-medium text-white">{session.duration ? `${session.duration} mins` : '--'}</span>
                                        </div>
                                        {session.endTime && (
                                            <div>
                                                <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Ended At</span>
                                                <span className="font-medium text-white flex items-center gap-1">
                                                    <Clock size={14} className="text-text-secondary"/>
                                                    {new Date(session.endTime).toLocaleTimeString([], {timeStyle: 'short'})}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {session.notes && (
                                        <div className="pt-4 border-t border-white/5">
                                            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-2">Nursing Notes</span>
                                            <p className="text-sm bg-bg-primary p-3 rounded-lg font-medium leading-relaxed">{session.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Action Panel / Workflows */}
                    <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 mt-8 flex flex-col items-center justify-center min-h-[140px]">
                        
                        {status === 'SCHEDULED' && (
                            <div className="text-center w-full max-w-lg">
                                {isAnotherSessionRunning ? (
                                    <div className="bg-accent-red/10 border border-accent-red/20 p-4 rounded-xl text-accent-red mb-4">
                                        <AlertTriangle className="mx-auto mb-2" size={24} />
                                        <p className="font-medium text-sm">Cannot start. A different session is currently IN PROGRESS for {patient.name}.</p>
                                    </div>
                                ) : (
                                    <p className="text-text-secondary mb-4 text-sm">Verify pre-dialysis parameters and initialize the dialysis tracking timer.</p>
                                )}
                                <button 
                                    onClick={handleStartSession}
                                    disabled={actionLoading || isAnotherSessionRunning}
                                    className="w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin"/> : <Play size={20}/>}
                                    START SESSION TIMER
                                </button>
                            </div>
                        )}

                        {status === 'IN_PROGRESS' && (
                            <div className="text-center w-full max-w-lg">
                                <p className="text-blue-400 mb-4 animate-pulse font-medium tracking-wide">Dialysis is actively running...</p>
                                <button 
                                    onClick={handleEndSession}
                                    disabled={actionLoading}
                                    className="w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin"/> : <Square size={20}/>}
                                    STOP TIMER / END DIALYSIS
                                </button>
                            </div>
                        )}

                        {status === 'COMPLETED' && !isFinalized && !showUpdateForm && (
                            <div className="text-center w-full max-w-lg">
                                <p className="text-green-500 mb-4 font-medium tracking-wide">Dialysis concluded. Final metrics required.</p>
                                <button 
                                    onClick={() => setShowUpdateForm(true)}
                                    className="w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                                >
                                    <FileEdit size={20}/>
                                    LOG POST-DIALYSIS METRICS
                                </button>
                            </div>
                        )}

                        {/* Post Dialysis Update Form Dropdown */}
                        <AnimatePresence>
                            {showUpdateForm && (
                                <motion.form 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    onSubmit={handleSubmit(handleUpdateSession)}
                                    className="w-full max-w-3xl mt-4 bg-bg-primary rounded-xl p-6 border border-border-color"
                                >
                                    <h4 className="text-accent-blue font-bold mb-6 text-lg tracking-wide border-b border-white/10 pb-2">Finalize Session Data</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Post-Dialysis Weight (kg)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" step="0.1" placeholder="e.g. 64.5"
                                                    className="w-full py-2.5 px-4 bg-bg-secondary border border-border-color rounded-xl text-text-primary outline-none focus:border-accent-blue"
                                                    {...register('postWeight')}
                                                />
                                            </div>
                                            {errors.postWeight && <p className="text-accent-red text-xs mt-1.5">{errors.postWeight.message}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Post Systolic</label>
                                                <input 
                                                    type="number" placeholder="Optional"
                                                    className="w-full py-2.5 px-4 bg-bg-secondary border border-border-color rounded-xl text-text-primary outline-none focus:border-accent-blue"
                                                    {...register('systolic')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Post Diastolic</label>
                                                <input 
                                                    type="number" placeholder="Optional"
                                                    className="w-full py-2.5 px-4 bg-bg-secondary border border-border-color rounded-xl text-text-primary outline-none focus:border-accent-blue"
                                                    {...register('diastolic')}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nursing Notes / Report</label>
                                            <textarea 
                                                rows="3" placeholder="Add observations here..."
                                                className="w-full py-2.5 px-4 bg-bg-secondary border border-border-color rounded-xl text-text-primary outline-none focus:border-accent-blue resize-none"
                                                {...register('notes')}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8">
                                        <button 
                                            type="button" onClick={() => setShowUpdateForm(false)}
                                            className="px-6 py-2 rounded-lg text-text-secondary hover:bg-white/5 transition-all text-sm font-semibold border border-transparent hover:border-border-color"
                                        >Cancel</button>
                                        <button 
                                            type="submit" disabled={isSubmitting}
                                            className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold tracking-wider hover:bg-green-500 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSubmitting && <Loader2 size={16} className="animate-spin"/>}
                                            SUBMIT & FINALIZE SESSION
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default SessionInfo;

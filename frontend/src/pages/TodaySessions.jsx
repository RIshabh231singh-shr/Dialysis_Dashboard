import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utility/axiosInstance';
import { Loader2, Calendar, Clock, User, Activity, ChevronRight, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const TodaySessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
    const navigate = useNavigate();

    const isToday = selectedDate === dayjs().format('YYYY-MM-DD');

    const fetchSessions = async (date) => {
        try {
            setLoading(true);
            let response;
            if (date === dayjs().format('YYYY-MM-DD')) {
                response = await api.get('/session/today');
            } else {
                response = await api.get(`/session/search/date?date=${date}`);
            }
            
            if (response.data.success) {
                setSessions(response.data.data);
                setFromCache(response.data.fromCache || false);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions(selectedDate);
    }, [selectedDate]);

    const handleResetToToday = () => {
        setSelectedDate(dayjs().format('YYYY-MM-DD'));
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'IN_PROGRESS':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const displayedSessions = showAnomaliesOnly 
        ? sessions.filter(s => s.anomalies && s.anomalies.length > 0) 
        : sessions;

    return (
        <div className="flex min-h-screen bg-bg-primary">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-accent-blue mb-2">
                                <Calendar size={18} />
                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    {isToday ? 'Daily Schedule' : 'Archived Schedule'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                                {isToday ? "Today's Sessions" : `Sessions on ${dayjs(selectedDate).format('MMMM D, YYYY')}`}
                            </h1>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-text-secondary">
                                    {isToday ? `Viewing all sessions for ${dayjs().format('MMMM D, YYYY')}` : `Total sessions: ${sessions.length}`}
                                </p>
                                {!isToday && (
                                    <button 
                                        onClick={handleResetToToday}
                                        className="text-accent-blue hover:text-white text-xs font-bold uppercase tracking-widest border-b border-accent-blue/30 hover:border-white transition-all ml-2"
                                    >
                                        Back to Today
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-end flex-wrap gap-4">
                            {/* Anomaly Filter Toggle */}
                            <button
                                onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-semibold h-10 ${
                                    showAnomaliesOnly 
                                    ? 'bg-accent-red/10 text-accent-red border-accent-red/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                                    : 'bg-bg-secondary text-text-secondary border-border-color hover:border-white/20'
                                }`}
                            >
                                <Filter size={16} />
                                {showAnomaliesOnly ? 'Showing Anomalies' : 'Show Anomalies'}
                            </button>

                            {/* Date Picker */}
                            <div className="flex items-center gap-3 bg-bg-secondary p-1.5 rounded-xl border border-border-color h-10 px-3">
                                <span className="text-xs font-bold text-text-secondary uppercase">Select:</span>
                                <input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-text-primary text-sm outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                            <p className="text-text-secondary font-medium">Fetching schedule...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedSessions.length > 0 ? (
                                displayedSessions.map((session, index) => (
                                    <motion.div
                                        key={session._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate(`/session/${session._id}`)}
                                        className={`group bg-bg-secondary border rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
                                            session.anomalies && session.anomalies.length > 0 
                                            ? 'border-accent-red/30 hover:border-accent-red' 
                                            : 'border-border-color hover:border-accent-blue/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6 flex-1">
                                            {/* Time Block */}
                                            <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-border-color pr-6">
                                                <div className="flex items-center gap-1.5 text-text-primary font-bold text-lg">
                                                    <Clock size={16} className="text-accent-blue" />
                                                    {session.startTime ? dayjs(session.startTime).format('HH:mm') : '--:--'}
                                                </div>
                                                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-1">Start Time</span>
                                            </div>

                                            {/* Patient Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-blue transition-colors flex items-center gap-2">
                                                        {session.patientId?.name || "Unknown Patient"}
                                                        {session.status === 'IN_PROGRESS' && (
                                                            <span className="flex h-2.5 w-2.5 relative">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-text-secondary">{session.patientId?.age} yrs • {session.patientId?.gender}</span>
                                                        <span className="w-1 h-1 rounded-full bg-border-color"></span>
                                                        <span className="text-xs font-bold text-accent-red uppercase">{session.patientId?.bloodGroup}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="ml-8 flex items-center gap-3">
                                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusStyles(session.status)}`}>
                                                    {session.status.replace('_', ' ')}
                                                </div>
                                            </div>
                                            
                                            {/* Anomalies Badge */}
                                            {session.anomalies && session.anomalies.length > 0 && (
                                                <div className="ml-6 flex items-center gap-1.5 bg-accent-red/10 border border-accent-red/20 px-3 py-1.5 rounded-lg">
                                                    <AlertTriangle size={14} className="text-accent-red" />
                                                    <span className="text-[11px] font-bold text-accent-red uppercase tracking-wider">
                                                        {session.anomalies.length} Flag(s)
                                                    </span>
                                                </div>
                                            )}

                                            {/* Unit Info */}
                                            <div className="ml-auto flex items-center gap-2 px-6">
                                                <Activity size={16} className="text-text-secondary" />
                                                <span className="text-sm font-medium text-text-secondary uppercase">{session.hospitalUnit}</span>
                                            </div>
                                        </div>

                                        <div className="text-border-color group-hover:text-accent-blue transition-colors px-2">
                                            <ChevronRight size={24} />
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-bg-secondary/30 rounded-3xl border border-dashed border-border-color">
                                    <Calendar size={48} className="mx-auto text-border-color mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-text-primary">
                                        {showAnomaliesOnly ? "No anomalies found" : "No sessions today"}
                                    </h3>
                                    <p className="text-text-secondary mt-2">
                                        {showAnomaliesOnly ? "There are no sessions with flagged anomalies on this date." : "There are no dialysis sessions scheduled for the current date."}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) }
                </div>
            </main>
        </div>
    );
};

export default TodaySessions;

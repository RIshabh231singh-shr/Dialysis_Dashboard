import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utility/axiosInstance';
import { Loader2, Search, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useSelector } from 'react-redux';

const PatientsList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalResults: 0
    });
    const navigate = useNavigate();
    
    // Poll global active sessions to render glowing dot
    const activeSessions = useSelector(state => state.session.activeSessions);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/patient/all', {
                params: {
                    page,
                    search,
                    limit: 10
                }
            });
            
            if (response.data.success) {
                setPatients(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPatients();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [search, page]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    const getStatusDetails = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return { text: 'Scheduled', classes: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' };
            case 'IN_PROGRESS':
                return { text: 'In Progress', classes: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' };
            case 'COMPLETED':
                return { text: 'Completed', classes: 'bg-green-500/10 text-green-500 border border-green-500/20' };
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-[1.875rem] font-bold text-text-primary leading-tight">Patients List</h1>
                            <p className="text-text-secondary text-sm">View and search through all registered patients.</p>
                        </div>
                        
                        <div className="relative w-[350px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search patients by name..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full py-3 pr-4 pl-10 bg-bg-secondary border border-border-color rounded-xl text-text-primary text-sm outline-none transition-colors duration-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50"
                            />
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
                            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                            <p className="text-text-secondary">Loading patients...</p>
                        </div>
                    ) : (
                        <>
                            {patients.length > 0 ? (
                                <div className="space-y-4 animate-fade-in">
                                    {patients.map((patient, index) => {
                                        const statusDetails = getStatusDetails(patient.sessionStatus);
                                        
                                        return (
                                            <motion.div 
                                                key={patient._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-bg-secondary border border-border-color rounded-xl p-5 flex items-center justify-between transition-all duration-300 hover:border-accent-blue/50 hover:shadow-lg hover:shadow-black/20 group"
                                            >
                                                {/* Left Side: Patient Info */}
                                                <div className="flex items-center gap-8">
                                                    <div className="w-[200px]">
                                                        <div className="flex items-center gap-2">
                                                            <h3 
                                                                className="text-base font-bold text-text-primary truncate cursor-pointer hover:text-accent-blue transition-colors duration-200"
                                                                onClick={() => navigate(`/patient/${patient._id}`)}
                                                            >
                                                                {patient.name}
                                                            </h3>
                                                            {!!activeSessions[patient._id] && (
                                                                <span className="flex h-2.5 w-2.5 relative" title="Session In Progress">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-text-secondary">{patient.age} years • {patient.gender}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 w-[120px]">
                                                        <span className="bg-accent-red/10 text-accent-red px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
                                                            {patient.bloodGroup}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 w-[150px]">
                                                        <span className="bg-text-secondary/10 text-text-secondary px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wider">
                                                            📍 {patient.hospitalUnit}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right Side: Status or Action */}
                                                <div>
                                                    {statusDetails ? (
                                                        <div className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide ${statusDetails.classes}`}>
                                                            {statusDetails.text}
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => navigate(`/add-session/${patient._id}`)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white border border-transparent transition-all duration-200 rounded-lg text-sm font-semibold group-hover:border-accent-blue/30"
                                                        >
                                                            <PlusCircle size={16} />
                                                            Add Session
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-bg-secondary/50 rounded-2xl border border-dashed border-border-color">
                                    <p className="text-text-secondary">No patients found matches your criteria.</p>
                                </div>
                            )}

                            <Pagination 
                                currentPage={page} 
                                totalPages={pagination.totalPages} 
                                onPageChange={(newPage) => setPage(newPage)} 
                            />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PatientsList;

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PatientCard = ({ patient }) => {
    const navigate = useNavigate();
    
    // Check if this patient has an active session in the global Redux store
    const hasActiveSession = useSelector(state => !!state.session.activeSessions[patient._id]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary border border-border-color rounded-2xl p-6 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:border-accent-blue hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)]"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-text-primary">{patient.name}</h3>
                        {hasActiveSession && (
                            <span className="flex h-3 w-3 relative" title="Session In Progress">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                            </span>
                        )}
                    </div>
                    <div className="text-[0.8125rem] text-text-secondary">
                        {patient.age} years • {patient.gender}
                    </div>
                </div>
                <div className="bg-accent-red/10 text-accent-red px-2.5 py-1 rounded-md text-xs font-bold">
                    {patient.bloodGroup}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-text-secondary uppercase tracking-wider mb-1">Hospital Unit</span>
                    <span className="text-sm font-medium text-text-primary">{patient.hospitalUnit}</span>
                </div>
                {/* Add more info items as needed */}
            </div>
            
            <div className="mt-5 pt-4 border-t border-border-color flex justify-end">
                <button 
                    onClick={() => navigate(`/patient/${patient._id}`)}
                    className="bg-accent-blue text-white px-4 py-2 rounded-lg text-[0.8125rem] font-semibold transition-colors duration-200 hover:bg-accent-blue-hover"
                >
                    View Details
                </button>
            </div>
        </motion.div>
    );
};

export default PatientCard;

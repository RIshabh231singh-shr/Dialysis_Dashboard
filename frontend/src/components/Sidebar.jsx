import { LayoutDashboard, Users, UserPlus, Settings, LogOut, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: UserPlus, label: 'Add Patient', path: '/add-patient' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-[260px] h-screen bg-bg-secondary border-r border-border-color flex flex-col p-6 sticky top-0"
        >
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-accent-blue p-2 rounded-lg flex items-center justify-center">
                    <Activity size={24} color="white" />
                </div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">DialysisCare</h1>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent bg-transparent text-text-secondary text-[0.95rem] font-medium cursor-pointer transition-all duration-200 text-left hover:bg-white/5 hover:text-text-primary ${
                                isActive ? '!bg-accent-blue/10 !text-accent-blue !border-accent-blue/20' : ''
                            }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-border-color">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-none bg-transparent text-text-secondary text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-accent-red/10 hover:text-accent-red">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;

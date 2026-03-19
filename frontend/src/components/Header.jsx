import { Search } from 'lucide-react';

const Header = ({ search, setSearch, hospitalUnit, setHospitalUnit }) => {
    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-[1.875rem] font-bold text-text-primary leading-tight">Overview</h1>
                <p className="text-text-secondary text-sm">Welcome back! Here's what's happening today.</p>
            </div>
            
            <div className="flex gap-4 items-center">
                <div className="relative w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search patients..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full py-2.5 pr-4 pl-10 bg-bg-secondary border border-border-color rounded-[10px] text-text-primary text-sm outline-none transition-colors duration-200 focus:border-accent-blue"
                    />
                </div>
                
                <select 
                    value={hospitalUnit}
                    onChange={(e) => setHospitalUnit(e.target.value)}
                    className="py-2.5 px-4 bg-bg-secondary border border-border-color rounded-[10px] text-text-primary text-sm outline-none cursor-pointer"
                >
                    <option value="">All Units</option>
                    <option value="UNIT A">Unit A</option>
                    <option value="UNIT B">Unit B</option>
                    <option value="UNIT C">Unit C</option>
                </select>
            </div>
        </header>
    );
};

export default Header;

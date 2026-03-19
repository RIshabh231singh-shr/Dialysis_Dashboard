import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PatientCard from '../components/PatientCard';
import Pagination from '../components/Pagination';
import api from '../utility/axiosInstance';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [hospitalUnit, setHospitalUnit] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalResults: 0
    });

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/patient/all', {
                params: {
                    page,
                    search,
                    hospitalUnit,
                    limit: 8
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
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [search, hospitalUnit, page]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setPage(1);
    }, [search, hospitalUnit]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <Header 
                    search={search} 
                    setSearch={setSearch} 
                    hospitalUnit={hospitalUnit} 
                    setHospitalUnit={setHospitalUnit} 
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
                        <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                        <p className="text-text-secondary">Loading patients...</p>
                    </div>
                ) : (
                    <>
                        {patients.length > 0 ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 animate-fade-in">
                                {patients.map((patient) => (
                                    <PatientCard key={patient._id} patient={patient} />
                                ))}
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
            </main>
        </div>
    );
};

export default Dashboard;

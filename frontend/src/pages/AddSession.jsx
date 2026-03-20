import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utility/axiosInstance';
import { Loader2, ArrowLeft, Activity, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

// Zod schema for Pre-Dialysis Form Validation
const sessionSchema = z.object({
    sessionDate: z.string().nonempty('Session Date is required'),
    hospitalUnit: z.string().nonempty('Hospital Unit is required'),
    dialysisMachineId: z.string().nonempty('Dialysis Machine ID is required'),
    preWeight: z.coerce.number().min(0, 'Weight must be non-negative'),
    systolic: z.coerce.number().min(50, 'Min 50').max(250, 'Max 250').optional().or(z.literal('')),
    diastolic: z.coerce.number().min(30, 'Min 30').max(150, 'Max 150').optional().or(z.literal(''))
});

const AddSession = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            sessionDate: new Date().toISOString().slice(0, 16), // Local datetime-local format
            hospitalUnit: '',
            dialysisMachineId: '',
            preWeight: '',
            systolic: '',
            diastolic: ''
        }
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await api.get(`/patient/${patientId}`);
                if (res.data.success) {
                    setPatient(res.data.data);
                    setValue('hospitalUnit', res.data.data.hospitalUnit);
                }
            } catch (err) {
                console.error('Failed to fetch patient details', err);
            } finally {
                setLoadingPatient(false);
            }
        };
        fetchPatient();
    }, [patientId, setValue]);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setServerError('');
            
            // Build backend payload
            const payload = {
                patientId,
                sessionDate: new Date(data.sessionDate).toISOString(),
                hospitalUnit: data.hospitalUnit.toUpperCase(),
                dialysisMachineId: data.dialysisMachineId,
                preWeight: Number(data.preWeight)
            };

            // Include BP only if provided
            if (data.systolic && data.diastolic) {
                payload.preBP = {
                    systolic: Number(data.systolic),
                    diastolic: Number(data.diastolic)
                };
            }

            const response = await api.post('/session/create', payload);

            if (response.data.success || response.status === 201) {
                // Navigate to the newly created session profile
                navigate(`/session/${response.data.data._id}`);
            }
        } catch (error) {
            console.error("Error creating session:", error);
            setServerError(error.response?.data?.message || 'Failed to create session. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full py-2.5 px-4 bg-bg-primary border border-border-color rounded-xl text-text-primary text-sm outline-none transition-colors duration-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50";
    const labelClasses = "block text-sm font-medium text-text-secondary mb-1.5";
    const errorClasses = "text-accent-red text-xs mt-1.5 font-medium";

    if (loadingPatient) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                    <p className="text-text-secondary">Loading patient environment...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <button 
                                onClick={() => navigate(`/patient/${patientId}`)}
                                className="flex items-center gap-2 text-text-secondary hover:text-accent-blue transition-colors text-sm mb-4 group"
                            >
                                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                                Back to Patient Profile
                            </button>
                            <h1 className="text-[1.875rem] font-bold text-text-primary leading-tight flex items-center gap-3">
                                Schedule Dialysis <Stethoscope className="text-accent-blue" size={28}/>
                            </h1>
                            <p className="text-text-secondary text-sm">Logging pre-dialysis metrics for <span className="text-text-primary font-bold">{patient?.name}</span></p>
                        </div>
                    </header>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg-secondary border border-border-color rounded-2xl p-8 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        
                        {serverError && (
                            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red text-sm font-medium">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Session Date/Time */}
                                <div>
                                    <label className={labelClasses}>Session Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className={inputClasses}
                                        {...register('sessionDate')}
                                    />
                                    {errors.sessionDate && <p className={errorClasses}>{errors.sessionDate.message}</p>}
                                </div>

                                {/* Machine ID */}
                                <div>
                                    <label className={labelClasses}>Dialysis Machine ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. MACH-001"
                                        className={inputClasses}
                                        {...register('dialysisMachineId')}
                                    />
                                    {errors.dialysisMachineId && <p className={errorClasses}>{errors.dialysisMachineId.message}</p>}
                                </div>

                                {/* Hospital Unit */}
                                <div>
                                    <label className={labelClasses}>Hospital Unit</label>
                                    <input 
                                        type="text" 
                                        placeholder="UNIT A"
                                        className={`${inputClasses} opacity-70 cursor-not-allowed`}
                                        readOnly
                                        {...register('hospitalUnit')}
                                    />
                                    <p className="text-xs text-text-secondary mt-1">Inherited from patient profile</p>
                                </div>

                                {/* Pre-Weight */}
                                <div>
                                    <label className={labelClasses}>Pre-Dialysis Weight (kg)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            placeholder="Enter pre-weight"
                                            className={inputClasses}
                                            {...register('preWeight')}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">kg</span>
                                    </div>
                                    {errors.preWeight && <p className={errorClasses}>{errors.preWeight.message}</p>}
                                </div>

                                {/* Pre-BP */}
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4 border-b border-border-color pb-2">
                                        <Activity size={18} className="text-accent-red"/>
                                        Pre-Dialysis Blood Pressure (Optional)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClasses}>Systolic (mmHg)</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 120"
                                                className={inputClasses}
                                                {...register('systolic')}
                                            />
                                            {errors.systolic && <p className={errorClasses}>{errors.systolic.message}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Diastolic (mmHg)</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 80"
                                                className={inputClasses}
                                                {...register('diastolic')}
                                            />
                                            {errors.diastolic && <p className={errorClasses}>{errors.diastolic.message}</p>}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="pt-6 border-t border-border-color flex justify-end gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/patient/${patientId}`)}
                                    className="px-6 py-2.5 rounded-xl border border-border-color text-text-secondary hover:bg-white/5 hover:text-text-primary font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blue-hover text-white font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        "Create Session & Proceed"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AddSession;

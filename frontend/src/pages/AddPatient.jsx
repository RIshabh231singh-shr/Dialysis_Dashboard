import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utility/axiosInstance';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const patientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    fatherName: z.string().min(2, "Father Name must be at least 2 characters").max(100, "Father Name cannot exceed 100 characters"),
    age: z.coerce.number().min(0, "Age cannot be negative").max(150, "Age seems unrealistic"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { required_error: "Gender is required" }),
    dryWeight: z.coerce.number().min(0, "Weight cannot be negative"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { required_error: "Blood Group is required" }),
    hospitalUnit: z.string().min(1, "Hospital Unit is required"),
});

const AddPatient = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: '',
            fatherName: '',
            age: '',
            gender: '',
            dryWeight: '',
            bloodGroup: '',
            hospitalUnit: '',
        }
    });

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setServerError('');
            // Format hospital unit to uppercase as required by model
            const payload = { ...data, hospitalUnit: data.hospitalUnit.toUpperCase() };
            
            const response = await api.post('/patient/create', payload);
            
            if (response.data.success || response.status === 201) {
                navigate('/');
            }
        } catch (error) {
            console.error("Error creating patient:", error);
            setServerError(error.response?.data?.message || 'Failed to add patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full py-2.5 px-4 bg-bg-primary border border-border-color rounded-xl text-text-primary text-sm outline-none transition-colors duration-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50";
    const labelClasses = "block text-sm font-medium text-text-secondary mb-1.5";
    const errorClasses = "text-accent-red text-xs mt-1.5 font-medium";

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <button 
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm mb-4"
                            >
                                <ArrowLeft size={16} />
                                Back to Dashboard
                            </button>
                            <h1 className="text-[1.875rem] font-bold text-text-primary leading-tight">Add New Patient</h1>
                            <p className="text-text-secondary text-sm">Enter the patient's details below to register them in the system.</p>
                        </div>
                    </header>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg-secondary border border-border-color rounded-2xl p-8 shadow-xl"
                    >
                        {serverError && (
                            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red text-sm font-medium">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div>
                                    <label className={labelClasses}>Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter patient's full name"
                                        className={inputClasses}
                                        {...register('name')}
                                    />
                                    {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
                                </div>

                                {/* Father Name Input */}
                                <div>
                                    <label className={labelClasses}>Father's Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter father's name"
                                        className={inputClasses}
                                        {...register('fatherName')}
                                    />
                                    {errors.fatherName && <p className={errorClasses}>{errors.fatherName.message}</p>}
                                </div>

                                {/* Age Input */}
                                <div>
                                    <label className={labelClasses}>Age (Years)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Enter age"
                                        className={inputClasses}
                                        {...register('age')}
                                    />
                                    {errors.age && <p className={errorClasses}>{errors.age.message}</p>}
                                </div>

                                {/* Gender Select */}
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <select 
                                        className={inputClasses}
                                        {...register('gender')}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    {errors.gender && <p className={errorClasses}>{errors.gender.message}</p>}
                                </div>

                                {/* Dry Weight Input */}
                                <div>
                                    <label className={labelClasses}>Dry Weight (kg)</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="Enter dry weight"
                                        className={inputClasses}
                                        {...register('dryWeight')}
                                    />
                                    {errors.dryWeight && <p className={errorClasses}>{errors.dryWeight.message}</p>}
                                </div>

                                {/* Blood Group Select */}
                                <div>
                                    <label className={labelClasses}>Blood Group</label>
                                    <select 
                                        className={inputClasses}
                                        {...register('bloodGroup')}
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                    {errors.bloodGroup && <p className={errorClasses}>{errors.bloodGroup.message}</p>}
                                </div>

                                {/* Hospital Unit Input */}
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Hospital Unit</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. UNIT A"
                                        className={inputClasses}
                                        {...register('hospitalUnit')}
                                    />
                                    {errors.hospitalUnit && <p className={errorClasses}>{errors.hospitalUnit.message}</p>}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border-color flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2.5 rounded-xl border border-border-color text-text-secondary hover:bg-white/5 hover:text-text-primary font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blue-hover text-white font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving Patient...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Add Patient
                                        </>
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

export default AddPatient;

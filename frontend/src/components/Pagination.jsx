import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="mt-12 flex justify-center gap-2">
            <button 
                className="w-10 h-10 bg-bg-secondary border border-border-color text-text-secondary rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:not-disabled:border-accent-blue hover:not-disabled:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft size={18} />
            </button>
            
            {pages.map((page) => (
                <button
                    key={page}
                    className={`w-10 h-10 bg-bg-secondary border border-border-color text-text-secondary rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:not-disabled:border-accent-blue hover:not-disabled:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentPage === page ? '!bg-accent-blue !text-white !border-accent-blue' : ''
                    }`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            
            <button 
                className="w-10 h-10 bg-bg-secondary border border-border-color text-text-secondary rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:not-disabled:border-accent-blue hover:not-disabled:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;

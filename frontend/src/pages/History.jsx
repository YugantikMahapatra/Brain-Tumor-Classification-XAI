import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Eye, Download, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch the user's prediction history from the backend
                const response = await api.get('/history/');
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const viewReport = (item, autoDownload = false) => {
        // Construct the full URL to the static file server using the api baseURL
        const staticUrl = `${api.defaults.baseURL}/${item.file_path}`;
        navigate('/prediction', { 
            state: { 
                filePath: item.file_path, 
                previewUrl: staticUrl,
                autoDownload: autoDownload
            } 
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <HistoryIcon className="mr-3 text-blue-500" size={32} />
                        Prediction History
                    </h1>
                    <p className="text-gray-500 mt-2">Review your past MRI analysis reports.</p>
                </div>
                
                <div className="mt-4 md:mt-0 relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search predictions..." 
                        className="w-full md:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300 transition-shadow shadow-sm"
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Diagnosis</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Confidence</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center">
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 w-1/3 rounded mb-4"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 rounded"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <HistoryIcon size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                            <p>No history found. Upload an MRI to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                history.map((item, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item.id} 
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        <td className="p-4 text-gray-700 dark:text-gray-300">
                                            {new Date(item.created_at).toLocaleDateString()}
                                            <span className="text-gray-400 text-xs ml-2">{new Date(item.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.prediction !== 'No Tumor' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                {item.prediction}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">
                                            {item.confidence}%
                                        </td>
                                        <td className="p-4 flex space-x-2">
                                            <button 
                                                onClick={() => viewReport(item, false)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => viewReport(item, true)}
                                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;

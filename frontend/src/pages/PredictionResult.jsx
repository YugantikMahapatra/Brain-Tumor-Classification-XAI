import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Download, AlertCircle, ChevronLeft } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

ChartJS.register(ArcElement, Tooltip, Legend);

// Professional Skeleton Loader for perceived performance
const SkeletonLoader = () => (
    <div className="animate-pulse space-y-8">
        <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-96"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-40"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
            </div>
            <div className="lg:col-span-7 space-y-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
            </div>
        </div>
    </div>
);

const PredictionResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const reportRef = useRef(null);
    const { width, height } = useWindowSize();
    // Retrieving the filepath passed from the Upload page
    const filePath = location.state?.filePath;
    const previewUrl = location.state?.previewUrl;
    
    // Prevent duplicate API calls caused by React Strict Mode double-rendering
    const requestedPathRef = useRef(null);

    useEffect(() => {
        if (!filePath) {
            navigate('/upload');
            return;
        }

        const fetchPrediction = async () => {
            // Check if we already requested a prediction for this exact file
            if (requestedPathRef.current === filePath) return;
            requestedPathRef.current = filePath;

            try {
                // Contacting the AI prediction endpoint built in Phase 5
                const response = await api.post('/predict/', { file_path: filePath });
                setResult(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to analyze the MRI scan.');
                setLoading(false);
                requestedPathRef.current = null; // reset on error so they can try again
            }
        };

        fetchPrediction();
    }, [filePath, navigate]);

    // Handle autoDownload from the History page
    const autoDownloadTriggered = useRef(false);
    useEffect(() => {
        if (result && location.state?.autoDownload && !autoDownloadTriggered.current) {
            autoDownloadTriggered.current = true;
            // Add a small delay to ensure chart animation is finished before taking screenshot
            setTimeout(() => {
                handleDownloadPDF();
            }, 1000);
        }
    }, [result, location.state]);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`NeuroAI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (error) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-red-500 h-full">
                <AlertCircle size={48} className="mb-4" />
                <h2 className="text-xl font-bold">{error}</h2>
                <button onClick={() => navigate('/upload')} className="mt-6 btn-primary">Try Again</button>
            </div>
        );
    }

    const chartData = result ? {
        labels: ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor'],
        datasets: [{
            data: [
                result.probabilities.glioma,
                result.probabilities.meningioma,
                result.probabilities.pituitary,
                result.probabilities.notumor
            ],
            backgroundColor: [
                'rgba(239, 68, 68, 0.8)', // Red
                'rgba(245, 158, 11, 0.8)', // Amber
                'rgba(59, 130, 246, 0.8)', // Blue
                'rgba(16, 185, 129, 0.8)'  // Emerald
            ],
            borderWidth: 0,
        }],
    } : null;

    return (
        <div className="max-w-6xl mx-auto">
            {result && result.prediction === 'No Tumor' && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={400}
                    gravity={0.15}
                />
            )}
            <button onClick={() => navigate('/upload')} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-6">
                <ChevronLeft size={20} className="mr-1" /> Back to Upload
            </button>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8">
                        <SkeletonLoader />
                    </motion.div>
                ) : (
                    <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8" ref={reportRef}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <Brain className="mr-3 text-blue-500" size={32} />
                                    Analysis Results
                                </h1>
                                <p className="text-gray-500 mt-2">Detailed AI breakdown for the uploaded MRI scan.</p>
                            </div>
                            <button 
                                onClick={handleDownloadPDF} 
                                disabled={isGeneratingPdf}
                                className={`btn-primary mt-4 md:mt-0 flex items-center shadow-blue-500/30 ${isGeneratingPdf ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                <Download size={18} className="mr-2" /> 
                                {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Images Section */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="glass-card p-4 rounded-2xl">
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Original MRI Scan</h3>
                                    <img src={previewUrl} alt="Original MRI" className="w-full h-auto rounded-xl shadow-inner border border-gray-100 dark:border-gray-700" />
                                </div>
                                <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                                        GradCAM Heatmap
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">AI Generated</span>
                                    </h3>
                                    <div className="relative">
                                        {result.gradcam ? (
                                            <img src={result.gradcam} alt="GradCAM Heatmap" className="w-full h-auto rounded-xl shadow-inner border border-gray-100 dark:border-gray-700" />
                                        ) : (
                                            <>
                                                <img src={previewUrl} alt="GradCAM Base" className="w-full h-auto rounded-xl shadow-inner border border-gray-100 dark:border-gray-700" />
                                                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/40 via-yellow-400/30 to-transparent mix-blend-overlay rounded-xl"></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Results Section */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Primary Verdict Card */}
                                <div className={`glass-card p-8 rounded-2xl border-l-4 ${result.prediction !== 'No Tumor' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'}`}>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Diagnosis</p>
                                    <div className="flex items-end justify-between">
                                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">{result.prediction}</h2>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence</p>
                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.confidence}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Probabilities Chart */}
                                <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between">
                                    <div className="w-full md:w-1/2 h-64 relative">
                                        <Doughnut data={chartData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
                                        {/* Inner Label */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-sm text-gray-500">Highest</span>
                                            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{result.prediction}</span>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 space-y-4 mt-6 md:mt-0 pl-0 md:pl-8">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Class Probabilities</h3>
                                        {Object.entries(result.probabilities).map(([key, val]) => (
                                            <div key={key} className="flex justify-between items-center">
                                                <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{key}</span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{val}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PredictionResult;

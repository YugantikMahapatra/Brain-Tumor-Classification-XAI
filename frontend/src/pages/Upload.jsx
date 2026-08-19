import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, FileImage, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setError(null);
        if (rejectedFiles.length > 0) {
            setError('Please upload a valid image file (PNG, JPG, JPEG)');
            return;
        }
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
        },
        maxFiles: 1,
        multiple: false
    });

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setUploadProgress(0);
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(10); 
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulated smooth progress bar since real uploads can be too fast on localhost
            const interval = setInterval(() => {
                setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
            }, 200);

            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            clearInterval(interval);
            setUploadProgress(100);
            
            setTimeout(() => {
                // Pass uploaded data to Prediction Result page (Phase 6 placeholder for now)
                navigate('/prediction', { state: { filePath: response.data.file_path, previewUrl: preview } });
            }, 800);
        } catch (err) {
            setError('Upload failed. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload MRI Scan</h1>
                <p className="text-gray-500 mt-2">Drag and drop the patient's MRI image to run AI analysis.</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 relative overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div 
                            key="dropzone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            {...getRootProps()} 
                            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
                                ${isDragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'}`}
                        >
                            <input {...getInputProps()} />
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                {isDragActive ? 'Drop the MRI scan here...' : 'Drag & drop an MRI scan here'}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">or click to browse from your computer</p>
                            <p className="text-xs text-gray-400 mt-4">Supported formats: JPEG, PNG</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col md:flex-row gap-8 items-center"
                        >
                            <div className="relative group w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                                <img src={preview} alt="MRI Preview" className="w-full h-auto object-cover max-h-[300px]" />
                                {!isUploading && (
                                    <button 
                                        onClick={clearFile}
                                        className="absolute top-3 right-3 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur transition-colors shadow-md"
                                        title="Remove Image"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1 w-full flex flex-col justify-center">
                                <div className="flex items-center space-x-3 mb-6">
                                    <FileImage className="text-blue-500" size={28} />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{file.name}</h3>
                                        <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>

                                {isUploading ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-gray-700 dark:text-gray-300">Uploading & Analyzing...</span>
                                            <span className="text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={handleUpload} className="btn-primary w-full py-3 flex items-center justify-center">
                                        <UploadCloud className="mr-2" size={20} />
                                        Upload and Analyze
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center shadow-sm"
                >
                    <AlertCircle className="mr-3" size={20} />
                    <p className="font-medium">{error}</p>
                </motion.div>
            )}
        </div>
    );
};

export default Upload;

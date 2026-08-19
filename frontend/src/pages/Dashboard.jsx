import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Image as ImageIcon } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-card p-6 flex items-center space-x-4 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-300 cursor-default group"
    >
        <div className={`p-4 rounded-2xl ${colorClass}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/predict/history');
                setHistory(response.data.history || []);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Calculate real stats
    const totalScans = history.length;
    const avgConfidence = totalScans > 0 
        ? (history.reduce((acc, curr) => acc + curr.confidence, 0) / totalScans).toFixed(1) 
        : 0;
    
    // Group by day for the chart (just a simple mapping of last 7 days for now)
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Scans Analyzed',
                // Mocking the distribution since all real scans might be today
                data: [0, 0, 0, 0, 0, 0, totalScans], 
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' }, suggestedMax: Math.max(5, totalScans) },
            x: { grid: { display: false } }
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total MRI Scans" 
                    value={totalScans.toLocaleString()} 
                    subtitle="Lifetime scans analyzed" 
                    icon={ImageIcon} 
                    colorClass="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30 shadow-lg"
                    delay={0.1}
                />
                <StatCard 
                    title="Recent Predictions" 
                    value={totalScans} 
                    subtitle="This week" 
                    icon={Activity} 
                    colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/30 shadow-lg"
                    delay={0.2}
                />
                <StatCard 
                    title="Avg Confidence Score" 
                    value={`${avgConfidence}%`} 
                    subtitle="Overall model accuracy" 
                    icon={Brain} 
                    colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30 shadow-lg"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-card p-6 lg:col-span-2 h-96 flex flex-col hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300"
                >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Analysis Activity</h3>
                    <div className="flex-1 w-full relative">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="glass-card p-6 flex flex-col h-96 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300"
                >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Findings</h3>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                        {loading ? (
                            <p className="text-sm text-gray-500 text-center mt-4">Loading history...</p>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center mt-4">No scans analyzed yet.</p>
                        ) : (
                            history.slice(0, 10).map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-default">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.prediction}</p>
                                        <p className="text-xs text-gray-500">{formatTime(item.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.confidence}%</p>
                                        <div className={`h-1.5 w-12 rounded-full mt-1 ${item.prediction === 'No Tumor' || item.prediction === 'Notumor' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;

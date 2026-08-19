import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Target } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total_users: 0, total_scans: 0, positive_rate: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users')
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setError("Access Denied. You do not have administrator privileges.");
                } else {
                    setError("Failed to load admin dashboard.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <Shield size={64} className="text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
                <p className="text-gray-500 mt-2 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
                <Shield className="text-indigo-500 mr-3" size={32} />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Control Panel</h1>
                    <p className="text-gray-500">System overview and platform user management.</p>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    </div>
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 flex items-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-100 dark:border-indigo-900/30">
                            <div className="p-4 bg-indigo-500 rounded-2xl text-white mr-4 shadow-lg shadow-indigo-500/30">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Registered Users</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_users}</h3>
                            </div>
                        </div>
                        <div className="glass-card p-6 flex items-center bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-100 dark:border-blue-900/30">
                            <div className="p-4 bg-blue-500 rounded-2xl text-white mr-4 shadow-lg shadow-blue-500/30">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scans Processed</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_scans}</h3>
                            </div>
                        </div>
                        <div className="glass-card p-6 flex items-center bg-gradient-to-br from-rose-500/5 to-orange-500/5 border border-rose-100 dark:border-rose-900/30">
                            <div className="p-4 bg-rose-500 rounded-2xl text-white mr-4 shadow-lg shadow-rose-500/30">
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Anomaly Detection Rate</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.positive_rate}%</h3>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Users</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/30">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User ID</th>
                                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email Address</th>
                                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Role Level</th>
                                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Account Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}
                                            key={user.id} 
                                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-sm">#{user.id}</td>
                                            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_admin ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'}`}>
                                                    {user.is_admin ? 'Administrator' : 'Standard User'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center text-emerald-500 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Active
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;

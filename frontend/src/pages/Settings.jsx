import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Moon, Sun, Save, CheckCircle } from 'lucide-react';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [saved, setSaved] = useState(false);
    
    // UI state for mockup settings
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                <p className="text-gray-500 mt-2">Manage your preferences and platform configuration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1 space-y-6">
                    <div className="glass-card p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate w-full">{user?.email || 'Doctor User'}</h3>
                        <p className="text-sm text-blue-500 font-medium mt-1">Medical Staff</p>
                    </div>

                    <div className="glass-card p-4 space-y-2">
                        <button className="w-full flex items-center p-3 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                            <User size={18} className="mr-3" /> Profile Details
                        </button>
                        <button className="w-full flex items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                            <Shield size={18} className="mr-3" /> Security
                        </button>
                        <button className="w-full flex items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                            <Bell size={18} className="mr-3" /> Notifications
                        </button>
                    </div>
                </motion.div>

                {/* Settings Form */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 glass-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">General Preferences</h3>
                    
                    <div className="space-y-6">
                        {/* Theme Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Interface Theme</label>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => toggleTheme('light')}
                                    className={`flex items-center px-4 py-2 rounded-xl border ${theme === 'light' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-all`}
                                >
                                    <Sun size={18} className="mr-2" /> Light Mode
                                </button>
                                <button 
                                    onClick={() => toggleTheme('dark')}
                                    className={`flex items-center px-4 py-2 rounded-xl border ${theme === 'dark' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-all`}
                                >
                                    <Moon size={18} className="mr-2" /> Dark Mode
                                </button>
                            </div>
                        </div>

                        {/* Email Alerts */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</h4>
                                <p className="text-sm text-gray-500">Receive alerts when new scans are uploaded by your team.</p>
                            </div>
                            <button 
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'transform translate-x-6' : ''}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        {saved ? (
                            <span className="flex items-center text-emerald-500 font-medium">
                                <CheckCircle size={18} className="mr-2" /> Settings Saved!
                            </span>
                        ) : <span></span>}
                        <button onClick={handleSave} className="btn-primary flex items-center">
                            <Save size={18} className="mr-2" /> Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;

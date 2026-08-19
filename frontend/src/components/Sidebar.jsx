import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UploadCloud, History, Settings, ChevronLeft, Menu, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
        { name: 'Upload MRI', icon: <UploadCloud size={20} />, path: '/upload' },
        { name: 'History', icon: <History size={20} />, path: '/history' },
        { name: 'Admin Panel', icon: <Shield size={20} />, path: '/admin' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <motion.div 
            animate={{ width: isCollapsed ? 80 : 250 }}
            className="h-screen bg-white dark:bg-healthcare-surface border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 relative z-20"
        >
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 h-16">
                {!isCollapsed && <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 truncate">NeuroAI</span>}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 focus:outline-none ml-auto"
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'}`
                        }
                    >
                        <div className="flex-shrink-0">{item.icon}</div>
                        {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>
        </motion.div>
    );
};

export default Sidebar;

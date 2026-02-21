import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Icons } from './Icons';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold text-slate-900 lg:hidden">TiewTrip.</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
            >
               <Icons.Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* User Profile */}
            <div 
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/profile')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Pro Traveler</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
                <img src={user?.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
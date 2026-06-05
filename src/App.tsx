import React, { useState, useEffect } from 'react';
import { User, Notification } from './types';
import HeroLogin from './components/HeroLogin';
import CandidateWorkspace from './components/CandidateWorkspace';
import RecruiterWorkspace from './components/RecruiterWorkspace';
import AdminAnalytics from './components/AdminAnalytics';
import CompanySettings from './components/CompanySettings';
import NotificationCenter from './components/NotificationCenter';
import { Shield, Sparkles, LogOut, Bell, Building, BarChart3, Briefcase, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<'jobs' | 'analytics' | 'companies' | 'notifications'>('jobs');
  
  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Status Banners
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Auto-Login session pull on boot
  useEffect(() => {
    const savedToken = localStorage.getItem('rec_jwt_token');
    if (savedToken) {
      setLoading(true);
      fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('rec_jwt_token');
          throw new Error('Stored session expired.');
        }
        return res.json();
      })
      .then(data => {
        setCurrentUser(data.user);
        setToken(savedToken);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Poll for notifications in active loops
  const syncNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Notifications sync warning: ", e);
    }
  };

  useEffect(() => {
    if (token) {
      syncNotifications();
      // Auto-poll to simulate real-time interactions
      const interval = setInterval(syncNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleLoginSuccess = (user: User, jwtToken: string) => {
    setCurrentUser(user);
    setToken(jwtToken);
    localStorage.setItem('rec_jwt_token', jwtToken);
    setActiveWorkspace('jobs');
    setErrorMsg('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('rec_jwt_token');
    setNotifications([]);
    setShowNotifications(false);
    setSuccessMsg('Session securely terminated. Return soon!');
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        syncNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper toast timers
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5500);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 5500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="space-y-4 text-center">
          <Sparkles className="w-10 h-10 animate-pulse text-zinc-900 mx-auto" />
          <h2 className="font-extrabold text-sm tracking-widest uppercase text-zinc-900">Booting Recruitment Registry...</h2>
          <p className="text-xs text-zinc-400 font-medium font-mono">Synchronizing core database state layers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between font-sans antialiased">
      
      {/* Top Banner Message Console */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            id="error_banner"
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -45 }}
            className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 bg-red-950 text-red-100 border border-red-800/50 p-4 rounded-xl shadow-lg text-xs font-semibold leading-normal capitalize"
          >
            ❌ Error Notification: {errorMsg}
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            id="success_banner"
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -45 }}
            className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 bg-zinc-950 text-white border border-zinc-800 p-4 rounded-xl shadow-lg text-xs font-semibold leading-normal"
          >
            ✔️ Action Verified: {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-grow">
        
        {/* Navigation & Header Brand */}
        <header className="flex justify-between items-center border-b border-zinc-100 pb-4 flex-wrap gap-4">
          
          <div id="brand_title" className="flex items-center gap-2 cursor-pointer">
            <Shield className="w-6 h-6 text-zinc-950" />
            <div>
              <span className="font-black text-lg tracking-tight text-zinc-950">Recruitment Central</span>
              <p className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-widest">Enterprise Talent Pipeline</p>
            </div>
          </div>

          {/* Session Header State */}
          {currentUser ? (
            <div id="session_hub" className="flex items-center gap-3 text-xs font-semibold">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-zinc-900 block leading-none">{currentUser.name}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                  Role: {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              {/* Notification bells */}
              <div className="relative">
                <button
                  id="header_notif_bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 border border-zinc-200 hover:bg-zinc-100 rounded-xl cursor-pointer relative"
                >
                  <Bell className="w-4 h-4 text-zinc-700" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                  )}
                </button>

                {/* Sliding panel widget portal */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 z-50">
                    <NotificationCenter
                      notifications={notifications}
                      onMarkAllRead={handleMarkAllRead}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                )}
              </div>

              {/* Logout key */}
              <button
                id="header_logout_btn"
                onClick={handleLogout}
                className="p-2 border border-zinc-200 text-zinc-700 hover:text-red-700 hover:border-red-100 hover:bg-red-50 rounded-xl cursor-pointer"
                title="Logout Workspace"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-[10px] text-zinc-400 font-bold font-mono tracking-wider">
              ESTABLISHED SYSTEM LOOP OK
            </div>
          )}

        </header>

        {currentUser ? (
          /* Main Workspace Container (Authenticated layout) */
          <div id="system_dashboard_enclosure" className="space-y-6">
            
            {/* Horizontal Workspace Selector Tabs */}
            <div className="flex border-b border-zinc-200 pb-1 flex-wrap gap-2 text-xs font-bold font-sans">
              
              <button
                id="tab_ws_jobs"
                onClick={() => { setActiveWorkspace('jobs'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeWorkspace === 'jobs' ? 'bg-zinc-900 text-white font-extrabold' : 'text-zinc-650 hover:bg-zinc-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Vacancies Catalog
              </button>

              {/* Visible to Sourcing staff */}
              {currentUser.role !== 'candidate' && (
                <>
                  <button
                    id="tab_ws_analytics"
                    onClick={() => { setActiveWorkspace('analytics'); }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                      activeWorkspace === 'analytics' ? 'bg-zinc-900 text-white font-extrabold' : 'text-zinc-650 hover:bg-zinc-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Hiring Analytics
                  </button>

                  <button
                    id="tab_ws_companies"
                    onClick={() => { setActiveWorkspace('companies'); }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                      activeWorkspace === 'companies' ? 'bg-zinc-900 text-white font-extrabold' : 'text-zinc-650 hover:bg-zinc-100'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Employer Ecosystem
                  </button>
                </>
              )}
            </div>

            {/* Routed Screens based on Navigation Tab */}
            <div id="ws_active_viewport" className="min-h-[500px]">
              
              {activeWorkspace === 'jobs' && (
                currentUser.role === 'candidate' ? (
                  <CandidateWorkspace token={token} currentUser={currentUser} />
                ) : (
                  <RecruiterWorkspace token={token} currentUser={currentUser} />
                )
              )}

              {activeWorkspace === 'analytics' && currentUser.role !== 'candidate' && (
                <AdminAnalytics token={token} />
              )}

              {activeWorkspace === 'companies' && currentUser.role !== 'candidate' && (
                <CompanySettings token={token} currentUser={currentUser} />
              )}

            </div>

          </div>
        ) : (
          /* User is not authenticated: render HeroOnboarding Portal */
          <HeroLogin
            onLoginSuccess={handleLoginSuccess}
            setError={setErrorMsg}
            setSuccess={setSuccessMsg}
          />
        )}

      </div>

      {/* Humble Footer, respect Anti-AI-slop and brand parameters */}
      <footer className="border-t border-zinc-100 py-6 text-center text-[11px] font-medium text-zinc-400 select-none bg-zinc-50/50 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Enterprise Recruitment Workspace. Security hash validated.</span>
          <div className="flex gap-4 font-semibold text-zinc-500">
            <span>Sourcing SLAs</span>
            <span>Gemini LLM OCR Service active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

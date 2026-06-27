import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Compass, FileText, MessageSquare, User, Menu, Users, Bell, Sun, Moon } from 'lucide-react';
import FlatButton from '../ui/FlatButton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Topbar = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState(null);
  const [activeBanners, setActiveBanners] = useState([]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Only trigger banners if seenNotificationIds is already initialized
        if (seenNotificationIds !== null) {
          const newNotifs = data.filter(n => !seenNotificationIds.includes(n.id) && !n.is_read);
          if (newNotifs.length > 0) {
            newNotifs.forEach(notif => {
              triggerBanner(notif);
            });
          }
        }
        
        setSeenNotificationIds(data.map(n => n.id));
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const triggerBanner = (notif) => {
    const bannerId = notif.id;
    setActiveBanners(prev => {
      const updated = [...prev];
      if (updated.length >= 5) {
        updated.shift(); // remove oldest banner if we exceed 5
      }
      if (updated.some(b => b.id === bannerId)) return prev;
      return [...updated, { id: bannerId, title: notif.title, message: notif.message }];
    });

    // Automatically remove after 3 seconds
    setTimeout(() => {
      setActiveBanners(prev => prev.filter(b => b.id !== bannerId));
    }, 3000);
  };

  const closeBanner = (bannerId) => {
    setActiveBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  useEffect(() => {
    if (token && user) {
      setSeenNotificationIds(null);
      setActiveBanners([]);
      fetchNotifications();
      // Poll every 3 seconds to keep notifications extremely live
      const interval = setInterval(fetchNotifications, 3000);
      return () => clearInterval(interval);
    } else {
      setSeenNotificationIds(null);
      setActiveBanners([]);
    }
  }, [token, user]);

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNavItems = () => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }];
    }
    if (user.role === 'INTERVIEWER') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Candidates', path: '/explorer', icon: Users } // reusing explorer as candidates
      ];
    }
    // Default student view
    return [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Explore', path: '/explorer', icon: Compass },
      { name: 'Jobs', path: '/jobs', icon: Briefcase },
      { name: 'Resume', path: '/resume', icon: FileText },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md transition-colors duration-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Career<span className="text-[#0ea5e9]">Connect</span>
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#0ea5e9] ${
                  isActive ? 'text-[#0ea5e9]' : 'text-slate-600 dark:text-slate-400'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl shadow-slate-200 dark:shadow-black/50 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications ({unreadCount})</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-[#0ea5e9] hover:underline">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.is_read && markAsRead(notif.id)}
                          className={`p-3 rounded-lg mb-1 transition-all cursor-pointer ${
                            notif.is_read 
                              ? 'opacity-50 hover:opacity-75 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50' 
                              : 'bg-blue-50 hover:bg-blue-100 dark:bg-white/5 dark:hover:bg-white/10 border-l-2 border-[#0ea5e9]'
                          }`}
                        >
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                <User size={16} className="text-slate-500 dark:text-slate-400" />
              </div>
              <FlatButton variant="outline" onClick={() => { logout(); navigate('/'); }} className="text-sm py-1.5 px-5 bg-red-50 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 rounded-lg">Logout</FlatButton>
            </div>
          ) : (
            <FlatButton variant="primary" onClick={() => navigate('/auth')} className="text-sm py-1.5 px-5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg shadow-lg shadow-blue-500/20">Sign In / Join</FlatButton>
          )}
        </div>

        <button className="md:hidden text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Floating Notification Banners on the Right */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full no-print pointer-events-none">
        {activeBanners.map(banner => (
          <div 
            key={banner.id} 
            className="pointer-events-auto bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200 dark:border-white/10 hover:border-[#0ea5e9]/30 text-slate-900 dark:text-white p-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 flex items-start gap-3 relative overflow-hidden"
            style={{
              animation: 'slideIn 0.3s ease-out forwards'
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0ea5e9] to-[#8b5cf6]"></div>
            <div className="flex-shrink-0 mt-0.5 p-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#0ea5e9]">
              <Bell size={14} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{banner.title}</h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">{banner.message}</p>
            </div>
            <button 
              onClick={() => closeBanner(banner.id)} 
              className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-lg font-bold leading-none p-0.5"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
};

export default Topbar;

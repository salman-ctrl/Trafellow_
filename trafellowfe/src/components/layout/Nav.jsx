"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getImageUrl } from "@/lib/utils";
import { MessageCircle as ChatIcon } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  // Determine active menu based on pathname
  const getActiveMenu = () => {
    if (pathname === '/dashboard') return 'beranda';
    if (pathname?.startsWith('/destinations')) return 'jelajah';
    if (pathname?.startsWith('/events')) return 'event';
    if (pathname?.startsWith('/friends')) return 'komunitas';
    if (pathname?.startsWith('/messages')) return 'messages';
    return '';
  };

  const activeMenu = getActiveMenu();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Listen for new message notifications
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('new_dm_notification', (data) => {
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        socket.off('new_dm_notification');
      };
    }
  }, [socket, isConnected]);

  // Reset unread count when user opens messages page
  useEffect(() => {
    if (pathname?.includes('/messages')) {
      setUnreadCount(0);
    }
  }, [pathname]);

  const handleNavigation = (path) => {
    if (path === '/messages') {
      setUnreadCount(0);
    }
    setShowDropdown(false);
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleNavigation('/dashboard')}
          >
            <img src="/icon/trafellow.png" className="h-16 w-auto" alt="Trafellow" />
            <h1 className="text-2xl font-bold text-blue-600">Trafellow</h1>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { name: "Beranda", path: "/dashboard", key: "beranda" },
              { name: "Jelajah", path: "/destinations", key: "jelajah" },
              { name: "Event", path: "/events", key: "event" },
              { name: "Teman", path: "/friends", key: "komunitas" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 text-base font-medium transition-all duration-200 rounded-lg relative ${
                  activeMenu === item.key
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {item.name}
                {activeMenu === item.key && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Messages Icon with Badge */}
                <button
                  onClick={() => handleNavigation('/messages')}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Messages"
                >
                  <ChatIcon className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <img
                      src={getImageUrl(user?.profile_picture)}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20">
                        <button
                          onClick={() => handleNavigation('/profile')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          Profile Saya
                        </button>
                        <button
                          onClick={() => handleNavigation('/events/my-events')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          Event Saya
                        </button>
                        <button
                          onClick={() => handleNavigation('/messages')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center justify-between"
                        >
                          <span>Pesan</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
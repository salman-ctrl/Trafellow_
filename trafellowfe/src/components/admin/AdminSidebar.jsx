"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Users, MapPin, FolderTree, 
  MapPinned, Calendar, LogOut, Shield 
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: LayoutDashboard,
      color: 'text-blue-500'
    },
    { 
      name: 'Users', 
      path: '/admin/users', 
      icon: Users,
      color: 'text-blue-500'
    },
    { 
      name: 'Regions', 
      path: '/admin/regions', 
      icon: MapPin,
      color: 'text-blue-500'
    },
    { 
      name: 'Categories', 
      path: '/admin/categories', 
      icon: FolderTree,
      color: 'text-blue-500'
    },
    { 
      name: 'Destinations', 
      path: '/admin/destinations', 
      icon: MapPinned,
      color: 'text-blue-500'
    },
    { 
      name: 'Events', 
      path: '/admin/events', 
      icon: Calendar,
      color: 'text-blue-500'
    },
  ];

  const handleBackToSite = () => {
    router.push('/dashboard');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-blue-500 text-white shadow-2xl z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <Shield className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Trafellow</h1>
            <p className="text-xs text-purple-200">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/20 bg-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-purple-200">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-500 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-white/20 space-y-2">
        <button
          onClick={handleBackToSite}
          className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center mb-2 space-x-2"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Back to Site</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
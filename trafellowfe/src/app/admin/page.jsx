"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import StatCard from '@/components/admin/StatCard';
import { Users, MapPin, MapPinned, Calendar, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-16 mb-4">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back to Trafellow Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.stats.users || 0}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Regions"
          value={stats?.stats.regions || 0}
          icon={MapPin}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Total Destinations"
          value={stats?.stats.destinations || 0}
          icon={MapPinned}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Total Events"
          value={stats?.stats.events || 0}
          icon={Calendar}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            User Registrations (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {stats?.charts.userRegistrations.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('id-ID', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.count / Math.max(...stats.charts.userRegistrations.map(i => i.count))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events by Region */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Events by Region</h3>
          <div className="space-y-3">
            {stats?.charts.eventsByRegion.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-semibold text-gray-800 bg-purple-100 px-3 py-1 rounded-full">
                  {item.count} events
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Users */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Latest Users</h3>
          <div className="space-y-3">
            {stats?.activities.latestUsers.map((user) => (
              <div key={user.user_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Events */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Latest Events</h3>
          <div className="space-y-3">
            {stats?.activities.latestEvents.map((event) => (
              <div key={event.event_id} className="p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-800 text-sm mb-1">{event.title}</p>
                <p className="text-xs text-gray-500">by {event.creator_name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Destinations */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Latest Destinations</h3>
          <div className="space-y-3">
            {stats?.activities.latestDestinations.map((dest) => (
              <div key={dest.destination_id} className="p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-800 text-sm mb-1">{dest.name}</p>
                <p className="text-xs text-gray-500">{dest.region_name}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
      {/* Top Destinations */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Most Viewed Destinations</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Views</th>
          </tr>
        </thead>
        <tbody>
          {stats?.charts.topDestinations.map((dest, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-4 font-semibold text-gray-800">{dest.name}</td>
              <td className="py-3 px-4 text-gray-600">{dest.region_name}</td>
              <td className="py-3 px-4 text-right">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  {dest.view_count}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
);
}
// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaWallet, 
  FaHistory, 
  FaBell,
  FaQrcode,
  FaTasks,
  FaCog,
  FaPlayCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingPayments: 0,
    todayQuizCompletions: 0,
    activePlans: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/dashboard/stats`),
        axios.get(`${API_BASE_URL}/api/dashboard/recent-activities`)
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      
      if (activitiesRes.data.success) {
        setRecentActivities(activitiesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "User Management",
      description: "Manage all users and their accounts",
      icon: <FaUsers className="text-lg" />,
      path: "/user-table",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Payment Approvals",
      description: "Approve wallet top-up requests",
      icon: <FaMoneyBillWave className="text-lg" />,
      path: "/payment",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Withdrawal Requests",
      description: "Process user withdrawal requests",
      icon: <FaWallet className="text-lg" />,
      path: "/withdrawal",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Quiz Management",
      description: "Create and manage daily quizzes",
      icon: <FaTasks className="text-lg" />,
      path: "/quiz_table",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "UPI & QR Setup",
      description: "Configure payment methods",
      icon: <FaQrcode className="text-lg" />,
      path: "/upi-scanner",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Notifications",
      description: "Send notifications to users",
      icon: <FaBell className="text-lg" />,
      path: "/notifications",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Cron Jobs",
      description: "Manual system tasks and maintenance",
      icon: <FaPlayCircle className="text-lg" />,
      path: "/admin/cron-jobs",
      color: "from-orange-500 to-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 pb-2">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-green-400 text-sm mt-1">System Administration Panel</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="space-y-6">
          {/* Stats Cards - Only Total Users and Total Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<FaUsers className="text-blue-400" />}
              color="blue"
            />
            <StatCard 
              title="Total Revenue" 
              value={`$${stats.totalRevenue}`} 
              icon={<FaMoneyBillWave className="text-green-400" />}
              color="green"
            />
          </div>

          {/* Quick Actions */} 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard 
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={() => navigate(action.path)}
                bgColor={action.color}
                isAdmin={action.title === "Cron Jobs"}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-3">Recent Activity</h2>
            <div className="max-h-60 overflow-y-auto">
              {recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <div className="p-1.5 bg-gray-600 rounded-full">
                        <FaHistory className="text-gray-300 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{activity.description}</p>
                        <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                        activity.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                        activity.type === 'withdrawal' ? 'bg-yellow-500/20 text-yellow-400' :
                        activity.type === 'registration' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-6">
                  <FaHistory className="text-2xl mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                  <p className="text-xs mt-1">User registrations, payments, withdrawals will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component - Compact
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'border-blue-500/30 hover:border-blue-500/60',
    green: 'border-green-500/30 hover:border-green-500/60', 
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border ${colorClasses[color]} hover:scale-102 transition-all duration-200 cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs mb-1">{title}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
        <div className="p-2 bg-gray-700 rounded-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component - Compact (Updated)
const QuickActionCard = ({ title, description, icon, onClick, bgColor, isAdmin }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-r ${bgColor} rounded-lg p-4 cursor-pointer hover:scale-102 transition-all duration-200 shadow border border-gray-700 hover:shadow-md relative ${
        isAdmin ? 'ring-2 ring-orange-400 ring-opacity-50' : ''
      }`}
    >
      {isAdmin && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          SYSTEM
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-md text-white">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-base truncate">{title}</h3>
          <p className="text-white/80 text-xs mt-0.5 truncate">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
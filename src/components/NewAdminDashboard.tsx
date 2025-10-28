import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plane,
  BookOpen,
  LogOut,
  BarChart3,
  DollarSign,
  Settings as SettingsIcon,
  CreditCard,
  Globe,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import UserManagement from './UserManagement';
import FlightManagement from './FlightManagement';
import BookingManagement from './BookingManagement';
import PaymentManagement from './PaymentManagement';
import AdminSettings from './AdminSettings';

type Tab = 'overview' | 'users' | 'flights' | 'bookings' | 'payments' | 'settings';

const NewAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlights: 0,
    totalBookings: 0,
    revenueUSD: 0,
    revenueNPR: 0,
  });
  const [exchangeRate, setExchangeRate] = useState(132.5);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState<any[]>([]);
  const { admin, logout } = useAdmin();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    loadStats();
    loadChartData();
  }, [admin, navigate]);

  const loadStats = async () => {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('usd_to_npr_rate')
      .maybeSingle();

    const rate = settings?.usd_to_npr_rate || 132.5;
    setExchangeRate(rate);

    const [usersRes, flightsRes, bookingsRes, paymentsRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('flights').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount_usd, amount_npr').eq('status', 'completed'),
    ]);

    const revenueUSD = paymentsRes.data?.reduce((sum: number, p: any) => sum + Number(p.amount_usd || 0), 0) || 0;
    const revenueNPR = paymentsRes.data?.reduce((sum: number, p: any) => sum + Number(p.amount_npr || 0), 0) || 0;

    setStats({
      totalUsers: usersRes.count || 0,
      totalFlights: flightsRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      revenueUSD,
      revenueNPR,
    });
  };

  const loadChartData = async () => {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('booking_date, total_amount, status')
      .order('booking_date', { ascending: true });

    if (bookings) {
      const monthlyData: Record<string, number> = {};
      bookings.forEach((booking: any) => {
        const month = new Date(booking.booking_date).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        monthlyData[month] = (monthlyData[month] || 0) + Number(booking.total_amount);
      });

      const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue: Number(revenue.toFixed(2)),
      }));

      setMonthlyRevenue(chartData.slice(-6));

      const statusCounts = bookings.reduce((acc: any, booking: any) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }));

      setBookingStats(statusData);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
              <p className="text-sm text-gray-600">
                {language === 'en' ? 'Welcome back, ' : 'स्वागत छ, '}
                {admin?.full_name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="h-5 w-5 mr-2" />
                {language === 'en' ? 'नेपाली' : 'English'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                {t('admin.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex space-x-2 mb-8 bg-white p-2 rounded-lg shadow overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            {t('admin.overview')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            {t('admin.users')}
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'flights' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plane className="h-5 w-5 mr-2" />
            {t('admin.flights')}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            {t('admin.bookings')}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {t('admin.payments')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="h-5 w-5 mr-2" />
            {t('admin.settings')}
          </button>
        </nav>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{t('stats.totalUsers')}</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Plane className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{t('stats.totalFlights')}</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFlights}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{t('stats.totalBookings')}</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{t('stats.totalRevenue')}</h3>
                <p className="text-2xl font-bold text-gray-900">${stats.revenueUSD.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  रू {stats.revenueNPR.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Monthly Revenue Trend' : 'मासिक राजस्व प्रवृत्ति'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Booking Status Distribution' : 'बुकिङ स्थिति वितरण'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookingStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Revenue by Month (USD)' : 'मासिक राजस्व (अमेरिकी डलर)'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'flights' && <FlightManagement />}
        {activeTab === 'bookings' && <BookingManagement />}
        {activeTab === 'payments' && <PaymentManagement />}
        {activeTab === 'settings' && <AdminSettings onUpdate={loadStats} />}
      </div>
    </div>
  );
};

export default NewAdminDashboard;

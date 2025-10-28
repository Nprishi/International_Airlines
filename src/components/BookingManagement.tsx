import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingData {
  id: string;
  user_id: string;
  flight_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  seat_number: string;
  booking_reference: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  booking_date: string;
  status: string;
  flight?: {
    flight_number: string;
    from_location: string;
    to_location: string;
  };
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useLanguage();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter(
      (booking) =>
        booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passenger_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(flight_number, from_location, to_location)
      `)
      .order('booking_date', { ascending: false });

    if (!error && data) {
      setBookings(data as any);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      await supabase.from('bookings').delete().eq('id', id);
      loadBookings();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);
    loadBookings();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.bookings')}</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('stats.totalBookings')}</p>
            <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${t('common.search')} bookings by reference, name or email...`}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings.reference')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings.passenger')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings.flight')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings.paymentStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings.bookingStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{booking.booking_reference}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.passenger_name}</div>
                    <div className="text-xs text-gray-500">{booking.passenger_email}</div>
                    <div className="text-xs text-gray-500">{booking.passenger_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.flight?.flight_number || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      {booking.flight?.from_location} → {booking.flight?.to_location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.seat_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${Number(booking.total_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{booking.payment_method || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                        booking.payment_status
                      )}`}
                    >
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.status}
                      onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                      className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(
                        booking.status
                      )}`}
                    >
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="completed">completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {language === 'en' ? 'No bookings found' : 'कुनै बुकिङ फेला परेन'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;

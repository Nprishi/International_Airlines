import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Download, Mail, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateTicketPDF } from '../utils/ticketGenerator';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    console.log('Loading bookings for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          flight:flights(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading bookings:', error);
        setBookings([]);
      } else {
        console.log('Bookings loaded:', data?.length || 0);
        console.log('Booking data:', data);
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    }

    setLoading(false);
  };

  const getFlightDetails = (booking: any) => {
    return booking.flight;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_cancellation':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (booking: any) => {
    if (booking.status === 'cancelled') {
      alert('This booking is already cancelled.');
      return;
    }

    if (booking.status === 'completed') {
      alert('Cannot cancel a completed flight.');
      return;
    }

    const confirmCancel = confirm(
      `Are you sure you want to cancel this booking?\n\n` +
      `Flight: ${booking.flight?.flight_number}\n` +
      `Booking Reference: ${booking.booking_reference}\n\n` +
      `You will be notified once the admin processes your cancellation request.`
    );

    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          cancelled_by_user: true,
          status: 'pending_cancellation'
        })
        .eq('id', booking.id);

      if (error) {
        console.error('Error requesting cancellation:', error);
        alert('Failed to request cancellation. Please try again.');
      } else {
        alert('Cancellation request submitted successfully. An admin will process your request shortly.');
        loadBookings();
      }
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      alert('Failed to request cancellation. Please try again.');
    }
  };

  const handleDownloadTicket = (booking: any) => {
    const flight = getFlightDetails(booking);
    if (flight) {
      generateTicketPDF({
        booking: {
          id: booking.id,
          userId: booking.user_id,
          flightId: booking.flight_id,
          passengers: [{ id: '1', title: 'Mr', firstName: booking.passenger_name.split(' ')[0], lastName: booking.passenger_name.split(' ').slice(1).join(' '), email: booking.passenger_email, phone: booking.passenger_phone, dateOfBirth: '', passportNumber: '', nationality: '' }],
          seats: booking.seat_number.split(', '),
          totalAmount: Number(booking.total_amount),
          status: booking.status,
          bookingDate: booking.created_at,
          paymentMethod: booking.payment_method,
          pnr: booking.booking_reference,
        },
        flight: {
          id: flight.id,
          flightNumber: flight.flight_number,
          airline: flight.airline,
          from: flight.from_location,
          to: flight.to_location,
          departureTime: flight.departure_time,
          arrivalTime: flight.arrival_time,
          price: Number(flight.price),
          duration: '',
          class: 'Economy',
          availableSeats: flight.available_seats,
          aircraft: flight.aircraft_type,
        },
        passengers: [{ id: '1', title: 'Mr', firstName: booking.passenger_name.split(' ')[0], lastName: booking.passenger_name.split(' ').slice(1).join(' '), email: booking.passenger_email, phone: booking.passenger_phone, dateOfBirth: '', passportNumber: '', nationality: '' }]
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your flight reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You haven't made any flight bookings yet.</p>
            <a
              href="/"
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Book Your First Flight
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const flight = getFlightDetails(booking);
              if (!flight) return null;

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {formatTime(flight.departure_time)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {flight.from_location.split('(')[1]?.replace(')', '')}
                          </div>
                        </div>

                        <div className="flex-1 px-4">
                          <div className="flex items-center justify-center">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <div className="px-3 text-sm text-gray-500">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {Math.floor((new Date(flight.arrival_time).getTime() - new Date(flight.departure_time).getTime()) / 3600000)}h
                            </div>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                          <div className="text-center text-xs text-gray-400 mt-1">
                            {flight.flight_number}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {formatTime(flight.arrival_time)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {flight.to_location.split('(')[1]?.replace(')', '')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            ${booking.total_amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Total paid</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Booking Reference</p>
                          <p className="font-medium">{booking.booking_reference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passenger</p>
                          <p className="font-medium flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {booking.passenger_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Booking Date</p>
                          <p className="font-medium">{formatDate(booking.created_at)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Passenger & Seat</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{booking.passenger_name}</span>
                            <span className="text-gray-600">
                              Seat {booking.seat_number}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleDownloadTicket(booking)}
                          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center text-sm"
                          disabled={booking.status === 'cancelled'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download E-Ticket
                        </button>
                        <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
                          disabled={booking.status === 'cancelled'}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Confirmation
                        </button>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'pending_cancellation' && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center text-sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </button>
                        )}
                        {booking.status === 'pending_cancellation' && (
                          <button
                            disabled
                            className="flex-1 bg-orange-400 text-white py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center text-sm"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Cancellation Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
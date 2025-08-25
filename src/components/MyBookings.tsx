import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Download, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateTicketPDF } from '../utils/ticketGenerator';
import { Booking } from '../types';
import { mockFlights } from '../data/mockData';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Get bookings from localStorage
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const userBookings = allBookings.filter((booking: Booking) => booking.userId === user.id);
      setBookings(userBookings);
    }
    setLoading(false);
  }, [user]);

  const getFlightDetails = (flightId: string) => {
    return mockFlights.find(flight => flight.id === flightId);
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadTicket = (booking: Booking) => {
    const flight = getFlightDetails(booking.flightId);
    if (flight) {
      generateTicketPDF({
        booking: booking,
        flight: flight,
        passengers: booking.passengers
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
              const flight = getFlightDetails(booking.flightId);
              if (!flight) return null;

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {formatTime(flight.departureTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {flight.from.split('(')[1]?.replace(')', '')}
                          </div>
                        </div>
                        
                        <div className="flex-1 px-4">
                          <div className="flex items-center justify-center">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <div className="px-3 text-sm text-gray-500">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {flight.duration}
                            </div>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                          <div className="text-center text-xs text-gray-400 mt-1">
                            {flight.flightNumber}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {formatTime(flight.arrivalTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {flight.to.split('(')[1]?.replace(')', '')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            ${booking.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Total paid</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Booking Reference</p>
                          <p className="font-medium">{booking.pnr}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passengers</p>
                          <p className="font-medium flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {booking.passengers.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Booking Date</p>
                          <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Passengers & Seats</p>
                        <div className="space-y-1">
                          {booking.passengers.map((passenger, index) => (
                            <div key={passenger.id} className="flex justify-between text-sm">
                              <span>{passenger.firstName} {passenger.lastName}</span>
                              <span className="text-gray-600">
                                Seat {booking.seats[index] || 'Not assigned'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => handleDownloadTicket(booking)}
                          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center text-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download E-Ticket
                        </button>
                        <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center text-sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Confirmation
                        </button>
                        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Check-in
                        </button>
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
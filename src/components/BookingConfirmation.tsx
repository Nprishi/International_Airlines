import React from 'react';
import { CheckCircle, Download, Mail, Calendar, MapPin, Users, Plane } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import { Link } from 'react-router-dom';

const BookingConfirmation: React.FC = () => {
  const { currentBooking, selectedFlight, passengers } = useBooking();

  if (!currentBooking || !selectedFlight) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No booking information found.</p>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your flight has been successfully booked</p>
      </div>

      {/* Booking Details */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-t-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Reference</h3>
              <p className="text-2xl font-bold tracking-wider">{currentBooking.pnr}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Booking Date</p>
              <p className="font-medium">{formatDate(currentBooking.bookingDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-x border-b rounded-b-lg p-6">
          {/* Flight Information */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Plane className="h-5 w-5 mr-2" />
              Flight Details
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(selectedFlight.departureTime)}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {formatDate(selectedFlight.departureTime)}
                  </div>
                  <div className="font-medium">{selectedFlight.from}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="px-3 text-sm text-gray-500">
                      {selectedFlight.duration}
                    </div>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  <div className="text-sm text-gray-600">{selectedFlight.flightNumber}</div>
                  <div className="text-xs text-gray-500">{selectedFlight.aircraft}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(selectedFlight.arrivalTime)}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {formatDate(selectedFlight.arrivalTime)}
                  </div>
                  <div className="font-medium">{selectedFlight.to}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Passenger Details
            </h4>
            
            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Passenger {index + 1}</p>
                      <p className="font-medium">
                        {passenger.title} {passenger.firstName} {passenger.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Seat</p>
                      <p className="font-medium">{currentBooking.seats[index] || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Passport</p>
                      <p className="font-medium">{passenger.passportNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount Paid</span>
                <span className="text-xl font-bold text-green-600">
                  ${currentBooking.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Payment Method: {currentBooking.paymentMethod.replace('-', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-blue-900 mb-2">Important Information</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please arrive at the airport at least 3 hours before international flights</li>
              <li>• Ensure your passport is valid for at least 6 months from travel date</li>
              <li>• Check-in opens 24 hours before departure</li>
              <li>• Baggage allowance: 23kg checked, 7kg carry-on</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Download E-Ticket
            </button>
            <button className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              Email Confirmation
            </button>
            <Link
              to="/my-bookings"
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View All Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <p className="text-gray-600 mb-4">
          A confirmation email has been sent to your registered email address.
        </p>
        <Link
          to="/"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Book Another Flight →
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
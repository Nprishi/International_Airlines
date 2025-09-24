import React, { useState, useEffect } from 'react';
import { Search, Plane, Clock, MapPin, Users, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types';
import { mockFlights } from '../data/mockData';

const CheckIn: React.FC = () => {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState<'pnr' | 'email'>('pnr');
  const [searchValue, setSearchValue] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedInPassengers, setCheckedInPassengers] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a valid PNR or email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setBooking(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get bookings from localStorage
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      let foundBooking = null;

      if (searchType === 'pnr') {
        foundBooking = allBookings.find((b: Booking) => 
          b.pnr.toLowerCase() === searchValue.toLowerCase()
        );
      } else {
        foundBooking = allBookings.find((b: Booking) => 
          b.passengers.some(p => p.email.toLowerCase() === searchValue.toLowerCase())
        );
      }

      if (foundBooking) {
        setBooking(foundBooking);
        // Get already checked-in passengers from localStorage
        const checkedIn = JSON.parse(localStorage.getItem(`checkin_${foundBooking.id}`) || '[]');
        setCheckedInPassengers(checkedIn);
      } else {
        setError('No booking found with the provided information');
      }
    } catch (err) {
      setError('Failed to search for booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = (passengerId: string) => {
    if (!booking) return;

    const newCheckedIn = [...checkedInPassengers, passengerId];
    setCheckedInPassengers(newCheckedIn);
    
    // Save to localStorage
    localStorage.setItem(`checkin_${booking.id}`, JSON.stringify(newCheckedIn));
  };

  const handleCheckInAll = () => {
    if (!booking) return;

    const allPassengerIds = booking.passengers.map(p => p.id);
    setCheckedInPassengers(allPassengerIds);
    
    // Save to localStorage
    localStorage.setItem(`checkin_${booking.id}`, JSON.stringify(allPassengerIds));
  };

  const generateBoardingPass = (passengerId: string) => {
    if (!booking) return;

    const passenger = booking.passengers.find(p => p.id === passengerId);
    const flight = mockFlights.find(f => f.id === booking.flightId);
    const seatIndex = booking.passengers.findIndex(p => p.id === passengerId);
    const seat = booking.seats[seatIndex];

    if (!passenger || !flight) return;

    const boardingPassWindow = window.open('', '_blank', 'width=800,height=600');
    if (!boardingPassWindow) {
      alert('Please allow popups to download your boarding pass');
      return;
    }

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
      });
    };

    const boardingPassHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Boarding Pass - ${passenger.firstName} ${passenger.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
          .boarding-pass { 
            background: white; 
            max-width: 600px; 
            margin: 0 auto; 
            border-radius: 10px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2563eb, #1d4ed8); 
            color: white; 
            padding: 20px; 
            text-align: center; 
          }
          .airline-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .boarding-pass-title { font-size: 16px; opacity: 0.9; }
          .main-content { padding: 30px; }
          .flight-info { 
            display: grid; 
            grid-template-columns: 1fr auto 1fr; 
            gap: 20px; 
            align-items: center; 
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .airport { text-align: center; }
          .airport-code { font-size: 36px; font-weight: bold; color: #1e40af; }
          .airport-name { color: #64748b; margin-top: 5px; }
          .flight-path { text-align: center; color: #64748b; }
          .passenger-info { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .info-item { }
          .info-label { color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { font-weight: bold; font-size: 16px; }
          .barcode { 
            text-align: center; 
            margin: 20px 0;
            background: repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px);
            height: 50px;
            margin-bottom: 10px;
          }
          .barcode-text { font-family: monospace; letter-spacing: 2px; }
          .footer { 
            background: #f8fafc; 
            padding: 20px; 
            text-align: center; 
            color: #64748b; 
            border-top: 1px solid #e2e8f0;
          }
          .print-btn { 
            background: #2563eb; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 10px;
          }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="boarding-pass">
          <div class="header">
            <div class="airline-name">International Airlines</div>
            <div class="boarding-pass-title">Boarding Pass</div>
          </div>
          
          <div class="main-content">
            <div class="flight-info">
              <div class="airport">
                <div class="airport-code">${flight.from.split('(')[1]?.replace(')', '')}</div>
                <div class="airport-name">${flight.from.split('(')[0]?.trim()}</div>
                <div style="margin-top: 10px; font-weight: bold;">${formatTime(flight.departureTime)}</div>
                <div style="color: #64748b;">${formatDate(flight.departureTime)}</div>
              </div>
              
              <div class="flight-path">
                <div style="font-weight: bold; margin-bottom: 5px;">${flight.flightNumber}</div>
                <div>${flight.duration}</div>
              </div>
              
              <div class="airport">
                <div class="airport-code">${flight.to.split('(')[1]?.replace(')', '')}</div>
                <div class="airport-name">${flight.to.split('(')[0]?.trim()}</div>
                <div style="margin-top: 10px; font-weight: bold;">${formatTime(flight.arrivalTime)}</div>
                <div style="color: #64748b;">${formatDate(flight.arrivalTime)}</div>
              </div>
            </div>
            
            <div class="passenger-info">
              <div class="info-item">
                <div class="info-label">Passenger</div>
                <div class="info-value">${passenger.firstName} ${passenger.lastName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Seat</div>
                <div class="info-value">${seat || 'TBA'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Class</div>
                <div class="info-value">${flight.class}</div>
              </div>
              <div class="info-item">
                <div class="info-label">PNR</div>
                <div class="info-value">${booking.pnr}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gate</div>
                <div class="info-value">A${Math.floor(Math.random() * 20) + 1}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Boarding</div>
                <div class="info-value">${formatTime(new Date(new Date(flight.departureTime).getTime() - 30 * 60000).toISOString())}</div>
              </div>
            </div>
            
            <div class="barcode"></div>
            <div class="barcode-text" style="text-align: center;">${booking.pnr}${passenger.id}</div>
          </div>
          
          <div class="footer">
            <p><strong>Important:</strong> Please arrive at the gate 30 minutes before boarding time</p>
            <p>Keep this boarding pass with you until you reach your destination</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px;">
          <button class="print-btn" onclick="window.print()">Print Boarding Pass</button>
          <button class="print-btn" onclick="window.close()" style="background: #64748b;">Close</button>
        </div>
      </body>
      </html>
    `;

    boardingPassWindow.document.write(boardingPassHTML);
    boardingPassWindow.document.close();
  };

  const getFlightDetails = () => {
    if (!booking) return null;
    return mockFlights.find(f => f.id === booking.flightId);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const flight = getFlightDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Online Check-in</h1>
          <p className="text-gray-600">Check in for your flight and get your boarding pass</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Find Your Booking</h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="pnr"
                checked={searchType === 'pnr'}
                onChange={(e) => setSearchType(e.target.value as 'pnr' | 'email')}
                className="mr-2"
              />
              <span>Search by PNR</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="email"
                checked={searchType === 'email'}
                onChange={(e) => setSearchType(e.target.value as 'pnr' | 'email')}
                className="mr-2"
              />
              <span>Search by Email</span>
            </label>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'pnr' ? 'Enter PNR (e.g., ABC123)' : 'Enter email address'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Booking Details */}
        {booking && flight && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Flight Details</h2>
                  <p className="text-primary-100">PNR: {booking.pnr}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-100">Status</p>
                  <p className="text-xl font-bold">Confirmed</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Flight Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatTime(flight.departureTime)}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {formatDate(flight.departureTime)}
                    </div>
                    <div className="font-medium">{flight.from}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <div className="px-3 text-sm text-gray-500 flex items-center">
                        <Plane className="h-4 w-4 mr-1" />
                        {flight.duration}
                      </div>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    <div className="text-sm font-medium">{flight.flightNumber}</div>
                    <div className="text-xs text-gray-500">{flight.aircraft}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatTime(flight.arrivalTime)}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {formatDate(flight.arrivalTime)}
                    </div>
                    <div className="font-medium">{flight.to}</div>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Passengers</h3>
                  {checkedInPassengers.length < booking.passengers.length && (
                    <button
                      onClick={handleCheckInAll}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Check-in All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {booking.passengers.map((passenger, index) => {
                    const isCheckedIn = checkedInPassengers.includes(passenger.id);
                    return (
                      <div key={passenger.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {passenger.firstName} {passenger.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Seat: {booking.seats[index] || 'Not assigned'}
                                </p>
                              </div>
                              {isCheckedIn && (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-5 w-5 mr-1" />
                                  <span className="text-sm font-medium">Checked In</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleCheckIn(passenger.id)}
                                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm"
                              >
                                Check In
                              </button>
                            ) : (
                              <button
                                onClick={() => generateBoardingPass(passenger.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Boarding Pass
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Check-in Status */}
              {checkedInPassengers.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">
                        Check-in Complete ({checkedInPassengers.length}/{booking.passengers.length} passengers)
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Please arrive at the airport at least 2 hours before departure for international flights.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
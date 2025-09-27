import React, { useState, useEffect } from 'react';
import { Clock, Plane, Users, ArrowLeft, Wifi, Coffee, Tv, Star } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import CurrencyDisplay from './CurrencyDisplay';
import { mockFlights } from '../data/mockData';
import { Flight } from '../types';

interface FlightListProps {
  onNext: () => void;
}

const FlightList: React.FC<FlightListProps> = ({ onNext }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchFilters, setSelectedFlight } = useBooking();

  useEffect(() => {
    // Simulate API call
    const searchFlights = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (searchFilters) {
        // Filter flights based on search criteria
        const filteredFlights = mockFlights.filter(flight => 
          flight.from === searchFilters.from &&
          flight.to === searchFilters.to &&
          flight.class === searchFilters.class
        );
        setFlights(filteredFlights);
      }
      
      setLoading(false);
    };

    searchFlights();
  }, [searchFilters]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    onNext();
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
    });
  };

  if (!searchFilters) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No search criteria found. Please search for flights first.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span><strong>From:</strong> {searchFilters.from}</span>
          <span><strong>To:</strong> {searchFilters.to}</span>
          <span><strong>Date:</strong> {formatDate(searchFilters.departureDate)}</span>
          <span><strong>Passengers:</strong> {searchFilters.passengers}</span>
          <span><strong>Class:</strong> {searchFilters.class}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Searching flights...</span>
        </div>
      ) : flights.length === 0 ? (
        <div className="text-center py-12">
          <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or dates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Available Flights ({flights.length})
            </span>
          </h2>
          
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatTime(flight.departureTime)}
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-1">
                          {flight.from.split('(')[1]?.replace(')', '')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(flight.departureTime)}
                        </div>
                      </div>
                      
                      <div className="flex-1 px-6">
                        <div className="flex items-center justify-center">
                          <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                          <div className="px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 border border-primary-200">
                            <Plane className="h-4 w-4 inline mr-2" />
                            {flight.duration}
                          </div>
                          <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                        </div>
                        <div className="text-center text-xs font-medium text-gray-500 mt-2">
                          {flight.aircraft}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatTime(flight.arrivalTime)}
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-1">
                          {flight.to.split('(')[1]?.replace(')', '')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(flight.arrivalTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <CurrencyDisplay 
                        amount={flight.price} 
                        className="text-3xl font-bold text-primary-600 mb-1" 
                      />
                      <div className="text-sm text-gray-500">per person</div>
                      <div className="flex items-center justify-end mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-0">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        {flight.flightNumber}
                      </span>
                      <span className="text-sm font-medium text-gray-600">{flight.airline}</span>
                      <span className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-medium">{flight.availableSeats}</span> seats left
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Wifi className="h-4 w-4 mr-1" />
                        <span>WiFi</span>
                      </div>
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-1" />
                        <span>Meals</span>
                      </div>
                      <div className="flex items-center">
                        <Tv className="h-4 w-4 mr-1" />
                        <span>Entertainment</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-0 lg:ml-8">
                  <button
                    onClick={() => handleSelectFlight(flight)}
                    className="w-full lg:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightList;
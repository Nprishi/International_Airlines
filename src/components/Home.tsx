import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Plane } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { cities } from '../data/mockData';
import { SearchFilters } from '../types';

const Home: React.FC = () => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'Economy' as 'Economy' | 'Business' | 'First',
    tripType: 'one-way' as 'one-way' | 'round-trip',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { user } = useAuth();
  const { setSearchFilters } = useBooking();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateSearch = () => {
    const newErrors: { [key: string]: string } = {};

    if (!searchData.from) newErrors.from = 'Departure city is required';
    if (!searchData.to) newErrors.to = 'Destination city is required';
    if (!searchData.departureDate) newErrors.departureDate = 'Departure date is required';
    if (searchData.tripType === 'round-trip' && !searchData.returnDate) {
      newErrors.returnDate = 'Return date is required for round trip';
    }
    if (searchData.from === searchData.to) {
      newErrors.to = 'Destination must be different from departure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSearch()) return;

    const filters: SearchFilters = {
      from: searchData.from,
      to: searchData.to,
      departureDate: searchData.departureDate,
      returnDate: searchData.tripType === 'round-trip' ? searchData.returnDate : undefined,
      passengers: searchData.passengers,
      class: searchData.class,
      tripType: searchData.tripType,
    };

    setSearchFilters(filters);

    if (!user) {
      // Store search filters and redirect to login
      sessionStorage.setItem('pendingSearch', JSON.stringify(filters));
      navigate('/login');
    } else {
      navigate('/booking');
    }
  };

  const swapCities = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fly Around the World
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing destinations with International Airlines
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="relative -mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Trip Type */}
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tripType"
                  value="one-way"
                  checked={searchData.tripType === 'one-way'}
                  onChange={handleInputChange}
                  className="mr-2 text-primary-600"
                />
                One Way
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tripType"
                  value="round-trip"
                  checked={searchData.tripType === 'round-trip'}
                  onChange={handleInputChange}
                  className="mr-2 text-primary-600"
                />
                Round Trip
              </label>
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* From */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="from"
                    value={searchData.from}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.from ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select departure</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                {errors.from && <p className="mt-1 text-sm text-red-600">{errors.from}</p>}
              </div>

              {/* To */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="to"
                    value={searchData.to}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.to ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select destination</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={swapCities}
                    className="absolute right-3 top-3 text-gray-400 hover:text-primary-600"
                  >
                    ⇄
                  </button>
                </div>
                {errors.to && <p className="mt-1 text-sm text-red-600">{errors.to}</p>}
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="departureDate"
                    value={searchData.departureDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.departureDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.departureDate && <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>}
              </div>

              {/* Return Date */}
              {searchData.tripType === 'round-trip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="returnDate"
                      value={searchData.returnDate}
                      onChange={handleInputChange}
                      min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.returnDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.returnDate && <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>}
                </div>
              )}
            </div>

            {/* Passengers and Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="passengers"
                    value={searchData.passengers}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="class"
                    value={searchData.class}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First Class</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Search Flights</span>
            </button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose International Airlines?</h2>
          <p className="text-lg text-gray-600">Experience the best in air travel with our premium services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Modern Fleet</h3>
            <p className="text-gray-600">Fly with confidence in our state-of-the-art aircraft equipped with the latest technology.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Excellent Service</h3>
            <p className="text-gray-600">Our dedicated crew ensures your journey is comfortable and memorable.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Network</h3>
            <p className="text-gray-600">Connect to destinations worldwide with our extensive route network.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Plane, ArrowRightLeft, Star, Shield, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Fly Around the
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                World
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover amazing destinations with International Airlines. 
              Experience comfort, luxury, and exceptional service.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/80">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span>Safe & Secure</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                <span>5-Star Service</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Form */}
      <div className="relative -mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Search Flights</h2>
            <p className="text-gray-600 mt-1">Find the perfect flight for your journey</p>
          </div>
          
          <form onSubmit={handleSearch} className="p-6 md:p-8">
            {/* Trip Type */}
            <div className="flex flex-wrap gap-6 mb-8">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="tripType"
                  value="one-way"
                  checked={searchData.tripType === 'one-way'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`flex items-center px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                  searchData.tripType === 'one-way' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}>
                  <Plane className="h-4 w-4 mr-2" />
                  One Way
                </div>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="tripType"
                  value="round-trip"
                  checked={searchData.tripType === 'round-trip'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`flex items-center px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                  searchData.tripType === 'round-trip' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Round Trip
                </div>
              </label>
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* From and To Container */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {/* From */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Departure
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <select
                        name="from"
                        value={searchData.from}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 bg-white text-gray-900 ${
                          errors.from 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-primary-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="" className="text-gray-500">Select departure city</option>
                        {cities.map(city => (
                          <option key={city} value={city} className="text-gray-900">{city}</option>
                        ))}
                      </select>
                    </div>
                    {errors.from && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.from}
                      </p>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                    <button
                      type="button"
                      onClick={swapCities}
                      className="bg-white border-2 border-gray-200 rounded-full p-3 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl group"
                    >
                      <ArrowRightLeft className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                    </button>
                  </div>

                  {/* To */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Destination
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <select
                        name="to"
                        value={searchData.to}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 bg-white text-gray-900 ${
                          errors.to 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-primary-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="" className="text-gray-500">Select destination city</option>
                        {cities.map(city => (
                          <option key={city} value={city} className="text-gray-900">{city}</option>
                        ))}
                      </select>
                    </div>
                    {errors.to && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.to}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-2">
                {/* Departure Date */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Departure Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="date"
                      name="departureDate"
                      value={searchData.departureDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 bg-white text-gray-900 ${
                        errors.departureDate 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-primary-500 hover:border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.departureDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.departureDate}
                    </p>
                  )}
                </div>

                {/* Return Date */}
                {searchData.tripType === 'round-trip' && (
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Return Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type="date"
                        name="returnDate"
                        value={searchData.returnDate}
                        onChange={handleInputChange}
                        min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                        className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 bg-white text-gray-900 ${
                          errors.returnDate 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-primary-500 hover:border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.returnDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.returnDate}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Passengers and Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-2">
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passengers
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <select
                      name="passengers"
                      value={searchData.passengers}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 hover:border-gray-300 transition-all duration-200 bg-white text-gray-900"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <option key={num} value={num} className="text-gray-900">
                          {num} {num === 1 ? 'Passenger' : 'Passengers'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Travel Class
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Plane className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <select
                      name="class"
                      value={searchData.class}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 hover:border-gray-300 transition-all duration-200 bg-white text-gray-900"
                    >
                      <option value="Economy" className="text-gray-900">Economy Class</option>
                      <option value="Business" className="text-gray-900">Business Class</option>
                      <option value="First" className="text-gray-900">First Class</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-200 flex items-center justify-center space-x-3"
            >
              <Search className="h-6 w-6" />
              <span>Search Flights</span>
            </button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Choose International Airlines?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the best in air travel with our premium services and world-class amenities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Plane className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Modern Fleet</h3>
            <p className="text-gray-600 leading-relaxed">
              Fly with confidence in our state-of-the-art aircraft equipped with the latest technology and safety features.
            </p>
          </div>

          <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">5-Star Service</h3>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated crew ensures your journey is comfortable, memorable, and exceeds your expectations.
            </p>
          </div>

          <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Global Network</h3>
            <p className="text-gray-600 leading-relaxed">
              Connect to destinations worldwide with our extensive route network spanning across continents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
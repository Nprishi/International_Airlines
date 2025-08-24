import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, CreditCard } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { Passenger } from '../types';

interface PassengerFormProps {
  onNext: () => void;
  onBack: () => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({ onNext, onBack }) => {
  const { searchFilters, passengers, setPassengers } = useBooking();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Passenger[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (searchFilters) {
      const initialPassengers: Passenger[] = Array.from({ length: searchFilters.passengers }, (_, index) => ({
        id: `passenger-${index + 1}`,
        title: 'Mr',
        firstName: index === 0 && user ? user.firstName : '',
        lastName: index === 0 && user ? user.lastName : '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        email: index === 0 && user ? user.email : '',
        phone: index === 0 && user ? user.phone : '',
      }));
      setFormData(initialPassengers);
    }
  }, [searchFilters, user]);

  const handleInputChange = (passengerIndex: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = [...formData];
    updatedPassengers[passengerIndex] = {
      ...updatedPassengers[passengerIndex],
      [field]: value,
    };
    setFormData(updatedPassengers);

    // Clear error when user starts typing
    const errorKey = `${passengerIndex}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    formData.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        newErrors[`${index}-firstName`] = 'First name is required';
      }
      if (!passenger.lastName.trim()) {
        newErrors[`${index}-lastName`] = 'Last name is required';
      }
      if (!passenger.dateOfBirth) {
        newErrors[`${index}-dateOfBirth`] = 'Date of birth is required';
      }
      if (!passenger.nationality.trim()) {
        newErrors[`${index}-nationality`] = 'Nationality is required';
      }
      if (!passenger.passportNumber.trim()) {
        newErrors[`${index}-passportNumber`] = 'Passport number is required';
      }
      if (!passenger.email.trim()) {
        newErrors[`${index}-email`] = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(passenger.email)) {
        newErrors[`${index}-email`] = 'Email is invalid';
      }
      if (!passenger.phone.trim()) {
        newErrors[`${index}-phone`] = 'Phone number is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setPassengers(formData);
    onNext();
  };

  const countries = [
    'Nepal', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'South Korea', 'Singapore',
    'India', 'China', 'Thailand', 'Malaysia', 'UAE'
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Passenger Information</h2>
        <p className="text-gray-600">Please provide details for all passengers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {formData.map((passenger, index) => (
          <div key={passenger.id} className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Passenger {index + 1} {index === 0 && '(Primary Contact)'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <select
                  value={passenger.title}
                  onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-firstName`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="First name"
                  />
                </div>
                {errors[`${index}-firstName`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-firstName`]}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-lastName`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Last name"
                  />
                </div>
                {errors[`${index}-lastName`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-lastName`]}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => handleInputChange(index, 'dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-dateOfBirth`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors[`${index}-dateOfBirth`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-dateOfBirth`]}</p>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={passenger.nationality}
                    onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-nationality`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select nationality</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                {errors[`${index}-nationality`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-nationality`]}</p>
                )}
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) => handleInputChange(index, 'passportNumber', e.target.value.toUpperCase())}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-passportNumber`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Passport number"
                  />
                </div>
                {errors[`${index}-passportNumber`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-passportNumber`]}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-email`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Email address"
                  />
                </div>
                {errors[`${index}-email`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-email`]}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={passenger.phone}
                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`${index}-phone`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Phone number"
                  />
                </div>
                {errors[`${index}-phone`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-phone`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Flights
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Continue to Seat Selection
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerForm;
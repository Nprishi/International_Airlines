import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import FlightList from './FlightList';
import PassengerForm from './PassengerForm';
import SeatSelection from './SeatSelection';
import PaymentForm from './PaymentForm';
import BookingConfirmation from './BookingConfirmation';

const BookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const { searchFilters, selectedFlight, passengers, currentBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check for pending search from session storage
    const pendingSearch = sessionStorage.getItem('pendingSearch');
    if (pendingSearch && !searchFilters) {
      const filters = JSON.parse(pendingSearch);
      // Set the search filters and clear from session storage
      sessionStorage.removeItem('pendingSearch');
      // You would set the filters here if you had the setter available
    }
  }, [user, navigate, searchFilters]);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FlightList onNext={nextStep} />;
      case 2:
        return <PassengerForm onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <SeatSelection onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <PaymentForm onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <BookingConfirmation />;
      default:
        return <FlightList onNext={nextStep} />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Flight';
      case 2: return 'Passenger Details';
      case 3: return 'Select Seats';
      case 4: return 'Payment';
      case 5: return 'Confirmation';
      default: return 'Booking';
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
            <div className="text-sm text-gray-500">Step {currentStep} of 5</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>Select Flight</span>
            <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>Passengers</span>
            <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>Seats</span>
            <span className={currentStep >= 4 ? 'text-primary-600 font-medium' : ''}>Payment</span>
            <span className={currentStep >= 5 ? 'text-primary-600 font-medium' : ''}>Confirmation</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
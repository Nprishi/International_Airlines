import React, { useState } from 'react';
import { CreditCard, Lock, Calendar, User } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { PaymentDetails, TotalsSummary } from '../types';

interface PaymentFormProps {
  onNext: () => void;
  onBack: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onNext, onBack }) => {
  const { selectedFlight, passengers, selectedSeats, setPaymentDetails, createBooking } = useBooking();
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentDetails>({
    method: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: user ? `${user.firstName} ${user.lastName}` : '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value,
        },
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!paymentData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Cardholder name is required';
    }

    if (!paymentData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!paymentData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format';
    }

    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    if (!paymentData.billingAddress?.street.trim()) {
      newErrors['billingAddress.street'] = 'Street address is required';
    }

    if (!paymentData.billingAddress?.city.trim()) {
      newErrors['billingAddress.city'] = 'City is required';
    }

    if (!paymentData.billingAddress?.zipCode.trim()) {
      newErrors['billingAddress.zipCode'] = 'ZIP code is required';
    }

    if (!paymentData.billingAddress?.country.trim()) {
      newErrors['billingAddress.country'] = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = (): TotalsSummary => {
    
    let total = selectedFlight.price * passengers.length;
    
    // Add seat fees
    selectedSeats.forEach(seat => {
      if (seat.includes('A') || seat.includes('F')) { // Window seats
        total += 25;
      } else if (seat.includes('C') || seat.includes('D')) { // Aisle seats
        total += 15;
      }
    });

    // Add taxes and fees
    const taxes = total * 0.12; // 12% taxes
    const serviceFee = 29.99;

    return {
      subtotal: total,
      taxes,
      serviceFee,
      total: total + taxes + serviceFee,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentDetails(paymentData);
      
      if (user) {
        createBooking(user.id);
      }
      
      onNext();
    } catch (error) {
      setErrors({ general: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedFlight || !user) {
    return <div className="p-6">Missing booking information</div>;
  }

  const totals: TotalsSummary = calculateTotal();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Information</h2>
        <p className="text-gray-600">Secure payment processing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={paymentData.method === 'credit-card'}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2" />
                  Credit Card
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit-card"
                    checked={paymentData.method === 'debit-card'}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2" />
                  Debit Card
                </label>
              </div>
            </div>

            {/* Card Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Card Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={paymentData.cardHolderName}
                      onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.cardHolderName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Name on card"
                    />
                  </div>
                  {errors.cardHolderName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardHolderName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength={19}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="MM/YY"
                    />
                  </div>
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.cvv ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h4 className="font-semibold mb-4">Billing Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingAddress.street}
                    onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors['billingAddress.street'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors['billingAddress.street'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingAddress.street']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingAddress.city}
                    onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors['billingAddress.city'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors['billingAddress.city'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingAddress.city']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingAddress.state}
                    onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingAddress.zipCode}
                    onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors['billingAddress.zipCode'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12345"
                  />
                  {errors['billingAddress.zipCode'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingAddress.zipCode']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={paymentData.billingAddress.country}
                    onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors['billingAddress.country'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="NP">Nepal</option>
                    <option value="IN">India</option>
                    <option value="AU">Australia</option>
                  </select>
                  {errors['billingAddress.country'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingAddress.country']}</p>
                  )}
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Flight ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
                <span className="text-sm font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxes & Fees</span>
                <span className="text-sm font-medium">${totals.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service Fee</span>
                <span className="text-sm font-medium">${totals.serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              <p>• Your payment is secured with 256-bit SSL encryption</p>
              <p>• No hidden fees or charges</p>
              <p>• Full refund available within 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Seats
        </button>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Complete Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
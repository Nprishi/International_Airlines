import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { ESewaPaymentService, PaymentServiceFactory, PaymentRequest } from '../services/paymentService';

interface PaymentConfirmationProps {
  paymentMethod: string;
  amount: number;
  bookingData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  paymentMethod,
  amount,
  bookingData,
  onSuccess,
  onCancel
}) => {
  const [credentials, setCredentials] = useState({
    id: '',
    password: '',
    pin: '',
    mobileNumber: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'credentials' | 'processing' | 'success' | 'error'>('credentials');

  const getPaymentConfig = () => {
    switch (paymentMethod) {
      case 'esewa':
        return {
          name: 'eSewa',
          logo: '🟢',
          color: 'green',
          fields: ['id', 'password'],
          idLabel: 'eSewa ID',
          passwordLabel: 'Password',
          description: 'Enter your eSewa credentials to complete the payment'
        };
      case 'khalti':
        return {
          name: 'Khalti',
          logo: '🟣',
          color: 'purple',
          fields: ['mobileNumber', 'pin'],
          idLabel: 'Mobile Number',
          passwordLabel: 'Khalti PIN',
          description: 'Enter your Khalti mobile number and PIN'
        };
      case 'ime-pay':
        return {
          name: 'IME Pay',
          logo: '🔵',
          color: 'blue',
          fields: ['mobileNumber', 'pin'],
          idLabel: 'Mobile Number',
          passwordLabel: 'IME Pay PIN',
          description: 'Enter your IME Pay mobile number and PIN'
        };
      case 'mobile-banking':
        return {
          name: 'Mobile Banking',
          logo: '🟠',
          color: 'orange',
          fields: ['id', 'password'],
          idLabel: 'User ID',
          passwordLabel: 'Password',
          description: 'Enter your mobile banking credentials'
        };
      case 'connect-ips':
        return {
          name: 'ConnectIPS',
          logo: '🔴',
          color: 'red',
          fields: ['id', 'password'],
          idLabel: 'Bank User ID',
          passwordLabel: 'Password',
          description: 'Enter your bank account credentials for ConnectIPS'
        };
      default:
        return {
          name: 'Payment',
          logo: '💳',
          color: 'gray',
          fields: ['id', 'password'],
          idLabel: 'User ID',
          passwordLabel: 'Password',
          description: 'Enter your payment credentials'
        };
    }
  };

  const config = getPaymentConfig();

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (config.fields.includes('id') && !credentials.id.trim()) {
      newErrors.id = `${config.idLabel} is required`;
    }

    if (config.fields.includes('password') && !credentials.password.trim()) {
      newErrors.password = `${config.passwordLabel} is required`;
    }

    if (config.fields.includes('pin') && !credentials.pin.trim()) {
      newErrors.pin = `${config.passwordLabel} is required`;
    } else if (config.fields.includes('pin') && credentials.pin.length < 4) {
      newErrors.pin = 'PIN must be at least 4 digits';
    }

    if (config.fields.includes('mobileNumber') && !credentials.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (config.fields.includes('mobileNumber') && !/^[0-9]{10}$/.test(credentials.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulatePaymentAPI = async () => {
    try {
      // For eSewa, use real API integration
      if (paymentMethod === 'esewa') {
        const paymentRequest: PaymentRequest = {
          amount: amount,
          currency: 'USD',
          paymentMethod: 'esewa',
          orderId: bookingData.orderId,
          customerInfo: {
            name: bookingData.customerName,
            email: bookingData.customerEmail,
            phone: bookingData.customerPhone,
          },
          successUrl: `${window.location.origin}/payment/success`,
          failureUrl: `${window.location.origin}/payment/failure`,
        };

        const response = await ESewaPaymentService.initiatePayment(paymentRequest);
        
        if (response.success && response.redirectForm) {
          // Open eSewa payment form in new window
          const paymentWindow = window.open('', '_blank', 'width=800,height=600');
          if (paymentWindow) {
            paymentWindow.document.write(response.redirectForm);
            paymentWindow.document.close();
            
            // Listen for payment completion
            const checkPaymentStatus = setInterval(() => {
              if (paymentWindow.closed) {
                clearInterval(checkPaymentStatus);
                // Check payment status from localStorage or API
                const paymentStatus = localStorage.getItem(`payment_${bookingData.orderId}`);
                if (paymentStatus === 'success') {
                  return { success: true };
                } else {
                  throw new Error('Payment was cancelled or failed');
                }
              }
            }, 1000);
            
            // Wait for payment completion
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                clearInterval(checkPaymentStatus);
                reject(new Error('Payment timeout'));
              }, 300000); // 5 minutes timeout
              
              const originalInterval = checkPaymentStatus;
              checkPaymentStatus = setInterval(() => {
                if (paymentWindow.closed) {
                  clearInterval(originalInterval);
                  clearTimeout(timeout);
                  const paymentStatus = localStorage.getItem(`payment_${bookingData.orderId}`);
                  if (paymentStatus === 'success') {
                    resolve(true);
                  } else {
                    reject(new Error('Payment was cancelled or failed'));
                  }
                }
              }, 1000);
            });
          } else {
            throw new Error('Please allow popups for payment processing');
          }
        } else {
          throw new Error(response.message || 'Failed to initiate payment');
        }
      } else {
        // For other payment methods, use existing simulation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate random success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (!isSuccess) {
          throw new Error('Payment failed. Please check your credentials and try again.');
        }
      }
    } catch (error) {
      throw error;
    }
    
    return {
      transactionId: bookingData.orderId,
      status: 'success',
      amount: amount,
      method: paymentMethod
    };
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      const result = await simulatePaymentAPI();
      setStep('success');
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      setStep('error');
      setErrors({ general: error instanceof Error ? error.message : 'Payment failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCredentialsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`text-6xl mb-4`}>{config.logo}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.name} Payment</h2>
        <p className="text-gray-600 mb-4">{config.description}</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-lg font-semibold">Amount to Pay: <span className="text-green-600">NPR {(amount * 133.25).toLocaleString()}</span></p>
          <p className="text-sm text-gray-500">≈ ${amount.toFixed(2)} USD</p>
        </div>
      </div>

      <div className="space-y-4">
        {config.fields.includes('id') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.idLabel}
            </label>
            <input
              type="text"
              value={credentials.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${config.color}-500 ${
                errors.id ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={`Enter your ${config.idLabel.toLowerCase()}`}
            />
            {errors.id && <p className="mt-1 text-sm text-red-600">{errors.id}</p>}
          </div>
        )}

        {config.fields.includes('mobileNumber') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.idLabel}
            </label>
            <input
              type="tel"
              value={credentials.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${config.color}-500 ${
                errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="98XXXXXXXX"
            />
            {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
          </div>
        )}

        {config.fields.includes('password') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.passwordLabel}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${config.color}-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={`Enter your ${config.passwordLabel.toLowerCase()}`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
        )}

        {config.fields.includes('pin') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.passwordLabel}
            </label>
            <input
              type="password"
              value={credentials.pin}
              onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${config.color}-500 ${
                errors.pin ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your PIN"
            />
            {errors.pin && <p className="mt-1 text-sm text-red-600">{errors.pin}</p>}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-800">Secure Payment</p>
            <p className="text-xs text-blue-600">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`flex-1 bg-${config.color}-600 text-white py-3 px-6 rounded-lg hover:bg-${config.color}-700 disabled:opacity-50 transition-colors flex items-center justify-center`}
        >
          <Shield className="h-4 w-4 mr-2" />
          Pay Now
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">{config.logo}</div>
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
      <h2 className="text-2xl font-bold text-gray-900">Processing Payment</h2>
      <p className="text-gray-600">Please wait while we process your {config.name} payment...</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">Do not close this window or press back button</p>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">✅</div>
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
      <h2 className="text-2xl font-bold text-green-900">Payment Successful!</h2>
      <p className="text-gray-600">Your {config.name} payment has been processed successfully.</p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm font-medium text-green-800">Amount Paid: NPR {(amount * 133.25).toLocaleString()}</p>
        <p className="text-xs text-green-600">Transaction ID: TXN{Date.now()}</p>
      </div>
      <p className="text-sm text-gray-500">Redirecting to confirmation page...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">❌</div>
      <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
      <h2 className="text-2xl font-bold text-red-900">Payment Failed</h2>
      <p className="text-gray-600">{errors.general}</p>
      <div className="flex space-x-4">
        <button
          onClick={() => setStep('credentials')}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 'credentials' && renderCredentialsForm()}
          {step === 'processing' && renderProcessing()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
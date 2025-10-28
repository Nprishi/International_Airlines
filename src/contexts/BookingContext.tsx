import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Flight, SearchFilters, Passenger, Booking, PaymentDetails } from '../types';

interface BookingContextType {
  searchFilters: SearchFilters | null;
  selectedFlight: Flight | null;
  passengers: Passenger[];
  selectedSeats: string[];
  paymentDetails: PaymentDetails | null;
  currentBooking: Booking | null;

  setSearchFilters: (filters: SearchFilters) => void;
  setSelectedFlight: (flight: Flight) => void;
  setPassengers: (passengers: Passenger[]) => void;
  setSelectedSeats: (seats: string[]) => void;
  setPaymentDetails: (payment: PaymentDetails) => void;
  createBooking: (userId: string) => Promise<Booking | null>;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const createBooking = async (userId: string): Promise<Booking | null> => {
    console.log('createBooking called with userId:', userId);

    if (!selectedFlight || passengers.length === 0) {
      console.error('Missing booking information:', { selectedFlight, passengers });
      throw new Error('Missing required booking information');
    }

    try {
      const totalAmount = calculateTotalAmount();
      const bookingReference = generatePNR();
      const primaryPassenger = passengers[0];

      console.log('Booking details:', {
        userId,
        flightId: selectedFlight.id,
        passengerName: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
        seats: selectedSeats.join(', '),
        reference: bookingReference,
        paymentMethod: paymentDetails?.method,
        amount: totalAmount
      });

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: userId,
            flight_id: selectedFlight.id,
            passenger_name: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
            passenger_email: primaryPassenger.email,
            passenger_phone: primaryPassenger.phone,
            seat_number: selectedSeats.join(', '),
            booking_reference: bookingReference,
            payment_status: 'completed',
            payment_method: paymentDetails?.method || 'credit-card',
            total_amount: totalAmount,
            status: 'confirmed',
          },
        ])
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        return null;
      }

      console.log('Booking created in database:', bookingData.id);

      const { data: settings } = await supabase
        .from('site_settings')
        .select('usd_to_npr_rate')
        .maybeSingle();

      const exchangeRate = settings?.usd_to_npr_rate || 132.5;

      console.log('Creating payment record...');
      const { error: paymentError } = await supabase.from('payments').insert([
        {
          booking_id: bookingData.id,
          user_id: userId,
          amount_usd: totalAmount,
          amount_npr: totalAmount * exchangeRate,
          exchange_rate: exchangeRate,
          payment_method: paymentDetails?.method || 'credit-card',
          payment_gateway: 'stripe',
          transaction_id: `TXN-${Date.now()}`,
          status: 'completed',
        },
      ]);

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
      } else {
        console.log('Payment record created successfully');
      }

      console.log('Updating flight seats...');
      const { error: updateError } = await supabase
        .from('flights')
        .update({ available_seats: selectedFlight.availableSeats - passengers.length })
        .eq('id', selectedFlight.id);

      if (updateError) {
        console.error('Flight seat update error:', updateError);
      } else {
        console.log('Flight seats updated successfully');
      }

      const booking: Booking = {
        id: bookingData.id,
        userId,
        flightId: selectedFlight.id,
        passengers,
        seats: selectedSeats,
        totalAmount,
        status: 'confirmed',
        bookingDate: bookingData.created_at,
        paymentMethod: paymentDetails?.method || 'credit-card',
        pnr: bookingReference,
      };

      setCurrentBooking(booking);
      console.log('Booking object set in context:', booking);
      return booking;
    } catch (error) {
      console.error('Booking error:', error);
      return null;
    }
  };

  const calculateTotalAmount = (): number => {
    if (!selectedFlight) return 0;

    let total = selectedFlight.price * passengers.length;

    selectedSeats.forEach(seat => {
      if (seat.includes('A') || seat.includes('F')) {
        total += 25;
      } else if (seat.includes('C') || seat.includes('D')) {
        total += 15;
      }
    });

    return total;
  };

  const generatePNR = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const clearBooking = () => {
    setSearchFilters(null);
    setSelectedFlight(null);
    setPassengers([]);
    setSelectedSeats([]);
    setPaymentDetails(null);
    setCurrentBooking(null);
  };

  const value = {
    searchFilters,
    selectedFlight,
    passengers,
    selectedSeats,
    paymentDetails,
    currentBooking,
    setSearchFilters,
    setSelectedFlight,
    setPassengers,
    setSelectedSeats,
    setPaymentDetails,
    createBooking,
    clearBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  createBooking: (userId: string) => Booking;
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

  const createBooking = (userId: string): Booking => {
    if (!selectedFlight || passengers.length === 0) {
      throw new Error('Missing required booking information');
    }

    const booking: Booking = {
      id: Date.now().toString(),
      userId,
      flightId: selectedFlight.id,
      passengers,
      seats: selectedSeats,
      totalAmount: calculateTotalAmount(),
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      paymentMethod: paymentDetails?.method || 'credit-card',
      pnr: generatePNR(),
    };

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    setCurrentBooking(booking);
    return booking;
  };

  const calculateTotalAmount = (): number => {
    if (!selectedFlight) return 0;
    
    let total = selectedFlight.price * passengers.length;
    
    // Add seat selection fees if any
    selectedSeats.forEach(seat => {
      if (seat.includes('A') || seat.includes('F')) { // Window seats
        total += 25;
      } else if (seat.includes('C') || seat.includes('D')) { // Aisle seats
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
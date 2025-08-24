import React, { useState, useEffect } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { Seat } from '../types';

interface SeatSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ onNext, onBack }) => {
  const { selectedFlight, passengers, selectedSeats, setSelectedSeats } = useBooking();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [currentSeats, setCurrentSeats] = useState<string[]>(selectedSeats);

  useEffect(() => {
    // Generate seat map based on aircraft type
    if (selectedFlight) {
      const generatedSeats = generateSeatMap(selectedFlight.aircraft, selectedFlight.class);
      setSeats(generatedSeats);
    }
  }, [selectedFlight]);

  const generateSeatMap = (aircraft: string, flightClass: string): Seat[] => {
    const seats: Seat[] = [];
    let rows = 30;
    let seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];

    if (aircraft.includes('777')) {
      rows = 35;
      seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];
    } else if (aircraft.includes('737')) {
      rows = 25;
      seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];
    }

    for (let row = 1; row <= rows; row++) {
      for (const letter of seatsPerRow) {
        const seatNumber = `${row}${letter}`;
        const isWindow = letter === 'A' || letter === 'F' || letter === 'J';
        const isAisle = letter === 'C' || letter === 'D' || (seatsPerRow.length > 6 && (letter === 'G' || letter === 'H'));
        const position = isWindow ? 'window' : isAisle ? 'aisle' : 'middle';
        
        // Randomly make some seats unavailable
        const isAvailable = Math.random() > 0.3;
        
        let price = 0;
        if (isWindow) price = 25;
        else if (isAisle) price = 15;

        seats.push({
          id: seatNumber,
          seatNumber,
          class: flightClass as 'Economy' | 'Business' | 'First',
          isAvailable,
          price,
          position,
        });
      }
    }

    return seats;
  };

  const handleSeatClick = (seatNumber: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    const newSelectedSeats = [...currentSeats];
    const seatIndex = newSelectedSeats.indexOf(seatNumber);

    if (seatIndex > -1) {
      // Remove seat
      newSelectedSeats.splice(seatIndex, 1);
    } else if (newSelectedSeats.length < passengers.length) {
      // Add seat
      newSelectedSeats.push(seatNumber);
    }

    setCurrentSeats(newSelectedSeats);
  };

  const getSeatClass = (seat: Seat) => {
    let baseClass = 'w-8 h-8 m-1 rounded-t-lg border-2 cursor-pointer transition-colors text-xs flex items-center justify-center font-medium ';
    
    if (!seat.isAvailable) {
      baseClass += 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed ';
    } else if (currentSeats.includes(seat.seatNumber)) {
      baseClass += 'bg-primary-600 border-primary-700 text-white ';
    } else {
      baseClass += 'bg-white border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-300 ';
    }

    return baseClass;
  };

  const calculateTotalSeatFees = () => {
    return currentSeats.reduce((total, seatNumber) => {
      const seat = seats.find(s => s.seatNumber === seatNumber);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleContinue = () => {
    setSelectedSeats(currentSeats);
    onNext();
  };

  if (!selectedFlight) {
    return <div className="p-6">No flight selected</div>;
  }

  const seatRows = seats.reduce((acc, seat) => {
    const row = parseInt(seat.seatNumber);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as { [key: number]: Seat[] });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Seats</h2>
        <p className="text-gray-600">
          Choose {passengers.length} seat{passengers.length > 1 ? 's' : ''} for your flight
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Aircraft: {selectedFlight.aircraft}</h3>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-t mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-primary-600 border-2 border-primary-700 rounded-t mr-2"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded-t mr-2"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>

            {/* Seat Map */}
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {Object.entries(seatRows)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .slice(0, 20) // Show first 20 rows
                  .map(([rowNumber, rowSeats]) => (
                    <div key={rowNumber} className="flex items-center">
                      <div className="w-8 text-xs text-gray-500 text-center">{rowNumber}</div>
                      <div className="flex">
                        {rowSeats
                          .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber))
                          .map((seat, index) => (
                            <React.Fragment key={seat.id}>
                              <button
                                onClick={() => handleSeatClick(seat.seatNumber, seat.isAvailable)}
                                className={getSeatClass(seat)}
                                disabled={!seat.isAvailable}
                                title={`Seat ${seat.seatNumber} - ${seat.position} - ${seat.price > 0 ? `$${seat.price}` : 'Free'}`}
                              >
                                {seat.seatNumber.slice(-1)}
                              </button>
                              {/* Add aisle space */}
                              {(index === 2 || index === 5) && <div className="w-4"></div>}
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Selection Summary</h3>
            
            <div className="space-y-3 mb-6">
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {passenger.firstName} {passenger.lastName}
                  </span>
                  <span className="text-sm font-medium">
                    {currentSeats[index] || 'No seat selected'}
                  </span>
                </div>
              ))}
            </div>

            {currentSeats.length > 0 && (
              <div className="border-t pt-4 mb-6">
                <h4 className="font-medium mb-2">Seat Fees</h4>
                <div className="space-y-1 text-sm">
                  {currentSeats.map(seatNumber => {
                    const seat = seats.find(s => s.seatNumber === seatNumber);
                    return (
                      <div key={seatNumber} className="flex justify-between">
                        <span>Seat {seatNumber}</span>
                        <span>${seat?.price || 0}</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-1 font-medium flex justify-between">
                    <span>Total Seat Fees</span>
                    <span>${calculateTotalSeatFees()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              <p>• Window seats: +$25</p>
              <p>• Aisle seats: +$15</p>
              <p>• Middle seats: Free</p>
            </div>

            <div className="text-sm text-gray-500">
              Selected: {currentSeats.length} of {passengers.length} seats
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
          Back to Passengers
        </button>
        <button
          onClick={handleContinue}
          disabled={currentSeats.length !== passengers.length}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
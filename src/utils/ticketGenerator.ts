import { Booking, Flight, Passenger } from '../types';

export interface TicketData {
  booking: Booking;
  flight: Flight;
  passengers: Passenger[];
}

export const generateTicketPDF = (ticketData: TicketData): void => {
  const { booking, flight, passengers } = ticketData;
  
  // Create a new window for the ticket
  const ticketWindow = window.open('', '_blank', 'width=800,height=1000');
  
  if (!ticketWindow) {
    alert('Please allow popups to download your ticket');
    return;
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const ticketHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Ticket - ${booking.pnr}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .ticket-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .ticket-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        
        .ticket-header::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-top: 20px solid #1d4ed8;
        }
        
        .airline-logo {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .plane-icon {
          width: 40px;
          height: 40px;
          fill: currentColor;
        }
        
        .ticket-title {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }
        
        .pnr-code {
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 3px;
          margin-top: 10px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: inline-block;
        }
        
        .ticket-body {
          padding: 40px;
        }
        
        .flight-info {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          border: 2px solid #e2e8f0;
        }
        
        .flight-route {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 30px;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .airport {
          text-align: center;
        }
        
        .airport-code {
          font-size: 3rem;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .airport-name {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 10px;
        }
        
        .flight-time {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e293b;
        }
        
        .flight-date {
          color: #64748b;
          margin-top: 5px;
        }
        
        .flight-path {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #64748b;
        }
        
        .flight-duration {
          background: #2563eb;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .flight-line {
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, #2563eb, #64748b, #2563eb);
          position: relative;
        }
        
        .plane-indicator {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          background: #2563eb;
          border-radius: 50%;
        }
        
        .flight-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .detail-item {
          text-align: center;
        }
        
        .detail-label {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }
        
        .detail-value {
          font-weight: bold;
          color: #1e293b;
          font-size: 1.1rem;
        }
        
        .passengers-section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .passenger-list {
          display: grid;
          gap: 15px;
        }
        
        .passenger-item {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #2563eb;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 20px;
          align-items: center;
        }
        
        .passenger-name {
          font-weight: bold;
          color: #1e293b;
          font-size: 1.1rem;
        }
        
        .passenger-seat {
          background: #2563eb;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
        }
        
        .passenger-passport {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .payment-summary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 30px;
        }
        
        .payment-title {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .payment-amount {
          font-size: 2.5rem;
          font-weight: bold;
          text-align: center;
        }
        
        .payment-method {
          text-align: center;
          margin-top: 10px;
          opacity: 0.9;
        }
        
        .important-info {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .important-title {
          color: #92400e;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        
        .important-list {
          color: #92400e;
          line-height: 1.6;
        }
        
        .important-list li {
          margin-bottom: 5px;
        }
        
        .barcode {
          text-align: center;
          margin: 30px 0;
        }
        
        .barcode-lines {
          display: inline-block;
          background: repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 2px,
            #fff 2px,
            #fff 4px
          );
          height: 60px;
          width: 300px;
          margin-bottom: 10px;
        }
        
        .barcode-text {
          font-family: monospace;
          font-size: 1.2rem;
          letter-spacing: 2px;
          color: #64748b;
        }
        
        .footer {
          text-align: center;
          padding: 20px;
          background: #f8fafc;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        
        .print-button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          margin: 20px;
          transition: all 0.3s ease;
        }
        
        .print-button:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(37, 99, 235, 0.3);
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .print-button {
            display: none;
          }
          
          .ticket-container {
            box-shadow: none;
            max-width: none;
          }
        }
        
        @media (max-width: 768px) {
          .flight-route {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .flight-path {
            order: -1;
          }
          
          .airport-code {
            font-size: 2rem;
          }
          
          .passenger-item {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .flight-details {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="ticket-header">
          <div class="airline-logo">
            <svg class="plane-icon" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            International Airlines
          </div>
          <div class="ticket-title">Electronic Ticket</div>
          <div class="pnr-code">${booking.pnr}</div>
        </div>
        
        <div class="ticket-body">
          <div class="flight-info">
            <div class="flight-route">
              <div class="airport">
                <div class="airport-code">${flight.from.split('(')[1]?.replace(')', '') || 'DEP'}</div>
                <div class="airport-name">${flight.from.split('(')[0]?.trim() || flight.from}</div>
                <div class="flight-time">${formatTime(flight.departureTime)}</div>
                <div class="flight-date">${formatDate(flight.departureTime)}</div>
              </div>
              
              <div class="flight-path">
                <div class="flight-duration">${flight.duration}</div>
                <div class="flight-line">
                  <div class="plane-indicator"></div>
                </div>
              </div>
              
              <div class="airport">
                <div class="airport-code">${flight.to.split('(')[1]?.replace(')', '') || 'ARR'}</div>
                <div class="airport-name">${flight.to.split('(')[0]?.trim() || flight.to}</div>
                <div class="flight-time">${formatTime(flight.arrivalTime)}</div>
                <div class="flight-date">${formatDate(flight.arrivalTime)}</div>
              </div>
            </div>
            
            <div class="flight-details">
              <div class="detail-item">
                <div class="detail-label">Flight Number</div>
                <div class="detail-value">${flight.flightNumber}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Aircraft</div>
                <div class="detail-value">${flight.aircraft}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Class</div>
                <div class="detail-value">${flight.class}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value" style="color: #10b981;">Confirmed</div>
              </div>
            </div>
          </div>
          
          <div class="passengers-section">
            <h3 class="section-title">Passenger Details</h3>
            <div class="passenger-list">
              ${passengers.map((passenger, index) => `
                <div class="passenger-item">
                  <div>
                    <div class="passenger-name">${passenger.title} ${passenger.firstName} ${passenger.lastName}</div>
                    <div class="passenger-passport">Passport: ${passenger.passportNumber}</div>
                  </div>
                  <div class="passenger-seat">Seat ${booking.seats[index] || 'TBA'}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="payment-summary">
            <div class="payment-title">Payment Summary</div>
            <div class="payment-amount">$${booking.totalAmount.toFixed(2)}</div>
            <div class="payment-method">Paid via ${booking.paymentMethod.replace('-', ' ').toUpperCase()}</div>
          </div>
          
          <div class="important-info">
            <div class="important-title">Important Information</div>
            <ul class="important-list">
              <li>Please arrive at the airport at least 3 hours before international flights</li>
              <li>Ensure your passport is valid for at least 6 months from travel date</li>
              <li>Check-in opens 24 hours before departure</li>
              <li>Baggage allowance: 23kg checked, 7kg carry-on</li>
              <li>This is an electronic ticket. Please present this document and valid ID at check-in</li>
            </ul>
          </div>
          
          <div class="barcode">
            <div class="barcode-lines"></div>
            <div class="barcode-text">${booking.pnr}${booking.id}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing International Airlines</p>
          <p>For support, contact us at support@internationalairlines.com or +1-800-FLY-INTL</p>
          <p>Booking Date: ${formatDate(booking.bookingDate)}</p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px;">
        <button class="print-button" onclick="window.print()">Print Ticket</button>
        <button class="print-button" onclick="window.close()" style="background: #64748b; margin-left: 10px;">Close</button>
      </div>
    </body>
    </html>
  `;

  ticketWindow.document.write(ticketHTML);
  ticketWindow.document.close();
};
/*
  # Insert 20 Flight Records

  1. New Data
    - Insert 20 diverse international and domestic flights
    - Mix of different airlines
    - Various routes from Nepal to international destinations
    - Different dates, times, and prices
  
  2. Details
    - Includes flights to major Asian, European, and Middle Eastern cities
    - Realistic pricing and seat availability
    - Various aircraft types
*/

INSERT INTO flights (flight_number, airline, from_location, to_location, departure_time, arrival_time, price, available_seats, total_seats, status, aircraft_type) VALUES
('NA101', 'Nepal Airlines', 'Kathmandu (KTM)', 'Delhi (DEL)', '2025-11-01 06:00:00+00', '2025-11-01 08:30:00+00', 250, 120, 180, 'scheduled', 'Airbus A320'),
('QR302', 'Qatar Airways', 'Kathmandu (KTM)', 'Doha (DOH)', '2025-11-01 22:00:00+00', '2025-11-02 03:30:00+00', 650, 85, 300, 'scheduled', 'Boeing 777'),
('EK415', 'Emirates', 'Kathmandu (KTM)', 'Dubai (DXB)', '2025-11-02 14:30:00+00', '2025-11-02 20:00:00+00', 720, 92, 350, 'scheduled', 'Airbus A380'),
('TK506', 'Turkish Airlines', 'Kathmandu (KTM)', 'Istanbul (IST)', '2025-11-03 01:15:00+00', '2025-11-03 09:45:00+00', 850, 78, 280, 'scheduled', 'Boeing 787'),
('AI217', 'Air India', 'Kathmandu (KTM)', 'Mumbai (BOM)', '2025-11-03 09:00:00+00', '2025-11-03 12:30:00+00', 280, 95, 160, 'scheduled', 'Airbus A321'),
('SQ451', 'Singapore Airlines', 'Kathmandu (KTM)', 'Singapore (SIN)', '2025-11-04 16:20:00+00', '2025-11-05 02:50:00+00', 980, 68, 250, 'scheduled', 'Boeing 777-300'),
('TG320', 'Thai Airways', 'Kathmandu (KTM)', 'Bangkok (BKK)', '2025-11-04 11:30:00+00', '2025-11-04 17:00:00+00', 520, 110, 220, 'scheduled', 'Airbus A330'),
('CZ3067', 'China Southern', 'Kathmandu (KTM)', 'Guangzhou (CAN)', '2025-11-05 08:45:00+00', '2025-11-05 16:30:00+00', 680, 88, 290, 'scheduled', 'Boeing 787-9'),
('NA202', 'Nepal Airlines', 'Kathmandu (KTM)', 'Pokhara (PKR)', '2025-11-05 07:00:00+00', '2025-11-05 07:30:00+00', 120, 45, 72, 'scheduled', 'ATR 72'),
('9N301', 'Yeti Airlines', 'Kathmandu (KTM)', 'Lukla (LUA)', '2025-11-06 06:30:00+00', '2025-11-06 07:15:00+00', 180, 12, 18, 'scheduled', 'DHC-6 Twin Otter'),
('BA198', 'British Airways', 'Kathmandu (KTM)', 'London (LHR)', '2025-11-06 23:00:00+00', '2025-11-07 12:30:00+00', 1250, 72, 280, 'scheduled', 'Boeing 787-10'),
('KE696', 'Korean Air', 'Kathmandu (KTM)', 'Seoul (ICN)', '2025-11-07 15:40:00+00', '2025-11-08 06:20:00+00', 920, 65, 260, 'scheduled', 'Boeing 777-200'),
('MU757', 'China Eastern', 'Kathmandu (KTM)', 'Kunming (KMG)', '2025-11-07 10:15:00+00', '2025-11-07 16:00:00+00', 590, 98, 240, 'scheduled', 'Airbus A330-200'),
('NA103', 'Nepal Airlines', 'Kathmandu (KTM)', 'Bangalore (BLR)', '2025-11-08 12:00:00+00', '2025-11-08 15:30:00+00', 310, 102, 180, 'scheduled', 'Airbus A320'),
('FZ575', 'Flydubai', 'Kathmandu (KTM)', 'Dubai (DXB)', '2025-11-08 19:30:00+00', '2025-11-09 01:00:00+00', 580, 115, 189, 'scheduled', 'Boeing 737 MAX'),
('QR304', 'Qatar Airways', 'Delhi (DEL)', 'Kathmandu (KTM)', '2025-11-09 10:00:00+00', '2025-11-09 12:30:00+00', 270, 125, 180, 'scheduled', 'Airbus A320'),
('H9871', 'Himalaya Airlines', 'Kathmandu (KTM)', 'Kuala Lumpur (KUL)', '2025-11-09 21:00:00+00', '2025-11-10 05:30:00+00', 750, 82, 220, 'scheduled', 'Airbus A320neo'),
('AI218', 'Air India', 'Mumbai (BOM)', 'Kathmandu (KTM)', '2025-11-10 14:00:00+00', '2025-11-10 17:30:00+00', 290, 88, 160, 'scheduled', 'Airbus A321'),
('NA105', 'Nepal Airlines', 'Kathmandu (KTM)', 'Dhaka (DAC)', '2025-11-10 08:30:00+00', '2025-11-10 10:00:00+00', 220, 135, 180, 'scheduled', 'Airbus A320'),
('MA60', 'Malindo Air', 'Kathmandu (KTM)', 'Kuala Lumpur (KUL)', '2025-11-11 13:15:00+00', '2025-11-11 21:45:00+00', 710, 94, 210, 'scheduled', 'Boeing 737-900')
ON CONFLICT (flight_number) DO NOTHING;

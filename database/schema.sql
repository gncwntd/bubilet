-- Önce mevcut tabloları temizleyelim
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Routes (Güzergahlar) tablosu
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    departure_city VARCHAR(50) NOT NULL,
    arrival_city VARCHAR(50) NOT NULL,
    distance INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL
);

-- Vehicles (Araçlar) tablosu
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    model_year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);

-- Trips (Seferler) tablosu
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL
);

-- Users (Kullanıcılar) tablosu
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Seats (Koltuklar) tablosu
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id),
    seat_number INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    seat_type VARCHAR(20) NOT NULL,
    price_multiplier DECIMAL(3,2) DEFAULT 1.0
);

-- Reservations (Rezervasyonlar) tablosu
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    trip_id INTEGER REFERENCES trips(trip_id),
    seat_id INTEGER REFERENCES seats(seat_id),
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_tc_no VARCHAR(11) NOT NULL,
    passenger_phone VARCHAR(15) NOT NULL
);

-- Örnek veriler
INSERT INTO routes (departure_city, arrival_city, distance, estimated_duration) VALUES 
('İstanbul', 'Ankara', 450, 300),
('İzmir', 'İstanbul', 480, 360),
('Ankara', 'Antalya', 500, 420);

INSERT INTO vehicles (plate_number, vehicle_type, capacity, model_year) VALUES 
('34 ABC 123', '2+1 VIP', 31, 2023),
('06 XYZ 456', '2+2 Standard', 45, 2022),
('35 KLM 789', '2+1 Business', 31, 2023);

INSERT INTO trips (route_id, vehicle_id, departure_time, arrival_time, base_price, available_seats) VALUES 
(1, 1, '2024-04-20 10:00:00', '2024-04-20 15:00:00', 400.00, 31),
(2, 2, '2024-04-20 12:00:00', '2024-04-20 18:00:00', 350.00, 45),
(3, 3, '2024-04-20 14:00:00', '2024-04-20 21:00:00', 450.00, 31);
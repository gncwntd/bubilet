-- Önce tüm tabloları sil
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users tablosu
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes tablosu
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    departure_city VARCHAR(50) NOT NULL,
    arrival_city VARCHAR(50) NOT NULL,
    distance INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL
);

-- Vehicles tablosu
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    plate_number VARCHAR(10) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    seat_capacity INTEGER NOT NULL,
    wifi BOOLEAN DEFAULT false,
    usb BOOLEAN DEFAULT false
);

-- Trips tablosu
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL
);

-- Seats tablosu
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id),
    seat_number INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    seat_type VARCHAR(20) DEFAULT 'standard',
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    UNIQUE(trip_id, seat_number)
);

-- Reservations tablosu
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    trip_id INTEGER REFERENCES trips(trip_id),
    seat_id INTEGER REFERENCES seats(seat_id),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_tc_no VARCHAR(11) NOT NULL,
    passenger_phone VARCHAR(15) NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    payment_method VARCHAR(20) NOT NULL
); 
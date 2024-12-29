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
    plate_number VARCHAR(10) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    seat_capacity INTEGER NOT NULL,
    wifi BOOLEAN DEFAULT false,
    usb BOOLEAN DEFAULT false
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

-- Seats (Koltuklar) tablosu
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(trip_id),
    seat_number INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    seat_type VARCHAR(20) DEFAULT 'standard',
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    UNIQUE(trip_id, seat_number)
);

-- Reservations (Rezervasyonlar) tablosu
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

-- Örnek veriler
INSERT INTO routes (departure_city, arrival_city, distance, estimated_duration) VALUES
('İstanbul', 'Ankara', 450, 300),
('İstanbul', 'İzmir', 480, 360),
('Ankara', 'İzmir', 520, 420);

INSERT INTO vehicles (plate_number, vehicle_type, seat_capacity, wifi, usb) VALUES
('34ABC123', 'Mercedes Travego', 48, true, true),
('06XYZ789', 'MAN Fortuna', 44, true, true),
('35DEF456', 'Neoplan Starliner', 46, true, true);

-- Bugün ve yarın için örnek seferler
INSERT INTO trips (route_id, vehicle_id, departure_time, arrival_time, base_price, available_seats) VALUES
(1, 1, CURRENT_DATE + INTERVAL '10 hours', CURRENT_DATE + INTERVAL '15 hours', 350.00, 48),
(1, 2, CURRENT_DATE + INTERVAL '14 hours', CURRENT_DATE + INTERVAL '19 hours', 300.00, 44),
(2, 3, CURRENT_DATE + INTERVAL '9 hours', CURRENT_DATE + INTERVAL '15 hours', 400.00, 46),
(1, 1, CURRENT_DATE + INTERVAL '1 day 10 hours', CURRENT_DATE + INTERVAL '1 day 15 hours', 350.00, 48),
(2, 2, CURRENT_DATE + INTERVAL '1 day 14 hours', CURRENT_DATE + INTERVAL '1 day 19 hours', 300.00, 44);

-- Her sefer için koltukları oluştur
INSERT INTO seats (trip_id, seat_number, seat_type, price_multiplier)
SELECT t.trip_id, s.seat_number, 
    CASE 
        WHEN s.seat_number <= 8 THEN 'premium'
        ELSE 'standard'
    END,
    CASE 
        WHEN s.seat_number <= 8 THEN 1.20
        ELSE 1.00
    END
FROM trips t
CROSS JOIN generate_series(1, 
    (SELECT seat_capacity FROM vehicles v WHERE v.vehicle_id = t.vehicle_id)
) AS s(seat_number);

-- Stored Procedures ve Fonksiyonlar

-- Sefer arama fonksiyonu
CREATE OR REPLACE FUNCTION search_trips(
    p_departure_city VARCHAR,
    p_arrival_city VARCHAR,
    p_departure_date DATE
)
RETURNS TABLE (
    trip_id INTEGER,
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    base_price DECIMAL(10,2),
    available_seats INTEGER,
    departure_city VARCHAR,
    arrival_city VARCHAR,
    vehicle_type VARCHAR,
    wifi BOOLEAN,
    usb BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trip_id,
        t.departure_time,
        t.arrival_time,
        t.base_price,
        t.available_seats,
        r.departure_city,
        r.arrival_city,
        v.vehicle_type,
        v.wifi,
        v.usb
    FROM trips t
    JOIN routes r ON t.route_id = r.route_id
    JOIN vehicles v ON t.vehicle_id = v.vehicle_id
    WHERE r.departure_city = p_departure_city 
    AND r.arrival_city = p_arrival_city
    AND DATE(t.departure_time) = p_departure_date
    AND t.available_seats > 0
    ORDER BY t.departure_time;
END;
$$;

-- Koltuk listeleme fonksiyonu
CREATE OR REPLACE FUNCTION get_trip_seats(
    p_trip_id INTEGER
)
RETURNS TABLE (
    seat_id INTEGER,
    seat_number INTEGER,
    is_available BOOLEAN,
    seat_type VARCHAR,
    price_multiplier DECIMAL(3,2),
    base_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.seat_id,
        s.seat_number,
        s.is_available,
        s.seat_type,
        s.price_multiplier,
        t.base_price,
        ROUND(CAST(t.base_price * s.price_multiplier AS numeric), 2) as total_price
    FROM seats s
    JOIN trips t ON s.trip_id = t.trip_id
    WHERE s.trip_id = p_trip_id
    ORDER BY s.seat_number;
END;
$$;

-- Rezervasyon oluşturma stored procedure'ü
CREATE OR REPLACE PROCEDURE create_reservation(
    p_user_id INTEGER,
    p_trip_id INTEGER,
    p_seat_id INTEGER,
    p_passenger_name VARCHAR,
    p_passenger_tc_no VARCHAR,
    p_passenger_phone VARCHAR,
    p_payment_method VARCHAR,
    OUT p_reservation_id INTEGER,
    OUT p_error_message VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_amount DECIMAL(10,2);
    v_seat_available BOOLEAN;
    v_price_multiplier DECIMAL(3,2);
    v_base_price DECIMAL(10,2);
BEGIN
    -- Koltuğun müsait olup olmadığını kontrol et
    SELECT 
        s.is_available,
        s.price_multiplier,
        t.base_price
    INTO 
        v_seat_available,
        v_price_multiplier,
        v_base_price
    FROM seats s
    JOIN trips t ON s.trip_id = t.trip_id
    WHERE s.seat_id = p_seat_id
    FOR UPDATE;

    IF NOT FOUND OR NOT v_seat_available THEN
        p_error_message := 'Seçilen koltuk müsait değil';
        RETURN;
    END IF;

    -- Toplam tutarı hesapla
    v_total_amount := v_base_price * v_price_multiplier;

    -- Rezervasyonu oluştur
    INSERT INTO reservations (
        user_id,
        trip_id,
        seat_id,
        passenger_name,
        passenger_tc_no,
        passenger_phone,
        total_amount,
        payment_method
    )
    VALUES (
        p_user_id,
        p_trip_id,
        p_seat_id,
        p_passenger_name,
        p_passenger_tc_no,
        p_passenger_phone,
        v_total_amount,
        p_payment_method
    )
    RETURNING reservation_id INTO p_reservation_id;

    -- Koltuğu müsait değil olarak işaretle
    UPDATE seats 
    SET is_available = false 
    WHERE seat_id = p_seat_id;

    -- Trip'in available_seats sayısını güncelle
    UPDATE trips 
    SET available_seats = available_seats - 1 
    WHERE trip_id = p_trip_id;

    p_error_message := NULL;
END;
$$;

-- Rezervasyon iptal fonksiyonu
CREATE OR REPLACE PROCEDURE cancel_reservation(
    p_user_id INTEGER,
    p_reservation_id INTEGER,
    OUT p_error_message VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_seat_id INTEGER;
    v_trip_id INTEGER;
    v_reservation_user_id INTEGER;
    v_status VARCHAR;
BEGIN
    -- Rezervasyonu kontrol et
    SELECT 
        r.user_id,
        r.status,
        r.seat_id,
        r.trip_id
    INTO 
        v_reservation_user_id,
        v_status,
        v_seat_id,
        v_trip_id
    FROM reservations r
    WHERE r.reservation_id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        p_error_message := 'Rezervasyon bulunamadı';
        RETURN;
    END IF;

    IF v_status != 'active' THEN
        p_error_message := 'Rezervasyon zaten iptal edilmiş';
        RETURN;
    END IF;

    IF v_reservation_user_id != p_user_id THEN
        p_error_message := 'Bu işlem için yetkiniz yok';
        RETURN;
    END IF;

    -- Rezervasyonu iptal et
    UPDATE reservations 
    SET status = 'cancelled' 
    WHERE reservation_id = p_reservation_id;

    -- Koltuğu tekrar müsait yap
    UPDATE seats 
    SET is_available = true 
    WHERE seat_id = v_seat_id;

    -- Trip'in available_seats sayısını güncelle
    UPDATE trips 
    SET available_seats = available_seats + 1 
    WHERE trip_id = v_trip_id;

    p_error_message := NULL;
END;
$$; 
DROP PROCEDURE IF EXISTS make_reservation;

CREATE OR REPLACE PROCEDURE make_reservation(
    p_user_id INTEGER,
    p_trip_id INTEGER,
    p_seat_id INTEGER,
    p_passenger_name VARCHAR,
    p_passenger_tc_no VARCHAR,
    p_passenger_phone VARCHAR,
    p_payment_method VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_price DECIMAL(10,2);
    v_price_multiplier DECIMAL(3,2);
    v_total_amount DECIMAL(10,2);
    v_is_seat_available BOOLEAN;
BEGIN
    -- Koltuğun müsaitlik durumunu kontrol et
    SELECT is_available INTO v_is_seat_available
    FROM seats
    WHERE seat_id = p_seat_id;
    
    IF NOT v_is_seat_available THEN
        RAISE EXCEPTION 'Seçilen koltuk müsait değil';
    END IF;
    
    -- Fiyat hesaplama
    SELECT t.base_price, s.price_multiplier 
    INTO v_base_price, v_price_multiplier
    FROM trips t
    JOIN seats s ON s.trip_id = t.trip_id
    WHERE t.trip_id = p_trip_id AND s.seat_id = p_seat_id;
    
    IF v_base_price IS NULL OR v_price_multiplier IS NULL THEN
        RAISE EXCEPTION 'Fiyat bilgisi bulunamadı';
    END IF;
    
    -- Total amount hesaplama
    v_total_amount := v_base_price * v_price_multiplier;
    
    IF v_total_amount IS NULL OR v_total_amount <= 0 THEN
        RAISE EXCEPTION 'Geçersiz fiyat hesaplandı';
    END IF;
    
    -- Rezervasyon oluştur
    INSERT INTO reservations (
        user_id, trip_id, seat_id, total_amount, 
        payment_method, passenger_name, passenger_tc_no, passenger_phone,
        status
    )
    VALUES (
        p_user_id, p_trip_id, p_seat_id, v_total_amount,
        p_payment_method, p_passenger_name, p_passenger_tc_no, p_passenger_phone,
        'pending'
    );
    
    -- Koltuğu meşgul olarak işaretle
    UPDATE seats
    SET is_available = FALSE
    WHERE seat_id = p_seat_id;
    
    -- Mevcut koltuk sayısını güncelle
    UPDATE trips
    SET available_seats = available_seats - 1
    WHERE trip_id = p_trip_id;
END;
$$; 

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

-- Rezervasyon oluşturma fonksiyonu (procedure yerine function kullanalım)
CREATE OR REPLACE FUNCTION create_new_reservation(
    p_user_id INTEGER,
    p_trip_id INTEGER,
    p_seat_id INTEGER,
    p_passenger_name VARCHAR,
    p_passenger_tc_no VARCHAR,
    p_passenger_phone VARCHAR,
    p_payment_method VARCHAR
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_price DECIMAL(10,2);
    v_price_multiplier DECIMAL(3,2);
    v_total_amount DECIMAL(10,2);
    v_is_seat_available BOOLEAN;
    v_reservation_id INTEGER;
BEGIN
    -- Koltuğun müsaitlik durumunu kontrol et
    SELECT is_available INTO v_is_seat_available
    FROM seats
    WHERE seat_id = p_seat_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Koltuk bulunamadı';
    END IF;
    
    IF NOT v_is_seat_available THEN
        RAISE EXCEPTION 'Seçilen koltuk müsait değil';
    END IF;
    
    -- Fiyat hesaplama
    SELECT t.base_price, s.price_multiplier 
    INTO v_base_price, v_price_multiplier
    FROM trips t
    JOIN seats s ON s.trip_id = t.trip_id
    WHERE t.trip_id = p_trip_id AND s.seat_id = p_seat_id;
    
    IF v_base_price IS NULL OR v_price_multiplier IS NULL THEN
        RAISE EXCEPTION 'Fiyat bilgisi alınamadı';
    END IF;
    
    v_total_amount := v_base_price * v_price_multiplier;
    
    -- Rezervasyonu oluştur
    INSERT INTO reservations (
        user_id, trip_id, seat_id, passenger_name, 
        passenger_tc_no, passenger_phone, total_amount, 
        payment_method
    ) VALUES (
        p_user_id, p_trip_id, p_seat_id, p_passenger_name,
        p_passenger_tc_no, p_passenger_phone, v_total_amount,
        p_payment_method
    ) RETURNING reservation_id INTO v_reservation_id;
    
    -- Koltuğu rezerve et
    UPDATE seats 
    SET is_available = false 
    WHERE seat_id = p_seat_id;
    
    -- Trip'in available_seats sayısını güncelle
    UPDATE trips 
    SET available_seats = available_seats - 1 
    WHERE trip_id = p_trip_id;
    
    RETURN v_reservation_id;
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
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

-- Örnek kullanıcılar ekleyelim (password_hash kullanarak)
INSERT INTO users (username, email, password_hash, phone_number) VALUES
('testuser', 'test@example.com', '$2a$10$6jxRF4jMwUSH1bKGUC3Nh.iWvz1XBzuHgGVXk8Ko86zGqC4V6tPJO', '5551234567'),
('demo', 'demo@example.com', '$2a$10$6jxRF4jMwUSH1bKGUC3Nh.iWvz1XBzuHgGVXk8Ko86zGqC4V6tPJO', '5559876543'); 
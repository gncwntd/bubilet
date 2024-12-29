-- Rezervasyon durumu değişikliğini izleyen trigger
CREATE OR REPLACE FUNCTION handle_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Eğer rezervasyon iptal edilirse
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- Koltuğu tekrar müsait yap
        UPDATE seats
        SET is_available = TRUE
        WHERE seat_id = NEW.seat_id;
        
        -- Mevcut koltuk sayısını artır
        UPDATE trips
        SET available_seats = available_seats + 1
        WHERE trip_id = NEW.trip_id;
    END IF;
    
    -- Eğer rezervasyon onaylanırsa
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        -- Rezervasyon tarihini güncelle
        NEW.reservation_date = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservation_status_change
BEFORE UPDATE ON reservations
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION handle_reservation_status_change();

-- Yeni sefer eklendiğinde otomatik koltuk oluşturan trigger
CREATE OR REPLACE FUNCTION create_seats_for_new_trip()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity INTEGER;
    v_seat_number INTEGER;
    v_seat_type VARCHAR(20);
BEGIN
    -- Aracın kapasitesini al
    SELECT capacity INTO v_capacity
    FROM vehicles
    WHERE vehicle_id = NEW.vehicle_id;
    
    -- Her koltuk için döngü
    FOR v_seat_number IN 1..v_capacity LOOP
        -- Koltuk tipini belirle
        v_seat_type := CASE 
            WHEN v_seat_number % 4 = 0 THEN 'aisle'
            WHEN v_seat_number % 4 = 1 THEN 'window'
            ELSE 'middle'
        END;
        
        -- Koltuğu oluştur
        INSERT INTO seats (
            trip_id, seat_number, is_available, seat_type,
            price_multiplier
        )
        VALUES (
            NEW.trip_id, v_seat_number, TRUE, v_seat_type,
            CASE 
                WHEN v_seat_type = 'window' THEN 1.1
                WHEN v_seat_type = 'aisle' THEN 1.05
                ELSE 1.0
            END
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_trip_insert
AFTER INSERT ON trips
FOR EACH ROW
EXECUTE FUNCTION create_seats_for_new_trip();

-- Mevcut seferler için koltukları oluşturalım
DO $$
DECLARE
    v_trip RECORD;
    v_capacity INTEGER;
    v_seat_number INTEGER;
    v_seat_type VARCHAR(20);
BEGIN
    FOR v_trip IN SELECT t.trip_id, v.capacity, v.vehicle_id 
                  FROM trips t 
                  JOIN vehicles v ON t.vehicle_id = v.vehicle_id LOOP
        
        FOR v_seat_number IN 1..v_trip.capacity LOOP
            -- Koltuk tipini belirle
            v_seat_type := CASE 
                WHEN v_seat_number % 4 = 0 THEN 'aisle'
                WHEN v_seat_number % 4 = 1 THEN 'window'
                ELSE 'middle'
            END;
            
            -- Koltuğu oluştur
            INSERT INTO seats (
                trip_id, seat_number, is_available, seat_type,
                price_multiplier
            )
            VALUES (
                v_trip.trip_id, v_seat_number, TRUE, v_seat_type,
                CASE 
                    WHEN v_seat_type = 'window' THEN 1.1
                    WHEN v_seat_type = 'aisle' THEN 1.05
                    ELSE 1.0
                END
            );
        END LOOP;
    END LOOP;
END $$; 
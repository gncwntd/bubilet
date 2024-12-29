-- Belirli tarih aralığında ve güzergahta sefer arama fonksiyonu
CREATE OR REPLACE FUNCTION search_trips(
    p_departure_city VARCHAR,
    p_arrival_city VARCHAR,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS TABLE (
    trip_id INTEGER,
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    base_price DECIMAL(10,2),
    available_seats INTEGER,
    vehicle_type VARCHAR,
    route_distance INTEGER
) AS $$
DECLARE
    trip_cursor CURSOR FOR
        SELECT 
            t.trip_id,
            t.departure_time,
            t.arrival_time,
            t.base_price,
            t.available_seats,
            v.vehicle_type,
            r.distance
        FROM trips t
        JOIN routes r ON t.route_id = r.route_id
        JOIN vehicles v ON t.vehicle_id = v.vehicle_id
        WHERE r.departure_city = p_departure_city
        AND r.arrival_city = p_arrival_city
        AND t.departure_time BETWEEN p_start_date AND p_end_date
        AND t.available_seats > 0
        AND v.status = 'active'
        ORDER BY t.departure_time;
    
    trip_record RECORD;
BEGIN
    OPEN trip_cursor;
    
    LOOP
        FETCH trip_cursor INTO trip_record;
        EXIT WHEN NOT FOUND;
        
        trip_id := trip_record.trip_id;
        departure_time := trip_record.departure_time;
        arrival_time := trip_record.arrival_time;
        base_price := trip_record.base_price;
        available_seats := trip_record.available_seats;
        vehicle_type := trip_record.vehicle_type;
        route_distance := trip_record.distance;
        
        RETURN NEXT;
    END LOOP;
    
    CLOSE trip_cursor;
END;
$$ LANGUAGE plpgsql; 
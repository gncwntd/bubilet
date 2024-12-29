const pool = require('../config/database');

exports.createReservation = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { trip_id, seat_id, passenger_name, passenger_tc_no, passenger_phone, payment_method } = req.body;
        const user_id = req.user.userId;

        console.log('Reservation request:', {
            user_id,
            trip_id,
            seat_id,
            passenger_name,
            passenger_tc_no,
            passenger_phone,
            payment_method
        });

        const result = await client.query(
            `SELECT create_new_reservation($1, $2, $3, $4, $5, $6, $7) as reservation_id`,
            [
                parseInt(user_id),
                parseInt(trip_id),
                parseInt(seat_id),
                passenger_name,
                passenger_tc_no,
                passenger_phone,
                payment_method
            ]
        );

        const reservation_id = result.rows[0].reservation_id;

        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            data: {
                reservation_id: reservation_id
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Reservation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Rezervasyon oluşturulurken bir hata oluştu'
        });
    } finally {
        client.release();
    }
};

exports.getUserReservations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, t.departure_time, t.arrival_time,
            rt.departure_city, rt.arrival_city,
            s.seat_number
            FROM reservations r
            JOIN trips t ON r.trip_id = t.trip_id
            JOIN routes rt ON t.route_id = rt.route_id
            JOIN seats s ON r.seat_id = s.seat_id
            WHERE r.user_id = $1
            ORDER BY r.reservation_date DESC`,
            [req.user.userId]
        );
        
        // Decimal değerleri number'a çevir
        const reservations = result.rows.map(reservation => ({
            ...reservation,
            total_amount: parseFloat(reservation.total_amount)
        }));

        res.json({
            success: true,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rezervasyonlar yüklenirken bir hata oluştu'
        });
    }
};

exports.cancelReservation = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { reservation_id } = req.params;
        const user_id = req.user.userId;
        
        console.log('Cancel request:', { reservation_id, user_id }); // Debug için
        
        // Önce rezervasyonu kontrol et
        const checkResult = await client.query(
            'SELECT * FROM reservations WHERE reservation_id = $1 AND user_id = $2',
            [reservation_id, user_id]
        );
        
        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Rezervasyon bulunamadı'
            });
        }
        
        // Rezervasyonu iptal et
        await client.query(
            'UPDATE reservations SET status = $1 WHERE reservation_id = $2 AND user_id = $3',
            ['cancelled', reservation_id, user_id]
        );
        
        // Koltuğu tekrar müsait yap
        await client.query(
            'UPDATE seats SET is_available = true WHERE seat_id = $1',
            [checkResult.rows[0].seat_id]
        );
        
        // Trip'in available_seats sayısını güncelle
        await client.query(
            'UPDATE trips SET available_seats = available_seats + 1 WHERE trip_id = $1',
            [checkResult.rows[0].trip_id]
        );

        await client.query('COMMIT');
        
        res.json({
            success: true,
            message: 'Rezervasyon başarıyla iptal edildi'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Cancel reservation error:', error); // Debug için
        res.status(500).json({
            success: false,
            message: 'Rezervasyon iptal edilirken bir hata oluştu'
        });
    } finally {
        client.release();
    }
}; 
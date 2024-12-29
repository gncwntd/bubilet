const pool = require('../config/database');

exports.searchTrips = async (req, res) => {
    try {
        const { departure_city, arrival_city, departure_date } = req.query;
        
        console.log('Search params:', { departure_city, arrival_city, departure_date });
        
        const result = await pool.query(
            'SELECT * FROM search_trips($1, $2, $3)',
            [departure_city, arrival_city, departure_date]
        );
        
        console.log('Query result:', result.rows);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Search trips error:', error);
        res.status(500).json({
            success: false,
            message: 'Seferler yüklenirken bir hata oluştu'
        });
    }
};

exports.getSeats = async (req, res) => {
    try {
        const { trip_id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM get_trip_seats($1)',
            [trip_id]
        );
        
        // Decimal değerleri number'a çevir
        const seats = result.rows.map(seat => ({
            ...seat,
            base_price: parseFloat(seat.base_price),
            price_multiplier: parseFloat(seat.price_multiplier),
            total_price: parseFloat(seat.total_price)
        }));

        res.json({
            success: true,
            data: seats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Koltuk bilgileri yüklenirken bir hata oluştu'
        });
    }
}; 
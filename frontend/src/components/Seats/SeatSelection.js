import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Box, 
    Grid, 
    Button, 
    Typography, 
    Paper,
    Alert,
    Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LoadingSpinner from '../common/LoadingSpinner';

const SeatSelection = () => {
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { trip_id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await axios.get(`/trips/${trip_id}/seats`);
                setSeats(response.data.data);
                setLoading(false);
            } catch (error) {
                setError('Koltuk bilgileri yüklenirken bir hata oluştu');
                setLoading(false);
            }
        };

        fetchSeats();
    }, [trip_id]);

    const handleSeatClick = (seat) => {
        if (!seat.is_available) return;
        setSelectedSeat(selectedSeat?.seat_id === seat.seat_id ? null : seat);
    };

    const handleContinue = () => {
        if (!selectedSeat) return;
        if (!user) {
            navigate('/login', { 
                state: { 
                    redirectTo: `/trips/${trip_id}/seats`,
                    message: 'Rezervasyon yapmak için lütfen giriş yapın.'
                }
            });
            return;
        }
        navigate(`/reservation/new`, {
            state: {
                trip_id,
                seat: selectedSeat
            }
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Koltuk Seçimi
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={1} justifyContent="center">
                        {seats.map((seat) => (
                            <Grid item key={seat.seat_id}>
                                <Tooltip title={`Koltuk ${seat.seat_number} - ${seat.seat_type === 'premium' ? 'Premium' : 'Standart'} - ${(seat.total_price).toFixed(2)} ₺`}>
                                    <span>
                                        <Button
                                            variant={selectedSeat?.seat_id === seat.seat_id ? "contained" : "outlined"}
                                            color={seat.is_available ? "primary" : "error"}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={!seat.is_available}
                                            sx={{
                                                minWidth: 'auto',
                                                width: 40,
                                                height: 40,
                                                m: 0.5,
                                                backgroundColor: seat.seat_type === 'premium' ? '#ffd700' : 'inherit'
                                            }}
                                        >
                                            <EventSeatIcon />
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Seçilen Koltuk: {selectedSeat ? `${selectedSeat.seat_number} (${selectedSeat.total_price.toFixed(2)} ₺)` : 'Seçilmedi'}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleContinue}
                            disabled={!selectedSeat}
                        >
                            Devam Et
                        </Button>
                    </Box>
                </Paper>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        * Premium koltuklar sarı renk ile gösterilmiştir
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        * Kırmızı koltuklar dolu koltuklardır
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default SeatSelection; 
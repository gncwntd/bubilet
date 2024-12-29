import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Grid,
    Alert,
    Divider
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import dayjs from 'dayjs';
import LoadingSpinner from '../common/LoadingSpinner';

const TripList = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                console.log('Fetching trips with params:', location.search);
                
                const response = await axios.get(`/trips/search${location.search}`);
                
                console.log('API response:', response.data);
                
                if (response.data.success) {
                    setTrips(response.data.data);
                } else {
                    setError('Veriler alınamadı');
                }
            } catch (error) {
                console.error('Fetch trips error:', error);
                setError(error.response?.data?.message || 'Seferler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        if (location.search) {
            fetchTrips();
        } else {
            setLoading(false);
        }
    }, [location.search]);

    const handleSelectSeats = (tripId) => {
        navigate(`/trips/${tripId}/seats`);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {searchParams.get('departure_city')} - {searchParams.get('arrival_city')}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {dayjs(searchParams.get('departure_date')).format('DD MMMM YYYY')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {trips.length === 0 ? (
                    <Alert severity="info">
                        Bu tarih için sefer bulunamadı.
                    </Alert>
                ) : (
                    <Grid container spacing={2}>
                        {trips.map((trip) => (
                            <Grid item xs={12} key={trip.trip_id}>
                                <Card>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={3}>
                                                <Box display="flex" alignItems="center">
                                                    <DirectionsBusIcon sx={{ mr: 1 }} />
                                                    <Typography variant="h6">
                                                        {new Date(trip.departure_time).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            
                                            <Grid item xs={12} md={3}>
                                                <Box display="flex" alignItems="center">
                                                    <AccessTimeIcon sx={{ mr: 1 }} />
                                                    <Typography>
                                                        {Math.round((new Date(trip.arrival_time) - new Date(trip.departure_time)) / (1000 * 60))} dk
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            
                                            <Grid item xs={12} md={3}>
                                                <Box display="flex" alignItems="center">
                                                    <EventSeatIcon sx={{ mr: 1 }} />
                                                    <Typography>
                                                        {trip.available_seats} koltuk
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            
                                            <Grid item xs={12} md={3}>
                                                <Box display="flex" flexDirection="column" alignItems="flex-end">
                                                    <Typography variant="h6" color="primary">
                                                        {trip.base_price} ₺
                                                    </Typography>
                                                    <Button 
                                                        variant="contained" 
                                                        onClick={() => handleSelectSeats(trip.trip_id)}
                                                        disabled={trip.available_seats === 0}
                                                    >
                                                        {trip.available_seats === 0 ? 'Dolu' : 'Koltuk Seç'}
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default TripList; 
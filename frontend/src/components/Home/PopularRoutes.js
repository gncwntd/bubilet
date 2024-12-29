import React from 'react';
import { 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    Button,
    Box,
    Grow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const popularRoutes = [
    {
        departure: 'İstanbul',
        arrival: 'Ankara',
        price: '300',
        duration: '5 saat'
    },
    {
        departure: 'İstanbul',
        arrival: 'İzmir',
        price: '400',
        duration: '6 saat'
    },
    {
        departure: 'Ankara',
        arrival: 'İzmir',
        price: '350',
        duration: '7 saat'
    }
];

const PopularRoutes = () => {
    const navigate = useNavigate();

    const handleRouteClick = (departure, arrival) => {
        const searchParams = new URLSearchParams({
            departure_city: departure,
            arrival_city: arrival,
            departure_date: dayjs().format('YYYY-MM-DD')
        });
        
        navigate(`/trips?${searchParams.toString()}`);
    };

    return (
        <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom align="center">
                Popüler Rotalar
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {popularRoutes.map((route, index) => (
                    <Grow 
                        in={true} 
                        timeout={(index + 1) * 500}
                        key={index}
                    >
                        <Grid item xs={12} md={4} key={index}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <DirectionsBusIcon sx={{ mr: 1 }} color="primary" />
                                        <Typography variant="h6">
                                            {route.departure} - {route.arrival}
                                        </Typography>
                                    </Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Süre: {route.duration}
                                    </Typography>
                                    <Typography color="primary" variant="h6" gutterBottom>
                                        {route.price} ₺'den başlayan fiyatlarla
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        fullWidth
                                        onClick={() => handleRouteClick(route.departure, route.arrival)}
                                    >
                                        Bilet Bul
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grow>
                ))}
            </Grid>
        </Box>
    );
};

export default PopularRoutes; 
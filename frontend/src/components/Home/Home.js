import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import SearchForm from '../Search/SearchForm';
import PopularRoutes from './PopularRoutes';

const Home = () => {
    return (
        <Container>
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Otobüs Bileti Bul
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Türkiye'nin her yerine güvenli ve konforlu yolculuk
                </Typography>
                <SearchForm />
                <PopularRoutes />
            </Box>
        </Container>
    );
};

export default Home; 
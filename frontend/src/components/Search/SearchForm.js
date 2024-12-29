import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    Grid,
    Autocomplete,
    Fade
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

const cities = [
    'İstanbul',
    'Ankara',
    'İzmir',
    'Bursa',
    'Antalya',
    'Adana',
    'Konya',
    'Gaziantep',
    'Mersin',
    'Diyarbakır'
];

const SearchForm = () => {
    const [formData, setFormData] = useState({
        departure_city: null,
        arrival_city: null,
        departure_date: dayjs()
    });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.departure_city || !formData.arrival_city) {
            return;
        }
        
        const searchParams = new URLSearchParams({
            departure_city: formData.departure_city,
            arrival_city: formData.arrival_city,
            departure_date: formData.departure_date.format('YYYY-MM-DD')
        });
        
        navigate(`/trips?${searchParams.toString()}`);
    };

    return (
        <Fade in={true} timeout={800}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={cities}
                            value={formData.departure_city}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    departure_city: newValue
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    label="Nereden"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={cities}
                            value={formData.arrival_city}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    arrival_city: newValue
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    label="Nereye"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                            <DatePicker
                                label="Tarih"
                                value={formData.departure_date}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        departure_date: newValue
                                    }));
                                }}
                                minDate={dayjs()}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        required: true,
                                        fullWidth: true
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3 }}
                >
                    Bilet Bul
                </Button>
            </Box>
        </Fade>
    );
};

export default SearchForm; 
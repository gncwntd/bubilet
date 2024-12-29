import React, { useState } from 'react';
import { 
    Container, 
    Box, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Fade
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    passenger_name: Yup.string()
        .required('Yolcu adı soyadı gereklidir')
        .min(3, 'En az 3 karakter olmalıdır')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Sadece harf kullanılabilir'),
    passenger_tc_no: Yup.string()
        .required('T.C. Kimlik No gereklidir')
        .matches(/^[0-9]{11}$/, 'Geçerli bir T.C. Kimlik No giriniz'),
    passenger_phone: Yup.string()
        .required('Telefon numarası gereklidir')
        .matches(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz (5XX...)')
        .test('starts-with-5', 'Telefon numarası 5 ile başlamalıdır', 
            value => value && value.startsWith('5')),
    payment_method: Yup.string()
        .required('Ödeme yöntemi seçiniz')
});

const ReservationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { trip_id, seat } = location.state || {};
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            passenger_name: '',
            passenger_tc_no: '',
            passenger_phone: '',
            payment_method: 'credit_card'
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await axios.post('/reservations', {
                    trip_id,
                    seat_id: seat.seat_id,
                    ...values
                });
                
                navigate('/my-reservations', {
                    state: { message: 'Rezervasyonunuz başarıyla oluşturuldu' }
                });
            } catch (error) {
                setError(error.response?.data?.message || 'Rezervasyon oluşturulurken bir hata oluştu');
            }
        }
    });

    if (!trip_id || !seat) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    Geçersiz rezervasyon bilgileri
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Rezervasyon Bilgileri
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Fade in={true} timeout={800}>
                    <Paper sx={{ p: 3 }}>
                        <Box component="form" onSubmit={formik.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ 
                                        p: 2, 
                                        bgcolor: 'primary.light', 
                                        borderRadius: 1,
                                        color: 'white'
                                    }}>
                                        <Typography variant="subtitle1">
                                            Seçilen Koltuk: {seat.seat_number}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            Toplam Ücret: {seat.total_price.toFixed(2)} ₺
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Yolcu Adı Soyadı"
                                        name="passenger_name"
                                        value={formik.values.passenger_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.passenger_name && Boolean(formik.errors.passenger_name)}
                                        helperText={formik.touched.passenger_name && formik.errors.passenger_name}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="T.C. Kimlik No"
                                        name="passenger_tc_no"
                                        value={formik.values.passenger_tc_no}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.passenger_tc_no && Boolean(formik.errors.passenger_tc_no)}
                                        helperText={formik.touched.passenger_tc_no && formik.errors.passenger_tc_no}
                                        inputProps={{ maxLength: 11 }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Telefon Numarası"
                                        name="passenger_phone"
                                        value={formik.values.passenger_phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.passenger_phone && Boolean(formik.errors.passenger_phone)}
                                        helperText={formik.touched.passenger_phone && formik.errors.passenger_phone}
                                        inputProps={{ maxLength: 10 }}
                                        placeholder="5XX..."
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth error={formik.touched.payment_method && Boolean(formik.errors.payment_method)}>
                                        <InputLabel>Ödeme Yöntemi</InputLabel>
                                        <Select
                                            name="payment_method"
                                            value={formik.values.payment_method}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            label="Ödeme Yöntemi"
                                        >
                                            <MenuItem value="credit_card">Kredi Kartı</MenuItem>
                                            <MenuItem value="debit_card">Banka Kartı</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{ mt: 2 }}
                                        disabled={!formik.isValid || formik.isSubmitting}
                                    >
                                        Rezervasyonu Tamamla
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
};

export default ReservationForm; 
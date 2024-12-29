import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from '../../utils/axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    username: Yup.string()
        .required('Kullanıcı adı gereklidir')
        .min(3, 'En az 3 karakter olmalıdır')
        .max(50, 'En fazla 50 karakter olmalıdır'),
    email: Yup.string()
        .required('E-posta adresi gereklidir')
        .email('Geçerli bir e-posta adresi giriniz'),
    password: Yup.string()
        .required('Şifre gereklidir')
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .matches(/[a-zA-Z]/, 'Şifre en az bir harf içermelidir'),
    phone_number: Yup.string()
        .required('Telefon numarası gereklidir')
        .matches(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz')
});

const Register = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            phone_number: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await axios.post('/auth/register', values);
                navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
            } catch (error) {
                setError(error.response?.data?.message || 'Kayıt olurken bir hata oluştu');
            }
        }
    });

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Kayıt Ol
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Kullanıcı Adı"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="email"
                        label="E-posta Adresi"
                        name="email"
                        autoComplete="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Şifre"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        name="phone_number"
                        label="Telefon Numarası"
                        id="phone_number"
                        autoComplete="tel"
                        value={formik.values.phone_number}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                        helperText={formik.touched.phone_number && formik.errors.phone_number}
                        inputProps={{ maxLength: 10 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Kayıt Ol
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/login"
                        fullWidth
                        sx={{ mt: 1 }}
                    >
                        Zaten hesabınız var mı? Giriş yapın
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Register; 
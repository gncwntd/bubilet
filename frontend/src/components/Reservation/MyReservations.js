import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Box, 
    Paper, 
    Typography, 
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import LoadingSpinner from '../common/LoadingSpinner';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelDialog, setCancelDialog] = useState({ open: false, reservation: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const location = useLocation();
    const successMessage = location.state?.message;

    const fetchReservations = async () => {
        try {
            const response = await axios.get('/reservations/my');
            setReservations(response.data.data);
            setError('');
        } catch (error) {
            setError('Rezervasyonlar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleCancelClick = (reservation) => {
        setCancelDialog({ open: true, reservation });
    };

    const handleCancelConfirm = async () => {
        try {
            const reservationId = cancelDialog.reservation.reservation_id;
            console.log('Cancelling reservation:', reservationId);
            
            const response = await axios.post(`/reservations/${reservationId}/cancel`);
            
            if (response.data.success) {
                await fetchReservations();
                setSnackbar({
                    open: true,
                    message: 'Rezervasyon başarıyla iptal edildi',
                    severity: 'success'
                });
                setCancelDialog({ open: false, reservation: null });
            }
        } catch (error) {
            console.error('Cancel error:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Rezervasyon iptal edilirken bir hata oluştu',
                severity: 'error'
            });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Rezervasyonlarım
                </Typography>

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {reservations.length === 0 ? (
                    <Alert severity="info">
                        Henüz bir rezervasyonunuz bulunmuyor.
                    </Alert>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rezervasyon Tarihi</TableCell>
                                    <TableCell>Güzergah</TableCell>
                                    <TableCell>Sefer Tarihi</TableCell>
                                    <TableCell>Koltuk No</TableCell>
                                    <TableCell>Yolcu</TableCell>
                                    <TableCell>Tutar</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell>İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reservations.map((reservation) => (
                                    <TableRow key={reservation.reservation_id}>
                                        <TableCell>
                                            {new Date(reservation.reservation_date).toLocaleDateString('tr-TR')}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.departure_city} - {reservation.arrival_city}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(reservation.departure_time).toLocaleDateString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.seat_number}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.passenger_name}
                                        </TableCell>
                                        <TableCell>
                                            {reservation.total_amount.toFixed(2)} ₺
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={reservation.status === 'active' ? 'Aktif' : 'İptal'}
                                                color={reservation.status === 'active' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {reservation.status === 'active' && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleCancelClick(reservation)}
                                                >
                                                    İptal Et
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbar.message}
                />

                <Dialog
                    open={cancelDialog.open}
                    onClose={() => setCancelDialog({ open: false, reservation: null })}
                >
                    <DialogTitle>Rezervasyon İptali</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bu rezervasyonu iptal etmek istediğinizden emin misiniz?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCancelDialog({ open: false, reservation: null })}>
                            Vazgeç
                        </Button>
                        <Button onClick={handleCancelConfirm} color="error">
                            İptal Et
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default MyReservations; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import TripList from './components/Search/TripList';
import SeatSelection from './components/Seats/SeatSelection';
import ReservationForm from './components/Reservation/ReservationForm';
import MyReservations from './components/Reservation/MyReservations';

function App() {
    return (
        <AuthProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/trips" element={<TripList />} />
                            <Route path="/trips/:trip_id/seats" element={<SeatSelection />} />
                            <Route path="/reservation/new" element={<ReservationForm />} />
                            <Route path="/my-reservations" element={<MyReservations />} />
                        </Routes>
                    </Router>
                </ThemeProvider>
            </LocalizationProvider>
        </AuthProvider>
    );
}

export default App;

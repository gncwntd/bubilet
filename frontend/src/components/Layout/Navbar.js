import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component={RouterLink} 
                    to="/" 
                    sx={{ 
                        flexGrow: 1, 
                        textDecoration: 'none',
                        color: 'inherit' 
                    }}
                >
                    BuBilet
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {user ? (
                        // Kullanıcı giriş yapmışsa
                        <>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/my-reservations"
                            >
                                Rezervasyonlarım
                            </Button>
                            <Button 
                                color="inherit"
                                onClick={logout}
                            >
                                Çıkış Yap
                            </Button>
                        </>
                    ) : (
                        // Kullanıcı giriş yapmamışsa
                        <>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/login"
                            >
                                Giriş Yap
                            </Button>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/register"
                            >
                                Kayıt Ol
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 
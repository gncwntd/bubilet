import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0'
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2'
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            dark: '#1b5e20'
        },
        error: {
            main: '#d32f2f',
            light: '#ef5350',
            dark: '#c62828'
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100'
        },
        info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b'
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff'
        }
    },
    typography: {
        fontFamily: [
            'Roboto',
            'Arial',
            'sans-serif'
        ].join(','),
        h4: {
            fontWeight: 600
        },
        h5: {
            fontWeight: 500
        },
        h6: {
            fontWeight: 500
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12
                }
            }
        }
    }
});

export default theme; 
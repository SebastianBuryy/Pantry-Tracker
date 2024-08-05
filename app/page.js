'use client';

import { Box, Typography, Button, TextField, Stack, LinearProgress, createTheme, ThemeProvider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

import Features from './components/features';
import Footer from './components/footer';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobileHeight = useMediaQuery('(max-height:800px)');

  return (
    <>
        <Box
          sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              width: '100vw',
              padding: isMobile ? '20px' : '40px',
              textAlign: 'center',
              marginBottom: isMobile ? '20px' : '0px',
              marginTop: isMobileHeight ? '-60px' : {xs: '-180px' , sm: '-150px'},
          }}
        >
          
          <Typography variant={isMobile ? 'h4' : 'h2'} color='white' fontWeight='bold' gutterBottom sx={{ textShadow: '0 0 20px white' }}>
            Welcome to Pantry Tracker
          </Typography>
          <Typography variant={isMobile ? 'body1' : 'h5'} color='white' maxWidth='1000px' gutterBottom sx={{ textShadow: '0px 1px 6px gray', marginBottom: 5 }}>
              Your ultimate solution for managing pantry items efficiently! With Pantry Tracker, you can minimize food waste, save money, and unleash your culinary creativity by discovering new recipes tailored to the ingredients you have at home.
          </Typography>
          {/* <Typography variant={isMobile ? 'body1' : 'h6'} color='white' maxWidth='1000px' paragraph sx={{ textShadow: '0px 1px 6px gray', marginBottom: '30px' }}>
              Join our community of food lovers and home cooks who are taking control of their kitchens. Start tracking your inventory today and never let good food go to waste again!
          </Typography> */}
          <hr style={{ width: '100%', maxWidth: '1000px', border: '2px solid white', marginBottom: '20px' }} />
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight='bold' color='white' sx={{ textShadow: '0 1px 5px gray'}} gutterBottom>
              Sign in to get started!
          </Typography>
          <Button
            href="/login"
            variant="contained"
            type="submit"
            sx={{
                backgroundColor: '#3DED97',
                color: 'white',
                height: '40px',
                width: '160px',
                '&:hover': {
                    backgroundColor: '#3DED97',
                    boxShadow: '0 0 20px white',
                }
            }}
           >
            SIGN IN
           </Button>
          <hr style={{ width: '100%', maxWidth: '1000px', border: '2px solid white', marginBottom: '0px', marginTop: '30px' }} />
        </Box>
      <Features />
      <Footer />
    </>
  );
};
import {Box, Typography, Link } from '@mui/material';

export default function Footer() {
    return (
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'transparent',
          color: 'white',
          padding: '20px 0',
          textAlign: 'center',
          marginTop: '40px',
        }}
      >
        <Typography variant="body1" gutterBottom sx={{ color: 'black', fontWeight: 'bold', textShadow: '0px 1px 8px rgba(0, 0, 0, 0.3)' }}>
          Pantry Tracker
        </Typography>
        <Typography variant="body2" gutterBottom color="black">
          © {new Date().getFullYear()} Sebastian Bury. All rights reserved.
        </Typography>
      </Box>
    );
  }
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';

// Create a custom styled button to remove hover effect
const CustomButton = styled(Button)({
  '&:hover': {
    backgroundColor: 'transparent', // Remove the background color change on hover
    boxShadow: 'none', // Remove the box shadow on hover
    color: 'white',
    textShadow: '0 0 15px white', // Add text shadow on hover
  },
  textDecoration: 'none',
});

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
    
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar 
      position="static"
      sx={{ 
        backgroundColor: 'transparent',
        boxShadow: '0 0 20px white', 
        zIndex: '20',
        height: '60px',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
              <Link href="/">
                <img src="/images/pantrywhite.png" alt="Pantry Tracker Logo" style={{ height: '45px', width: '45px', marginRight: '10px', textDecoration: 'none' }} />
              </Link>
              <Typography component="div" sx={{ fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>
                Pantry Tracker
              </Typography>
            </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
            <CustomButton
              onClick={handleSignOut}
              sx={{ color: 'white', textTransform: 'none', fontSize: '20px', fontWeight: 'bold', textDecoration: 'none' }}
            >
              Sign Out
            </CustomButton>
          ) : (
            <Link href="/login" passHref>
              <CustomButton sx={{ color: 'white', textTransform: 'none', fontSize: '20px', fontWeight: 'bold', textDecoration: 'none' }}>
                Sign in
              </CustomButton>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
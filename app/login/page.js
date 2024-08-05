'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { auth, googleProvider } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      {'Sebastian Bury '} 
      {new Date().getFullYear()}
      .
    </Typography>
  );
}

export default function SignIn() {

  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User successfully signed in!', user);
      if (user) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('User successfully signed in with Google!', user);
      if (user) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error.message);
    }
  };

  return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px',
            backgroundColor: 'whitesmoke',
            border: '1px solid #3DED97', 
            borderRadius: '25px', 
            boxShadow: '0 0 30px #3DED97',
            marginBottom: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#3DED97' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email&nbsp;Address"
              name="email"
              autoComplete="email"
              autoFocus
            InputLabelProps={{
              sx: {
                color: 'black',
                '&.Mui-focused': {
                  color: 'black',
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'grey',
                },
                '&:hover fieldset': {
                  borderColor: 'black',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3DED97',
                  boxShadow: '0 0 10px #3DED97',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'black',
              },
              '& .MuiInputLabel-shrink': {
                color: 'black',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: 'black !important',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-root': {
                color: 'black !important',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-shrink': {
                color: 'black !important',
              },
            }}
          />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              InputLabelProps={{
                sx: {
                  color: 'black',
                  '&.Mui-focused': {
                    color: 'black',
                  },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'grey',
                  },
                  '&:hover fieldset': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3DED97',
                    boxShadow: '0 0 10px #3DED97',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'black',
                },
                '& .MuiInputLabel-shrink': {
                  color: 'black',
                },
                '& .Mui-focused .MuiInputLabel-root': {
                  color: 'black !important',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-root': {
                  color: 'black !important',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-shrink': {
                  color: 'black !important',
                },
              }}
            />
            {error && (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#3DED97', color: 'white', '&:hover': { backgroundColor: '#3DED97', boxShadow: '0 0 15px #3DED97',} }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGoogleSignIn}
              sx={{
                mt: 1,
                mb: 2,
                backgroundColor: '#DB4437',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#DB4437',
                  boxShadow: '0 0 15px #DB4437',
                },
              }}
            >
              Sign In with Google
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
               <Typography variant="body1">
                  {`Don't have an account?`}
               </Typography>
               <Button
                   href="/register"
                   variant="text"
                   sx={{
                       color: '#3DED97',
                       textDecoration: 'none',
                       fontWeight: 'bold',
                       '&:hover': {
                           backgroundColor: 'transparent',
                           boxShadow: 'none',
                           textShadow: '0 0 15px #3DED97',
                       }
                   }}
               >Sign Up
               </Button>
               </Box>
            </Box>
        </Box>
        <Copyright sx={{ mt: '-50px', mb: 4 }} />
      </Container>
  );
}
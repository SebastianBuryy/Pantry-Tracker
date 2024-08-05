import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import Tilt from 'react-parallax-tilt';

const items = [
  {
    icon: <InventoryRoundedIcon />,
    title: 'Inventory Management',
    description:
      'Easily keep track of your pantry items in one organised location. Add, remove, and update items, ensuring you never run out of essentials.',
  },
  {
    icon: <MenuBookRoundedIcon />,
    title: 'Tasty Recipe Suggestions',
    description:
      'Discover new recipes based on the ingredients already in your pantry. Get creative with your cooking and reduce food waste.',
  },
  {
    icon: <NotificationsActiveRoundedIcon />,
    title: 'Expiration Alerts',
    description:
      'Receive notifications when items are about to expire, so you can plan your shopping trip ahead of time and never waste groceries again!',
  },
  {
    icon: <PaidRoundedIcon />,
    title: 'Reduce Expenses',
    description:
      'Save money by avoiding unnecessary purchases and making the most of the ingredients you already have in your pantry.',
  },
  {
    icon: <RecyclingRoundedIcon />,
    title: 'Environmentally Friendly',
    description:
      'Join our mission to combat food waste! Our tracker promotes sustainable eating habits by ensuring you utilise ingredients before they spoil.',
  },
  {
    icon: <RestaurantRoundedIcon />,
    title: 'Culinary Exploration',
    description:
      'Experiment with new dishes and ingredients, and broaden your culinary horizons with our diverse range of recipes.',
  },
];

export default function Features() {

  const isMobileHeight = useMediaQuery('(max-height:800px)');

  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'black',
        bgcolor: 'transparent',
        mt: isMobileHeight ? '-150px' : {xs: '-260px' , sm: '-390px'},
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography 
            component="h2"
            variant="h4"
            fontWeight="bold"
            color="white"
            gutterBottom
            sx={{
              textShadow: '0 1px 5px gray',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            Features 
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', textShadow: '0px 1px 6px gray', textAlign: 'center'}}>
            Our platform prioritises user-friendliness, offering a wide range of features
            to elevate your cooking and food management experience with
            precision in every detail.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Tilt>
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'white',
                  background: 'transparent',
                  backgroundColor: 'white',
                  boxShadow: '0 0 12px #3DED97',
                }}
              >
                <Box sx={{ color: '#3DED97', opacity: '70%' }}>{item.icon}</Box>
                <div>
                  <Typography fontWeight="medium" color="black" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'black' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
              </Tilt>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
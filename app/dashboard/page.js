'use client';

import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  IconButton,
  Collapse,
  InputAdornment,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import theme from "../theme.js";
import { auth, firestore } from '@/firebase';
import { collection, doc, getDocs, setDoc, getDoc, deleteDoc, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { format } from 'date-fns';
import Footer from '../components/footer';

import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {xs: 350 , sm: 400},
  bgcolor: 'white',
  border: '1px solid #3DED97',
  boxShadow: '0px 0px 30px #3DED97',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  borderRadius: 4,
};

export default function Dashboard() {

  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [price, setPrice] = useState(''); 
  const [count, setCount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  const [expiringItems, setExpiringItems] = useState([]);

  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/login'); // Redirect if no user is logged in
    } else {
      updatePantry();
    }
  }, [user]);

  const updatePantry = async () => {
    if (!user) return;

    const userPantryRef = collection(firestore, 'users', user.uid, 'pantry');
    const snapshot = query(userPantryRef);
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()});
    });
    console.log(pantryList);
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  // Create a unique ID for each item
  const createItemId = (name, expirationDate, price) => {
    return `${name}-${expirationDate}-${price}`;
  };

  const addItem = async (item, expirationDate, price, count) => {
    if (!user) return;

    const itemId = createItemId(item, expirationDate, price);
    const docRef = doc(collection(firestore, 'users', user.uid, 'pantry'), itemId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingCount = docSnap.data().count || 0;
      await setDoc(docRef, {count: existingCount + parseInt(count), expirationDate, price}, {merge: true});
    } else {
      await setDoc(docRef, {count: parseInt(count), expirationDate, price});
    }
    await updatePantry();
  };

  const incrementItem = async (itemId) => {
    if (!user) return;

    const docRef = doc(collection(firestore, 'users', user.uid, 'pantry'), itemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const count = data.count || 0;
      const expirationDate = data.expirationDate || ''; // Default to empty if undefined
      const price = data.price || ''; // Default to empty if undefined
      await setDoc(docRef, { count: count + 1, expirationDate, price }, { merge: true });
      await updatePantry();
    }
  };

  const removeItem = async (itemId) => {
    if (!user) return;

    const docRef = doc(collection(firestore, 'users', user.uid, 'pantry'), itemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const {count} = data;

      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        const expirationDate = data.expirationDate || ''; // Default to empty if undefined
        const price = data.price || ''; // Default to empty if undefined
        await setDoc(docRef, {count: count - 1, expirationDate, price}, {merge: true});
      }
    }
    await updatePantry();
  };

  // Function to check for expiring items
  const checkExpiration = async () => {
    const today = new Date();
    const expiringSoon = pantry.filter(({expirationDate}) => {
      if (!expirationDate) return false;

      const expiration = new Date(expirationDate);
      const diffTime = Math.abs(expiration - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    });
    
    setExpiringItems(expiringSoon.map(item => item.name));
  };

  useEffect(() => {
    checkExpiration();
  }, [pantry]);

  // Helper function to safely parse dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'N/A' : format(date, 'dd-MM-yyyy');
  };

  const filteredPantry = pantry.filter(({name}) => name.toLowerCase().includes(searchQuery.toLowerCase()));

  // GEMINI API FETCH
  // const fetchRecipes = async () => {
  //   setLoadingRecipes(true); // Show a loading indicator
  //   const ingredientList = pantry.map((item) => item.name.split('-')[0]).join(', '); // Create a string of ingredients
  //   try {
  //     const response = await axios.post('http://localhost:5000/generate-recipes', { ingredients: ingredientList.split(',') });
  
  //     console.log("API Response Data:", response.data); // Log API response for debugging
  
  //     setRecipes(response.data.recipes); // Store the fetched recipes
  //   } catch (error) {
  //     console.error("Error fetching recipes:", error);
  //   } finally {
  //     setLoadingRecipes(false); // Hide the loading indicator
  //   }
  // };

  // EDAMAM API FETCH
  const fetchRecipes = async (start = 0, count = 5) => {
    setLoadingRecipes(true); // Show a loading indicator

    const appId = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;
    const appKey = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY;

    const ingredientList = pantry.map((item) => item.name.split('-')[0]).join(','); // Create a string of ingredients
    const apiUrl = `https://api.edamam.com/search?q=${ingredientList}&app_id=${appId}&app_key=${appKey}&from=${start}&to=${start + count}`;

    try {
      const response = await axios.get(apiUrl);

      console.log("API Response Data:", response.data); // Log API response for debugging

      const recipesData = response.data.hits.map((hit) => ({
        title: hit.recipe.label,
        ingredients: hit.recipe.ingredientLines,
        recipeLink: hit.recipe.url,
        imageLink: hit.recipe.image,
        calories: hit.recipe.calories.toFixed(2), // Total calories
        dietLabels: hit.recipe.dietLabels.join(", "),
        healthLabels: hit.recipe.healthLabels.join(", "),
        totalTime: hit.recipe.totalTime,
        yield: hit.recipe.yield,
        cuisineType: hit.recipe.cuisineType.join(", "),
        nutrients: {
          fat: hit.recipe.totalNutrients.FAT ? hit.recipe.totalNutrients.FAT.quantity.toFixed(2) : 'N/A',
          carbs: hit.recipe.totalNutrients.CHOCDF ? hit.recipe.totalNutrients.CHOCDF.quantity.toFixed(2) : 'N/A',
          protein: hit.recipe.totalNutrients.PROCNT ? hit.recipe.totalNutrients.PROCNT.quantity.toFixed(2) : 'N/A',
        }
      }));

      setRecipes(recipesData); // Store the fetched recipes
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoadingRecipes(false); // Hide the loading indicator
    }
  };

  useEffect(() => {
    if (pantry.length > 0) {
      fetchRecipes(); // Fetch recipes after pantry is updated
    }
  }, [pantry]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 3,
        marginTop: 10,
        padding: 0,
      }}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
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
              id="expiration-date"
              label="Expiration Date"
              variant="outlined"
              fullWidth
              type="date"
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'black',
                  '&.Mui-focused': {
                    color: 'black',
                  },
                },
              }}
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
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
              id="item-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'black',
                  '&.Mui-focused': {
                    color: 'black',
                  },
                },
              }}
              value={count}
              onChange={(e) => setCount(e.target.value)}
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
              id="item-price"
              label="Price"
              variant="outlined"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                sx: {
                  color: 'black',
                  '&.Mui-focused': {
                    color: 'black',
                  },
                },
              }}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
                  '& input': {
                    color: 'black !important', // Ensure text color is black
                    '&:focus': {
                      color: 'black !important', // Override focus color
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'black !important',
                },
                '& .MuiInputLabel-shrink': {
                  color: 'black !important',
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
            <Button 
              variant="contained"
              onClick={() => {
                addItem(itemName, expirationDate, price, count);
                setItemName('');
                setExpirationDate('');
                setCount('');
                setPrice('');
                handleClose();
              }}
              sx={{
                backgroundColor: '#3DED97',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#3DED97', 
                  boxShadow: '0 0 15px #3DED97',
                } 
              }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Stack
        width="100%"
        maxWidth={{ xs: '350px', sm: '1000px' }}
        justifyContent="center"
        direction="row"
        spacing={2}
        alignItems="center"
        marginBottom={2}
      >
        <IconButton
          onClick={() => setSearchOpen(!searchOpen)}
          size="large"
          sx={{
            boxShadow: '0 0 20px white',
            color: '#3DED97',
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'white',
              boxShadow: '0 0 15px grey',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <SearchIcon />
        </IconButton>
        <Collapse in={searchOpen} orientation="horizontal" timeout="auto">
          <TextField
            id="search-bar"
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            InputProps={{
              sx: {
                color: 'white',
                '&.Mui-focused': {
                  color: 'white',
                },
              },
            }}
            sx={{
              minWidth: { xs: '100%', sm: '250px' }, // Responsive width
              transition: 'min-width 0.3s ease-in-out',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                  boxShadow: '0 0 8px white',
                },
                '& input': {
                  color: 'white !important', // Ensure text color is black
                  '&:focus': {
                    color: 'white !important', // Override focus color
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white !important',
              },
              '& .MuiInputLabel-shrink': {
                color: 'white !important',
              },
              '& .Mui-focused .MuiInputLabel-root': {
                color: 'white !important',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-root': {
                color: 'white !important',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiInputLabel-shrink': {
                color: 'white !important',
              },
            }}
          />
        </Collapse>

        <Button 
          variant="contained"
          size="large"
          startIcon={<PlaylistAddIcon />}
          onClick={handleOpen}
          sx={{
            backgroundColor: 'white',
            color: '#3DED97',
            boxShadow: '0 0 20px white',
            '&:hover': { 
              backgroundColor: 'white', 
              boxShadow: '0 0 15px grey',
            }
          }}
        >
          Add Item
        </Button>
      </Stack>
      <Card
        sx={{
          width: '90%',
          maxWidth: '1000px',
          borderRadius: 3,
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          maxHeight: '600px',
        }}
      >
        <Box
          bgcolor="#3DED97"
          display="flex"
          justifyContent="center"
          alignItems="center"
          padding={2}
          borderRadius="inherit"
          sx={{
            boxShadow: '0 0 10px #3DED97',
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
          }}
        >
          <Typography 
            variant="h4" 
            color="white"
            textAlign="center"
            fontWeight="bold"
            sx={{
              textShadow: '0 0 20px white',
            }}
          >
            Pantry Items
          </Typography>
        </Box>
        <Stack
          maxHeight="600px"
          spacing={1}
          padding={2}
        >
          {filteredPantry.map(({name, count, expirationDate, price}) => (
            <Card
              key={name}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease-in-out',
                minHeight: {xs: '200px', sm: '0px'},
                '&:hover': {
                  boxShadow: '0 0 15px #3DED97',
                },
                marginBottom: 1,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  padding: 2,
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <Typography
                      variant="h6"
                      color="textPrimary"
                      fontSize={{ xs: '0.875rem', sm: '1rem' }}
                      fontWeight="bold"
                      textAlign="center"
                    >
                      {name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography
                      variant="body1"
                      color="black"
                      fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                      textAlign="center"
                    >
                      Quantity: {count}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography
                      variant="body1"
                      color="black"
                      fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                      textAlign="center"
                    >
                      Expiration: {formatDate(expirationDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography
                      variant="body1"
                      color="black"
                      fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                      textAlign="center"
                    >
                      Price: €{price}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} display="flex" justifyContent="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton aria-label="add" onClick={() => incrementItem(name)} sx={{color: 'primary.main'}}>
                        <AddCircleIcon />
                      </IconButton>
                      <IconButton aria-label="delete" onClick={() => removeItem(name)} sx={{color: 'red'}}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
              {expiringItems.includes(name) && (
                  <Typography variant="body2" color="red" sx={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                    ⚠️ This item is expiring soon!
                  </Typography>
                )}
            </Card>
          ))}
        </Stack>
      </Card>
      
      <Card
        sx={{
          width: '90%',
          maxWidth: '1000px',
          borderRadius: 3,
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
          marginTop: 4,
          maxHeight: '600px',
          overflowY: 'auto',
          paddingBottom: '20px',
          marginBottom: 2,
        }}
      >
        <Box
          bgcolor="#3DED97"
          display="flex"
          justifyContent="center"
          alignItems="center"
          padding={2}
          borderRadius="inherit"
          sx={{
            boxShadow: '0 0 10px #3DED97',
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            color="white"
            textAlign="center"
            fontWeight="bold"
            sx={{
              textShadow: '0 0 20px white',
            }}
          >
            Recipe Suggestions
          </Typography>
        </Box>
        <Stack spacing={2} padding={3}>
          {loadingRecipes ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : (
            recipes.map((recipe, index) => (
              <Card
                key={index}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 0 15px #3DED97',
                  },
                  display: 'flex',
                  padding: 2,
                }}
              >
                <Box sx={{ flex: '0 0 auto', marginRight: 2 }}>
                  <img src={recipe.imageLink} alt={recipe.title} style={{ width: '100px', height: '100px', borderRadius: 8, marginTop: 20, }} />
                </Box>
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <Typography variant="h6" color="textPrimary" fontWeight="bold">
                    {recipe.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Cuisine:</strong> {recipe.cuisineType.charAt(0).toUpperCase() + recipe.cuisineType.slice(1) || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                    <strong>Calories:</strong> {recipe.calories} kcal
                  </Typography>
                  <ul style={{ paddingLeft: '20px', marginBottom: '0.5rem'}}>
                    <li style={{ fontSize: '0.9rem', color: '#555' }}>Protein: {recipe.nutrients.protein} g</li>
                    <li style={{ fontSize: '0.9rem', color: '#555' }}>Carbs: {recipe.nutrients.carbs} g</li>
                    <li style={{ fontSize: '0.9rem', color: '#555' }}>Fat: {recipe.nutrients.fat} g</li>
                  </ul>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Diet:</strong> {recipe.dietLabels || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Health:</strong> {recipe.healthLabels || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Time:</strong> {recipe.totalTime ? `${recipe.totalTime} min` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Servings:</strong> {recipe.yield || 'N/A'}
                  </Typography>
                  <a
                    href={recipe.recipeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', marginTop: '20px', display: 'inline-block', backgroundColor: '#3DED97', padding: '8px', borderRadius: '5px' }}
                  >
                    View Full Recipe
                  </a>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Card>
      <Footer />
    </Box>
  );
}
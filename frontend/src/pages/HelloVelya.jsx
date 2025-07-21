import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';
import authService from '../services/authService';

const Dashboard = ({ token, onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getMe(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        onLogout();
        navigate('/login');
      }
    };

    if (token) {
      fetchUser();
    } else {
      navigate('/login');
    }
  }, [token, navigate, onLogout]);

  return (
    <Container component="main" maxWidth="md">
      <Typography component="h1" variant="h4" sx={{ mt: 4, mb: 4 }}>
        Hello Velya
      </Typography>
      {user && (
        <>
          <Typography variant="h6">Welcome, {user.fname} {user.lname}!</Typography>
    
      
           <Button 
            variant="contained"
            color="secondary"
            sx={{ mt: 3 }}
            onClick={onLogout}
          >
            Logout
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, ml: 2 }}
            onClick={() => navigate('/home')} 
          >
            Commencer 
          </Button>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
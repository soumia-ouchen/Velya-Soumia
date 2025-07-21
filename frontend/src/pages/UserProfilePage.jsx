import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Button, 
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import authService from '../services/authService';
import { UserAvatar, UserInfo } from '../components/UserProfile';

const UserProfilePage = ({ token }) => {
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError('');
        
        const userData = userId 
          ? await authService.getUserById(token, userId)
          : await authService.getMe(token);
        
        if (!userData) {
          throw new Error('Utilisateur non trouvé');
        }
        
        setUser(userData);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement du profil');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      navigate('/login', { state: { from: `/profile${userId ? `/${userId}` : ''}` } });
    }
  }, [token, navigate, userId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Retour à laccueil
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }} className='bg-gray-50 dark:bg-black rounded-lg text-gray-900 dark:text-white'>
      {user ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
          }}className='bg-gray-50 dark:bg-black rounded-lg text-gray-900 dark:text-white'
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'flex-start'
          }}
            className='bg-gray-50 dark:bg-black rounded-lg text-gray-900 dark:text-white'>
            {/* Avatar Section */}
            <Box sx={{ 
              width: { xs: '100%', md: '30%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <UserAvatar 
                user={user} 
                size={150}
                sx={{
                  border: theme.palette.mode === 'dark' ? '2px solid #64FF07' : '2px solid #1976d2'
                }}
              />
              

            </Box>
            
            {/* Info Section */}
            <Box sx={{ 
              width: { xs: '100%', md: '70%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              color: theme.palette.text.primary
            }}>
              <UserInfo user={user} />
              
              <Divider 
                sx={{ 
                  my: 2,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                }} 
              />
              
            </Box>
          </Box>
        </Paper>
      ) : (
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ 
            mt: 4,
            color: theme.palette.text.primary
          }}
        >
          Aucune donnée utilisateur disponible
        </Typography>
      )}
    </Container>
  );
};

export default UserProfilePage;
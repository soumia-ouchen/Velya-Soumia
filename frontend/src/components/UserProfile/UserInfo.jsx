import { Box, Typography, Divider, Chip, useTheme } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';

const UserInfo = ({ user }) => {
  const theme = useTheme();

  if (!user) {
    return (
      <Box className="mb-16 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800" sx={{ mb: 4 }}>
        <Typography className="text-red-600 dark:text-red-400" color="error">Aucune information utilisateur disponible</Typography>
      </Box>
    );
  }

  return (
    <Box className="mb-16 p-6 bg-white dark:bg-black rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700" sx={{ mb: 4 }}>
      <Typography 
        variant="h6" 
        gutterBottom
        className="font-bold text-white dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2"
        sx={{ color: theme.palette.text.primary }}
      >
        Informations personnelles
      </Typography>
      <Divider 
        className="border-gray-200 dark:border-gray-600 mb-8"
        sx={{ 
          mb: 2,
          borderColor: theme.palette.mode === 'dark' ? 
            'rgba(0, 0, 0, 0.12)' : 
            'rgba(0, 0, 0, 0.12)'
        }} 
      />
      
      <Box className="flex items-center mb-4 p-3 bg-white dark:bg-black rounded-lg" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <EmailIcon 
          className="mr-3 text-blue-600 dark:text-green-400"
          sx={{ 
            mr: 1,
            color: theme.palette.mode === 'dark' ? 'black' : theme.palette.primary.main
          }} 
        />
        <Typography variant="body1" className="text-gray-800 dark:text-gray-200 font-medium" sx={{ color: theme.palette.text.primary }}>
          {user.email || 'Non spécifié'}
        </Typography>
      </Box>
      
      <Chip
        icon={user.isVerified ? <VerifiedIcon /> : <PendingIcon />}
        label={user.isVerified ? 'Email vérifié' : 'Email non vérifié'}
        color={user.isVerified ? 'success' : 'warning'}
        className={`mt-4 px-4 py-2 font-semibold ${user.isVerified
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
          }`}
        sx={{ 
          mt: 1,
          backgroundColor: theme.palette.mode === 'dark' && !user.isVerified ? 
            'rgba(255, 193, 7, 0.16)' : undefined,
          color: theme.palette.mode === 'dark' ? 
            (user.isVerified ? '#64FF07' : theme.palette.warning.light) : 
            undefined
        }}
      />
    </Box>
  );
};

export default UserInfo;
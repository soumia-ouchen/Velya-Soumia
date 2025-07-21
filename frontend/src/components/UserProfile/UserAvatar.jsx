import { Avatar, Box, Typography, useTheme } from '@mui/material';

const UserAvatar = ({ user, size = 120 }) => {
  const theme = useTheme();
  
  const initials = user?.fname ?
    `${user.fname.charAt(0)}` : '?';
  const displayName = user?.lname && user?.fname ? 
    `${user.lname} ${user.fname}` : 'Utilisateur inconnu';
  const joinDate = user?.createdAt ? 
    new Date(user.createdAt).toLocaleDateString() : 'Date inconnue';

  return (
    <Box
      className="flex flex-col items-center mb-16 bg-white dark:bg-black rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4 
      }}
    >
      <Avatar
        className="border-2 border-blue-600 dark:border-green-400 mb-8 shadow-lg dark:shadow-green-400/20"
        sx={{ 
          zIndex: 1,
          width: size, 
          height: size, 
          fontSize: size * 0.4,
          bgcolor: theme.palette.mode === 'dark' ? '#64FF07' : theme.palette.primary.main,
          color: theme.palette.mode === 'dark' ? theme.palette.getContrastText('#64FF07') : '#fff',
          mb: 2,
          border: theme.palette.mode === 'dark' ? 
            '2px solid rgba(100, 255, 7, 0.5)' : 
            '2px solid ' + theme.palette.primary.dark
        }}
      >
        {initials}
      </Avatar>
      <Typography 
        variant="h5"
        className="text-gray-900 dark:text-white font-bold text-center"
        sx={{ 
          color: theme.palette.text.primary,
          textAlign: 'center'
        }}
      >
        {displayName}
      </Typography>
      <Typography 
        variant="body2"
        className="text-gray-600 dark:text-gray-300 text-center"
        sx={{ 
          color: theme.palette.mode === 'dark' ? 
            'rgb(255, 255, 255)' : 
            theme.palette.text.secondary
        }}
      >
        Membre depuis {joinDate}
      </Typography>
    </Box>
  );
};

export default UserAvatar;
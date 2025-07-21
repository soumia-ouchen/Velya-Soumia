import { useState } from 'react';
import {  useLocation } from 'react-router-dom';
import {  Typography, Link } from '@mui/material';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';

const ResetPassword = () => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      await authService.resetPassword(token || values.token, values.password);
      setSuccess(true);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Reset failed');
    }
  };

  return (
  <>
      {success ? (
        <>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Password has been reset successfully.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link href="/login">Login with your new password</Link>
          </Typography>
        </>
      ) : (
        <>
          <AuthForm
            type="resetPassword"
            onSubmit={handleSubmit}
            serverError={serverError}
            initialValues={{ token: token || '' }}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link href="/login">Back to login</Link>
          </Typography>
        </>
      )}
    </>
  );
};

export default ResetPassword;
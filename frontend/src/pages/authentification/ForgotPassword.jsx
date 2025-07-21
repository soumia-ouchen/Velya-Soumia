import { useState } from 'react';
import {  Typography, Link } from '@mui/material';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Request failed');
    }
  };

  return (
   <>
      {success ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Password reset link has been sent to your email.
        </Typography>
      ) : (
        <>
          <AuthForm
            type="forgotPassword"
            onSubmit={handleSubmit}
            serverError={serverError}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Remember your password? <Link href="/login">Login here</Link>
          </Typography>
        </>
      )}
      </>
  );
};

export default ForgotPassword;
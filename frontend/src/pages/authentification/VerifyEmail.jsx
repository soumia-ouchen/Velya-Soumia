import { useState } from 'react';
import {  useLocation } from 'react-router-dom';
import {  Typography, Link } from '@mui/material';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';
import Button from '../../components/common/Button';

const VerifyEmail = () => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      await authService.verifyEmail(token || values.token);
      setSuccess(true);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <>
      {success ? (
        <>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Email verified successfully.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Button
              href="/login"
              title="Login to your account"
            />
          </Typography>
        </>
      ) : (
        <>
          <AuthForm
            type="verifyEmail"
            onSubmit={handleSubmit}
            serverError={serverError}
            initialValues={{ token: token || '' }}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link href="/login">Back to login</Link>
          </Typography>
        </>
      )}
    </>);
};

export default VerifyEmail;
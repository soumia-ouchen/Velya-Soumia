/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';

const Register = () => {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      
      await authService.register(values);
      navigate('/email-verification-sent');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
    }
  };

  return <AuthForm type="register" onSubmit={handleSubmit} serverError={serverError} />;
};

export default Register;*/ 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';

const Register = () => {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      await authService.register(values);
      navigate('/email-verification-sent');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
    }
  };

  return <AuthForm type="register" onSubmit={handleSubmit} serverError={serverError} />;
};

export default Register;

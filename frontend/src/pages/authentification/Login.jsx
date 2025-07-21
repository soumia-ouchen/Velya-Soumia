/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';

const Login = ({ onLogin }) => {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      const response = await authService.login(values);
      console.log('Response from authService.login:',response);
      
      onLogin(response.token,response.user);
      navigate('/profile');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Login failed');
    }
  };

  return <AuthForm type="login" onSubmit={handleSubmit} serverError={serverError} />;
};

export default Login;*/
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/authentification/AuthForm';
import authService from '../../services/authService';

const Login = ({ onLogin }) => {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setServerError('');
      const response = await authService.login(values);
      console.log('Response from login:', response);
      onLogin(response.token, response.user);
      navigate('/profile');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Login failed');
    }
  };

  return <AuthForm type="login" onSubmit={handleSubmit} serverError={serverError} />;
};

export default Login;

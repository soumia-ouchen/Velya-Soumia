import api from './api';

export const getCategories = async () => {
    const response = await api.get('/products/categories');
    return response.data;
  };
  
  export const getColors = async () => {
    const response = await api.get('/products/colors');
    return response.data;
  };
  
  export const getSizes = async () => {
    const response = await api.get('/products/sizes');
    return response.data;
  };
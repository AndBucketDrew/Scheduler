// Imports
import axios from 'axios';

// Utility function to make API requests with customizable options
const fetchAPI = (options = {}) => {

  const defaultConfig = {
    method: 'get',
    timeout: 5000, 
    data: {}, 
    url: '/', 
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  };
  
  // Convert data object to URL-encoded form format
  const formData = new URLSearchParams(options.data).toString();
  // console.log('formData indexJs', formData); 
  
  // Merge default config with provided options and set headers for auth
  const axiosConfig = {
    ...defaultConfig,
    ...options,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', 
      ...(options.token ? { Authorization: 'Bearer ' + options.token } : {}), 
    },
    data: formData, 
  };
  
  // Execute the API request using axios
  return axios(axiosConfig);
};

export { fetchAPI };
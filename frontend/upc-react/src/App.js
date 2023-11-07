import React, { useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ApplicationForm from './Components/ApplicationForm';
import { CENTRAL_SERVER_URL } from './Tools/api.js';


function App() {
  useEffect(() => {
    // Register the service
    const registerService = async () => {
      try {
        const response = await axios.post(`${CENTRAL_SERVER_URL}/frontend/register-service`, {
          name: 'React Frontend Service',
          url: window.location.origin,
        });
        console.log('Service registered:', response.data);
      } catch (error) {
        console.error('Failed to register service:', error);
      }
    };

    // Unregister the service
    const unregisterService = async () => {
      try {
        const response = await axios.delete(`${CENTRAL_SERVER_URL}/frontend/unregister-service`, {
          data: { url: window.location.origin },
        });
        console.log('Service unregistered:', response.data);
      } catch (error) {
        console.error('Failed to unregister service:', error);
      }
    };

    registerService();

    // Cleanup function to unregister service
    return () => {
      unregisterService();
    };
  }, []);

  return (
    <div className="App">
      <ApplicationForm />
    </div>
  );
}

export default App;

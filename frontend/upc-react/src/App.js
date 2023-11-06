import React, { useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ApplicationForm from './Components/ApplicationForm';

const CENTRAL_SERVER_REGISTRATION_URL = 'http://localhost:4000/frontend/register-service';
const CENTRAL_SERVER_UNREGISTRATION_URL = 'http://localhost:4000/frontend/unregister-service';

function App() {
  useEffect(() => {
    // Register the service
    const registerService = async () => {
      try {
        const response = await axios.post(CENTRAL_SERVER_REGISTRATION_URL, {
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
        const response = await axios.delete(CENTRAL_SERVER_UNREGISTRATION_URL, {
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

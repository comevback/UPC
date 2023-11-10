import React, { useEffect } from 'react';
import './App.css';
import ApplicationForm from './Components/ApplicationForm';
import { registerService, unregisterService } from './Tools/api.js';


function App() {
  useEffect(() => {
    // Register the service
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

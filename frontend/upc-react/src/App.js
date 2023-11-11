import React, { useEffect } from 'react';
import './App.css';
import ApplicationForm from './Components/ApplicationForm';
import { registerService, unregisterService } from './Tools/api.js';
import { ParaProvider } from './Global.js';


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
      <ParaProvider>
        <ApplicationForm />
      </ParaProvider>
    </div>
  );
}

export default App;

import React, { useContext, useEffect } from 'react';
import './App.css';
import Application from './Components/Application';
import { registerService, unregisterService, sendHeartbeat } from './Tools/api.js';
import { ParaProvider } from './Global.js';
import { ParaContext } from './Global.js';


function App() {
  const { CENTRAL_SERVER_URL } = useContext(ParaContext);

  useEffect(() => {
    console.log('app is being rendered');
    // Register the service
    registerService(CENTRAL_SERVER_URL);

    setInterval(() => {
      sendHeartbeat(CENTRAL_SERVER_URL);
    } , 60000);
    // Cleanup function to unregister service
    return () => {
      unregisterService(CENTRAL_SERVER_URL);
    };
  }, []);

  return (
    <div className="App">
      <ParaProvider>
        <Application />
      </ParaProvider>
    </div>
  );
}

export default App;

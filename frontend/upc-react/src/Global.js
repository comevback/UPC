import { createContext, useState } from 'react';

// Get data
const INITIAL_API_URL = 'http://localhost:4000'; // replace with your backend URL
const INITIAL_CENTRAL_SERVER_URL = 'http://localhost:8000'; // replace with your central register server URL
const INITIAL_WebSocketURL = 'ws://localhost:4000'; // replace with your backend WS URL

const defaultValue = {
    API_URL: INITIAL_API_URL,
    setAPI_URL: () => {},
    CENTRAL_SERVER_URL: INITIAL_CENTRAL_SERVER_URL,
    setCENTRAL_SERVER_URL: () => {},
    WebSocketURL: INITIAL_WebSocketURL,
    setWebSocketURL: () => {},
};

// Create a context
export const ParaContext = createContext(defaultValue);

export const ParaProvider = ({ children }) => {
    const [apiUrl, setAPI_URL] = useState(INITIAL_API_URL);
    const [centralServerUrl, setCENTRAL_SERVER_URL] = useState(INITIAL_CENTRAL_SERVER_URL);
    const [webSocketUrl, setWebSocketURL] = useState(INITIAL_WebSocketURL);

    return (
        <ParaContext.Provider value={{
            API_URL: apiUrl, 
            setAPI_URL, 
            CENTRAL_SERVER_URL: centralServerUrl, 
            setCENTRAL_SERVER_URL, 
            WebSocketURL: webSocketUrl, 
            setWebSocketURL
        }}>
            {children}
        </ParaContext.Provider>
    );
};

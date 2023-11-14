import React, { useContext, useEffect, useState } from 'react';
import { sendCommand } from '../Tools/api.js';
import { ParaContext } from '../Global.js';
import './Console.css';


const Console = (props) => {
    const [info, setInfo] = useState([]);
    const { API_URL, WebSocketURL } = useContext(ParaContext);
    const [command, setCommand] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        await sendCommand(API_URL, command);
        setCommand('');
    };

    useEffect( () => {
        props.refresh();

        // Create a new WebSocket
        const newSocket = new WebSocket(WebSocketURL);

        // Listen for messages
        newSocket.onmessage = (event) => {
            // Update the state with the message from the server
            setInfo(prevInfo => {
                console.log(prevInfo); // 调试输出
                return Array.isArray(prevInfo) ? [...prevInfo, event.data] : [event.data];
            });
            
        };

        // Listen for WebSocket connection open
        newSocket.onopen = (event) => {
            console.log('WebSocket connected:', event);
        };

        // Listen for WebSocket errors
        newSocket.onerror = (event) => {
            console.error('WebSocket error:', event);
            setInfo(event.data);
        };

        // Listen for WebSocket connection close
        newSocket.onclose = (event) => {
            console.log('WebSocket disconnected:', event);
            setInfo(event.data);
        };

        // Close the WebSocket connection when the component unmounts
        return () => {
            console.log('Closing WebSocket connection');
            newSocket.close();
            setInfo([]);
        };

    }, [API_URL]);
    return(
        <div>
            <h1>Console</h1>
            <div className='console'>
            <form className='input-form' action={`${API_URL}/api/command`} method='post' onSubmit={handleSubmit}>
                <textarea
                    className="input-textarea"
                    name="command"
                    placeholder={`Enter your command here...`}
                    onChange={(e) => setCommand(e.target.value)}
                />
                <button type="submit" className='command-button'>Execute</button>
            </form>
                <div className='output-terminal'>
                    <pre className='output-info'>
                        {info}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default Console;
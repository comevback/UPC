import React, { useContext, useEffect, useState } from 'react';
import { sendCommand } from '../Tools/api.js';
import { ParaContext } from '../Global.js';
import { io } from 'socket.io-client';
import './Console.css';


const Console = (props) => {
    const [info, setInfo] = useState([]);
    const { API_URL } = useContext(ParaContext);
    const [command, setCommand] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        await sendCommand(API_URL, command);
        setCommand('');
    };

    useEffect( () => {
        props.refresh();

        // Create a new WebSocket
        const socket = io(API_URL);

        // Listen for connection open
        socket.on('connection', () => {
            console.log('Connected to WebSocket server');
        });

        // Listen for messages
        socket.on('commandMessage', (data) => {
            setInfo(prevInfo => {
                return Array.isArray(prevInfo) ? [...prevInfo, data] : [data];
            });
        });

        // Listen for WebSocket connection open
        socket.on('open', () => {
            console.log('Connected to WebSocket server');
        });

        // Listen for WebSocket errors
        socket.on('commandError', (error) => {
            console.error('Error:', error);
        });

        // Listen for WebSocket connection close
        socket.on('close', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Close the WebSocket connection when the component unmounts
        return () => {
            console.log('Closing WebSocket connection');
            socket.close();
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
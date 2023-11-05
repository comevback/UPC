import { useState, useEffect } from 'react';
import { downloadFile, generateImage, deleteFile} from '../Tools/api';
import './FileList.css';

// FileList.js
function FileList(props) {
    const [info, setInfo] = useState([]);
    const [activeInfoFile, setActiveInfoFile] = useState('');

    // ============================== WebSocket ==================================
    useEffect(() => {
        // Create a new WebSocket
        const newSocket = new WebSocket('ws://localhost:3001'); // 请替换为你的WebSocket服务的URL

        // Listen for messages
        newSocket.onmessage = function(event) {
            // Display messages received from the WebSocket server
            console.log('Message from server:', event.data);
            // Update the state with the message from the server
            setInfo(event.data);
        };

        // Listen for WebSocket connection open
        newSocket.onopen = function(event) {
            console.log('WebSocket connected:', event);
        };

        // Listen for WebSocket errors
        newSocket.onerror = function(event) {
            console.error('WebSocket error:', event);
        };

        // Listen for WebSocket connection close
        newSocket.onclose = function(event) {
            console.log('WebSocket disconnected:', event);
        };

        // Close the WebSocket connection when the component unmounts
        return () => {
            console.log('Closing WebSocket connection');
            newSocket.close();
            setInfo([]);
        };
    }, []);

    // ============================== WebSocket ==================================

    // If click the file, Show the info
    const handleFileClick = async(file) => {
        setInfo('Loading...');
        setActiveInfoFile(file);
        await generateImage(file);
        props.refreshAll();
    };

    if (!props.files.length){
        return (
            <div>
                <h1>Uploaded</h1>
                <div className="file-list">
                    <p>No files uploaded yet.</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1>Uploaded</h1>
            <ul className="file-list">
                {props.files.map(file => (
                    <li className="file-item" key={file}>
                        <div className='name-and-buttons'>
                            <span>{file}</span>
                            <div className='buttons'>
                                <button onClick={() => handleFileClick(file)} >Generate Image</button>
                                <button onClick={() => downloadFile(file)}>Download</button>
                                <button onClick={async() => {
                                    await deleteFile(file);
                                    props.refreshFiles();
                                }}>Delete</button>
                            </div> 
                        </div>
                        {activeInfoFile === file && (
                            <div className='info'>
                                <p>{info || 'Loading...'}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>       
    );
}

export default FileList;
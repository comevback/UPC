import { useState, useEffect, useContext } from 'react';
import { downloadFile, generateImage, deleteFile } from '../Tools/api';
import { ParaContext } from '../Global.js';        
import './FileList.css';

// FileList.js
const FileList = (props) => {
    const [info, setInfo] = useState([]);
    const [activeInfoFile, setActiveInfoFile] = useState('');
    const { API_URL, WebSocketURL } = useContext(ParaContext);


    // If click the checkbox, add the file to the selectedFiles
    const handleCheckboxChange = (fileName) => {
        const updatedSelectedFiles = props.selectedFiles.includes(fileName) 
            ? props.selectedFiles.filter(file => file !== fileName)
            : [...props.selectedFiles, fileName];
        
        console.log('Updated selected files:', updatedSelectedFiles);
        props.setSelectedFiles(updatedSelectedFiles);
    };
    

    // ============================== WebSocket ==================================
    useEffect(() => {
        props.refreshFiles();

        // Create a new WebSocket
        const newSocket = new WebSocket(WebSocketURL);

        // Listen for messages
        newSocket.onmessage = (event) => {
            // Update the state with the message from the server
            setInfo(event.data);
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
    }, [API_URL, WebSocketURL]);

    // ============================== WebSocket ==================================

    // If click the file, Show the info, and generate the image, refresh the file list
    const handleFileClick = async(file) => {
        setInfo('Loading...');
        setActiveInfoFile(file);
        await generateImage(API_URL, file);
        props.refreshAll();
    };

    if (!props.files.length){
        return (
            <div>
                <h1>Uploaded</h1>
                <div className="file-list">
                    <p>No file uploaded yet.</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1>Uploaded</h1>
            <ul className="file-list">
                {props.files.map(file => (
                    <li className={`file-item ${props.selectedFiles.includes(file) ? 'selected' : ''}`} key={file}>
                        <div className='name-and-buttons'>
                            <input type='checkbox' className='checkbox' checked={props.selectedFiles.includes(file)}
                                onChange={() => handleCheckboxChange(file)} />
                            <span>{file}</span>
                            <div className='buttons'>
                                <button onClick={() => handleFileClick(file)} >Generate Image</button>
                                <button onClick={() => downloadFile(API_URL, file)}>Download</button>
                                <button onClick={async() => {
                                    await deleteFile(API_URL, file);
                                    props.refreshFiles();
                                }}>Delete</button>
                            </div> 
                        </div>
                        {activeInfoFile === file && (
                            <div className='info'>
                                <p className={
                                    info === 'Invalid file type, Shoud be .zip file'
                                    ? 'info-error'
                                    : info === 'Loading...'
                                    ? 'info-loading'
                                    : ''
                                }>
                                {info || 'Loading...'}
                                </p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>       
    );
}

export default FileList;
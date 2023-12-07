import { useState, useEffect, useContext } from 'react';
import { downloadFile, generateImage, deleteFile, downloadAllFiles, downloadAllFilesZip } from '../Tools/api';
import { ParaContext } from '../Global.js';
import io from 'socket.io-client';     
import './FileList.css';

// FileList.js
const FileList = (props) => {
    const [info, setInfo] = useState([]);
    const [activeInfoFile, setActiveInfoFile] = useState('');
    const { API_URL } = useContext(ParaContext);


    // If click the checkbox, add the file to the selectedFiles
    const handleCheckboxChange = (fileName) => {
        const updatedSelectedFiles = props.selectedFiles.includes(fileName) 
            ? props.selectedFiles.filter(file => file !== fileName)
            : [...props.selectedFiles, fileName];
        
        console.log('Updated selected files:', updatedSelectedFiles);
        props.setSelectedFiles(updatedSelectedFiles);
    };
    
    // select all files
    const handleSelectAllClick = () => {
        if (props.selectedFiles.length === props.files.length) {
            props.setSelectedFiles([]);
        } else {
            props.setSelectedFiles(props.files);
        }
    };

    // Download all files separately
    const handleDownloadAllClick = () => {
        downloadAllFiles(API_URL, props.selectedFiles);
    };

    // Download all files together
    const handleDownloadTogetherClick = () => {
        downloadAllFilesZip(API_URL, props.selectedFiles);
    };

    // ============================== WebSocket ==================================
    useEffect(() => {
        props.refreshFiles();

        // Create a new WebSocket
        const socket = io(API_URL);

        // Listen for connection open
        socket.on('connection', () => {
            console.log('Connected to WebSocket server');
        });

        // Listen for connection close
        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
        
        // Listen for messages
        socket.on('message', (data) => {
            setInfo(data);
            console.log('Received message from server:', data);
        });

        // Listen for WebSocket errors
        socket.on('error', (error) => {
            console.error('Error:', error);
        });

        // Listen for geneMessage
        socket.on('geneMessage', (data) => {
            setInfo(data);
        });

        // Listen for geneError
        socket.on('geneError', (data) => {
            setInfo(data);
        });


        // Close the WebSocket connection when the component unmounts
        return () => {
            socket.close();
            setInfo([]);
        };
    }, [API_URL]);

    // =============================== WebSocket ==================================

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
                <ul className="file-list">
                <li className='file-item example'>
                    <div className='name-and-buttons'>
                        <input type='checkbox' className='checkbox' />
                        <span>File Name</span>
                        <div className='buttons'>
                            <button onClick={() => {handleDownloadAllClick()}}>&#x21E9; Separately</button>
                            <button onClick={() => {handleDownloadTogetherClick()}}>&#x21E9; Bundle</button>
                        </div>
                    </div>
                </li>
                </ul>
            </div>
        );
    };

    return (
        <div>
            <h1>Uploaded</h1>
            <ul className="file-list">
                <li className='file-item example'>
                    <div className='name-and-buttons'>
                        <input type='checkbox' className='checkbox' checked={props.selectedFiles.length === props.files.length}
                            onChange={handleSelectAllClick} />
                        <span>File Name</span>
                        <div className='buttons'>
                            <button onClick={() => {handleDownloadAllClick()}}>&#x21E9; Separately</button>
                            <button onClick={() => {handleDownloadTogetherClick()}}>&#x21E9; Bundle</button>
                        </div>
                    </div>
                </li>
                {props.files.map(file => (
                    <li className={`file-item ${props.selectedFiles.includes(file) ? 'selected' : ''}`} key={file}>
                        <div className='name-and-buttons'>
                            <input type='checkbox' className='checkbox' checked={props.selectedFiles.includes(file)}
                                onChange={() => handleCheckboxChange(file)} />
                            <span>{file}</span>
                            <div className='buttons'>
                                <button onClick={() => handleFileClick(file)} >Generate Image</button>
                                <button onClick={() => downloadFile(API_URL, file)}>&#x21E9;</button>
                                <button onClick={async() => {
                                    await deleteFile(API_URL, file);
                                    props.refreshFiles();
                                }}>&#10007;</button>
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
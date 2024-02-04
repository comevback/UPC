import { useState, useContext } from 'react';
import { downloadFile_server, generateImage, deleteFile_server, downloadAllFiles_server, downloadAllFilesZip_server, deleteAllFiles_server, processFile } from '../Tools/api';
import { ParaContext } from '../Global.js';   
import './FileList.css';

// FileList.js
const FileListServer = (props) => {
    const [info, setInfo] = useState([]);
    const [activeInfoFile, setActiveInfoFile] = useState('');
    const { CENTRAL_SERVER_URL } = useContext(ParaContext);


    // If click the checkbox, add the file to the selectedFiles
    const handleCheckboxChange = (fileName) => {
        const updatedSelectedFiles = props.selectedFilesServer.includes(fileName) 
            ? props.selectedFilesServer.filter(file => file !== fileName)
            : [...props.selectedFilesServer, fileName];
        
        console.log('Updated selected files:', updatedSelectedFiles);
        props.setSelectedFilesServer(updatedSelectedFiles);
    };
    
    // select all files
    const handleSelectAllClick = () => {
        if (props.selectedFilesServer.length === props.filesServer.length) {
            props.setSelectedFilesServer([]);
        } else {
            props.setSelectedFilesServer(props.filesServer);
        }
    };

    // Download all files separately
    const handleDownloadAllClick = () => {
        downloadAllFiles_server(CENTRAL_SERVER_URL, props.selectedFilesServer);
    };

    // Download all files together
    const handleDownloadTogetherClick = () => {
        downloadAllFilesZip_server(CENTRAL_SERVER_URL, props.selectedFilesServer);
    };

    // Delete all selected files
    const handleDeleteAllClick = async () => {
        await deleteAllFiles_server(CENTRAL_SERVER_URL, props.selectedFilesServer);
        props.refreshFilesServer();
    };

    // If click the file, Show the info, and generate the image, refresh the file list
    const handleFileClick = async(file) => {
        setInfo('Loading...');
        setActiveInfoFile(file);
        await generateImage(CENTRAL_SERVER_URL, file);
        props.refreshAll();
    };


    if (!props.filesServer.length){
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
                            <button onClick={() => {handleDeleteAllClick()}} >&#10007;</button>
                        </div>
                    </div>
                </li>
                </ul>
            </div>
        );
    };

    return (
        <div>
            <h1>Uploaded (Register Server)</h1>
            <ul className="file-list">
                <li className='file-item example'>
                    <div className='name-and-buttons'>
                        <input type='checkbox' className='checkbox' checked={props.selectedFilesServer.length === props.filesServer.length}
                            onChange={handleSelectAllClick} />
                        <span>File Name</span>
                        <div className='buttons'>
                            <button onClick={() => {handleDownloadAllClick()}}>&#x21E9; Separately</button>
                            <button onClick={() => {handleDownloadTogetherClick()}}>&#x21E9; Bundle</button>
                            <button onClick={() => {handleDeleteAllClick()}} >&#10007;</button>
                        </div>
                    </div>
                </li>
                {props.filesServer.map(file => (
                    <li className={`file-item ${props.selectedFilesServer.includes(file) ? 'selected' : activeInfoFile.includes(file) ? 'actived' : ''}`} key={file}>
                        <div className='name-and-buttons'>
                            <input type='checkbox' className='checkbox' checked={props.selectedFilesServer.includes(file)}
                                onChange={() => handleCheckboxChange(file)} />
                            <span>{file}</span>
                            <div className='buttons'>
                                <button >Assign</button>
                                <button onClick={() => downloadFile_server(CENTRAL_SERVER_URL, file)}>&#x21E9;</button>
                                <button onClick={async() => {
                                    await deleteFile_server(CENTRAL_SERVER_URL, file);
                                    props.refreshFilesServer();
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

export default FileListServer;
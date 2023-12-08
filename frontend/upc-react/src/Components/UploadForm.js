// UploadForm.js
import { useContext, useState, useEffect } from "react";
import { uploadData } from '../Tools/api';
import { ParaContext } from "../Global.js";
import './UploadForm.css';

const UploadForm = (props) => {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('○');
    const { API_URL } = useContext(ParaContext);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        props.refreshFiles();
    }, [API_URL]);

    const handleDragOver = (event) => {
        event.preventDefault(); // 阻止默认行为
        if (!dragging) {
        setDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault(); // 阻止默认行为
        setDragging(false);
    };

    const handleDrop = async (event) => {
        event.preventDefault(); // 阻止文件被打开
        setDragging(false);
        
        const dropedFiles = Array.from(event.dataTransfer.files);
        console.log(dropedFiles);
        // 处理文件上传逻辑
        setFiles(Array.from(dropedFiles));
        setUploadStatus('○');

        const formData = new FormData();
        dropedFiles.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData(API_URL, formData);
        if (result.length > 0) {
            setUploadStatus('✓');
        } else {
            setUploadStatus('✗');
        } // Display the result from the server
        props.refreshFiles(); // Refresh the list of files
        setFiles([]); // Clear the file input

        console.log(files);
    };

    const handleFileChange = (event) => {
        setFiles(Array.from(event.target.files));
        setUploadStatus('○');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();// Prevent the default form submit event
        const formData = new FormData();
        // Create an empty FormData object
        
        files.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData(API_URL, formData);
        if (result.length > 0) {
            setUploadStatus('✓');
        } else {
            setUploadStatus('✗');
        } // Display the result from the server
        props.refreshFiles(); // Refresh the list of files
        setFiles([]); // Clear the file input
    };

    let uploadStatusClass = 'upload-status';
    if (uploadStatus === '✓') {
        uploadStatusClass += ' success';
    } else if  (uploadStatus === '✗') {
        uploadStatusClass += ' failure';
    }

    return (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <h1>Upload a file</h1>
            <form className={`upload-form ${dragging ? "dragging" : "" }`} onSubmit={handleSubmit}>
                <div className="upload-input">
                    <div className="upload-panel">
                        <input type="file" id="file-input" onChange={handleFileChange} multiple />
                        <button type="submit">Upload</button>
                    </div>
                    <div className={`upload-status ${uploadStatus === '✓' ? 'success' : uploadStatus === '✗' ? 'failure' : ''}`}>{uploadStatus}</div>
                </div>
            </form>
        </div>
    );
}

export default UploadForm;
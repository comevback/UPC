// UploadForm.js
import { useState, useEffect } from "react";
import { uploadData } from '../Tools/api';
import './UploadForm.css';

function UploadForm(props) {
    const [file, setFile] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event) => {
        setFile(Array.from(event.target.files));
        setUploadStatus('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();// Prevent the default form submit event
        const formData = new FormData();
        // Create an empty FormData object
        
        file.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData(formData);
        if (result) {
            setUploadStatus('File uploaded successfully');
        } else {
            setUploadStatus('File upload failed: ' + result);
        } // Display the result from the server
        props.refreshFiles(); // Refresh the list of files
        setFile([]); // Clear the file input
    };



    return (
        <div>
            <h1>Upload a file</h1>
            <form className="upload-form" onSubmit={handleSubmit}>
                <input type="file" id="file-input" onChange={handleFileChange} multiple />
                <button type="submit">Upload</button>
                <p>{uploadStatus}</p>
            </form>
        </div>
    );
}

export default UploadForm;
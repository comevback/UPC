// UploadForm.js
import { useState, useEffect } from "react";
import { uploadData } from '../Tools/api';
import './UploadForm.css';

function UploadForm(props) {
    const [file, setFile] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');

    // useEffect(() => {
    //     // Get the list of files when the component mounts
    //     props.refreshFiles();
    //     props.refreshResults();
    // }, []);

    // const uploadSth = async (formData) => {
    //     const uploadedData = await uploadData(formData);
    //     // Get the updated list of files
    //     props.refreshFiles();
    // };

    const handleFileChange = (event) => {
        setFile(Array.from(event.target.files));
        setUploadStatus('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        console.log(formData)
        
        file.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        await uploadData(formData);
        props.refreshFiles();
        setFile([]);
        setUploadStatus('File uploaded successfully');
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
// UploadForm.js
import { useContext, useState } from "react";
import { uploadData } from '../Tools/api';
import { ParaContext } from "../Global.js";
import './UploadForm.css';

function UploadForm(props) {
    const [file, setFile] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('○');
    const { API_URL } = useContext(ParaContext);

    const handleFileChange = (event) => {
        setFile(Array.from(event.target.files));
        setUploadStatus('○');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();// Prevent the default form submit event
        const formData = new FormData();
        // Create an empty FormData object
        
        file.forEach((file) => {
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
        setFile([]); // Clear the file input
    };



    return (
        <div className="upload-form-container">
            <h1>Upload a file</h1>
            <h2>{API_URL}</h2>
            <form className="upload-form" onSubmit={handleSubmit}>
                <div className="upload-input">
                    <div className="upload-panel">
                        <input type="file" id="file-input" onChange={handleFileChange} multiple />
                        <button type="submit">Upload</button>
                    </div>
                    <div className="upload-status">{uploadStatus}</div>
                </div>
                {/*
                <ol class="upload-instructions">
                    <li>Compress your environment folder into a <code>.zip</code> file.</li>
                    <li>Upload the zipped file using this form.</li>
                    <li>Click on the "Generate Image" button of the file</li>
                    <li>Wait for the generation to finish.</li>
                </ol>
                 */}
            </form>
        </div>
    );
}

export default UploadForm;
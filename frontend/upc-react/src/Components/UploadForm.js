// UploadForm.js
import { useState } from "react";

function UploadForm({ handleFileChange, handleSubmit }) {
    const [uploadStatus, setUploadStatus] = useState('');

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="file-input">Upload File:</label>
                <input text="input file" type="file" id="file-input" onChange={handleFileChange} />
            </div>
            <button type="submit">Submit</button>
            <p>{uploadStatus}</p>
        </form>
    );
}

export default UploadForm;
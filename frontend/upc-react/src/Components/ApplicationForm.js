import React, { useState } from 'react';
import './ApplicationForm.css';
import { getData, uploadData } from '../Tools/api';

function ApplicationForm() {
    const [data, setData] = useState(null);
    const fetchSth = async () => {
        const fetchedData = await getData();
        setData(fetchedData);
    };
    const uploadSth = async (formData) => {
        const uploadedData = await uploadData(formData);
        setData(uploadedData);
    };

    const [file, setFile] = useState(null);
    const [text, setText] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('text', text);
        // Send formData to server using fetch or axios
        uploadSth(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="file-input">Upload File:</label>
                <input type="file" id="file-input" onChange={handleFileChange} />
            </div>
            <div>
                <label htmlFor="text-input">Enter Text:</label>
                <input type="text" id="text-input" value={text} onChange={handleTextChange} />
            </div>
            <button type="submit">Submit</button>

            <button onClick={fetchSth}>Fetch</button>
            <div>{data}</div>
        </form>
    );
}

export default ApplicationForm;

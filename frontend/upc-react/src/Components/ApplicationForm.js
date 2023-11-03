import React, { useState, useEffect } from 'react';
import './ApplicationForm.css';
import { uploadData, getFiles, downloadFile } from '../Tools/api';
import FileList from './FileList';
import UploadForm from './UploadForm';

function ApplicationForm() {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Get the list of files when the component mounts
        getFiles()
        .then(files => {
            setFiles(files);
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
    }, []);

    const [data, setData] = useState(null);

    const uploadSth = async (formData) => {
        const uploadedData = await uploadData(formData);
        setData(uploadedData);
        // Get the updated list of files
        getFiles()
        .then(files => {
            setFiles(files);
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
    };

    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        // Send formData to server using fetch or axios
        uploadSth(formData);
    };

    return (
        <div>
            <UploadForm handleFileChange={handleFileChange} handleSubmit={handleSubmit} />
            <FileList files={files} />
        </div>
    );
}

export default ApplicationForm;

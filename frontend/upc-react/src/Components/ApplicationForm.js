import React, { useState, useEffect } from 'react';
import './ApplicationForm.css';
import { getFiles, getResults } from '../Tools/api';
import FileList from './FileList';
import ResultList from './ResultList';
import UploadForm from './UploadForm';
import ImagesList from './ImagesList';

function ApplicationForm() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const refreshFiles = () => {
        getFiles()
        .then(files => {
            setFiles(files);
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
    };

    const refreshResults = () => {
        getResults()
        .then(results => {
            setResults(results);
        })
        .catch(error => {
            console.error('Error fetching results:', error);
        });
    };

    const refresh = () => {
        refreshFiles();
        refreshResults();
    };

    useEffect(() => {
        // Get the list of files when the component mounts
        refreshFiles();
        refreshResults();
    }, []);

    return (
        <div>
            <UploadForm refreshFiles={refreshFiles} refreshResults={refreshResults}/>
            <div className='shownFiles'>
                <FileList files={files} refreshFiles={refreshFiles} refreshResults={refreshResults}/>
                <ResultList results={results} />
            </div>
            <ImagesList />
            <button className="button" onClick={refresh}>Refresh file list</button>
        </div>
    );
}

export default ApplicationForm;

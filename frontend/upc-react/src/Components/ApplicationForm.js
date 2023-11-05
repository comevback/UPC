import React, { useState, useEffect } from 'react';
import './ApplicationForm.css';
import { getFiles, getResults, getImages } from '../Tools/api';
import FileList from './FileList';
import ResultList from './ResultList';
import UploadForm from './UploadForm';
import ImagesList from './ImagesList';

function ApplicationForm() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [images, setImages] = useState([]);

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

    const refreshImages = () => {
        getImages()
        .then(images => {
            setImages(images);
        })
        .catch(error => {
            console.error('Error fetching images:', error);
        });
    }

    const refresh = () => {
        refreshFiles();
        refreshResults();
        refreshImages();
        console.log("Resfreshed files, images and results");
    };

    useEffect(() => {
        // Get the list of files when the component mounts
        refreshFiles();
        refreshResults();
        refreshImages();
    }, []);

    return (
        <div>
            <div className="shownFiles">
                <UploadForm refreshFiles={refreshFiles} refreshResults={refreshResults}/>
                <ImagesList images={images}/>
            </div>
            
            <div className='shownFiles'>
                <FileList files={files} refreshFiles={refreshFiles} refreshResults={refreshResults}/>
                <ResultList results={results} refreshFiles={refreshFiles} refreshResults={refreshResults}/>
            </div>
            
            <button className="button" onClick={refresh}>Refresh file list</button>
        </div>
    );
}

export default ApplicationForm;

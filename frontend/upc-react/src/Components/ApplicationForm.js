import React, { useContext, useState, useEffect } from 'react';
import './ApplicationForm.css';
import { getFiles, getResults, getImages } from '../Tools/api';
import { ParaContext } from '../Global.js';
import FileList from './FileList';
import ResultList from './ResultList';
import UploadForm from './UploadForm';
import ImagesList from './ImagesList';
import Heading from './Heading';

function ApplicationForm() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [images, setImages] = useState([]);
    const { API_URL, CENTRAL_SERVER_URL, WebSocketURL } = useContext(ParaContext);

    const refreshFiles = () => {
        getFiles(API_URL)
        .then(files => {
            setFiles(files);
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
    };

    const refreshResults = () => {
        getResults(API_URL)
        .then(results => {
            setResults(results);
        })
        .catch(error => {
            console.error('Error fetching results:', error);
        });
    };

    const refreshImages = () => {
        getImages(API_URL)
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
            <Heading/>
            <div className="shownFiles">
                <UploadForm refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ImagesList images={images} refreshImages={refreshImages} refreshAll={refresh}/>
            </div>
            
            <div className='shownFiles'>
                <FileList files={files} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ResultList results={results} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
            </div>
        </div>
    );
}

export default ApplicationForm;

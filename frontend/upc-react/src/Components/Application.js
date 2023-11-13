import React, { useContext, useState, useEffect } from 'react';
import './Application.css';
import { getFiles, getResults, getImages } from '../Tools/api.js';
import { ParaContext } from '../Global.js';
import FileList from './FileList.js';
import ResultList from './ResultList.js';
import UploadForm from './UploadForm.js';
import ImagesList from './ImagesList.js';
import Heading from './Heading.js';

function ApplicationForm() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [images, setImages] = useState([]);
    const { API_URL, API_NAME } = useContext(ParaContext);

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
            <div className='sources'>
                <a href='./' rel="noopener noreferrer"><img src='UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/></a>
                <div>
                    <h1>UPC - Generating and Processing</h1>
                    <h2>Current Server: <a className='Serverlink' href={API_URL} target="_blank" rel="noopener noreferrer">{API_NAME}</a></h2>
                </div>
            </div>
            <Heading/>
            <div className="area">
                <UploadForm refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ImagesList images={images} refreshImages={refreshImages} refreshAll={refresh}/>
            </div>
            
            <div className='area'>
                <FileList files={files} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ResultList results={results} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
            </div>
        </div>
    );
}

export default ApplicationForm;

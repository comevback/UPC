import React, { useContext, useState, useEffect } from 'react';
import './Application.css';
import { checkConnection, getFiles, getResults, getTemps, getImages, process } from '../Tools/api.js';
import { ParaContext } from '../Global.js';
import FileList from './FileList.js';
import ResultList from './ResultList.js';
import UploadForm from './UploadForm.js';
import TempList from './TempList.js';
import ImagesList from './ImagesList.js';
import Heading from './Heading.js';
import Console from './Console.js';
import Term from './Term.js';

const ApplicationForm = () => {
    const [connected, setConnected] = useState(false);
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [temps, setTemps] = useState([]);
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState(""); // Store the selected files
    const [selectedFiles, setSelectedFiles] = useState([]); // Store the selected files
    const { API_URL } = useContext(ParaContext);

    // Check if the backend is connected
    const checkBackend = async() => {
        const connectSitu = await checkConnection(API_URL);
        setConnected(connectSitu);
    };

    const handleProcessClick = () => {
        process(API_URL, selectedImages, selectedFiles);
        setSelectedFiles([]);
        setSelectedImages([]);
        refreshTemps();
    };

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

    const refreshTemps = () => {
        getTemps(API_URL)
        .then(temps => {
            setTemps(temps);
        })
        .catch(error => {
            console.error('Error fetching temps:', error);
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
        refreshTemps();
        console.log("Resfreshed files, images and results");
    };

    useEffect(() => {
        // Get the list of files when the component mounts
        checkBackend();
        if (connected) {
            refreshFiles();
            refreshResults();
            refreshTemps();
            refreshImages();
        }
    }, [API_URL]);

    return (
        <div>
            <Heading/>
            <div className='sources'>
                <a href='./' rel="noopener noreferrer"><img src='UPC-logo-rm.png' alt='UPC logo' width='300px' height='300px'/></a>
                <div>
                    <h1 className='title'>UPC - Generate and Process</h1>
                    <h2>Current Server: <a className={`Serverlink ${connected ? '' : 'notConnected'}`} href={connected? API_URL : "./"} target="_blank" rel="noopener noreferrer">{connected? API_URL : "Not connected"}</a></h2>
                </div>
            </div>
            <button className='command-button' onClick={handleProcessClick} disabled={selectedImages.length === 0}>Process</button>
            <div className="area">
                <UploadForm refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <FileList files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ImagesList images={images} selectedImages={selectedImages} setSelectedImages={setSelectedImages} refreshImages={refreshImages} refreshAll={refresh}/>
            </div>
            
            <div className='area'>
                <Console refresh={refresh}/>
                <TempList temps={temps} refreshTemps={refreshTemps} refreshAll={refresh}/>
                <ResultList results={results} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
            </div>
            <div className='area'>
                <Term/>
            </div>
        </div>
    );
}

export default ApplicationForm;

import React, { useContext, useState, useEffect } from 'react';
import './Application.css';
import { checkConnection, getFiles, getFiles_server, getResults, getResults_server, getImages, process } from '../Tools/api.js';
import { ParaContext } from '../Global.js';
import FileList from './FileList.js';
import FileListServer from './FileListServer.js';
import ResultList from './ResultList.js';
import ResultListServer from './ResultListServer.js';
import UploadForm from './UploadForm.js';
import UploadFormServer from './UploadFormServer.js';
import ImagesList from './ImagesList.js';
import Heading from './Heading.js';
import Logo from './Logo.js';
import Term from './Term.js';
import particlesJS from 'particles.js';
import ProcessForm from './ProcessForm.js';

const ApplicationForm = () => {
    const [connected, setConnected] = useState(false);
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [filesServer, setFilesServer] = useState([]);
    const [resultsServer, setResultsServer] = useState([]);
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState(""); // Store the selected files
    const [selectedFiles, setSelectedFiles] = useState([]); // Store the selected files
    const [selectedFilesServer, setSelectedFilesServer] = useState([]); // Store the selected files
    const [selectedResultsServer, setSelectedResultsServer] = useState([]); // Store the selected files
    const [selectedResults, setSelectedResults] = useState([]); // Store the selected files
    const [termShown, setTermShown] = useState(false); // Store the selected files
    const [processing, setProcessing] = useState(false); // Store the selected files
    const { API_URL, CENTRAL_SERVER_URL } = useContext(ParaContext);

    // Check if the backend is connected
    const checkBackend = async() => {
        const connectSitu = await checkConnection(API_URL);
        setConnected(connectSitu);
    };

    const toggleProcess = () => {
        setProcessing(!processing);
        // process(API_URL, selectedImages, {fileNames: selectedFiles, Port:[4000,4000]});
    };

    const toggleTerm = () => {
        window.scrollTo({
            top: 0,
            right: 0,
            behavior: 'smooth'
        });
        setTermShown(!termShown);
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

    const refreshFilesServer = () => {
        getFiles_server(CENTRAL_SERVER_URL)
        .then(files => {
            setFilesServer(files);
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

    const refreshResultsServer = () => {
        getResults_server(CENTRAL_SERVER_URL)
        .then(results => {
            setResultsServer(results);
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
        refreshFilesServer();
        refreshResults();
        refreshImages();
        console.log("Resfreshed files, images and results");
    };

    useEffect(() => {
        // Get the list of files when the component mounts
        checkBackend();
        if (connected) {
            refreshFiles();
            refreshResults();
            refreshImages();
        }

        // Load the particles.js library
        if (window.particlesJS) {
            window.particlesJS.load('particles-js', 'particlesjs.json', function() {
              console.log('particles.js loaded - callback');
            });
        }
        
        // Remove the canvas element when the component unmounts
        return () => {
            let particlesJSContainer = document.getElementById('particles-js');
            if (particlesJSContainer) {
                // Remove the canvas element
                while (particlesJSContainer.firstChild) {
                    particlesJSContainer.removeChild(particlesJSContainer.firstChild);
                }
            }
        };
    }, [API_URL]);

    return (
        <div>
            <div id="particles-js" className="particles-container"></div>
            <Heading toggleTerm={toggleTerm} />
            <div className='term-and-logo'>
                <Logo termShown={termShown} connected={connected}/>     
                <div className={`term ${termShown? 'active' : ''}`}>
                    {termShown? <Term/> : null}
                </div>
            </div>
            <button className={`command-button ${!processing && selectedImages  ? 'shining' : processing ? 'active' : '' }` } onClick={toggleProcess} >Process</button>
            <div className={`process ${processing ? 'active' : ''}`}>
                <ProcessForm selectedImages={selectedImages} selectedFiles={selectedFiles} images={images} files={files} /> 
            </div>
            
            <div className="area">
                <UploadFormServer refreshFilesServer={refreshFilesServer} refreshResultsServer={refreshResultsServer} refreshAll={refresh}/>
            </div>
            <div className="area"> 
                <FileListServer filesServer={filesServer} refreshFilesServer={refreshFilesServer} refreshAll={refresh} selectedFilesServer={selectedFilesServer} setSelectedFilesServer={setSelectedFilesServer}/>
                <ResultListServer resultsServer={resultsServer} refreshResultsServer={refreshResultsServer} refreshAll={refresh} selectedResultsServer={selectedResultsServer} setSelectedResultsServer={setSelectedResultsServer}/>
            </div>

            <div className="area">
                <UploadForm refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ImagesList images={images} selectedImages={selectedImages} setSelectedImages={setSelectedImages} refreshImages={refreshImages} refreshAll={refresh}/>
            </div>
            <div className='area'>
                <FileList files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
                <ResultList results={results} selectedResults={selectedResults} setSelectedResults={setSelectedResults} refreshFiles={refreshFiles} refreshResults={refreshResults} refreshAll={refresh}/>
            </div>
        </div>
    );
}

export default ApplicationForm;

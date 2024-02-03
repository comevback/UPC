import { useContext, useEffect } from 'react';
import { ParaContext } from '../Global.js';
import { downloadResult_server, deleteResult_server, downloadAllResult_server, downloadAllResultZip_server, deleteAllResult_server } from '../Tools/api';
import './ResultList.css';


// resultList.js
const ResultListServer = (props) => {
    const { CENTRAL_SERVER_URL } = useContext(ParaContext);

    useEffect(() => {
        props.refreshResultsServer();
    }, [CENTRAL_SERVER_URL]);

    // if click the checkbox, add the result to the selectedResults
    const handleCheckboxChange = (resultName) => {
        const updatedSelectedResults = props.selectedResultsServer.includes(resultName) 
            ? props.selectedResultsServer.filter(result => result !== resultName)
            : [...props.selectedResultsServer, resultName];
        
        console.log('Updated selected results:', updatedSelectedResults);
        props.setSelectedResultsServer(updatedSelectedResults);
    };

    // select all results
    const handleSelectAllClick = () => {
        if (props.selectedResultsServer.length === props.resultsServer.length) {
            props.setSelectedResultsServer([]);
        } else {
            props.setSelectedResultsServer(props.results);
        }
    };

    // Download all results separately
    const handleDownloadAllClick = () => {
        downloadAllResult_server(CENTRAL_SERVER_URL, props.selectedResultsServer);
    };

    // Download all results together
    const handleDownloadTogetherClick = () => {
        downloadAllResultZip_server(CENTRAL_SERVER_URL, props.selectedResultsServer);
    };

    // Delete all selected results
    const handleDeleteAllClick = async () => {
        await deleteAllResult_server(CENTRAL_SERVER_URL, props.selectedResults);
        props.refreshResults();
    };

    // ============================================================================================

    if (!props.resultsServer.length){
        return (
            <div>
                <h1>Results</h1>
                <ul className="result-list">
                <li className='result-item example'>
                    <div className='name-and-buttons'>
                        <input type='checkbox' className='checkbox' />
                        <span>File Name</span>
                        <div className='buttons'>
                            <button onClick={() => {handleDownloadAllClick()}}>&#x21E9; Separately</button>
                            <button onClick={() => {handleDownloadTogetherClick()}}>&#x21E9; Bundle</button>
                            <button onClick={() => {handleDeleteAllClick()}} >&#10007;</button>
                        </div>
                    </div>
                </li>
                </ul>
            </div>
        );
    };

    return (
        <div>
            <h1>Results</h1>
            <ul className="result-list">
                <li className='result-item example'>
                    <div className='name-and-buttons'>
                        <input type='checkbox' className='checkbox' checked={props.selectedResultsServer.length === props.resultsServer.length}
                            onChange={handleSelectAllClick} />
                        <span>File Name</span>
                        <div className='buttons'>
                            <button onClick={() => {handleDownloadAllClick()}}>&#x21E9; Separately</button>
                            <button onClick={() => {handleDownloadTogetherClick()}}>&#x21E9; Bundle</button>
                            <button onClick={() => {handleDeleteAllClick()}} >&#10007;</button>
                        </div>
                    </div>
                </li>
                {props.resultsServer.map(result => (
                    <li className={`result-item ${props.selectedResultsServer.includes(result) ? 'selected' : ''}`} key={result}>
                        <div className='name-and-buttons'>
                            <input
                                type="checkbox"
                                checked={props.selectedResultsServer.includes(result)}
                                onChange={() => handleCheckboxChange(result)}
                            />
                            <span>{result}</span>
                            <div className='buttons'>
                                <button onClick={() => downloadResult_server(CENTRAL_SERVER_URL, result)}>&#x21E9;</button>
                                <button onClick={async() => {
                                    await deleteResult_server(CENTRAL_SERVER_URL, result);
                                    props.refreshResultsServer();
                                }}>&#10007;</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div> 
    );
}

export default ResultListServer;
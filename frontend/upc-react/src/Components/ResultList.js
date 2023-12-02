import { useContext, useEffect } from 'react';
import { ParaContext } from '../Global.js';
import { downloadResult, deleteResult, downloadAllResult, downloadAllResultZip } from '../Tools/api';
import './ResultList.css';

// resultList.js
const ResultList = (props) => {
    const { API_URL } = useContext(ParaContext);

    useEffect(() => {
        props.refreshResults();
    }, [API_URL]);

    // if click the checkbox, add the result to the selectedResults
    const handleCheckboxChange = (resultName) => {
        const updatedSelectedResults = props.selectedResults.includes(resultName) 
            ? props.selectedResults.filter(result => result !== resultName)
            : [...props.selectedResults, resultName];
        
        console.log('Updated selected results:', updatedSelectedResults);
        props.setSelectedResults(updatedSelectedResults);
    };

    // select all results
    const handleSelectAllClick = () => {
        if (props.selectedResults.length === props.results.length) {
            props.setSelectedResults([]);
        } else {
            props.setSelectedResults(props.results);
        }
    };

    // Download all results separately
    const handleDownloadAllClick = () => {
        downloadAllResult(API_URL, props.selectedResults);
    };

    // Download all results together
    const handleDownloadTogetherClick = () => {
        downloadAllResultZip(API_URL, props.selectedResults);
    };

    if (!props.results.length){
        return (
            <div>
                <h1>Results</h1>
                <ul className="result-list">
                    <p>No Result result yet</p>
                </ul>
            </div>
        );
    };

    return (
        <div>
            <h1>Results</h1>
            <ul className="result-list">
                <li className='result-item'>
                    <div className='name-and-buttons'>
                        <input type='checkbox' className='checkbox' checked={props.selectedResults.length === props.results.length}
                            onChange={handleSelectAllClick} />
                        <span>Select All</span>
                        <div className='buttons'>
                            <button onClick={() => {handleDownloadAllClick()}}>Download Separately</button>
                            <button onClick={() => {handleDownloadTogetherClick()}}>Download Together</button>
                        </div>
                    </div>
                </li>
                {props.results.map(result => (
                    <li className={`result-item ${props.selectedResults.includes(result) ? 'selected' : ''}`} key={result}>
                        <div className='name-and-buttons'>
                            <input
                                type="checkbox"
                                checked={props.selectedResults.includes(result)}
                                onChange={() => handleCheckboxChange(result)}
                            />
                            <span>{result}</span>
                            <div className='buttons'>
                                <button onClick={() => downloadResult(API_URL, result)}>Download</button>
                                <button onClick={async() => {
                                    await deleteResult(API_URL, result);
                                    props.refreshResults();
                                }}>Delete</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div> 
    );
}

export default ResultList;
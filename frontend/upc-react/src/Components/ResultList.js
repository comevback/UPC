import { useContext, useEffect } from 'react';
import { ParaContext } from '../Global.js';
import { downloadResult, deleteResult } from '../Tools/api';
import './ResultList.css';

// FileList.js
function ResultList(props) {
    const { API_URL } = useContext(ParaContext);

    useEffect(() => {
        props.refreshResults();
    }, [API_URL]);

    if (!props.results.length){
        return (
            <div>
                <h1>Results</h1>
                <div className="result-list">
                    <p>No Results files yet.</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1>Results</h1>
            <h2>{API_URL}</h2>
            <ul className="result-list">
                {props.results.map(result => (
                    <li className="result-item" key={result}>
                        <div className='name-and-buttons'>
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
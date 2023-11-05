import { downloadResult, deleteResult } from '../Tools/api';
import './ResultList.css';

// FileList.js
function ResultList(props) {
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
            <ul className="result-list">
                {props.results.map(result => (
                    <li className="result-item" key={result}>
                        <span>{result}</span>
                        <button onClick={() => downloadResult(result)}>Download</button>
                        <button onClick={async() => {
                            await deleteResult(result);
                            props.refreshResults();
                        }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div> 
    );
}

export default ResultList;
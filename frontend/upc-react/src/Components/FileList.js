import { downloadFile, generateImage, deleteFile} from '../Tools/api';
import './FileList.css';

// FileList.js
function FileList(props) {    
    if (!props.files.length){
        return (
            <div>
                <h1>Uploaded files</h1>
                <div className="file-list">
                    <p>No files uploaded yet.</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1>Uploaded files</h1>
            <ul className="file-list">
                {props.files.map(file => (
                    <li className="file-item" key={file}>
                        <span>{file}</span>
                        <div className='buttons'>
                            <button onClick={async() => {
                                await generateImage(file);
                                props.refreshFiles();
                            }} >Generate Image</button>
                            <button onClick={() => downloadFile(file)}>Download</button>
                            <button onClick={async() => {
                                await deleteFile(file);
                                props.refreshFiles();
                            }}>Delete</button>
                        </div> 
                    </li>
                ))}
            </ul>
        </div>       
    );
}

export default FileList;
import { downloadFile } from '../Tools/api';

// FileList.js
function FileList({ files }) {
    return (
        <ul>
            {files.map(file => (
                <li key={file}>
                    {file} <button onClick={() => downloadFile(file)}>Download</button>
                </li>
            ))}
        </ul>
    );
}

export default FileList;
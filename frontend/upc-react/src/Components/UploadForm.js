// UploadForm.js
import { useContext, useState, useEffect } from "react";
import { uploadData } from '../Tools/api';
import { ParaContext } from "../Global.js";
import './UploadForm.css';

const UploadForm = (props) => {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('○');
    const { API_URL } = useContext(ParaContext);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        props.refreshFiles();
    }, [API_URL]);

    const handleDragOver = (event) => {
        event.preventDefault(); // 阻止默认行为
        if (!dragging) {
        setDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault(); // 阻止默认行为
        setDragging(false);
    };

    const handleDrop = async (event) => {
        event.preventDefault(); // 阻止文件被打开
        setDragging(false);
        
        const dropedFiles = Array.from(event.dataTransfer.files);
        console.log(dropedFiles);
        // 处理文件上传逻辑
        setFiles(Array.from(dropedFiles));
        setUploadStatus('○');

        const formData = new FormData();
        dropedFiles.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData(API_URL, formData);
        if (result.length > 0) {
            setUploadStatus('✓');
        } else {
            setUploadStatus('✗');
        } // Display the result from the server
        props.refreshFiles(); // Refresh the list of files
        setFiles([]); // Clear the file input

        console.log(files);
    };

    const handleFileChange = (event) => {
        setFiles(Array.from(event.target.files));
        setUploadStatus('○');
        document.getElementById('progress-bar').style.setProperty('--progress-width', `0%`); // when new file(s) be selected, reset the progress bar
    };

    // submit function using axios
    const handleSubmit = async (event) => {
        event.preventDefault();// Prevent the default form submit event
        console.log(files);
        const formData = new FormData();
        // Create an empty FormData object
        
        files.forEach((file) => {
            formData.append('file', file);
        });// Add the file to formData

        // Send formData to server using fetch or axios
        const result = await uploadData(API_URL, formData);
        if (result.length > 0) {
            setUploadStatus('✓');
        } else {
            setUploadStatus('✗');
        } // Display the result from the server
        props.refreshFiles(); // Refresh the list of files
        setFiles([]); // Clear the file input

        // window scrollTo bottom
        window.scrollTo({
            top: 10000,
            right: 0,
            behavior: 'smooth'
        });
    };

    // submit function with progress check using xhr
    const handleSubmit_xhr = async (event) => {
        event.preventDefault();// Prevent the default form submit event
        console.log(files);

        // 如果没有文件被选择，直接返回，不进行上传，显示红色
        if(files.length === 0) {
            setUploadStatus('✗');
            document.getElementById('progress-bar').style.setProperty('--progress-width', `100%`); // Reset the progress bar
            document.getElementById('progress-bar').style.setProperty('--background-color', 'red'); // set the progress bar color to red
            return;
        }

        // 创建一个FormData对象，把每个被选择的文件添加到formData中
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        document.getElementById('progress-bar').style.setProperty('--background-color', '#2ebdfb'); // set the progress bar color to blue

        // 创建一个XMLHttpRequest对象，发送formData到服务器
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/upload`, true);

        // 设置上传进度监听器
        xhr.upload.onprogress = (event) => {
            const progress = event.loaded / event.total * 100;
            document.getElementById('progress-bar').style.setProperty('--progress-width', `${progress}%`); // Updating the progress bar
            if (progress === 100) {
                document.getElementById('progress-bar').style.setProperty('--background-color', 'lightgreen'); // set the progress bar color to green
            }
        }

        // 设置上传完成监听器
        xhr.onload = () => {
            if (xhr.status === 200) {
                setUploadStatus('✓');
            } else {
                setUploadStatus('✗');
                document.getElementById('progress-bar').style.setProperty('--background-color', 'red'); // set the progress bar color to red
            }
            props.refreshFiles(); // Refresh the list of files
            setFiles([]); // Clear the file input
        }

        xhr.send(formData);

        // window scrollTo bottom
        window.scrollTo({
            top: 10000,
            right: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <h1>Upload files</h1>
            <form className={`upload-form ${dragging ? "dragging" : "" }`} onSubmit={handleSubmit_xhr}>
                <div className="upload-input">
                    <div className="upload-panel">
                        {/* <input type="file" id="file-input" onChange={handleFileChange} webkitdirectory="true" multiple /> */}
                        <input type="file" id="file-input" onChange={handleFileChange} multiple placeholder="well"/>
                        <button type="submit" className={`${files.length ? 'actived' : ''} `}>Upload</button>
                        <div id="progress-container">
                            <div id="progress-bar" style={{'--progress-width': '0%', '--background-color': '#2ebdfb'}}></div>
                        </div>
                    </div>
                    <div className={`upload-status ${uploadStatus === '✓' ? 'success' : uploadStatus === '✗' ? 'failure' : ''}`}>{uploadStatus}</div>
                </div>
            </form>
        </div>
    );
}

export default UploadForm;
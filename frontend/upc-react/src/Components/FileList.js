import { useEffect } from 'react';
import { downloadFile, generateImage, deleteFile} from '../Tools/api';
import './FileList.css';

// FileList.js
function FileList(props) {    
    // 创建一个状态来保存WebSocket实例

    useEffect(() => {
        // 创建WebSocket连接
        const newSocket = new WebSocket('ws://localhost:3001'); // 请替换为你的WebSocket服务的URL

        // 监听WebSocket的消息事件
        newSocket.onmessage = function(event) {
            // 处理接收到的消息
            console.log('Message from server:', event.data);
        };

        // 监听WebSocket的开启事件
        newSocket.onopen = function(event) {
            console.log('WebSocket connected:', event);
        };

        // 监听WebSocket的错误事件
        newSocket.onerror = function(event) {
            console.error('WebSocket error:', event);
        };

        // 监听WebSocket的关闭事件
        newSocket.onclose = function(event) {
            console.log('WebSocket disconnected:', event);
        };

        // 组件卸载时关闭WebSocket连接
        return () => {
            console.log('Closing WebSocket connection');
            newSocket.close();
        };
    }, []);


    if (!props.files.length){
        return (
            <div>
                <h1>Uploaded</h1>
                <div className="file-list">
                    <p>No files uploaded yet.</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1>Uploaded</h1>
            <ul className="file-list">
                {props.files.map(file => (
                    <li className="file-item" key={file}>
                        <span>{file}</span>
                        <div className='buttons'>
                            <button onClick={async() => {
                                await generateImage(file);
                                props.refreshAll();
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
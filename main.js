const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1200,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // 加载前端客户端
    mainWindow.loadURL('http://localhost:3000'); // 替换为 React 客户端的 URL
}

function startServers() {
    // 启动注册服务器
    const registerServer = spawn('node', ['server.js'], {
        cwd: './register-server' // 替换为注册服务器的路径
    });

    registerServer.stdout.on('data', (data) => {
        console.log(`register-server: ${data}`);
    });

    // 启动 API 服务器
    const apiServer = spawn('node', ['app.js'], {
        cwd: './backend/UPC-API' // 替换为 API 服务器的路径
    });

    apiServer.stdout.on('data', (data) => {
        console.log(`api-server: ${data}`);
    });

    const reactServer = spawn('npm', ['start'], {
        cwd: './frontend/upc-react' // 替换为 React 客户端的路径
    });

    reactServer.stdout.on('data', (data) => {
        console.log(`react-server: ${data}`);
    });

    // 退出时关闭服务器
    app.on('quit', () => {
        registerServer.kill();
        apiServer.kill();
    });
}

app.whenReady().then(() => {
    createWindow();
    startServers();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

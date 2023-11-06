//import and setting
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import axios from "axios";
import fs from 'fs';
import os from 'os';
import path from 'path';
import extract from "extract-zip";
import upload from "./Components/upload.js";
import WebSocket, {WebSocketServer} from "ws";
import { exec, spawn } from "child_process";
import { User, Task } from "./Components/mongo.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3002;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cors());

// Convert bytes to gigabytes
const bytesToGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';

// Convert seconds to days, hours, and minutes
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds % (3600 * 24) / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

// 获取主机配置信息
const getHostInfo = () => {
    return {
      architecture: os.arch(), // CPU 架构
      cpus: os.cpus().length, // CPU 核心数量
      totalMemory: bytesToGB(os.totalmem()), // 系统总内存
      freeMemory: bytesToGB(os.freemem()), // 系统空闲内存
      uptime: formatUptime(os.uptime()), // 系统运行时间
      platform: os.platform(), // 操作系统平台
      release: os.release(), // 操作系统版本
    };
  };

const hostInfo = getHostInfo();
const id = 'My API Service 2';

//Rate limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
app.use(limiter);

// 中心服务器的信息
const CENTRAL_SERVER = 'http://localhost:4000'; // 替换为实际地址

// 后端服务器的详细信息
const serviceInfo = {
  _id: id,
  url: 'http://localhost:3002', // 替换为实际地址
  endpoints: [
    '/',
    '/register',
    '/login',
    '/tasks',
    '/api/upload',
    '/api/files',
    '/api/files/:filename',
    '/api/results',
    '/api/results/:filename',
    '/api/images',
    '/api/images/:imageName'
  ], // 列出所有可用的端点
  hostInfo: hostInfo
};

// 注册服务
const registerService = async () => {
  try {
    const response = await axios.post(`${CENTRAL_SERVER}/register-service`, serviceInfo);
    console.log('Service registered');
  } catch (error) {
    console.error('Failed to register service:', error);
  }
};

// 发送心跳
const sendHeartbeat = async () => {
  try {
    const response = await axios.post(`${CENTRAL_SERVER}/service-heartbeat/${id}`);
    console.log('Heartbeat sent:', response.data);
  } catch (error) {
    console.error('Failed to send heartbeat:', error);
  }
};

// 注销服务
const unregisterService = async () => {
  try {
    const response = await axios.delete(`${CENTRAL_SERVER}/unregister-service/${id}`);
    console.log('Service unregistered');
  } catch (error) {
    console.error('Failed to unregister service:');
  }
};

// 在服务器启动时注册服务
registerService();

// 每分钟发送一次心跳
setInterval(sendHeartbeat, 60000);

// 在服务器关闭时注销服务
const gracefulShutdown = async () => {
    try {
      await unregisterService();
      console.log('Service unregistered and server is closing.');
    } catch (error) {
      console.log('Failed to unregister service');
    } finally {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    }
  };
  

// 捕获关闭信号
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


//--------------------------------------------------------------------------------------

//basic
app.get("/", (req, res) => {
    res.send("Hello World!");
});

//Register and Login
app.post('/register', async (req, res) => {
const hashedPassword = await bcrypt.hash(req.body.password, 10);
const user = new User({
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email
});
await user.save();
res.status(201).send('User registered successfully');
});

app.post('/login', async (req, res) => {
const user = await User.findOne({ username: req.body.username });
if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ userId: user._id }, 'SECRET_KEY', { expiresIn: '1h' });
    res.json({ token });
} else {
    res.status(401).send('Invalid credentials');
}
});

//Function that makes sure the user is authenticated
function authenticate(req, res, next) {
const token = req.headers.authorization;
if (!token) return res.status(401).send('Access denied');
try {
    const verified = jwt.verify(token, 'SECRET_KEY');
    req.user = verified;
    next();
} catch {
    res.status(400).send('Invalid token');
}
}

//get and post tasks
app.get('/tasks', authenticate, async (req, res) => {
const tasks = await Task.find({ owner: req.user.userId });
res.json(tasks);
});

app.post('/tasks', authenticate, async (req, res) => {
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        owner: req.user.userId
    });
await task.save();
res.status(201).send('Task created');
});

//Route to update files to the server
app.post('/api/upload', upload.array('file', 50), (req, res) => {
    console.log(req.files);
    res.send(req.files);
});

// Route to get the list of all files
app.get('/api/files', async (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        } 
        // Return the list of files
        res.send(files);
    });
});

app.get('/api/results', async (req, res) => {
    const directoryPath = path.join(__dirname, 'results');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        } 
        // Return the list of files
        res.send(files);
    });
});

// Route to get the list of all images
app.get('/api/images', (req, res) => {
    exec('docker images --format "{{.Repository}}:{{.Tag}}" | sort', (err, stdout, stderr) => {
        if (err) {
            // Error handling
            res.status(500).send(stderr);
        } else {
            // Standard output handling
            const images = stdout.split('\n').filter(line => line); // Delete the last empty line
            res.status(200).json(images);
        }
    });
});

//view the image details
app.get('/api/images/:imageName', (req, res) => {
    const { imageName } = req.params;
    exec(`docker image inspect ${imageName}`, (err, stdout, stderr) => {
        if (err) {
            // Error handling
            console.error(`Error inspecting image: ${err}`);
            res.status(500).send(stderr);
        } else {
            try {
                // 将输出转换为JSON对象
                const imageDetails = JSON.parse(stdout);

                // 创建一个新的对象来保存您想要的信息
                const formattedDetails = imageDetails.map(detail => ({
                    RepositoryTags: detail.RepoTags,
                    Id: detail.Id,
                    Created: detail.Created,
                    Size: `${(detail.Size / 1024 / 1024).toFixed(2)} MB`,
                    Architecture: detail.Architecture,
                    Os: detail.Os,
                    DockerVersion: detail.DockerVersion,
                    // 添加您想要的其他信息
                }));

                // 发送格式化后的信息
                res.status(200).json(formattedDetails);
            } catch (parseErr) {
                // JSON解析错误处理
                console.error(`Error parsing JSON: ${parseErr}`);
                res.status(500).send('服务器内部错误，无法解析镜像信息。');
            }
        }
    });
});


// Route to download a file
app.get('/api/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath);
});

// Route to download a result
app.get('/api/results/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'results', req.params.filename);
    res.download(filePath);
});

//generate image
app.post('/api/files/:filename', async(req, res) => {
    const { filename } = req.params;
    const baseFileName = path.basename(filename, '.zip');
    const filePath = path.join(__dirname, 'uploads', filename);
    const extractPath = path.join(__dirname, 'uploads');
    const appPath = path.join(__dirname, 'uploads', baseFileName);

    console.log(`Attempting to unzip file: ${filePath}`);

    if (!filename.endsWith('.zip')) {
        console.log('Invalid file type');
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send('Invalid file type');
            }
          });
        return res.status(400).send({ message: 'Invalid file type' });
    }
    if (!fs.existsSync(filePath)) {
        console.log('File does not exist');
        return res.status(400).send({ message: 'File does not exist' });
    }

    //unzip the file
    try {
        //if the file is already unzipped, delete the unzipped folder
        if (fs.existsSync(appPath)) {
            await fs.promises.rm(appPath, { recursive: true });
            console.log('Previous unzipped folder deleted');
        }
        await extract(filePath, { dir: extractPath });
        console.log('File unzipped successfully');

        // Replace docker run with pack build command
        const pack = spawn('pack', [
            'build', 
            baseFileName.toLowerCase(),               // This is the image name
            '--path', appPath,        // Path to the application code
            '--builder', 'paketobuildpacks/builder:base'
        ]);

        pack.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            // Send the output to all connected WebSocket clients
            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
              }
            });
        });
    

        pack.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            // Send the Error to all connected WebSocket clients
            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
              }
            });
        });

        pack.on('close', async(code) => {
            if (code === 0) {
                console.log(`pack build completed successfully.`);
                await fs.promises.rm(appPath, { recursive: true });
                console.log('unzipped folder deleted');
                res.status(200).send({ message: 'Image built successfully' });
            } else {
                console.error(`pack build failed with code ${code}`);
                res.status(500).send({ message: 'Error building image' });
            }
        });
        
    } catch (error) {
        console.error('Error unzipping file:', error);
        res.status(500).send({ message: 'Error unzipping file' });
    }

});

// Route to delete a file
app.delete('/api/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res.status(500).send('Error when visiting the file path: ' + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Can not find the file'+ err.message);
                }
                res.send('directory deleted successfully');
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res.status(500).send('Unable to delete the file: ' + err.message);
                }
                // send success response after deleting the file
                res.send('File deleted successfully');
            });
        }
    });
});

// Route to delete a result
app.delete('/api/results/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'results', req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res.status(500).send('Error when visiting the file path: ' + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Can not find the file'+ err.message);
                }
                res.send('directory deleted successfully');
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res.status(500).send('Unable to delete the file: ' + err.message);
                }
                // send success response after deleting the file
                res.send('File deleted successfully');
            });
        }
    });
});

// Route to delete an image
app.delete('/api/images/:imageName', (req, res) => {
    const { imageName } = req.params;
    exec(`docker rmi ${imageName}`, (err, stdout, stderr) => {
        if (err) {
            // Error handling
            console.error(`Error deleting image: ${err}`);
            res.status(500).send(stderr);
        } else {
            // Standard output handling
            console.log(`Image deleted: ${stdout}`);
            res.status(200).send(stdout);
        }
    });
});

//Listen on port
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});

// Create a new WebSocket server
const wss = new WebSocketServer({ server });

// Listen for new connections
wss.on('connection', function connection(ws) {
  console.log('A new client connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  // Send a message to the client
  ws.send('Server: Successfully connected to the server');
});

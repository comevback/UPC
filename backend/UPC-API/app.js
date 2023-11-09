//import and setting
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import extract from "extract-zip";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from "child_process";
import WebSocket, {WebSocketServer} from "ws";
import { upload, limiter, registerService, sendHeartbeat, gracefulShutdown} from "./Components/methods.js";

const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cors());
app.use(limiter);

// Register the service
registerService();

// Send a heartbeat every 2 minutes
setInterval(sendHeartbeat, 120000);

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


//--------------------------------------------------------------------------------------

//basic
app.get("/", (req, res) => {
    res.render("index");
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

// Route to get the list of all results
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

// Generate Image after upload and unzip file
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
              client.send('Invalid file type, Shoud be .zip file');
            }
          });
        return res.status(400).send({ message: 'Invalid file type, Shoud be .zip file' });
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

// Route to run a docker image
app.post('/api/images/docker-run', (req, res) => {
    const { imageName, fileName } = req.body; // 确保通过正确的验证和错误处理
  
    const command = `docker run --rm -v ${__dirname}/uploads:/app/uploads -v ${__dirname}/results:/app/results ${imageName} ${fileName}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send(stderr);
      }
      // 假设你的 Docker 容器会把结果输出到一个文件
      res.status(200).send(`Result saved to: /results/output-${fileName}.txt`);
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

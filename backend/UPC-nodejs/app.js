//import and setting
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import extract from "extract-zip";
import upload from "./Components/upload.js";
import { exec, spawn } from "child_process";
import { User, Task } from "./Components/mongo.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cors());

//Rate limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
app.use(limiter);


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

// app.post('/api/upload', upload.single('file'), (req, res) => {
//     res.send('File uploaded successfully');
// });

app.post('/api/upload', upload.array('file', 12), (req, res) => {
    res.send('File uploaded successfully');
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
    exec('docker images --format "{{.Repository}}:{{.Tag}}——{{.Size}}"', (err, stdout, stderr) => {
        if (err) {
            // 错误处理
            res.status(500).send(stderr);
        } else {
            // 标准输出处理
            const images = stdout.split('\n').filter(line => line); // 删除空行
            res.status(200).json(images);
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
        return res.status(400).send({ message: 'Invalid file type' });
    }
    if (!fs.existsSync(filePath)) {
        console.log('File does not exist');
        return res.status(400).send({ message: 'File does not exist' });
    }
    
    //unzip the file
    try {
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
        });

        pack.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pack.on('close', (code) => {
            if (code === 0) {
                console.log(`pack build completed successfully.`);
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


//Listen on port
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});



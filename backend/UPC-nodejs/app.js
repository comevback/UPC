//import and setting
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import upload from "./Components/upload.js";
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

//Listen on port
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});



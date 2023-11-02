//import and setting
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import multer from "multer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import rateLimit from 'express-rate-limit';
import { spawn } from "child_process";

dotenv.config();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//Rate limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
app.use(limiter);

//mongoose connection
mongoose.connect(process.env.MongoURL)
.then(() => {
    console.log(`Connected to MongoDB.`);
})
.catch(error => {
    console.error(`MongoDB connection error: ${error}`);
});

//Create Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
  });
  
const taskSchema = new mongoose.Schema({
title: String,
description: String,
owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

//--------------------------------------------------------------------------------------

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

//Listen on port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});

const child = spawn('docker', ['run', '--rm', '-p', '3001:3000', 'afterlifexx/myblogapp']);

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});

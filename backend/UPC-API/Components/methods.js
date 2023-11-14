// upload
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import axios from "axios";
import rateLimit from "express-rate-limit";

// URL of the central server
const CENTRAL_SERVER = 'http://localhost:8000'; // TODO: Change this to the URL of your central server

// Get host information. ============================================
export const getHostInfo = () => {
    return {
      architecture: os.arch(), 
      cpus: os.cpus().length, 
      totalMemory: bytesToGB(os.totalmem()), 
      freeMemory: bytesToGB(os.freemem()),
      uptime: formatUptime(os.uptime()),
      platform: os.platform(),
      release: os.release(),
    };
};

// Convert bytes to gigabytes ============================================
export const bytesToGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';

// Convert seconds to days, hours, and minutes
export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds % (3600 * 24) / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const hostInfo = getHostInfo();
const id = 'API Service'; // TODO: Change this to a unique ID for your service

// Information about this service
export const serviceInfo = {
  _id: id,
  url: 'http://localhost:4000', // TODO: Change this to the URL of your service
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
  ],
  hostInfo: hostInfo
};


// Upload Function ============================================
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir) // Destination folder
    },
    filename: (req, file, cb) => {
        //cb(null, file.originalname + '_' + Date.now() + path.extname(file.originalname)) // Filename + timestamp
        cb(null, file.originalname) // Filename + timestamp originalname
    }
});

export const upload = multer({ storage });

//Rate limit ============================================
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

// Register the service ============================================
export const registerService = async () => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER}/register-service`, serviceInfo);
      console.log('Service registered');
    } catch (error) {
      console.error('Failed to register service');
    }
};
  
// Send a heartbeat to the central server ============================================
export const sendHeartbeat = async () => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER}/service-heartbeat`, serviceInfo);
      console.log('Heartbeat sent');
    } catch (error) {
      console.error('Failed to send heartbeat');
    }
};
  
// Unregister the service. ============================================
export const unregisterService = async () => {
    try {
      const response = await axios.delete(`${CENTRAL_SERVER}/unregister-service`, { data: { _id: id } });
      console.log('Service unregistered');
    } catch (error) {
      console.error('Failed to unregister service:', error.message);
    }
};


// sort the matched files ============================================
export const sortFiles = (files) => {
  // if the file is a python file, put it in the front
  const pyFiles = files.filter(file => file.endsWith('.py'));
  const otherFiles = files.filter(file => !file.endsWith('.py'));
  return pyFiles.concat(otherFiles);
}
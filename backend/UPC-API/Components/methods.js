import multer from 'multer';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import axios from "axios";
import rateLimit from "express-rate-limit";
import { exec, execSync } from 'child_process';
// import OpenAI from 'openai';

dotenv.config();

// Get the Public IP of the backend server
const response = await axios.get('https://api.ipify.org?format=json');
const backendIP = `http://${response.data.ip}:4000`;
console.log('Backend IP:', backendIP);

// Get the Local IP of the backend server
const getLocalIPAddress = () =>{
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '0.0.0.0';
}

const localIP = getLocalIPAddress();
const localURL = `http://${localIP}:4000`;
console.log(`Local IP Address: ${localIP}`);

// URL of this service
const hostURL = process.env.API_URL || localURL; // TODO: Change this to the URL of your service
// URL of the central server
const CENTRAL_SERVER = process.env.CENTRAL_SERVER || 'http://18.179.12.207:8000'; // TODO: Change this to the URL of your central server
// ChatGPT API
// const CHATGPT_API = process.env.OpenAI_API_Key; // replace with your chatGPT API URL

// // OpenAI
// const openai = new OpenAI({
//   apiKey: CHATGPT_API,
// });

// export const AI_input = async (file_input) => {
//   try {
//     const file = await openai.files.create({
//       file: fs.createReadStream(file_input),
//       purpose: 'assistants',
//     });

//     const assistant = await openai.beta.assistants.create({
//       name: "Dockerfile Generator",
//       description: "You are a developer who wants to create a Dockerfile for your project.",
//       model: "gpt-3.5-turbo-1106",
//       tools: [{"type": "code_interpreter"}, {"type": "retrieval"}],
//       file_ids: [file.id]
//     });
  
//     const thread = await openai.beta.threads.create({
//       messages: [
//         {
//           "role": "user",
//           "content": "Create a Dockerfile for my project.",
//           "file_ids": [file.id]
//         }
//       ]
//     });
  
//     const run = await openai.beta.threads.runs.create(
//       thread.id,
//       { assistant_id: assistant.id }
//     );

//     return (thread.id, run.id);
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// }

// export const checkRunResult = async (thread_id, run_id) => {
//   try {
//     const run_result = await openai.beta.threads.runs.retrieve(
//       thread_id,
//       run_id
//     );
//     return run_result;
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// }


// Get host information. ============================================
export const getHostInfo = () => {
    return {
      architecture: os.arch(), 
      cpus: os.cpus().length, 
      cpuModel: os.cpus()[0].model, // CPU model
      cpuSpeed: os.cpus()[0].speed/1000, // CPU speed（MHz）
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
const id = `API: ${hostURL}`; // TODO: Change this to a unique ID for your service

// Information about this service
export const serviceInfo = {
  _id: id,
  url: hostURL, // TODO: Change this to the URL of your service
  publicUrl: backendIP,
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

//Rate limit =======================================================================================
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

// Register the service ============================================================================
export const registerService = async () => {
    try {
      const response = await axios.post(`${CENTRAL_SERVER}/register-service`, serviceInfo);
      if (response.status >= 200 && response.status < 300) {
        return true;
      } else {
        console.error('Failed to register service: ' + response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Failed to register service:' + error.message);
      return false;
    }
};

// Send a heartbeat to the central server ============================================
export const sendHeartbeat = async () => {
    try {
      const hostInfo = getHostInfo();
      const response = await axios.post(`${CENTRAL_SERVER}/service-heartbeat`, { _id: id, hostInfo: hostInfo});
      if (response.status == 200){
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to send heartbeat:' + error.message);
      return false;
    }
};

// Unregister the service. ============================================================
export const unregisterService = async () => {
    try {
      await axios.delete(`${CENTRAL_SERVER}/unregister-service`, { data: { _id: id } });
      console.log('Service unregistered');
    } catch (error) {
      console.error('Failed to unregister service:', error.message);
    }
};


// sort the matched files ==================================================================
export const sortFiles = (files) => {
  // if the file is a python file, put it in the front
  const pyFiles = files.filter(file => file.endsWith('.py'));
  const otherFiles = files.filter(file => !file.endsWith('.py'));
  return pyFiles.concat(otherFiles);
}

// Process the uploaded files ============================================================
export const processFiles = async (imageName, fileNames) => {
  const processedFiles = [];
  for (const file of files) {
    const result = await processFile(file);
    processedFiles.push(result);
  }
  return processedFiles;
};


// (docker inspect --format='{{.Config.WorkingDir}}' your-image-name) this command can get the working directory of the image
// (docker inspect --format='{{.Config.Entrypoint}}' your-image-name) this command can get the entrypoint of the image
// (docker inspect --format='{{.Config.Cmd}}' your-image-name) this command can get the cmd of the image

//get the working directory of the image
export const getWorkingDir = async(imageName) => {
  return new Promise((resolve, reject) => {
      exec(`docker inspect --format='{{.Config.WorkingDir}}' ${imageName}`, (err, stdout, stderr) => {
          if (err) {
              // Error handling
              console.error(`Error inspecting image: ${err}`);
              reject(stderr);
          } else {
              resolve(stdout.trim());
          }
      });
  });
}

//get the entrypoint of the image
export const getEntrypoint = async(imageName) => {
  return new Promise((resolve, reject) => {
      exec(`docker inspect --format='{{.Config.Entrypoint}}' ${imageName}`, (err, stdout, stderr) => {
          if (err) {
              // Error handling
              console.error(`Error inspecting image: ${err}`);
              reject(stderr);
          } else {
              resolve(stdout.trim());
          }
      });
  });
}

//get the cmd of the image
export const getCmd = async(imageName) => {
  return new Promise((resolve, reject) => {
      exec(`docker inspect --format='{{.Config.Cmd}}' ${imageName}`, (err, stdout, stderr) => {
          if (err) {
              // Error handling
              console.error(`Error inspecting image: ${err}`);
              reject(stderr);
          } else {
              resolve(stdout.trim());
          }
      });
  });
}

// detect the available shell
export const getAvailableShell = () => {
  const shells = ['zsh', 'bash', 'sh', 'csh', 'ksh', 'powershell', 'cmd'];

  for (let shell of shells) {
      try {
          // check if the shell exists
          execSync(`which ${shell}`);
          return shell; // if the shell exists, return it
      } catch (e) {
          // if the shell doesn't exist, try the next one
      }
  }

  return null; // if no shells exist, return null
}
import express from "express";
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import backendRoutes from './Routes/backend.js';
import frontendRoutes from './Routes/frontend.js';
import fileRoutes from './Routes/files.js';
import { upload, checkDatabaseConnection, BackendService, FrontendService, backendServices, frontendServices, readServicesFromFile, writeServicesToFile, CleanUpDataBase, CleanUpLocal } from "./Components/method.js";

const port = process.env.REGI_PORT || 8000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('trust proxy', true); // trust first proxy
app.use(express.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cors());

// ************************************************  manage the services  ************************************************
// Read data from file on startup
readServicesFromFile();

// Check if the database is connected, if not, use local storage instead of database
let isDbConnected = false;
checkDatabaseConnection().then((isConnected) => {
  if (isConnected) {
    console.log('Connected to MongoDB.');
    isDbConnected = true;
  } else {
    console.log('Failed to connect to MongoDB. use local storage instead.');
    isDbConnected = false;
  }
});

// 中间件来设置 isDbConnected 状态
app.use((req, res, next) => {
  req.isDbConnected = isDbConnected;
  next();
});

// *************************************************** Routes ****************************************************
app.use('/frontend', frontendRoutes);
app.use('/backend', backendRoutes);
app.use('/files', fileRoutes);

// Homepage
app.get('/', async (req, res) => {
  try {
    if (isDbConnected) {
      const backend_services = await BackendService.find().lean();  // Lean() is to convert the mongoose object to a plain JS object
      const frontend_services = await FrontendService.find().lean(); // Lean() is to convert the mongoose object to a plain JS object
      res.render('index.ejs', { backend_services, frontend_services });
    } else {
      const backend_services = Object.values(backendServices); // Convert the object to an array
      const frontend_services = Object.values(frontendServices);
      res.render('index.ejs', { backend_services, frontend_services });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start the Server --------------------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Register server is running on port ${port}.`);
  if (isDbConnected) {
    setInterval(CleanUpDataBase, 60000);
  } else {
    setInterval(CleanUpLocal, 60000);
  }
});
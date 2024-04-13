import express from "express";
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { upload, checkDatabaseConnection, BackendService, FrontendService, backendServices, frontendServices, readServicesFromFile, writeServicesToFile, CleanUpDataBase, CleanUpLocal } from "./Components/method.js";

const port = process.env.REGI_PORT || 8000; 
const app = express();
app.set('trust proxy', true); // trust first proxy
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cors());


// manage the services =================================================================================

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


// Endpoints --------------------------------------------------------------------------------------------

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


// BACKEND SERVERS --------------------------------------------------------------------------------------------


// List all registered services as json
app.get('/list-services', async (req, res) => {
  try {
    if (isDbConnected) {
      const services = await BackendService.find();
      res.send(services);
    } else {
      const services = Object.values(backendServices); // Convert the object to an array
      res.send(services);
    } 
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Register a service
app.post('/register-service', async (req, res) => {
    const { _id, url, publicUrl, hostInfo } = req.body;
    try {
      if (isDbConnected) {
        const newService = new BackendService({
          _id,
          url,
          publicURL: publicUrl,
          createdAt: new Date(),
          hostInfo
        });
        await BackendService.findOneAndUpdate({ _id: _id }, newService, { upsert: true }) // upsert: true means if the service is not found, insert it
        .then((service) => {
          console.log(`Service ${service._id} registered successfully`);
          res.status(201).json(service);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: error.message });
        });
      } else {
        backendServices[_id] = {
          _id,
          url,
          publicURL: publicUrl,
          hostInfo,
          createdAt: new Date(),
          lastHeartbeat: new Date()
        };
        writeServicesToFile();
        console.log(`Service ${_id} registered successfully`);
        res.status(201).json({ message: 'Service registered successfully.' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Unregister a service
app.delete('/unregister-service', async (req, res) => {
  const { _id } = req.body;
  try {
    if (isDbConnected) {
      const service = await BackendService.findByIdAndDelete(_id);
      console.log(`Unregistered service ${service._id}`);
      // Service has been found and deleted successfully
      res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
    } else {
      const service = backendServices[_id]
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      delete backendServices[_id];
      writeServicesToFile()
      console.log(`Unregistered service ${service._id}`);
      // Service has been found and deleted successfully
      res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
// Heartbeat Endpoint
app.post('/service-heartbeat', async (req, res) => {
  const { _id, hostInfo } = req.body;
    try {
      if (isDbConnected) {
        const service = await BackendService.findByIdAndUpdate(
            _id,
            // update the hostInfo and lastHeartbeat
            { hostInfo, lastHeartbeat: Date.now() },
            { new: true }
        );
        console.log(`Heartbeat from backend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(service);
      } else {
        const service = backendServices[_id];
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        // update the hostInfo and lastHeartbeat
        service.hostInfo = hostInfo;
        service.lastHeartbeat = Date.now();
        console.log(`Heartbeat from backend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
        res.status(200).json(service);
      }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// FRONTEND SERVERS --------------------------------------------------------------------------------------------

// Register frontend server
app.post('/frontend/register-service', async (req, res) => {
  const { _id, url, publicUrl } = req.body;
  try {
    if (isDbConnected) {
      const newService = new FrontendService({
        _id,
        url,
        publicURL: publicUrl,
        createdAt: new Date()
      });
      await FrontendService.findOneAndUpdate({ _id: _id }, newService, { upsert: true, new: true }) // upsert: true means if the service is not found, insert it
      .then((service) => {
        console.log(`Service ${service._id} registered successfully`);
        res.status(201).json(service);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: error.message });
      });
    } else {
      frontendServices[url] = {
        _id,
        url,
        publicURL: publicUrl,
        createdAt: new Date(),
        lastHeartbeat: new Date()
      };
      writeServicesToFile();
      console.log(`Service ${_id} registered successfully`);
      res.status(201).json({ message: 'Service registered successfully.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unregister frontend server 
app.delete('/frontend/unregister-service', async (req, res) => {
  const { _id } = req.body;
  try {
    if (isDbConnected) {
      const service = await FrontendService.findByIdAndDelete(_id);
      console.log(`Unregistered service ${service._id}`);
      // Service has been found and deleted successfully
      res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
    } else {
      const service = frontendServices[_id]
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      delete frontendServices[_id];
      writeServicesToFile()
      console.log(`Unregistered service ${service._id}`);
      // Service has been found and deleted successfully
      res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// heartbeat from frontend server
app.post('/frontend/service-heartbeat', async (req, res) => {
  const { _id } = req.body;
  try {
    if (isDbConnected) {
      const service = await FrontendService.findByIdAndUpdate(
          _id,
          { lastHeartbeat: Date.now() },
          { new: true }
      );
      console.log(`Heartbeat from frontend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
      if (!service) {
          return res.status(404).json({ message: "Service not found" });
      }
      res.status(200).json(service);
    } else {
      const service = frontendServices[_id];
      if (!service) {
          return res.status(404).json({ message: "Service not found" });
      }
      service.lastHeartbeat = Date.now();
      console.log(`Heartbeat from frontend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
      res.status(200).json(service);
    }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


// manage the files ================================================================================================

//Route to update files to the server
app.post('/upload', upload.array('file', 50), (req, res) => {
  console.log(req.files);
  res.send(req.files);
});

// Route to get the list of all files
app.get('/files', async (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');
  // if the uploads folder does not exist, create it
  if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
  }
  fs.readdir(directoryPath, (err, files) => {
      if (err) {
          return res.status(500).send('Unable to scan directory: ' + err);
      } 
      // ignore the .gitkeep and __MACOSX and .DS_Store file
      files = files.filter(file => file !== '.gitkeep' && file !== '__MACOSX' && file !== '.DS_Store');
      // Return the list of files
      res.send(files);
  });
});

// Route to get the list of all results
app.get('/results', async (req, res) => {
  const directoryPath = path.join(__dirname, 'results');
  if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
  }
  fs.readdir(directoryPath, (err, files) => {
      if (err) {
          return res.status(500).send('Unable to scan directory: ' + err);
      } 
      // ignore the .gitkeep file
      files = files.filter(file => file !== '.gitkeep' && file !== '__MACOSX' && file !== '.DS_Store');
      // Return the list of files
      res.send(files);
  });
});

// Route to download a file
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});

// Route to download all selected files
app.post('/files/download', async(req, res) => {
  const { fileNames } = req.body;
  const filePath = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(filePath);
  const matchedFiles = files.filter(file => fileNames.includes(file));

  if (matchedFiles.length === 0) {
      return res.status(404).send('No files found');
  }

  console.log('Files to download:', matchedFiles);

  const zipFileName = 'Files-' + Date.now()+ '.zip'; // Name of the ZIP file to download
  const zipFilePath = path.join(filePath, zipFileName);

  const zip = spawn('zip', ['-r', zipFileName, ...matchedFiles], { cwd: filePath });

  zip.on('close', (code) => {
      if (code !== 0) {
          console.error(`zip process exited with code ${code}`);
          return res.status(500).send({ message: 'Error zipping files' });
      }
      console.log('Files zipped successfully');

      // Now that ZIP process has completed, send the file
      res.download(zipFilePath, (err) => {
          if (err) {
              // Handle error, but don't re-throw if headers are already sent
              console.error('Error sending file:', err);
          }

          // Attempt to delete the file after sending it to the client
          fs.unlink(zipFilePath, (unlinkErr) => {
              if (unlinkErr) {
                  console.error(`Error deleting file ${zipFilePath}:`, unlinkErr);
              } else {
                  console.log(`Successfully deleted ${zipFilePath}`);
              }
          });
      });
  });
});

// Route to download a result
app.get('/results/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'results', req.params.filename);
  res.download(filePath);
});

// Route to download all selected results
app.post('/results/download', async(req, res) => {
  const { fileNames } = req.body;
  const filePath = path.join(__dirname, 'results');
  const files = fs.readdirSync(filePath);
  const matchedFiles = files.filter(file => fileNames.includes(file));

  if (matchedFiles.length === 0) {
      return res.status(404).send('No files found');
  }

  console.log('Files to download:', matchedFiles);

  const zipFileName = 'Result-' + Date.now()+ '.zip'; // Name of the ZIP file to download
  const zipFilePath = path.join(filePath, zipFileName);

  const zip = spawn('zip', ['-r', zipFileName, ...matchedFiles], { cwd: filePath });

  zip.on('close', (code) => {
      if (code !== 0) {
          console.error(`zip process exited with code ${code}`);
          return res.status(500).send({ message: 'Error zipping files' });
      }
      console.log('Files zipped successfully');

      // Now that ZIP process has completed, send the file
      res.download(zipFilePath, (err) => {
          if (err) {
              // Handle error, but don't re-throw if headers are already sent
              console.error('Error sending file:', err);
          }

          // Attempt to delete the file after sending it to the client
          fs.unlink(zipFilePath, (unlinkErr) => {
              if (unlinkErr) {
                  console.error(`Error deleting file ${zipFilePath}:`, unlinkErr);
              } else {
                  console.log(`Successfully deleted ${zipFilePath}`);
              }
          });
      });
  });
});

// Route to delete a file
app.delete('/files/:filename', (req, res) => {
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
app.delete('/results/:filename', (req, res) => {
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

// Delete all selected files
app.delete('/files', async(req, res) => {
  const { fileNames } = req.body.files;
  const filePath = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(filePath);
  const matchedFiles = files.filter(file => fileNames.includes(file));

  if (matchedFiles.length === 0) {
      return res.status(404).send('No files found');
  }

  console.log('Files to delete:', matchedFiles);

  matchedFiles.forEach(file => {
      fs.unlinkSync(path.join(filePath, file));
  });

  res.status(200).send({ message: 'Files deleted successfully' });
});


// Delete all selected results
app.delete('/results', async(req, res) => {
  const { fileNames } = req.body.files;
  const filePath = path.join(__dirname, 'results');
  const files = fs.readdirSync(filePath);
  const matchedFiles = files.filter(file => fileNames.includes(file));

  if (matchedFiles.length === 0) {
      return res.status(404).send('No files found');
  }

  console.log('Files to delete:', matchedFiles);

  matchedFiles.forEach(file => {
      fs.unlinkSync(path.join(filePath, file));
  });

  res.status(200).send({ message: 'Files deleted successfully' });
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
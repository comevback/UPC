import express from "express";
import cors from 'cors';
import { checkDatabaseConnection, Service } from "./Components/mongoDB.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cors());
const Server_URL = 'http://localhost:8000';
const port = 8000; 

let frontendServices = {}; // Store the registered frontend services
let backendServices = []; // Store the registered backend services
let isDbConnected = false;

checkDatabaseConnection().then((isConnected) => {
    if (isConnected) {
      console.log('Connected to MongoDB.');
      isDbConnected = true;
    } else {
      console.error('Failed to connect to MongoDB. use local storage instead.');
    }
});

// Homepage
app.get('/', async (req, res) => {
  try {
      if (isDbConnected) {
        const services = await Service.find();
        res.render('index.ejs', { services, frontendServices });
      } else {
        const services = Object.values(backendServices);
        res.render('index.ejs', { services, frontendServices });
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});

// Register a service
app.post('/register-service', async (req, res) => {
    const { _id, url, endpoints, hostConfig } = req.body;
    //console.log(req.body);
  
    try {
      if (isDbConnected) {
      const newService = new Service({
        _id,
        url,
        endpoints,
        hostConfig
      });
      const savedService = await newService.save();
      console.log(`Service ${savedService._id} registered successfully`);
      res.status(201).json(savedService);
      } else {
        backendServices[_id] = {
          _id,
          url,
          endpoints,
          hostConfig,
          createdAt: new Date(),
          lastHeartbeat: new Date()
        };
        console.log(`Service ${_id} registered successfully`);
        res.status(201).json({ message: 'Service registered successfully.' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  
// List all registered services as json
app.get('/list-services', async (req, res) => {
    try {
      if (isDbConnected) {
        const services = await Service.find();
        res.status(200).json(services);
      } else {
        res.status(200).json(backendServices);
      } 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  
  
// Heartbeat Endpoint
app.post('/service-heartbeat/:id', async (req, res) => {
    try {
      if (isDbConnected) {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { lastHeartbeat: Date.now() },
            { new: true }
        );
        console.log(`Heartbeat from backend service : ${service._id}`);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(service);
      } else {
        const service = backendServices[req.params.id];
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        service.lastHeartbeat = Date.now();
        console.log(`Heartbeat from backend service : ${service._id}`);
        res.status(200).json(service);
      }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  
// Unregister a service
app.delete('/unregister-service/:id', async (req, res) => {
    try {
      if (isDbConnected) {
        const service = await Service.findByIdAndDelete(req.params.id);
        console.log(`Unregistered service ${service._id}`);
        // Service has been found and deleted successfully
        res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
      } else {
        const service = backendServices[req.params.id];
        if (!service) {
          return res.status(404).json({ message: "Service not found" });
        }
        delete backendServices[req.params.id];
        console.log(`Unregistered service ${service._id}`);
        // Service has been found and deleted successfully
        res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


// Register frontend server 
app.post('/frontend/register-service', (req, res) => {
    const { name, url } = req.body;
  
    // Use the URL as a unique identifier for the service
    if (frontendServices[url]) {
      return res.status(400).json({ message: 'Service is already registered.' });
    }
  
    // Add the service to the registered services object
    frontendServices[url] = {
      name,
      url,
      registeredAt: new Date()
    };
  
    console.log(`Service ${name} registered successfully`);
    res.status(201).send({ URL: Server_URL }); // 201 Created
});

// Unregister frontend server 
app.delete('/frontend/unregister-service', (req, res) => {
    const { name, url } = req.body;
  
    if (!frontendServices[url]) {
      return res.status(404).json({ message: 'Service not found.' });
    }
  
    // Remove the service from the registered services object
    delete frontendServices[url];
  
    console.log(`Service ${name} unregistered successfully`);
    res.status(200).json({ message: 'Service unregistered successfully.' });
});

  

app.listen(port, () => {
    console.log(`Register server is running on port ${port}.`);
    // Clean up services that have not sent a heartbeat in the last 30 seconds
      if (!isDbConnected) {
        setInterval(async () => {
        for (const service of backendServices) {
          const now = Date.now();
          const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
          if (timeElapsedSinceLastHeartbeat > 300000) { // 5 minutes
            try {
              await Service.findByIdAndDelete(service._id); // Using await to ensure the operation completes
              console.log(`Unregistered service ${service._id}`);
            } catch (error) {
              console.error(`Error unregistering service ${service._id}: ${error}`);
            }
          }
        }
      }, 10000);
    } else {
      setInterval(async () => {
      const services = await Service.find();
      for (const service of services) {
        const now = Date.now();
        const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
        if (timeElapsedSinceLastHeartbeat > 300000) { // 5 minutes
          try {
            await Service.findByIdAndDelete(service._id); // Using await to ensure the operation completes
            console.log(`Unregistered service ${service._id}`);
          } catch (error) {
            console.error(`Error unregistering service ${service._id}: ${error}`);
          }
        }
      }
    }, 10000);
  }
});

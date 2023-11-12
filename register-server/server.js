import express from "express";
import cors from 'cors';
import { checkDatabaseConnection, BackendService, FrontendService } from "./Components/mongoDB.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cors());
const Server_URL = 'http://localhost:8000';
const port = 8000; 

let frontendServices = {}; // Store the registered frontend services
let backendServices = {} // Store the registered backend services
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

// Homepage
app.get('/', async (req, res) => {
  try {
      if (isDbConnected) {
        const backend_services = await BackendService.find();
        const frontend_services = await FrontendService.find();
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
    const { _id, url, endpoints, hostConfig } = req.body;
    try {
      if (isDbConnected) {
        const newService = new BackendService({
          _id,
          url,
          endpoints,
          hostConfig
        });
        await newService.save().then((service) => {
          console.log(`Service ${service._id} registered successfully`);
          res.status(201).json(service);
        }).catch((error) => {
          console.log(error);
          res.status(500).json({ message: error.message });
        });
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
  
// Heartbeat Endpoint
app.post('/service-heartbeat', async (req, res) => {
    const { _id } = req.body;
    try {
      if (isDbConnected) {
        const service = await BackendService.findByIdAndUpdate(
            _id,
            { lastHeartbeat: Date.now() },
            { new: true }
        );
        console.log(`Heartbeat from backend service : ${service._id}`);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(service);
      } else {
        const service = backendServices[_id];
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
        console.log(`Unregistered service ${service._id}`);
        // Service has been found and deleted successfully
        res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


// Register frontend server 
app.post('/frontend/register-service', async (req, res) => {
    const { _id, url } = req.body;

    if (isDbConnected) {
      const newService = new FrontendService({
        _id,
        url
      });
      await newService.save().then((service) => {
        console.log(`Frontend Service: ${service._id} registered successfully`);
        res.status(200).json(service);
      }).catch((err) => {
        console.log(err);
        res.status(500).json({message: err.message})
      });
  } else {
      frontendServices[url] = {
        _id,
        url,
        registeredAt: new Date()
      };
      console.log(`Service ${_id} registered successfully`);
      res.status(201).send({ URL: Server_URL }); // 201 Created
    }
});

// Unregister frontend server 
app.delete('/frontend/unregister-service', async (req, res) => {
    const { _id, url } = req.body;
    if (isDbConnected) {
        const service = await FrontendService.findByIdAndDelete(_id);
        console.log(`Service ${_id} unregistered successfully`);
        res.status(200).json({ message: 'Service unregistered successfully.' });
    } else {
      delete frontendServices[_id];
      console.log(`Service ${_id} unregistered successfully`);
      res.status(200).json({ message: 'Service unregistered successfully.' });
    }
});

// heartbeat from frontend server
app.post('/frontend/service-heartbeat', async (req, res) => {
  const { _id, url } = req.body;
  if (isDbConnected) {
    const service = await FrontendService.findOneAndUpdate(
      { url: url }, 
      { lastHeartbeat: Date.now() }, 
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    console.log(`Heartbeat from frontend service : ${_id}`);
    res.status(200).json(service);
  } else {
    frontendServices[url].lastHeartbeat = Date.now();
    console.log(`Heartbeat from frontend service : ${_id}`);
    res.status(200).json(frontendServices[url]);
  }
});
  

app.listen(port, () => {
    console.log(`Register server is running on port ${port}.`);
    // Clean up services that have not sent a heartbeat in a certain amount of time
      if (!isDbConnected) {
        setInterval(async () => {
        const services = Object.values(backendServices);
        for (const service of services) {
          const now = Date.now();
          const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
          if (timeElapsedSinceLastHeartbeat > 120000) { // 2 minutes
            try {
              await BackendService.findByIdAndDelete(service._id); // Using await to ensure the operation completes
              console.log(`Unregistered service ${service._id}`);
            } catch (error) {
              console.error(`Error unregistering service ${service._id}: ${error}`);
            }
          }
        }
      }, 60000);// 10 seconds
    } else {
      setInterval(async () => {
      const services = await BackendService.find();
      for (const service of services) {
        const now = Date.now();
        const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
        if (timeElapsedSinceLastHeartbeat > 120000) { // 2 minutes
          try {
            await FrontendService.findByIdAndDelete(service._id); // Using await to ensure the operation completes
            console.log(`Unregistered service ${service._id}`);
          } catch (error) {
            console.error(`Error unregistering service ${service._id}: ${error}`);
          }
        }
      }
    }, 60000);
  }
});

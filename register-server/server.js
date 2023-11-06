import express from "express";
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json()); // 用于解析JSON请求体
app.use(express.static("public"));
app.use(cors());
const port = 4000; // 中心服务器的端口号

let frontendServices = {};

// 连接到MongoDB数据库
mongoose.connect('mongodb://localhost:27017/Register-server', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// 定义服务信息的数据结构
const serviceSchema = new mongoose.Schema({
    _id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  endpoints: [{
    type: String,
    required: true
  }],
  hostConfig: {
    architecture: String,
    cpus: Number,
    totalMemory: Number,
    freeMemory: Number,
    uptime: Number,
    platform: String,
    release: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  }
});

const Service = mongoose.model('Service', serviceSchema);


// 存储服务信息的数据结构å

app.post('/register-service', async (req, res) => {
    const { _id, url, endpoints, hostConfig } = req.body;
    //console.log(req.body);
    const newService = new Service({
      _id,
      url,
      endpoints,
      hostConfig
    });
  
    try {
      const savedService = await newService.save();
      console.log(`Service ${savedService._id} registered successfully`);
      res.status(201).json(savedService);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

app.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.render('index.ejs', { services, frontendServices });
    } catch (error) {
        res.status(500).send(error.message);
    }
});
  

app.get('/list-services', async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  
  
// Heartbeat Endpoint
app.post('/service-heartbeat/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { lastHeartbeat: Date.now() },
            { new: true }
        );
        console.log(`Heartbeat from service ${service._id}`);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  

app.delete('/unregister-service/:id', async (req, res) => {
    try {
      await Service.findByIdAndDelete(req.params.id);
      console.log(`Unregistered service ${req.params.id}`);
      // Service has been found and deleted successfully
      res.status(200).json({ message: "Service unregistered successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  

//frontend server ================================
app.post('/frontend/register-service', (req, res) => {
    const { name, url } = req.body;
    console.log(req.body);
  
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
    res.status(201).json({ message: 'Service registered successfully.' });
});

app.delete('/frontend/unregister-service', (req, res) => {
    const { url } = req.body;
  
    if (!frontendServices[url]) {
      return res.status(404).json({ message: 'Service not found.' });
    }
  
    // Remove the service from the registered services object
    delete frontendServices[url];
  
    console.log(`Service unregistered successfully`);
    res.status(200).json({ message: 'Service unregistered successfully.' });
});

  

app.listen(port, () => {
    console.log(`Register server is running on port ${port}.`);
    // Clean up services that have not sent a heartbeat in the last 30 seconds
    setInterval(async () => {
      const services = await Service.find();
      for (const service of services) {
        const now = Date.now();
        const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
        if (timeElapsedSinceLastHeartbeat > 120000) {
          try {
            await Service.findByIdAndDelete(service._id); // Using await to ensure the operation completes
            console.log(`Unregistered service ${service._id}`);
          } catch (error) {
            console.error(`Error unregistering service ${service._id}: ${error}`);
          }
        }
      }
    }, 10000);
});

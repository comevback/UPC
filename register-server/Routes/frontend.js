import express from 'express';
import { FrontendService, frontendServices, writeServicesToFile, checkDatabaseConnection } from '../Components/method.js';

const router = express.Router();


// Check if the database is connected, if not, use local storage instead of database
// let isDbConnected = false;
// checkDatabaseConnection().then((isConnected) => {
//     if (isConnected) {
//       isDbConnected = true;
//     } else {
//       isDbConnected = false;
//     }
// });

// Register frontend server
router.post('/register-service', async (req, res) => {
    const { _id, url, publicUrl } = req.body;
    try {
        if (req.isDbConnected) {
            const newService = new FrontendService({
                _id,
                url,
                publicURL: publicUrl,
                createdAt: new Date()
            });
            await FrontendService.findOneAndUpdate({ _id: _id }, newService, { upsert: true, new: true }) // upsert: true means if the service is not found, insert it, new: true means return the new service
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
router.delete('/unregister-service', async (req, res) => {
    const { _id } = req.body;
    try {
        if (req.isDbConnected) {
            const service = await FrontendService.findByIdAndDelete(_id);
            console.log(`Unregistered service ${service._id}`);
            // Service has been found and deleted successfully
            res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
        } else {
            const service = frontendServices[_id];
            if (!service) {
                return res.status(404).json({ message: "Service not found" });
            }
            delete frontendServices[_id];
            writeServicesToFile();
            console.log(`Unregistered service ${service._id}`);
            // Service has been found and deleted successfully
            res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Heartbeat from frontend server
router.post('/service-heartbeat', async (req, res) => {
    const { _id } = req.body;
    try {
        if (req.isDbConnected) {
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

export default router;

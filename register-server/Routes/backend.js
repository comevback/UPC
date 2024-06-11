import express from 'express';
import { BackendService, backendServices, writeServicesToFile, checkDatabaseConnection } from '../Components/method.js';

const router = express.Router();

// ====================================================== Routes ======================================================

router.get('/list-services', async (req, res) => {
    try {
        if (req.isDbConnected) {
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

// Register a service also used for heartbeat
router.post('/register-service', async (req, res) => {
    const { _id, url, publicUrl, hostInfo } = req.body;
    try {
        if (req.isDbConnected) {
            const service = await BackendService.findByIdAndUpdate(
                _id,
                { url: url, publicURL: publicUrl, hostInfo, lastHeartbeat: Date.now() },
                { new: true, upsert: true } // 如果服务未找到，则插入新的服务
            );
            console.log(`Heartbeat from backend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
            res.status(200).json(service);
        } else {
            const service = backendServices[_id];
            if (!service) {
                // 注册新的服务
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
            } else {
                // 更新现有服务的心跳
                service.url = url;
                service.publicURL = publicUrl;
                service.hostInfo = hostInfo;
                service.lastHeartbeat = Date.now();
                console.log(`Heartbeat from backend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
                writeServicesToFile();
                res.status(200).json(service);
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unregister a service
// router.delete('/unregister-service', async (req, res) => {
//     const { _id } = req.body;
//     try {
//         if (req.isDbConnected) {
//             const service = await BackendService.findByIdAndDelete(_id);
//             console.log(`Unregistered service ${service._id}`);
//             // Service has been found and deleted successfully
//             res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
//         } else {
//             const service = backendServices[_id];
//             if (!service) {
//                 return res.status(404).json({ message: "Service not found" });
//             }
//             delete backendServices[_id];
//             writeServicesToFile();
//             console.log(`Unregistered service ${service._id}`);
//             // Service has been found and deleted successfully
//             res.status(200).json({ message: `Service ${service._id} unregistered successfully` });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// Heartbeat Endpoint
router.post('/service-heartbeat', async (req, res) => {
    const { _id, url, publicUrl, hostInfo } = req.body;
    try {
        if (req.isDbConnected) {
            const service = await BackendService.findByIdAndUpdate(
                _id,
                { url: url, publicURL: publicUrl, hostInfo, lastHeartbeat: Date.now() },
                { new: true }
            );
            console.log(`Heartbeat from backend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
            if (!service) {
                console.log('Service not found, registering now');
                // upsert: true means if the service is not found, insert it
                await BackendService.findOneAndUpdate({ _id: _id, url: url, publicURL: publicUrl, hostInfo, lastHeartbeat: Date.now() }, { upsert: true })
                    .then((newService) => {
                        console.log(`Service ${newService._id} registered successfully`);
                        return res.status(201).json(newService);
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({ message: error.message });
                    });
            } else {
                return res.status(200).json(service);
            }
        } else {
            const service = backendServices[_id];
            if (!service) {
                console.log('Service not found, registering now');
                backendServices[_id] = {
                    _id,
                    url,
                    publicURL: publicUrl,
                    hostInfo,
                    lastHeartbeat: Date.now()
                };
                writeServicesToFile();
                console.log(`Service ${_id} registered successfully`);
                return res.status(201).json({ message: 'Service registered successfully.' });
            } else {
                service.hostInfo = hostInfo;
                service.lastHeartbeat = Date.now();
                console.log(`Heartbeat from backend service: (${service._id}): ————` + new Date(Date.now()).toLocaleString());
                return res.status(200).json(service);
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;

import fs from 'fs';

// Local storage --------------------------------------------------------------------------------------------

const frontendServicesFile = './frontendServices.json';
const backendServicesFile = './backendServices.json';

export let frontendServices = {}; 
export let backendServices = {};

// Read data from file
export function readServicesFromFile() {
  // Check if the file exists and create it if it doesn't
  if (!fs.existsSync(frontendServicesFile)) {
    fs.writeFileSync(frontendServicesFile, JSON.stringify({}, null, 2), 'utf8');
  } else {
    frontendServices = JSON.parse(fs.readFileSync(frontendServicesFile, 'utf8'));
  }

  // Check if the file exists and create it if it doesn't
  if (!fs.existsSync(backendServicesFile)) {
    fs.writeFileSync(backendServicesFile, JSON.stringify({}, null, 2), 'utf8');
  } else {
    backendServices = JSON.parse(fs.readFileSync(backendServicesFile, 'utf8'));
  }
}

// Write data to file
export function writeServicesToFile() {
  fs.writeFileSync(frontendServicesFile, JSON.stringify(frontendServices, null, 2), 'utf8');
  fs.writeFileSync(backendServicesFile, JSON.stringify(backendServices, null, 2), 'utf8');
}

// Clean up Functions
export const CleanUpBackend = async () => {
  if (!isDbConnected) {
    const services = Object.values(backendServices);
    for (const service of services) {
      const now = Date.now();
      const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
      if (timeElapsedSinceLastHeartbeat > 120000) { // 2 minutes
        try {
          delete backendServices[service._id];
          writeServicesToFile();
          console.log(`Unregistered service ${service._id}`);
        } catch (error) {
          console.error(`Error unregistering service ${service._id}: ${error}`);
        }
      }
    }
  } else {
    try {
      await BackendService.deleteMany({ lastHeartbeat: { $lt: Date.now() - 120000 } });
    } catch (error) {
      console.error(`Error unregistering service ${service._id}: ${error}`);
    }
  }
};

export const CleanUpFrontend = async () => {
  if (!isDbConnected) {
    const services = Object.values(frontendServices);
    for (const service of services) {
      const now = Date.now();
      const timeElapsedSinceLastHeartbeat = now - service.lastHeartbeat;
      if (timeElapsedSinceLastHeartbeat > 120000) { // 2 minutes
        try {
          delete frontendServices[service._id];
          writeServicesToFile();
          console.log(`Unregistered service ${service._id}`);
        } catch (error) {
          console.error(`Error unregistering service ${service._id}: ${error}`);
        }
      }
    }
  } else {
    try {
      await FrontendService.deleteMany({ lastHeartbeat: { $lt: Date.now() - 120000 } });
    } catch (error) {
      console.error(`Error unregistering service ${service._id}: ${error}`);
    }
  }
};
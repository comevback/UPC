import multer from 'multer';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config("../.env");

let BackendService, FrontendService;



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

// MongoDB Cloud--------------------------------------------------------------------------------------------

// test if the database is connected
const checkDatabaseConnection = async () => {
    try {
      const connection = await mongoose.connect(process.env.MongoURL);
      // if after 3 seconds the connection is not successful, the database is not connected
      setTimeout(() => {
        if (!connection) {
          console.error('Failed to connect to MongoDB, falling back to local storage.');
          return false; // if database connection failed
        }
      }, 3000);
      // if the connection is successful, the database is connected
      if (connection) {
        console.log('Connected to MongoDB.');
        return true;
      } else {
        console.error('Failed to connect to MongoDB, falling back to local storage.');
        return false; // if database connection failed
      }
    } catch (error) {
      console.error('Failed to connect to MongoDB, falling back to local storage.');
      return false; // if database connection failed
    }
  };
  
  if (await checkDatabaseConnection()) {
    // Connect to MongoDB
    mongoose.connect(process.env.MongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    // Define the backend service schema
    const serviceSchema = new mongoose.Schema({
        _id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      publicURL: {
        type: String,
        required: false
      },
      hostInfo: {
        architecture: String,
        cpus: Number,
        totalMemory: String,
        freeMemory: String,
        cpuModel: String, // CPU model
        cpuSpeed: Number, // CPU speed（MHz）
        uptime: String,
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
  
    // define the frontend service schema
    const frontendServiceSchema = new mongoose.Schema({
      _id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      publicURL: {
        type: String,
        required: false
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
  
    // Create a model using the schema
    BackendService = mongoose.model('BackendService', serviceSchema);
    FrontendService = mongoose.model('FrontendService', frontendServiceSchema);
  } else {
      BackendService = {};
      FrontendService = {};
  }
  
export { checkDatabaseConnection, BackendService, FrontendService }



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
export const CleanUpDataBase = async () => {
    const thresholdTime = Date.now() - 120000; // 2 minutes
    try {
        await FrontendService.deleteMany({ lastHeartbeat: { $lt: thresholdTime } });
        await BackendService.deleteMany({ lastHeartbeat: { $lt: thresholdTime } });
    } catch (error) {
        console.error(`Error during cleanup process: ${error}`);
    }
};


export const CleanUpLocal = async () => {
    const back_services = Object.values(frontendServices);
    const front_services = Object.values(backendServices);
    const now = Date.now();

    // Clean up the backend services
    for (const service of back_services) {
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

    // Clean up the frontend services
    for (const service of front_services) {
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
};

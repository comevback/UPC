import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config("../.env");

let BackendService, FrontendService;


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
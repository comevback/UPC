import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config("../.env");

let Service;

const checkDatabaseConnection = async () => {
  try {
    await mongoose.connect(process.env.MongoURL);
    return true; // if database connected successfully
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


// Define the service schema
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

Service = mongoose.model('Service', serviceSchema);
} else {
  Service = {};
}

export {checkDatabaseConnection, Service}
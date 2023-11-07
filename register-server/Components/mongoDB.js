import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config("../.env");

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

export const Service = mongoose.model('Service', serviceSchema);
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config('../.env');

// mongoose connection
mongoose.connect(process.env.MongoURL)
.then(() => {
    console.log(`Connected to MongoDB.`);
})
.catch(error => {
    console.error(`MongoDB connection error: ${error}`);
});

// Create Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

export { User, Task };
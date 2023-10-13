import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MongoURL).then(() => {console.log("Successfully connected to the MongoDB")}).catch((err) => {console.log(err)});
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    tasks: [String]
});
const User = mongoose.model("user", UserSchema);

app.listen(port, () => {
    console.log(`Server is listening on the port ${port}.`);
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post('/submit_job', (req, res) => {
    // Extract job data from request
    const jobData = req.body;
  
    // TODO: Process job data and send to worker nodes
    
    // Send a response
    res.send('Job submitted!');
  });

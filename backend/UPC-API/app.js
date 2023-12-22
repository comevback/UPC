//import and setting
import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import pty from 'node-pty';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from "child_process"; 
import http from "http";
import { Server } from "socket.io";    
import { AI_input, checkRunResult, serviceInfo, upload, limiter, registerService, unregisterService, sendHeartbeat, sortFiles, getWorkingDir, getEntrypoint, getCmd, getAvailableShell } from "./Components/methods.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
const port = process.env.API_PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.json()); // for parsing application/json
app.use(cors());
//app.use(limiter);

// Register Or Heartbeat ======================================================================================

let isRegistered = false;

const Register = async () => {
    const response = await registerService();
    if (response) {
        isRegistered = true;
        console.log('Service registered');
    } else {
        isRegistered = false;
        console.log('Failed to register service, isRegisterd: ' + isRegistered);
    }
};

const Heartbeat = async () => {
    const response = await sendHeartbeat();
    if (response) {
        console.log('Heartbeat sent: ————' + new Date(Date.now()).toLocaleString());
    } else {
        isRegistered = false;
    }
}

Register();

// Send a heartbeat or register the service every 60 seconds
setInterval(() => {
    if (!isRegistered) {
        Register();
    } else {
        Heartbeat();
    };
}, 60000);


// Gracefully unregister the service when the process is terminated ============================================
const gracefulShutdown = () => {
    try {
      unregisterService();
      console.log('Service unregistered and server is closing.');
      setTimeout(() => {
        process.exit(0);
      }, 1000); // Wait 3 seconds before shutting down
    } catch (error) {
      console.log('Failed to unregister service: ', error.message);
    } 
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Routers ======================================================================================

//basic
app.get("/", (req, res) => {
    res.render("index");
});

//Connection test
app.get('/api', (req, res) => {
    res.send("Connected to API server");
});

//Route to update files to the server
app.post('/api/upload', upload.array('file', 50), (req, res) => {
    console.log(req.files);
    res.send(req.files);
});

// Route to get the list of all files
app.get('/api/files', async (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    // if the uploads folder does not exist, create it
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        } 
        // ignore the .gitkeep and __MACOSX and .DS_Store file
        files = files.filter(file => file !== '.gitkeep' && file !== '__MACOSX' && file !== '.DS_Store');
        // Return the list of files
        res.send(files);
    });
});

// Route to get the list of all results
app.get('/api/results', async (req, res) => {
    const directoryPath = path.join(__dirname, 'results');
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        } 
        // ignore the .gitkeep file
        files = files.filter(file => file !== '.gitkeep' && file !== '__MACOSX' && file !== '.DS_Store');
        // Return the list of files
        res.send(files);
    });
});

// Route to get the list of all temp
app.get('/api/temps', async (req, res) => {
    const directoryPath = path.join(__dirname, 'temps');
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        // ignore the .gitkeep file
        files = files.filter(file => file !== '.gitkeep' && file !== '__MACOSX' && file !== '.DS_Store');
        // Return the list of files
        res.send(files);
    });
});

// Route to get the list of all images
app.get('/api/images', (req, res) => {
    exec('docker images --format "{{.Repository}}:{{.Tag}}" | sort', (err, stdout, stderr) => {
        if (err) {
            // Error handling
            res.status(500).send(stderr);
        } else {
            // Standard output handling
            const images = stdout.split('\n').filter(line => line); // Delete the last empty line
            res.status(200).json(images);
        }
    });
});

//view the image details
app.get('/api/images/:imageName', async(req, res) => {
    const { imageName } = req.params;

    exec(`docker inspect ${imageName}`, (err, stdout, stderr) => {
        if (err) {
            // Error handling
            console.error(`Error inspecting image: ${err}`);
            res.status(500).send(stderr);
        } else {
            try {
                // Try to parse the JSON output
                const imageDetails = JSON.parse(stdout);
                // Create a new array with the formatted details
                const formattedDetails = imageDetails.map(detail => ({
                    WorkingDir: detail.Config.WorkingDir,
                    Entrypoint: detail.Config.Entrypoint,
                    Cmd: detail.Config.Cmd,
                    Id: detail.Id,
                    Created: detail.Created,
                    Size: `${(detail.Size / 1024 / 1024).toFixed(2)} MB`,
                    Architecture: detail.Architecture,
                    RepositoryTags: detail.RepoTags,
                    Os: detail.Os,
                    DockerVersion: detail.DockerVersion,
                    // more details can be added here
                }));

                // Send the formatted details to the client
                res.status(200).json(formattedDetails);

                // 

            } catch (parseErr) {
                // If the JSON parsing fails, send an error to the client
                console.error(`Error parsing JSON: ${parseErr}`);
                res.status(500).send('Error parsing JSON');
            }
        }
    });
});

// Route to download a file
app.get('/api/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath);
});

// Route to download all selected files
app.post('/api/files/download', async(req, res) => {
    const { fileNames } = req.body;
    const filePath = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter(file => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send('No files found');
    }

    console.log('Files to download:', matchedFiles);

    const zipFileName = 'Result-' + Date.now()+ '.zip'; // Name of the ZIP file to download
    const zipFilePath = path.join(filePath, zipFileName);

    const zip = spawn('zip', ['-r', zipFileName, ...matchedFiles], { cwd: filePath });

    zip.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        io.emit('output', data.toString());
    });

    zip.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        io.emit('output', data.toString());
    });

    zip.on('close', (code) => {
        if (code !== 0) {
            console.error(`zip process exited with code ${code}`);
            return res.status(500).send({ message: 'Error zipping files' });
        }
        console.log('Files zipped successfully');
        io.emit('output', 'Files zipped successfully');

        // Now that ZIP process has completed, send the file
        res.download(zipFilePath, (err) => {
            if (err) {
                // Handle error, but don't re-throw if headers are already sent
                console.error('Error sending file:', err);
            }

            // Attempt to delete the file after sending it to the client
            fs.unlink(zipFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting file ${zipFilePath}:`, unlinkErr);
                } else {
                    console.log(`Successfully deleted ${zipFilePath}`);
                }
            });
        });
    });
});

// Route to download a result
app.get('/api/results/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'results', req.params.filename);
    res.download(filePath);
});

// Route to download all selected results
app.post('/api/results/download', async(req, res) => {
    const { fileNames } = req.body;
    const filePath = path.join(__dirname, 'results');
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter(file => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send('No files found');
    }

    console.log('Files to download:', matchedFiles);

    const zipFileName = 'Result-' + Date.now()+ '.zip'; // Name of the ZIP file to download
    const zipFilePath = path.join(filePath, zipFileName);

    const zip = spawn('zip', ['-r', zipFileName, ...matchedFiles], { cwd: filePath });

    zip.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        io.emit('output', data.toString());
    });

    zip.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        io.emit('output', data.toString());
    });

    zip.on('close', (code) => {
        if (code !== 0) {
            console.error(`zip process exited with code ${code}`);
            return res.status(500).send({ message: 'Error zipping files' });
        }
        console.log('Files zipped successfully');
        io.emit('output', 'Files zipped successfully');

        // Now that ZIP process has completed, send the file
        res.download(zipFilePath, (err) => {
            if (err) {
                // Handle error, but don't re-throw if headers are already sent
                console.error('Error sending file:', err);
            }

            // Attempt to delete the file after sending it to the client
            fs.unlink(zipFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting file ${zipFilePath}:`, unlinkErr);
                } else {
                    console.log(`Successfully deleted ${zipFilePath}`);
                }
            });
        });
    });
});

// Route to download a temp
app.get('/api/temps/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'temps', req.params.filename);
    res.download(filePath);
});

// Route to download all selected temps
app.post('/api/temps/download', async(req, res) => {
    const { fileNames } = req.body;
    const filePath = path.join(__dirname, 'temps');
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter(file => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send('No files found');
    }

    console.log('Files to download:', matchedFiles);

    const zipFileName = 'Result-' + Date.now()+ '.zip'; // Name of the ZIP file to download
    const zipFilePath = path.join(filePath, zipFileName);

    const zip = spawn('zip', ['-r', zipFileName, ...matchedFiles], { cwd: filePath });

    zip.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        io.emit('output', data.toString());
    });

    zip.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        io.emit('output', data.toString());
    });

    zip.on('close', (code) => {
        if (code !== 0) {
            console.error(`zip process exited with code ${code}`);
            return res.status(500).send({ message: 'Error zipping files' });
        }
        console.log('Files zipped successfully');
        io.emit('output', 'Files zipped successfully');

        // Now that ZIP process has completed, send the file
        res.download(zipFilePath, (err) => {
            if (err) {
                // Handle error, but don't re-throw if headers are already sent
                console.error('Error sending file:', err);
            }

            // Attempt to delete the file after sending it to the client
            fs.unlink(zipFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting file ${zipFilePath}:`, unlinkErr);
                } else {
                    console.log(`Successfully deleted ${zipFilePath}`);
                }
            });
        });
    });
});


// Generate Image after upload and unzip file =========================================================================================
app.post('/api/files/:filename', async(req, res) => {
    const startTime = Date.now();

    const { filename } = req.params;
    const baseFileName = path.basename(filename, '.zip');
    const filePath = path.join(__dirname, 'uploads', filename);
    const extractPath = path.join(__dirname, 'uploads');
    const appPath = path.join(__dirname, 'uploads', baseFileName);

    console.log(`Attempting to unzip file: ${filePath}`);

    if (!filename.endsWith('.zip')) {
        console.log('Invalid file type');
        io.emit('geneError', 'Invalid file type, Shoud be .zip file');
        return res.status(400).send({ message: 'Invalid file type, Shoud be .zip file' });
    }
    if (!fs.existsSync(filePath)) {
        console.log('File does not exist');
        return res.status(400).send({ message: 'File does not exist' });
    }

    if (fs.existsSync(appPath)) {
        await fs.promises.rm(appPath, { recursive: true });
        console.log('Previous unzipped folder deleted');
    }
    
    //await extract(filePath, { dir: extractPath });

    const unzip = spawn('unzip', ['-o', filePath, '-d', extractPath]);

    unzip.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        io.emit('geneMessage', data.toString());
    });

    unzip.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        io.emit('geneError', data.toString());
    });

    unzip.on('close', (code) => {
        if (code !== 0) {
            console.error(`unzip process exited with code ${code}`);
            return res.status(500).send({ message: 'Error unzipping file' });
        }
        
        console.log('File unzipped successfully');
        io.emit('geneMessage', 'File unzipped successfully');

        const pack = spawn('pack', [
            'build', 
            baseFileName.toLowerCase(),               // This is the image name
            '--path', appPath,        // Path to the application code
            '--builder', 'paketobuildpacks/builder-jammy-base'
        ]);
    
        pack.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            // Send the output to all connected WebSocket clients
            io.emit('geneMessage', data.toString());
        });
    
        pack.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            // Send the Error to all connected WebSocket clients
            io.emit('geneError', data.toString());
        });
    
        pack.on('close', async(code) => {
            const endTime = Date.now();
            const timeTaken = (endTime - startTime)/1000 ;
            console.log(`Time took: ${timeTaken}s`);
    
            if (code === 0) {
                console.log(`pack build completed successfully.`);
                await fs.promises.rm(appPath, { recursive: true }); // Delete the unzipped folder
                console.log('unzipped folder deleted');
                io.emit('geneMessage', `[${timeTaken}s] Image built successfully.`);
                res.status(200).send({ message: 'Image built successfully'});
            } else {
                console.error(`pack build failed with code ${code}`);
                io.emit('geneError', `[${timeTaken}s] Error building image.`);
                res.status(500).send({ message: 'Error building image'});
            }
        });

    });  
});

// Route to Process a Task by image with or without input files
app.post('/api/process', async(req, res) => {
    const startTime = Date.now();

    const { imageName, fileNames } = req.body;
    // put the files matching the fileNames in the uploads folder into the anonymous directory
    const filePath = path.join(__dirname, 'uploads');
    const tempPath = path.join(__dirname, 'temps'); // Create a temporary directory to store the files
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath);
    }
    const resultPath = path.join(__dirname, 'results');
    const files = fs.readdirSync(filePath); // Get the list of files in the uploads folder
    const matchedFiles = files.filter(file => fileNames.includes(file)); // Filter the files to only include the ones in the fileNames array
    console.log('Files to copy:', matchedFiles);
    // Copy the files to the temp directory
    matchedFiles.forEach(file => {
        fs.copyFileSync(path.join(filePath, file), path.join(tempPath, file));
    });

    const WorkingDir = await getWorkingDir(imageName);
    const Entrypoint = await getEntrypoint(imageName);
    const Cmd = await getCmd(imageName);
    console.log(`WorkingDir: ${WorkingDir}`);
    console.log(`Entrypoint: ${Entrypoint}`);
    console.log(`Cmd: ${Cmd}`);

    //use spawn to run the command, use --mount to mount the temp directory
    const docker_process = spawn('docker', [
        'run', 
        '--rm', 
        '-v', `${tempPath}:${WorkingDir}/input`, 
        '-v', `${resultPath}:${WorkingDir}/output`, 
        imageName, 
        // other parameters
    ]);

    //use websocket to send the output to the client
    docker_process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        // Send the output to all connected WebSocket clients
        //io.emit('runMessage', data.toString());
        io.emit('output', data.toString());
    });
    //use websocket to send the error to the client
    docker_process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        // Send the Error to all connected WebSocket clients
        //io.emit('runError', data.toString());
        io.emit('output', data.toString());
    });
    //use websocket to send the result to the client
    docker_process.on('close', async(code) => {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime)/1000 ;
        console.log(`Time took: ${timeTaken}s`);

        if (code === 0) {
            console.log(`docker run completed successfully.`);
            // Delete all the files in the temp directory
            await fs.promises.rm(tempPath, { recursive: true });
            //io.emit('runMessage', `[${timeTaken}s] Docker run completed successfully.`);
            io.emit('output', `[${timeTaken}s] Docker run completed successfully.`);
            console.log('temp folder deleted');
            res.status(200).send({ message: 'Docker run completed successfully' });
        } else {
            console.error(`docker run failed with code ${code}`);
            io.emit('runError', `[${timeTaken}s] Error running docker.`);
            res.status(500).send({ message: 'Error running docker' });
        }
    });
});

// Route to delete a file
app.delete('/api/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res.status(500).send('Error when visiting the file path: ' + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Can not find the file'+ err.message);
                }
                res.send('directory deleted successfully');
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res.status(500).send('Unable to delete the file: ' + err.message);
                }
                // send success response after deleting the file
                res.send('File deleted successfully');
            });
        }
    });
});

// Route to delete a result
app.delete('/api/results/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'results', req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res.status(500).send('Error when visiting the file path: ' + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Can not find the file'+ err.message);
                }
                res.send('directory deleted successfully');
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res.status(500).send('Unable to delete the file: ' + err.message);
                }
                // send success response after deleting the file
                res.send('File deleted successfully');
            });
        }
    });
});

// Delete all selected files
app.delete('/api/files', async(req, res) => {
    const { fileNames } = req.body.files;
    const filePath = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter(file => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send('No files found');
    }

    console.log('Files to delete:', matchedFiles);

    matchedFiles.forEach(file => {
        fs.unlinkSync(path.join(filePath, file));
    });

    res.status(200).send({ message: 'Files deleted successfully' });
});


// Delete all selected results
app.delete('/api/results', async(req, res) => {
    const { fileNames } = req.body.files;
    const filePath = path.join(__dirname, 'results');
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter(file => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send('No files found');
    }

    console.log('Files to delete:', matchedFiles);

    matchedFiles.forEach(file => {
        fs.unlinkSync(path.join(filePath, file));
    });

    res.status(200).send({ message: 'Files deleted successfully' });
});


// Route to delete a temp
app.delete('/api/temps/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'temps', req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res.status(500).send('Error when visiting the file path: ' + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Can not find the file'+ err.message);
                }
                res.send('directory deleted successfully');
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res.status(500).send('Unable to delete the file: ' + err.message);
                }
                // send success response after deleting the file
                res.send('File deleted successfully');
            });
        }
    });
});

// Route to delete an image
app.delete('/api/images/:imageName', (req, res) => {
    const { imageName } = req.params;
    exec(`docker rmi ${imageName}`, (err, stdout, stderr) => {
        if (err) {
            // Error handling
            console.error(`Error deleting image: ${err}`);
            res.status(500).send(stderr);
        } else {
            // Standard output handling
            console.log(`Image deleted: ${stdout}`);
            res.status(200).send(stdout);
        }
    });
});

// Route to run a docker image
app.post('/api/images/docker-run', (req, res) => {
    const { imageName, fileName } = req.body; // Get the image name and file name from the request body
  
    const command = `docker run --rm -v ${__dirname}/uploads:/app/uploads -v ${__dirname}/results:/app/results ${imageName} ${fileName}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send(stderr);
      }
      // Send the output to all connected WebSocket clients
      res.status(200).send(`Result saved to: /results/output-${fileName}.txt`);
    });
});


// Route to execute a command and use ws to send the output to the client
app.post('/api/command', (req, res) => {
    console.log(req.body);
    const { command } = req.body; // Get the command from the request body
    console.log(`Executing command: ${command}`);

    const child = exec(command, { shell: true });

    // Send the output to all connected WebSocket clients
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        io.emit('commandMessage', data.toString());
    });
    // Send the Error to all connected WebSocket clients
    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        io.emit('commandError', data.toString());
    });
    // Send the output to all connected WebSocket clients
    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        io.emit('commandMessage', `child process exited with code ${code}`);
    });
});

// upload this file to openai and get the result
app.post('/api/openai/:fileName', async(req, res) => {
    const { fileName } = req.params;
    console.log("process this file with OpenAI: " + fileName);
    const filePath = path.join(__dirname, 'uploads', fileName);
    const result = await AI_input(filePath);
    const { thread_id, run_id } = result;
    console.log(result);
    res.send(result);
});




//Listen on port
server.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});


// Listen for new connections
io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    // Send the service info to the client
    socket.emit('message', serviceInfo);
    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });
});

// Listen for new connections
io.on('connection', async(socket) => {
    console.log('New WebSocket connection');
    // Send the service info to the client
    socket.emit('message', serviceInfo);

    const available_shell = getAvailableShell();

    const shellTTY = pty.spawn(available_shell, [], {
        name: 'xterm-256color',
        cols: 130,
        rows: 40,
        cwd: process.env.WorkingDir,
        env: process.env
    });

    shellTTY.on('data', (data) => {
        socket.emit('output', data);
    });

    socket.on('input', (input) => {
        shellTTY.write(input);
    });

    socket.on('disconnect', () => {
        shellTTY.kill();
        console.log('User disconnected');
    });
});
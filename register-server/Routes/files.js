import express from "express";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { upload } from "../Components/method.js"; // 引入 upload 中间件

const router = express.Router();
const __dirname = path.resolve();

// Route to update files to the server
router.post("/upload", upload.array("file", 50), (req, res) => {
    console.log(req.files);
    res.send(req.files);
});

// Route to get the list of all files
router.get("/files", async (req, res) => {
    const directoryPath = path.join(__dirname, "uploads");
    // if the uploads folder does not exist, create it
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Unable to scan directory: " + err);
        }
        // ignore the .gitkeep and __MACOSX and .DS_Store file
        files = files.filter(
            (file) =>
                file !== ".gitkeep" && file !== "__MACOSX" && file !== ".DS_Store"
        );
        // Return the list of files
        res.send(files);
    });
});

// Route to get the list of all results
router.get("/results", async (req, res) => {
    const directoryPath = path.join(__dirname, "results");
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Unable to scan directory: " + err);
        }
        // ignore the .gitkeep file
        files = files.filter(
            (file) =>
                file !== ".gitkeep" && file !== "__MACOSX" && file !== ".DS_Store"
        );
        // Return the list of files
        res.send(files);
    });
});

// Route to download a file
router.get("/files/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    res.download(filePath);
});

// Route to download all selected files
router.post("/files/download", async (req, res) => {
    const { fileNames } = req.body;
    const filePath = path.join(__dirname, "uploads");
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter((file) => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send("No files found");
    }

    console.log("Files to download:", matchedFiles);

    const zipFileName = "Files-" + Date.now() + ".zip"; // Name of the ZIP file to download
    const zipFilePath = path.join(filePath, zipFileName);

    const zip = spawn("zip", ["-r", zipFileName, ...matchedFiles], {
        cwd: filePath,
    });

    zip.on("close", (code) => {
        if (code !== 0) {
            console.error(`zip process exited with code ${code}`);
            return res.status(500).send({ message: "Error zipping files" });
        }
        console.log("Files zipped successfully");

        // Now that ZIP process has completed, send the file
        res.download(zipFilePath, (err) => {
            if (err) {
                // Handle error, but don't re-throw if headers are already sent
                console.error("Error sending file:", err);
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
router.get("/results/:filename", (req, res) => {
    const filePath = path.join(__dirname, "results", req.params.filename);
    res.download(filePath);
});

// Route to download all selected results
router.post("/results/download", async (req, res) => {
    const { fileNames } = req.body;
    const filePath = path.join(__dirname, "results");
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter((file) => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send("No files found");
    }

    console.log("Files to download:", matchedFiles);

    const zipFileName = "Result-" + Date.now() + ".zip"; // Name of the ZIP file to download
    const zipFilePath = path.join(filePath, zipFileName);

    const zip = spawn("zip", ["-r", zipFileName, ...matchedFiles], {
        cwd: filePath,
    });

    zip.on("close", (code) => {
        if (code !== 0) {
            console.error(`zip process exited with code ${code}`);
            return res.status(500).send({ message: "Error zipping files" });
        }
        console.log("Files zipped successfully");

        // Now that ZIP process has completed, send the file
        res.download(zipFilePath, (err) => {
            if (err) {
                // Handle error, but don't re-throw if headers are already sent
                console.error("Error sending file:", err);
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

// Route to delete a file
router.delete("/files/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res
                .status(500)
                .send("Error when visiting the file path: " + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send("Can not find the file" + err.message);
                }
                res.send("directory deleted successfully");
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res
                        .status(500)
                        .send("Unable to delete the file: " + err.message);
                }
                // send success response after deleting the file
                res.send("File deleted successfully");
            });
        }
    });
});

// Route to delete a result
router.delete("/results/:filename", (req, res) => {
    const filePath = path.join(__dirname, "results", req.params.filename);
    fs.lstat(filePath, (err, stats) => {
        if (err) {
            // if file does not exist or path is invalid, handle the error
            return res
                .status(500)
                .send("Error when visiting the file path: " + err.message);
        }

        if (stats.isDirectory()) {
            // if it is a directory, delete it recursively
            fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send("Can not find the file" + err.message);
                }
                res.send("directory deleted successfully");
            });
        } else {
            // if it is not a directory, try to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    // if file can not be deleted, handle the error
                    return res
                        .status(500)
                        .send("Unable to delete the file: " + err.message);
                }
                // send success response after deleting the file
                res.send("File deleted successfully");
            });
        }
    });
});

// Delete all selected files
router.delete("/files", async (req, res) => {
    const { fileNames } = req.body.files;
    const filePath = path.join(__dirname, "uploads");
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter((file) => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send("No files found");
    }

    console.log("Files to delete:", matchedFiles);

    matchedFiles.forEach((file) => {
        fs.unlinkSync(path.join(filePath, file));
    });

    res.status(200).send({ message: "Files deleted successfully" });
});

// Delete all selected results
router.delete("/results", async (req, res) => {
    const { fileNames } = req.body.files;
    const filePath = path.join(__dirname, "results");
    const files = fs.readdirSync(filePath);
    const matchedFiles = files.filter((file) => fileNames.includes(file));

    if (matchedFiles.length === 0) {
        return res.status(404).send("No files found");
    }

    console.log("Files to delete:", matchedFiles);

    matchedFiles.forEach((file) => {
        fs.unlinkSync(path.join(filePath, file));
    });

    res.status(200).send({ message: "Files deleted successfully" });
});

export default router;

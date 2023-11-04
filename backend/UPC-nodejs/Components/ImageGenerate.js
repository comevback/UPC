import { spawn, exec } from "child_process";
const multer = require('multer');
const extract = require('extract-zip');
const path = require('path');

const upload = multer({ dest: 'geneImages/' });

const generateImage = (text, callback) => {
    const child = spawn("pack build test_img --path apps/test-app --builder cnbs/sample-builder:bionic");

    child.stdout.on('data', (data) => {
        onsole.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`子进程退出，退出码 ${code}`);
    });
};
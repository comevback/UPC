import { spawn } from "child_process";

const generateImage = (text, callback) => {
    const child = spawn('docker', ['run', '--rm', '-p', '3001:3000', 'afterlifexx/myblogapp']);

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
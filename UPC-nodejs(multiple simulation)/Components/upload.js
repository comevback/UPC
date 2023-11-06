// upload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir) // Destination folder
    },
    filename: (req, file, cb) => {
        //cb(null, file.originalname + '_' + Date.now() + path.extname(file.originalname)) // Filename + timestamp 时间戳名，可以重复上传同一文件
        cb(null, file.originalname) // Filename 原名，不能重复上传同一文件
    }
});

const upload = multer({ storage });

export default upload;
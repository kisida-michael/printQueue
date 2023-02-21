const util = require('util');
const multer = require('multer');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '/uploads');
console.log(UPLOAD_DIR);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
}).single('file');

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;

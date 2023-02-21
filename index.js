const express = require('express');
const app = express();
const http = require('http').createServer(app);
const multer = require('multer');
const cups = require('node-cups');
const uploadFile = require('./middleware/upload.js');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(bodyParser.json());

app.use(
  cors({
    origin: '*', // replace with the URL of your frontend application
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Create the upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const io = require('socket.io')(http, {
  cors: {
    origin: '*', // replace with the URL of your frontend application
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('upload', (data) => {
    console.log(`Received file ${data.name}`);

    // Save the file to the upload directory
    const filePath = path.join(UPLOAD_DIR, data.name);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.write(data.buffer);
    fileStream.end();

    // Emit a message to all clients to update the progress bar
    io.emit('progress', {
      name: data.name,
      progress: 100,
    });
  });

  socket.on('progress', (data) => {
    console.log(
      `Received progress update for file ${data.name}: ${data.progress}%`
    );
    io.emit('progress', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

async function printFile(fileName) {
  // Get the name of the PDF printer you want to use (this is the virtual printer created by cups-pdf)
  const printerName = ['HP-Color-LaserJet-M452dn'];

  // Define the print job options
  const options = {
    printer: printerName,
    jobName: fileName,
    fileType: 'PDF',
    fitToPage: true,
    printerOptions: {
      'fit-to-page': 'True',
      media: 'A4',
    },
    duplex: cups.CUPS_SIDES_ONE_SIDED,
    media: 'A4',
    copies: 1,
  };

  const filePath = path.join(__dirname, 'uploads', fileName);

  // Create a new print job and send the PDF file to the printer
  const printers = await cups.getPrinterNames();
  // await cups.cancelAllJobs(printers)

  console.log(await cups.getNotCompletedQueue(printers));
  // const printerOptions = await cups.getPrinterOptions(printerName);

  console.log(printers);
  // console.log(printerOptions)
  // const printer = printers.find((p) => p.name === printerName);
  // if (!printer) {
  //   console.error(`Printer not found: ${printerName}`);
  //   return;
  // }

  cups.printFile(filePath, options);

  // Delete the file after printing
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    } else {
      console.log(`Deleted file: ${filePath}`);
    }
  });
}

// define a route that accepts POST requests to /upload

app.post('/upload', async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: 'Please upload a file!' });
    }
    console.log('file uploadibng');
    res.send('File uploaded successfully');
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
});
app.post('/print', async (req, res) => {
  // Get the file name from the request body
  const fileName = req.body.fileName;

  // Print the file
  try {
    await printFile(fileName);
    res.send('Printed successfully');
    console.log('Printed successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error printing file');
  }
});
// Start the server

app.use(express.static(path.join(__dirname, '/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

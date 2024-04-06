const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8080;

const uploadsDir = path.join(__dirname, 'uploadedfiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.json());

app.use((req, res, next) => {
  const logData = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  console.log(`${req.method} ${req.url}`);
  fs.appendFile(path.join(__dirname, 'server.log'), logData, (err) => {
      if (err) {
          console.error('Failed to log request:', err);
      }
  });
  next();
});


app.post('/createFile', (req, res) => {
  const { filename, content} = req.body;

  if (!filename || !content) {
    return res.status(400).send('Both filename and content are required.');
  }
  const filePath = path.join(uploadsDir, filename);

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to create file.');
    }
    res.status(200).send('File created successfully.');
  });
});



app.get('/getFiles', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to get files.');
    }
    res.status(200).json(files);
  });
});


app.get('/getFile', (req, res) => {
    
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).send('Filename is required.');
  }

  const filePath = path.join(uploadsDir, filename);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(400).send('File not found.');
    }
    res.status(200).send(data);
  });
});


app.put('/modifyFile', (req, res) => {
    const { filename, content} = req.body;

    if (!filename || !content) {
        return res.status(400).send('Both filename and content are required.');
    }

    const filePath = path.join(uploadsDir, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to modify file.');
        }
        res.status(200).send('File modified successfully.');
    });
});



app.delete('/deleteFile', (req, res) => {
    const { filename} = req.query;

    if (!filename) {
        return res.status(400).send('Filename is required.');
    }

    const filePath = path.join(uploadsDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to delete file.');
        }
        res.status(200).send('File deleted successfully.');
    });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

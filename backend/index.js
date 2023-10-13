const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());  // To parse JSON requests

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.post('/submit_job', (req, res) => {
  // Extract job data from request
  const jobData = req.body;

  // TODO: Process job data and send to worker nodes
  
  // Send a response
  res.send('Job submitted!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

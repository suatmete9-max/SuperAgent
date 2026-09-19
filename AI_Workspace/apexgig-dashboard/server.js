const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database in-memory for client management
let clients = [
  { id: 1, name: "John Doe", platform: "Upwork", service: "Content Writing", budget: 250, status: "In Progress" },
  { id: 2, name: "Sarah Khan", platform: "Fiverr", service: "Translation", budget: 150, status: "Completed" },
  { id: 3, name: "Alex Mercer", platform: "Direct Client", service: "Web Development", budget: 800, status: "Lead" }
];

app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const newClient = {
    id: clients.length + 1,
    name: req.body.name,
    platform: req.body.platform,
    service: req.body.service,
    budget: parseFloat(req.body.budget) || 0,
    status: req.body.status || "Lead"
  };
  clients.push(newClient);
  res.status(201).json(newClient);
});

app.listen(PORT, () => {
  console.log(`ApexGig server running at http://localhost:${PORT}`);
});
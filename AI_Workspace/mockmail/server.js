const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Database
const users = {
  'support@mockmail.com': {
    password: 'password123',
    fullName: 'MockMail Support',
    inbox: [
      {
        id: 1,
        from: 'system@mockmail.com',
        fromName: 'System Administrator',
        subject: 'Welcome to your MockMail Inbox!',
        body: 'Welcome! You can register new mock accounts, login, and send real-time simulated messages to any other user registered on this server.',
        timestamp: new Date().toLocaleString()
      }
    ]
  }
};

// Register API
app.post('/api/register', (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const formattedEmail = email.toLowerCase().trim().endsWith('@mockmail.com') 
    ? email.toLowerCase().trim() 
    : `${email.toLowerCase().trim()}@mockmail.com`;

  if (users[formattedEmail]) {
    return res.status(400).json({ error: 'This email address is already taken.' });
  }

  users[formattedEmail] = {
    password,
    fullName,
    inbox: [
      {
        id: Date.now(),
        from: 'system@mockmail.com',
        fromName: 'MockMail Team',
        subject: 'Welcome to your new Inbox!',
        body: `Congratulations ${fullName}! Your simulated email address (${formattedEmail}) has been successfully created. Try sending an email to support@mockmail.com or register another account to test internal messaging!`,
        timestamp: new Date().toLocaleString()
      }
    ]
  };

  res.status(201).json({ 
    message: 'Account created successfully!', 
    email: formattedEmail,
    fullName 
  });
});

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const formattedEmail = email.toLowerCase().trim();

  const user = users[formattedEmail];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({
    email: formattedEmail,
    fullName: user.fullName,
    inbox: user.inbox
  });
});

// Send Email API
app.post('/api/send', (req, res) => {
  const { from, to, subject, body } = req.body;

  if (!from || !to || !subject || !body) {
    return res.status(400).json({ error: 'Recipient, subject and body are required.' });
  }

  const sender = users[from.toLowerCase().trim()];
  const recipientEmail = to.toLowerCase().trim();
  const recipient = users[recipientEmail];

  if (!sender) {
    return res.status(403).json({ error: 'Unauthorized sender.' });
  }

  if (!recipient) {
    return res.status(404).json({ error: `Recipient address ${recipientEmail} does not exist on this server.` });
  }

  const newMail = {
    id: Date.now(),
    from: from.toLowerCase().trim(),
    fromName: sender.fullName,
    subject,
    body,
    timestamp: new Date().toLocaleString()
  };

  recipient.inbox.unshift(newMail); // Add to beginning of inbox

  res.json({ message: 'Email sent successfully!' });
});

// Get Inbox API
app.get('/api/inbox/:email', (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  const user = users[email];

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json(user.inbox);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
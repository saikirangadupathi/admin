const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000/communicationPage", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const users = [
  { id: 1, name: 'Agent 1' },
  { id: 2, name: 'Agent 2' },
  { id: 3, name: 'Delivery Partner 1' },
  { id: 4, name: 'Delivery Partner 2' },
];

const messages = {
  1: [{ user: 'Agent 1', text: 'Hello, how can I help you?' }],
  2: [],
  3: [],
  4: [],
};

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000/communicationPage' })); // Allow CORS from your frontend URL

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/chat/:userId', (req, res) => {
  const userId = req.params.userId;
  res.json(messages[userId] || []);
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', (message) => {
    const userId = message.userId;
    if (!messages[userId]) {
      messages[userId] = [];
    }
    messages[userId].push(message);
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});

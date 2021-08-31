import express from 'express';
import http from 'http';
import { userInfo } from 'os';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

type User = {
  id: string;
  color: number;
  x: number;
  y: number;
};

let state: User[] = [];

app.get('/test', (req, res) => {
  res.sendStatus(200);
});

const getUser = (userId: string): User => {
  return state.find((user) => user.id === userId)!;
};

const updateStateInPlaceWithUser = (updatedUser: User): void => {
  const userIndex = state.findIndex((user) => user.id === updatedUser.id);

  state[userIndex] = updatedUser;
};

io.on('connection', (socket) => {
  console.log('a user connected');

  state.push({ id: socket.id, color: 0, x: 0, y: 0 });

  io.emit('connected', state);

  //   socket.broadcast.emit('connection', [1, 2, 3]);

  socket.on('disconnect', () => {
    state = state.filter((user) => user.id !== socket.id);
    console.log('disconnected');
    io.emit('disconnected', state);
  });

  socket.on('userMovement', (targetX, targetY) => {
    console.log(targetX);
    console.log(targetY);
    const user = getUser(socket.id);
    user.x = targetX;
    user.y = targetY;
    updateStateInPlaceWithUser(user);
    io.emit('userLocationChanged', state);
  });

  socket.on('colorChange', (colorSelection) => {
    const user = getUser(socket.id);
    if (colorSelection === user.color) {
      updateStateInPlaceWithUser({
        id: socket.id,
        color: colorSelection + (1 % 7),
        x: user.x,
        y: user.y,
      });
    } else {
      updateStateInPlaceWithUser({
        id: socket.id,
        color: colorSelection,
        x: user.x,
        y: user.y,
      });
    }

    io.emit('thing', state);
  });

  socket.on('drawing', (drawingData) => {
    io.emit('partnerDraw', drawingData);
  });
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});

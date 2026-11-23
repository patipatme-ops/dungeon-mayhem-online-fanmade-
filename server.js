const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, rooms: rooms.size }));

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms.has(code));
  return code;
}
function publicRoom(room) {
  return { code: room.code, name: room.name, maxPlayers: room.maxPlayers, isPrivate: room.isPrivate,
    players: [...room.players.values()].map(p => ({ id: p.id, name: p.name, host: p.host })) };
}
function emitRoom(room) { io.to(room.code).emit('room:update', publicRoom(room)); }
function leaveRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  socket.leave(code);
  socket.data.roomCode = null;
  if (!room) return;
  room.players.delete(socket.id);
  if (room.players.size === 0) rooms.delete(code);
  else {
    if (![...room.players.values()].some(p => p.host)) {
      const next = room.players.values().next().value;
      next.host = true;
    }
    emitRoom(room);
  }
}

io.on('connection', socket => {
  socket.on('room:create', (payload = {}, reply = () => {}) => {
    leaveRoom(socket);
    const name = String(payload.playerName || 'Player').trim().slice(0, 18) || 'Player';
    const roomName = String(payload.roomName || '').trim().slice(0, 28) || `${name}'s Room`;
    const maxPlayers = Math.max(3, Math.min(6, Number(payload.maxPlayers) || 6));
    const code = makeCode();
    const room = { code, name: roomName, maxPlayers, isPrivate: payload.isPrivate !== false, players: new Map() };
    room.players.set(socket.id, { id: socket.id, name, host: true });
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    reply({ ok: true, room: publicRoom(room) });
  });

  socket.on('room:join', (payload = {}, reply = () => {}) => {
    leaveRoom(socket);
    const code = String(payload.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const room = rooms.get(code);
    if (!room) return reply({ ok: false, error: 'ไม่พบห้องนี้ ตรวจสอบรหัสแล้วลองอีกครั้ง' });
    if (room.players.size >= room.maxPlayers) return reply({ ok: false, error: 'ห้องนี้เต็มแล้ว' });
    const name = String(payload.playerName || 'Player').trim().slice(0, 18) || 'Player';
    room.players.set(socket.id, { id: socket.id, name, host: false });
    socket.join(code);
    socket.data.roomCode = code;
    emitRoom(room);
    reply({ ok: true, room: publicRoom(room) });
  });

  socket.on('room:leave', () => leaveRoom(socket));
  socket.on('disconnect', () => leaveRoom(socket));
});

server.listen(PORT, () => console.log(`Dungeon Mayhem Online running on port ${PORT}`));

import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface RemotePlayer {
  id: string;
  name: string;
  color: string;
  skinIndex: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  health: number;
  maxHealth: number;
  armor: number;
  currentWeapon: string;
  isFiring: boolean;
  inVehicle: boolean;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleAngle?: number;
  vehicleSpeed?: number;
  horn: boolean;
  interiorId: string | null;
  lastSeen: number;
}

interface Room {
  code: string;
  createdAt: number;
  players: Map<string, { ws: WebSocket; data: RemotePlayer }>;
}

const rooms = new Map<string, Room>();

function getOrCreateRoom(code: string): Room {
  const normalized = code.trim().toUpperCase().slice(0, 8);
  let room = rooms.get(normalized);
  if (!room) {
    room = {
      code: normalized,
      createdAt: Date.now(),
      players: new Map()
    };
    rooms.set(normalized, room);
  }
  return room;
}

function broadcastToRoom(room: Room, message: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  room.players.forEach(({ ws }) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      totalPlayers: Array.from(rooms.values()).reduce((sum, r) => sum + r.players.size, 0)
    });
  });

  // Room status check
  app.get('/api/rooms/:code', (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.json({ exists: false, playerCount: 0 });
    }
    return res.json({
      exists: true,
      code: room.code,
      playerCount: room.players.size,
      players: Array.from(room.players.values()).map(p => ({
        id: p.data.id,
        name: p.data.name,
        interiorId: p.data.interiorId
      }))
    });
  });

  // WebSocket Server setup
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomCode: string | null = null;
    let playerId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case 'join': {
            const { roomCode, player } = msg;
            if (!roomCode || !player || !player.id) return;

            const room = getOrCreateRoom(roomCode);
            currentRoomCode = room.code;
            playerId = player.id;

            const playerData: RemotePlayer = {
              id: player.id,
              name: player.name || 'Speler',
              color: player.color || '#3b82f6',
              skinIndex: player.skinIndex ?? 0,
              x: player.x ?? 3200,
              y: player.y ?? 3200,
              angle: player.angle ?? 0,
              speed: 0,
              health: player.health ?? 100,
              maxHealth: player.maxHealth ?? 100,
              armor: player.armor ?? 50,
              currentWeapon: player.currentWeapon || 'pistol',
              isFiring: false,
              inVehicle: !!player.inVehicle,
              vehicleModel: player.vehicleModel,
              vehicleColor: player.vehicleColor,
              vehicleAngle: player.vehicleAngle,
              vehicleSpeed: player.vehicleSpeed,
              horn: false,
              interiorId: player.interiorId ?? null,
              lastSeen: Date.now()
            };

            room.players.set(playerId, { ws, data: playerData });

            // Send existing players to new player
            const existingPlayers = Array.from(room.players.values())
              .filter(p => p.data.id !== playerId)
              .map(p => p.data);

            ws.send(JSON.stringify({
              type: 'joined',
              roomCode: room.code,
              selfId: playerId,
              players: existingPlayers
            }));

            // Notify others
            broadcastToRoom(room, {
              type: 'player_joined',
              player: playerData
            }, ws);

            break;
          }

          case 'update': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const entry = room.players.get(playerId);
            if (!entry) return;

            // Merge update
            Object.assign(entry.data, msg.state, { lastSeen: Date.now() });

            // Broadcast update to others in room
            broadcastToRoom(room, {
              type: 'player_updated',
              player: entry.data
            }, ws);

            break;
          }

          case 'action': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            // Broadcast action (shooting, honk, hit, etc.)
            broadcastToRoom(room, {
              type: 'player_action',
              playerId,
              action: msg.action
            }, ws);

            break;
          }

          case 'chat': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const entry = room.players.get(playerId);
            const senderName = entry?.data.name || 'Speler';

            broadcastToRoom(room, {
              type: 'chat',
              playerId,
              senderName,
              text: String(msg.text || '').slice(0, 150),
              timestamp: Date.now()
            });

            break;
          }

          case 'leave': {
            if (currentRoomCode && playerId) {
              const room = rooms.get(currentRoomCode);
              if (room) {
                room.players.delete(playerId);
                broadcastToRoom(room, { type: 'player_left', playerId });
                if (room.players.size === 0) {
                  rooms.delete(currentRoomCode);
                }
              }
            }
            currentRoomCode = null;
            playerId = null;
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomCode && playerId) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          room.players.delete(playerId);
          broadcastToRoom(room, { type: 'player_left', playerId });
          if (room.players.size === 0) {
            rooms.delete(currentRoomCode);
          }
        }
      }
    });
  });

  // Periodically clean up stale rooms
  setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, code) => {
      room.players.forEach((entry, pId) => {
        if (now - entry.data.lastSeen > 30000) { // 30s timeout
          entry.ws.terminate();
          room.players.delete(pId);
        }
      });
      if (room.players.size === 0 && now - room.createdAt > 300000) {
        rooms.delete(code);
      }
    });
  }, 15000);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running with WebSockets on http://localhost:${PORT}`);
  });
}

startServer();

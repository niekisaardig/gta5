import { MultiplayerPlayer, MultiplayerChatMessage } from './types';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface MultiplayerCallbacks {
  onStatusChange?: (status: ConnectionStatus) => void;
  onRoomJoined?: (roomCode: string, selfId: string, initialPlayers: MultiplayerPlayer[]) => void;
  onRoomLeft?: () => void;
  onPlayerJoined?: (player: MultiplayerPlayer) => void;
  onPlayerUpdated?: (player: MultiplayerPlayer) => void;
  onPlayerLeft?: (playerId: string) => void;
  onPlayersUpdate?: (players: Map<string, MultiplayerPlayer>) => void;
  onPlayerAction?: (playerId: string, action: any) => void;
  onChatMessage?: (chat: MultiplayerChatMessage) => void;
  onError?: (err: any) => void;
}

export class MultiplayerManager {
  private ws: WebSocket | null = null;
  public status: ConnectionStatus = 'disconnected';
  public currentRoomCode: string | null = null;
  public selfPlayerId: string = 'p_' + Math.random().toString(36).substring(2, 9);
  public playerName: string = 'Speler';
  public remotePlayers = new Map<string, MultiplayerPlayer>();
  public chatMessages: MultiplayerChatMessage[] = [];
  private callbacks: MultiplayerCallbacks = {};
  private lastSentTime = 0;
  private sendIntervalMs = 50; // 20 updates per second for smooth real-time syncing

  public get localPlayerId(): string {
    return this.selfPlayerId;
  }

  constructor(callbacks: MultiplayerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: MultiplayerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public connect(roomCode: string, playerName: string, initialPlayerState: Partial<MultiplayerPlayer> = {}) {
    this.connectAndJoin(roomCode, playerName, initialPlayerState);
  }

  public connectAndJoin(roomCode: string, playerName: string, initialPlayerState: Partial<MultiplayerPlayer> = {}) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.disconnect();
    }

    if (playerName) this.playerName = playerName;
    const cleanCode = roomCode.trim().toUpperCase().slice(0, 8);
    this.currentRoomCode = cleanCode;
    this.setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected');
        // Send join packet
        const joinMsg = {
          type: 'join',
          roomCode: cleanCode,
          player: {
            id: this.selfPlayerId,
            name: playerName || 'Speler',
            ...initialPlayerState
          }
        };
        this.send(joinMsg);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.remotePlayers.clear();
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
        this.setStatus('disconnected');
        this.callbacks.onError?.(err);
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      this.setStatus('disconnected');
      this.callbacks.onError?.(err);
    }
  }

  public disconnect() {
    if (this.ws) {
      try {
        this.send({ type: 'leave' });
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.currentRoomCode = null;
    this.remotePlayers.clear();
    this.setStatus('disconnected');
    this.callbacks.onRoomLeft?.();
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.callbacks.onStatusChange?.(status);
  }

  private handleMessage(msg: any) {
    switch (msg.type) {
      case 'joined': {
        this.currentRoomCode = msg.roomCode;
        this.remotePlayers.clear();
        (msg.players || []).forEach((p: MultiplayerPlayer) => {
          this.remotePlayers.set(p.id, p);
        });
        this.callbacks.onRoomJoined?.(msg.roomCode, msg.selfId, msg.players || []);
        this.callbacks.onPlayersUpdate?.(this.remotePlayers);
        break;
      }

      case 'player_joined': {
        if (msg.player && msg.player.id !== this.selfPlayerId) {
          this.remotePlayers.set(msg.player.id, msg.player);
          this.callbacks.onPlayerJoined?.(msg.player);
          this.callbacks.onPlayersUpdate?.(this.remotePlayers);
        }
        break;
      }

      case 'player_updated': {
        if (msg.player && msg.player.id !== this.selfPlayerId) {
          const existing = this.remotePlayers.get(msg.player.id);
          if (existing) {
            Object.assign(existing, msg.player);
          } else {
            this.remotePlayers.set(msg.player.id, msg.player);
          }
          this.callbacks.onPlayerUpdated?.(msg.player);
          this.callbacks.onPlayersUpdate?.(this.remotePlayers);
        }
        break;
      }

      case 'player_left': {
        if (msg.playerId) {
          this.remotePlayers.delete(msg.playerId);
          this.callbacks.onPlayerLeft?.(msg.playerId);
          this.callbacks.onPlayersUpdate?.(this.remotePlayers);
        }
        break;
      }

      case 'player_action': {
        if (msg.playerId && msg.playerId !== this.selfPlayerId) {
          this.callbacks.onPlayerAction?.(msg.playerId, msg.action);
        }
        break;
      }

      case 'chat': {
        const chatItem: MultiplayerChatMessage = {
          id: 'chat_' + Math.random().toString(36).substring(2, 7),
          playerId: msg.playerId,
          playerName: msg.playerName || msg.senderName || 'Speler',
          message: msg.message || msg.text || '',
          timestamp: msg.timestamp || Date.now()
        };
        this.chatMessages.push(chatItem);
        if (this.chatMessages.length > 50) this.chatMessages.shift();
        this.callbacks.onChatMessage?.(chatItem);
        break;
      }
    }
  }

  public sendUpdate(state: Partial<MultiplayerPlayer>) {
    if (!this.isConnected()) return;
    const now = performance.now();
    if (now - this.lastSentTime < this.sendIntervalMs) return;
    this.lastSentTime = now;

    this.send({
      type: 'update',
      state
    });
  }

  public sendAction(action: any) {
    if (!this.isConnected()) return;
    this.send({
      type: 'action',
      action
    });
  }

  public sendChat(text: string) {
    this.sendChatMessage(text);
  }

  public sendChatMessage(text: string) {
    if (!this.isConnected() || !text.trim()) return;
    this.send({
      type: 'chat',
      text: text.trim(),
      playerName: this.playerName
    });
  }

  public isConnected(): boolean {
    return this.status === 'connected' && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (err) {
        console.error('Failed to send WS payload:', err);
      }
    }
  }
}

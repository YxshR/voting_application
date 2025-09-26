import { WebSocketServer } from 'ws';
import { createServer } from 'http';

export const MESSAGE_TYPES = {
  CONNECTION_ACK: 'connection-ack',
  VOTE_UPDATE: 'vote-update',
  ERROR: 'error'
};
class VotingWebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.clients = new Set();
    this.server = null;
    this.wss = null;
  }

  start() {

    this.server = createServer();

    this.wss = new WebSocketServer({
      server: this.server,
      path: '/ws'
    });

    this.setupEventHandlers();

    this.server.listen(this.port, () => {
      console.log(`WebSocket server running on port ${this.port}`);
    });
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');

      this.clients.add(ws);

      this.sendMessage(ws, {
        type: MESSAGE_TYPES.CONNECTION_ACK,
        data: 'Connected to voting server',
        timestamp: Date.now()
      });

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} ${reason}`);
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
        this.clients.delete(ws);

        if (ws.readyState === ws.OPEN) {
          this.sendError(ws, 'Connection error occurred');
        }
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message:', message);

          switch (message.type) {
            case 'ping':
              this.sendMessage(ws, {
                type: 'pong',
                data: 'pong',
                timestamp: Date.now()
              });
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Invalid message format:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.setupHealthMonitoring();
  }

  setupHealthMonitoring() {
    const interval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log('Terminating dead connection');
          ws.terminate();
          this.clients.delete(ws);
          return;
        }

        ws.isAlive = false;
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        }
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        this.clients.delete(ws);
        return false;
      }
    } else {
      this.clients.delete(ws);
      return false;
    }
  }

  sendError(ws, errorMessage) {
    this.sendMessage(ws, {
      type: MESSAGE_TYPES.ERROR,
      data: errorMessage,
      timestamp: Date.now()
    });
  }

  broadcastVoteUpdate(voteResults) {
    const message = {
      type: MESSAGE_TYPES.VOTE_UPDATE,
      data: voteResults,
      timestamp: Date.now()
    };

    console.log(`Broadcasting vote update to ${this.clients.size} clients`);

    let successCount = 0;
    let failureCount = 0;

    this.clients.forEach((ws) => {
      if (this.sendMessage(ws, message)) {
        successCount++;
      } else {
        failureCount++;
      }
    });

    if (failureCount > 0) {
      console.log(`Broadcast completed: ${successCount} successful, ${failureCount} failed`);
    }

    return { successCount, failureCount };
  }

  getConnectionCount() {
    return this.clients.size;
  }

  stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
    this.clients.clear();
    console.log('WebSocket server stopped');
  }
}

let wsServerInstance = null;

export function getWebSocketServer() {
  if (!wsServerInstance) {
    wsServerInstance = new VotingWebSocketServer();
  }
  return wsServerInstance;
}

export function startWebSocketServer() {
  const server = getWebSocketServer();
  if (!server.wss) {
    server.start();
  }
  return server;
}

export function broadcastVoteUpdate(voteResults) {
  const server = getWebSocketServer();
  server.broadcastVoteUpdate(voteResults);
}

export default VotingWebSocketServer;
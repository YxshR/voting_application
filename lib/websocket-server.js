import { WebSocketServer } from 'ws';
import { createServer } from 'http';

/**
 * WebSocket message types for real-time voting updates
 */
export const MESSAGE_TYPES = {
  CONNECTION_ACK: 'connection-ack',
  VOTE_UPDATE: 'vote-update',
  ERROR: 'error'
};

/**
 * WebSocket server for real-time voting updates
 */
class VotingWebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.clients = new Set();
    this.server = null;
    this.wss = null;
  }

  /**
   * Start the WebSocket server
   */
  start() {

    this.server = createServer();

    // Create WebSocket server
    this.wss = new WebSocketServer({
      server: this.server,
      path: '/ws'
    });

    this.setupEventHandlers();

    this.server.listen(this.port, () => {
      console.log(`WebSocket server running on port ${this.port}`);
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');

      // Add client to active connections
      this.clients.add(ws);

      // Send connection acknowledgment
      this.sendMessage(ws, {
        type: MESSAGE_TYPES.CONNECTION_ACK,
        data: 'Connected to voting server',
        timestamp: Date.now()
      });

      // Set up ping/pong for connection health monitoring
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle client disconnect
      ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} ${reason}`);
        this.clients.delete(ws);
      });

      // Handle client errors
      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
        this.clients.delete(ws);

        // Send error to client if connection is still open
        if (ws.readyState === ws.OPEN) {
          this.sendError(ws, 'Connection error occurred');
        }
      });

      // Handle incoming messages (for future extensibility)
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message:', message);

          // Handle different message types
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

    // Set up connection health monitoring
    this.setupHealthMonitoring();
  }

  /**
   * Setup health monitoring with ping/pong
   */
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
    }, 30000); // Check every 30 seconds

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  /**
   * Send a message to a specific client
   */
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
      // Clean up dead connections
      this.clients.delete(ws);
      return false;
    }
  }

  /**
   * Send error message to a specific client
   */
  sendError(ws, errorMessage) {
    this.sendMessage(ws, {
      type: MESSAGE_TYPES.ERROR,
      data: errorMessage,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast vote updates to all connected clients
   */
  broadcastVoteUpdate(voteResults) {
    const message = {
      type: MESSAGE_TYPES.VOTE_UPDATE,
      data: voteResults,
      timestamp: Date.now()
    };

    console.log(`Broadcasting vote update to ${this.clients.size} clients`);

    let successCount = 0;
    let failureCount = 0;

    // Send to all connected clients
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

  /**
   * Get current connection count
   */
  getConnectionCount() {
    return this.clients.size;
  }

  /**
   * Stop the WebSocket server
   */
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

// Create singleton instance
let wsServerInstance = null;

/**
 * Get or create WebSocket server instance
 */
export function getWebSocketServer() {
  if (!wsServerInstance) {
    wsServerInstance = new VotingWebSocketServer();
  }
  return wsServerInstance;
}

/**
 * Start WebSocket server if not already running
 */
export function startWebSocketServer() {
  const server = getWebSocketServer();
  if (!server.wss) {
    server.start();
  }
  return server;
}

/**
 * Broadcast vote update to all connected clients
 */
export function broadcastVoteUpdate(voteResults) {
  const server = getWebSocketServer();
  server.broadcastVoteUpdate(voteResults);
}

export default VotingWebSocketServer;
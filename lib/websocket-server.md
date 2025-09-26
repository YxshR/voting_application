# WebSocket Server for Real-time Voting

This WebSocket server provides real-time updates for the voting application, broadcasting vote results to all connected clients.

## Features

- **Real-time Broadcasting**: Automatically broadcasts vote updates to all connected clients
- **Connection Management**: Handles client connections and disconnections gracefully
- **Error Handling**: Provides robust error handling for invalid messages and connection issues
- **Message Format**: Standardized JSON message format for all communications

## Usage

### Starting the Server

The WebSocket server is automatically started when you run the application:

```bash
npm run dev
```

This starts both the Next.js application on port 3000 and the WebSocket server on port 8080.

### Message Types

The server supports the following message types:

- `connection-ack`: Sent when a client connects successfully
- `vote-update`: Broadcast when vote results change
- `error`: Sent when an error occurs

### Message Format

All messages follow this JSON structure:

```json
{
  "type": "vote-update",
  "data": {
    "options": [
      {
        "id": 1,
        "name": "Option A",
        "count": 5,
        "percentage": 50
      }
    ],
    "totalVotes": 10,
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

### Client Connection

Clients can connect to the WebSocket server at:

```
ws://localhost:8080/ws
```

### Broadcasting Updates

When a vote is cast, the server automatically broadcasts updated results to all connected clients:

```javascript
import { broadcastVoteUpdate } from './lib/websocket-server.js';

// After a vote is recorded
const updatedResults = await getCurrentVotingResults();
broadcastVoteUpdate(updatedResults);
```

## Integration

The WebSocket server is integrated with the voting API routes to automatically broadcast updates when votes are cast. No manual intervention is required for real-time updates.

## Testing

Run the WebSocket server tests:

```bash
npm test -- test/websocket-integration.test.js
```

## Configuration

The WebSocket server runs on port 8080 by default. This can be configured in the `VotingWebSocketServer` constructor if needed.
import { createServer } from 'http';
import next from 'next';
import { startWebSocketServer } from './lib/websocket-server.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('Starting WebSocket server...');
  startWebSocketServer();


  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Next.js server ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:8080/ws`);
  });
});
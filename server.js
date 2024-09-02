import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT ?? '3000';

void app.prepare().then(() => {
  createServer((req, res) => {
    if (req.url) {
      const parsedUrl = parse(req.url, true);
      void handle(req, res, parsedUrl);
    } else {
      res.writeHead(400);
      res.end('Bad Request');
    }
  }).listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const gamesJsonPath = path.resolve(__dirname, 'public/data/games.json');

function gamesApiPlugin() {
  return {
    name: 'games-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/games') || req.url?.startsWith('/data/games.json')) {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            if (fs.existsSync(gamesJsonPath)) {
              const data = fs.readFileSync(gamesJsonPath, 'utf-8');
              res.end(data);
            } else {
              res.end(JSON.stringify({ games: [], updatedAt: 0 }));
            }
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const dir = path.dirname(gamesJsonPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                const gamesList = Array.isArray(parsed) ? parsed : (parsed.games || []);
                const payload = {
                  updatedAt: Date.now(),
                  games: gamesList
                };
                fs.writeFileSync(gamesJsonPath, JSON.stringify(payload, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, updatedAt: payload.updatedAt }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [gamesApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  }
});

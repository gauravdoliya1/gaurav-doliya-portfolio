// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();

        const parseBody = () => new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (_) { resolve({}); }
          });
        });

        const sendJson = (status, obj) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.end(JSON.stringify(obj));
        };

        const getPaths = (file) => {
          const cwd = process.cwd();
          return [
            path.resolve(cwd, 'src/data', file),
            path.resolve(cwd, 'frontend/src/data', file),
            path.resolve(cwd, 'backend/data', file),
            path.resolve(cwd, 'dist/data', file)
          ];
        };

        const readData = (file, fallback) => {
          for (const p of getPaths(file)) {
            try {
              if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
            } catch (_) {}
          }
          return fallback;
        };

        const writeData = (file, data) => {
          const str = JSON.stringify(data, null, 2);
          for (const p of getPaths(file)) {
            try {
              const dir = path.dirname(p);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(p, str, 'utf-8');
            } catch (_) {}
          }
        };

        // 1. /api/redirect
        if (url.startsWith('/api/redirect')) {
          if (req.method === 'GET') {
            const data = readData('redirectConfig.json', { isActive: true, targetUrl: 'https://youtube.com/@gauravdoliya' });
            return sendJson(200, { success: true, data });
          }
          if (req.method === 'POST') {
            return parseBody().then((body) => {
              const current = readData('redirectConfig.json', { isActive: true, targetUrl: 'https://youtube.com/@gauravdoliya' });
              const trimmed = body.targetUrl !== undefined ? String(body.targetUrl).trim() : current.targetUrl;
              const updated = { isActive: Boolean(trimmed), targetUrl: trimmed };
              writeData('redirectConfig.json', updated);
              return sendJson(200, {
                success: true,
                message: updated.targetUrl ? `Saved! /a is now redirecting to: ${updated.targetUrl}` : 'Saved! /a is now showing the Coming Soon page.',
                data: updated
              });
            });
          }
        }

        // 2. /api/theme
        if (url.startsWith('/api/theme')) {
          if (req.method === 'GET') {
            const data = readData('theme.json', { primaryColor: '#7c3aed', heroColor: '#de4528' });
            return sendJson(200, { success: true, data });
          }
          if (req.method === 'POST') {
            return parseBody().then((body) => {
              const current = readData('theme.json', { primaryColor: '#7c3aed', heroColor: '#de4528' });
              const updated = {
                primaryColor: body.primaryColor ? String(body.primaryColor).trim() : current.primaryColor,
                heroColor: body.heroColor ? String(body.heroColor).trim() : current.heroColor,
                grayColor: body.grayColor ? String(body.grayColor).trim() : current.grayColor,
                backgroundColor: body.backgroundColor ? String(body.backgroundColor).trim() : current.backgroundColor,
                textColor: body.textColor ? String(body.textColor).trim() : current.textColor
              };
              writeData('theme.json', updated);
              return sendJson(200, { success: true, message: 'Website colors updated successfully!', data: updated });
            });
          }
        }

        // 3. /api/contact
        if (url.startsWith('/api/contact')) {
          if (req.method === 'GET') {
            const data = readData('contact.json', {});
            return sendJson(200, { success: true, data });
          }
          if (req.method === 'POST') {
            return parseBody().then((body) => {
              const current = readData('contact.json', {});
              const updated = {
                email: body.email ? String(body.email).trim() : current.email,
                phone: body.phone !== undefined ? String(body.phone).trim() : current.phone,
                whatsapp: body.whatsapp !== undefined ? String(body.whatsapp).replace(/[^0-9]/g, '') : current.whatsapp,
                linkedin: body.linkedin !== undefined ? String(body.linkedin).trim() : current.linkedin,
                location: body.location !== undefined ? String(body.location).trim() : current.location
              };
              writeData('contact.json', updated);
              return sendJson(200, { success: true, message: 'Contact details updated successfully!', data: updated });
            });
          }
        }

        next();
      });
    }
  };
}

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), devApiPlugin()],
  },
});

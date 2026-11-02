const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const SiteManager = require('./electron/siteManager');

const PORT = 4173;
const userDataPath = path.join(process.env.APPDATA || process.env.USERPROFILE || '', 'fastwp');
const defaultBaseDir = path.join(process.env.USERPROFILE || '', 'Documents', 'FastWP Sites');

const siteManager = new SiteManager(userDataPath);

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  console.log(`[HTTP] ${req.method} ${pathname}`);

  // API endpoints
  if (pathname === '/api/sites' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(siteManager.getSites()));
    return;
  }

  if (pathname === '/api/env' && req.method === 'GET') {
    const env = await siteManager.checkEnvironment();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(env));
    return;
  }

  if (pathname === '/api/sites' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const newSite = await siteManager.createSite(data, defaultBaseDir);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newSite));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/start') && req.method === 'POST') {
    const siteId = pathname.split('/')[3];
    try {
      const site = await siteManager.startSite(siteId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(site));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/stop') && req.method === 'POST') {
    const siteId = pathname.split('/')[3];
    try {
      const site = await siteManager.stopSite(siteId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(site));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/blueprints' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(siteManager.getBlueprints()));
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/clone') && req.method === 'POST') {
    const siteId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const cloned = await siteManager.cloneSite(siteId, data.name);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cloned));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/blueprint') && req.method === 'POST') {
    const siteId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const bp = await siteManager.saveAsBlueprint(siteId, data.name);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(bp));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/notes') && req.method === 'POST') {
    const siteId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { notes } = JSON.parse(body);
        const updated = siteManager.saveNotes(siteId, notes);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/open-folder' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { path: targetPath } = JSON.parse(body);
        console.log('[OPEN-FOLDER] Request for:', targetPath);
        if (targetPath && fs.existsSync(targetPath)) {
          const cleanPath = path.normalize(targetPath).replace(/'/g, "''");
          // Use COM Shell.Application which triggers desktop explorer window reliably
          const psCommand = `$p = '${cleanPath}'; try { (New-Object -ComObject Shell.Application).Explore($p) } catch { Start-Process explorer.exe -ArgumentList ('"' + $p + '"') }`;
          spawn('powershell.exe', [
            '-NoProfile',
            '-WindowStyle', 'Hidden',
            '-Command',
            psCommand
          ], { detached: true, stdio: 'ignore' });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error('[OPEN-FOLDER] Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/files') && req.method === 'GET') {
    const siteId = pathname.split('/')[3];
    const site = siteManager.getSites().find(s => s.id === siteId);
    if (!site) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Site not found' }));
      return;
    }
    const subpath = url.searchParams.get('subpath') || '';
    const targetDir = path.join(site.publicPath, subpath);
    try {
      if (!fs.existsSync(targetDir)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      const items = fs.readdirSync(targetDir, { withFileTypes: true }).map(item => {
        let size = 0;
        let mtime = null;
        try {
          const stat = fs.statSync(path.join(targetDir, item.name));
          size = stat.size;
          mtime = stat.mtime;
        } catch {}
        return {
          name: item.name,
          isDirectory: item.isDirectory(),
          size,
          mtime
        };
      });
      // Sort directories first
      items.sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0) || a.name.localeCompare(b.name));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(items));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/file-content') && req.method === 'GET') {
    const siteId = pathname.split('/')[3];
    const site = siteManager.getSites().find(s => s.id === siteId);
    if (!site) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Site not found' }));
      return;
    }
    const subpath = url.searchParams.get('subpath') || '';
    const targetFile = path.join(site.publicPath, subpath);
    try {
      if (fs.existsSync(targetFile) && !fs.statSync(targetFile).isDirectory()) {
        const content = fs.readFileSync(targetFile, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/exec') && req.method === 'POST') {
    const siteId = pathname.split('/')[3];
    const site = siteManager.getSites().find(s => s.id === siteId);
    if (!site) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Site not found' }));
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        if (!command) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Command required' }));
          return;
        }

        const phpBinary = path.join(__dirname, 'bin', 'php', 'php.exe');
        const customEnv = {
          ...process.env,
          PATH: `${path.join(__dirname, 'bin', 'php')};${process.env.PATH}`
        };

        exec(command, { cwd: site.publicPath, env: customEnv }, (err, stdout, stderr) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            stdout: stdout || '',
            stderr: stderr || '',
            code: err ? err.code || 1 : 0
          }));
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/api/open-terminal' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { path: targetPath } = JSON.parse(body);
        if (targetPath && fs.existsSync(targetPath)) {
          const cleanPath = path.normalize(targetPath).replace(/'/g, "''");
          spawn('powershell.exe', [
            '-NoProfile',
            '-Command',
            `Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', 'Set-Location ''${cleanPath}'''`
          ], { detached: true, stdio: 'ignore' });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/blueprints/') && req.method === 'DELETE') {
    const bpName = decodeURIComponent(pathname.split('/')[3]);
    try {
      const remaining = siteManager.deleteBlueprint(bpName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(remaining));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/logs') && req.method === 'GET') {
    const siteId = pathname.split('/')[3];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(siteManager.getLogs(siteId)));
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/emails') && req.method === 'GET') {
    const siteId = pathname.split('/')[3];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(siteManager.getEmails(siteId)));
    return;
  }

  if (pathname.startsWith('/api/sites/') && pathname.endsWith('/emails') && req.method === 'DELETE') {
    const siteId = pathname.split('/')[3];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(siteManager.clearEmails(siteId)));
    return;
  }

  if (pathname.startsWith('/api/sites/') && req.method === 'DELETE') {
    const siteId = pathname.split('/')[3];
    try {
      const updated = await siteManager.deleteSite(siteId, true);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve static dist
  let filePath = path.join(__dirname, 'dist', pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`FastWP Web Server running at http://127.0.0.1:${PORT}`);
});

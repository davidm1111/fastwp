const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const net = require('net');

class SiteManager {
  constructor(userDataPath) {
    this.sitesFile = path.join(userDataPath, 'sites.json');
    this.sites = [];
    this.runningProcesses = new Map(); // siteId -> ChildProcess
    this.siteLogs = new Map(); // siteId -> Array of log objects
    this.capturedEmails = new Map(); // siteId -> Array of emails
    this.loadSites();
  }

  loadSites() {
    try {
      if (fs.existsSync(this.sitesFile)) {
        const raw = fs.readFileSync(this.sitesFile, 'utf8');
        this.sites = JSON.parse(raw);
        // Reset all sites to stopped on initial boot
        this.sites.forEach(s => s.status = 'stopped');
      } else {
        this.sites = [];
        this.saveSites();
      }
    } catch (e) {
      console.error('Error loading sites:', e);
      this.sites = [];
    }
  }

  saveSites() {
    try {
      const dir = path.dirname(this.sitesFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.sitesFile, JSON.stringify(this.sites, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving sites:', e);
    }
  }

  getSites() {
    return this.sites;
  }

  async findAvailablePort(startPort = 10000) {
    let port = startPort;
    const isPortTaken = (p) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(true));
        server.once('listening', () => {
          server.close();
          resolve(false);
        });
        server.listen(p, '127.0.0.1');
      });
    };

    while (await isPortTaken(port)) {
      port++;
    }
    return port;
  }

  async createSite(data, defaultBaseDir) {
    const id = 'site_' + Date.now();
    const siteName = data.name.trim();
    const domain = data.domain || `${siteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.local`;
    const port = data.port || await this.findAvailablePort(10000 + Math.floor(Math.random() * 5000));
    const sitePath = data.path || path.join(defaultBaseDir, siteName.replace(/[^a-zA-Z0-9_-]/g, '_'));
    const publicPath = path.join(sitePath, 'app', 'public');

    // Create directories
    fs.mkdirSync(publicPath, { recursive: true });
    fs.mkdirSync(path.join(sitePath, 'logs'), { recursive: true });
    fs.mkdirSync(path.join(sitePath, 'conf'), { recursive: true });

    // Populate starter files (FastWP instant starter with WordPress compatibility and installer)
    const blueprint = data.blueprint;
    this.createStarterWordPressFiles(publicPath, siteName, data, blueprint);

    const newSite = {
      id,
      name: siteName,
      domain,
      port,
      path: sitePath,
      publicPath,
      phpVersion: data.phpVersion || '8.2',
      webServer: data.webServer || 'Built-in Fast Engine',
      dbEngine: data.dbEngine || 'SQLite (Instant)',
      dbName: data.dbName || siteName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_db',
      dbUser: data.dbUser || 'root',
      dbPassword: data.dbPassword || '',
      adminUser: data.adminUser || 'admin',
      adminEmail: data.adminEmail || 'dev@local.fast',
      notes: data.notes || '',
      status: 'stopped',
      createdAt: new Date().toISOString(),
      ssl: false
    };

    this.sites.push(newSite);
    this.saveSites();
    this.siteLogs.set(id, []);
    this.capturedEmails.set(id, []);

    this.log(id, 'system', `Site "${siteName}" created successfully at ${sitePath}`);
    return newSite;
  }

  createStarterWordPressFiles(publicPath, siteName, data, blueprintName) {
    if (blueprintName) {
      const bpDir = path.join(__dirname, '..', 'templates', 'blueprints', blueprintName);
      if (fs.existsSync(bpDir)) {
        fs.cpSync(bpDir, publicPath, { recursive: true });
        return;
      }
    }

    const tplDir = path.join(__dirname, '..', 'templates', 'wordpress-sqlite');
    if (fs.existsSync(tplDir) && fs.readdirSync(tplDir).length > 0) {
      // Instant creation: copy preconfigured WordPress SQLite template
      fs.cpSync(tplDir, publicPath, { recursive: true });
      return;
    }

    const indexPath = path.join(publicPath, 'index.php');
    if (!fs.existsSync(indexPath)) {
      const phpContent = `<?php
/**
 * FastWP Instant Local Environment
 * Site: ${siteName}
 */
$siteName = "${siteName}";
$phpVersion = phpversion();
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'PHP CLI Server';
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? __DIR__;
$startTime = microtime(true);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($siteName); ?> - FastWP Local</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --border: #334155;
            --primary: #22c55e;
            --primary-glow: rgba(34, 197, 94, 0.2);
            --text: #f8fafc;
            --text-muted: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 720px;
            width: 100%;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--primary-glow);
            color: var(--primary);
            border: 1px solid var(--primary);
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--primary);
            box-shadow: 0 0 10px var(--primary);
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }
        h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        p.subtitle { color: var(--text-muted); font-size: 15px; margin-bottom: 24px; line-height: 1.5; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 28px;
        }
        .stat-card {
            background: #0f172a;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 16px;
        }
        .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-val { font-size: 16px; font-weight: 600; color: #fff; margin-top: 4px; }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
        }
        .btn-primary {
            background: var(--primary);
            color: #0f172a;
        }
        .btn-primary:hover { background: #16a34a; }
        .btn-secondary {
            background: #334155;
            color: #fff;
        }
        .btn-secondary:hover { background: #475569; }
        .footer {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            font-size: 12px;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge"><span class="pulse"></span> FastWP Engine Online</div>
        <h1><?php echo htmlspecialchars($siteName); ?></h1>
        <p class="subtitle">Tu entorno local de WordPress está corriendo en modo ultra rápido con latencia mínima y cero cuellos de botella.</p>
        
        <div class="grid">
            <div class="stat-card">
                <div class="stat-label">Versión PHP</div>
                <div class="stat-val"><?php echo $phpVersion; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Motor Web</div>
                <div class="stat-val"><?php echo htmlspecialchars($serverSoftware); ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Base de Datos</div>
                <div class="stat-val">${data.dbEngine || 'SQLite (Ultra Fast)'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Puerto</div>
                <div class="stat-val">${data.port || 10000}</div>
            </div>
        </div>

        <div class="actions">
            <a href="info.php" class="btn btn-secondary">Ver phpinfo()</a>
            <a href="test-email.php" class="btn btn-secondary">Probar Email MailCatcher</a>
        </div>

        <div class="footer">
            <span>Ruta: <?php echo htmlspecialchars($documentRoot); ?></span>
            <span>FastWP v1.0 &bull; Cero sobrecarga</span>
        </div>
    </div>
</body>
</html>`;
      fs.writeFileSync(indexPath, phpContent, 'utf8');

      // Also create info.php for phpinfo
      fs.writeFileSync(path.join(publicPath, 'info.php'), `<?php phpinfo(); ?>`, 'utf8');

      // Create test-email.php
      fs.writeFileSync(path.join(publicPath, 'test-email.php'), `<?php
// Simula un envío de email para FastWP MailCatcher
$to = 'admin@example.com';
$subject = 'Test Email from ' . $_SERVER['HTTP_HOST'];
$message = "Hola! Este es un correo de prueba enviado desde tu WordPress local en FastWP.\\n\\nHora: " . date('Y-m-d H:i:s');
$headers = 'From: noreply@fastwp.local\\r\\n' .
    'Reply-To: noreply@fastwp.local\\r\\n' .
    'X-Mailer: FastWP-Local-Mailer/1.0';

$sent = @mail($to, $subject, $message, $headers);
?>
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif; background:#0f172a; color:#fff; padding:40px;">
    <h2>Simulación de Envío de Email</h2>
    <p>Email enviado a <b><?php echo $to; ?></b> con asunto: <b><?php echo $subject; ?></b></p>
    <br>
    <a href="index.php" style="color:#22c55e;">&larr; Volver al inicio</a>
</body>
</html>`, 'utf8');
    }
  }

  log(siteId, type, message) {
    if (!this.siteLogs.has(siteId)) {
      this.siteLogs.set(siteId, []);
    }
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      type, // 'stdout', 'stderr', 'system'
      message
    };
    const logs = this.siteLogs.get(siteId);
    logs.push(entry);
    if (logs.length > 500) logs.shift(); // Keep last 500 logs
    return entry;
  }

  async startSite(siteId, onLog, onStatusChange) {
    const site = this.sites.find(s => s.id === siteId);
    if (!site) throw new Error('Site not found');
    if (this.runningProcesses.has(siteId)) {
      return site;
    }

    const port = site.port;
    const docRoot = site.publicPath;

    // Detect PHP binary and custom php.ini
    const { binary: phpBinary, ini: phpIni } = await this.resolvePhpBinary();

    this.log(siteId, 'system', `Starting PHP server on 127.0.0.1:${port}...`);
    if (onLog) onLog(this.log(siteId, 'system', `Using runtime: ${phpBinary}`));

    const phpArgs = [];
    if (phpIni && fs.existsSync(phpIni)) {
      phpArgs.push('-c', phpIni);
    }
    phpArgs.push('-S', `127.0.0.1:${port}`, '-t', docRoot);

    // Spawn PHP built-in server
    const phpProc = spawn(phpBinary, phpArgs, {
      cwd: docRoot,
      windowsHide: true,
      env: {
        ...process.env,
        FASTWP_SITE_ID: siteId
      }
    });

    this.runningProcesses.set(siteId, phpProc);
    site.status = 'running';
    this.saveSites();
    if (onStatusChange) onStatusChange({ siteId, status: 'running' });

    phpProc.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      const entry = this.log(siteId, 'stdout', msg);
      if (onLog) onLog(entry);
    });

    phpProc.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      const entry = this.log(siteId, 'stderr', msg);
      if (onLog) onLog(entry);
    });

    phpProc.on('close', (code) => {
      this.runningProcesses.delete(siteId);
      site.status = 'stopped';
      this.saveSites();
      this.log(siteId, 'system', `Process exited with code ${code}`);
      if (onStatusChange) onStatusChange({ siteId, status: 'stopped' });
    });

    phpProc.on('error', (err) => {
      this.runningProcesses.delete(siteId);
      site.status = 'stopped';
      this.saveSites();
      this.log(siteId, 'system', `Failed to start PHP: ${err.message}`);
      if (onStatusChange) onStatusChange({ siteId, status: 'stopped', error: err.message });
    });

    return site;
  }

  async stopSite(siteId, onStatusChange) {
    const site = this.sites.find(s => s.id === siteId);
    if (!site) return;

    const proc = this.runningProcesses.get(siteId);
    if (proc && proc.pid) {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${proc.pid} /T /F`, () => {});
      } else {
        proc.kill('SIGTERM');
      }
      this.runningProcesses.delete(siteId);
    }

    site.status = 'stopped';
    this.saveSites();
    this.log(siteId, 'system', 'Site stopped.');
    if (onStatusChange) onStatusChange({ siteId, status: 'stopped' });
    return site;
  }

  async startAllSites(onLog, onStatusChange) {
    for (const site of this.sites) {
      if (site.status !== 'running') {
        try {
          await this.startSite(site.id, onLog, onStatusChange);
        } catch (e) {
          console.error(`Error starting site ${site.name}:`, e);
        }
      }
    }
    return this.sites;
  }

  async stopAllSites(onStatusChange) {
    for (const site of this.sites) {
      if (site.status === 'running') {
        await this.stopSite(site.id, onStatusChange);
      }
    }
    return this.sites;
  }

  async deleteSite(siteId, deleteFiles = false) {
    await this.stopSite(siteId);
    const index = this.sites.findIndex(s => s.id === siteId);
    if (index !== -1) {
      const site = this.sites[index];
      if (deleteFiles && fs.existsSync(site.path)) {
        try {
          fs.rmSync(site.path, { recursive: true, force: true });
        } catch (e) {
          console.error('Error removing site folder:', e);
        }
      }
      this.sites.splice(index, 1);
      this.saveSites();
      this.siteLogs.delete(siteId);
      this.capturedEmails.delete(siteId);
    }
    return this.sites;
  }

  async cloneSite(siteId, newName) {
    const original = this.sites.find(s => s.id === siteId);
    if (!original) throw new Error('Site not found');

    const cloneName = newName ? newName.trim() : `${original.name} (Copia)`;
    const port = await this.findAvailablePort(original.port + 1);
    const id = 'site_' + Date.now();
    const sitePath = path.join(path.dirname(original.path), cloneName.replace(/[^a-zA-Z0-9_-]/g, '_'));
    const publicPath = path.join(sitePath, 'app', 'public');

    // Fast copy of files
    fs.mkdirSync(path.dirname(sitePath), { recursive: true });
    fs.cpSync(original.path, sitePath, { recursive: true });

    const newSite = {
      ...original,
      id,
      name: cloneName,
      domain: `${cloneName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.local`,
      port,
      path: sitePath,
      publicPath,
      status: 'stopped',
      createdAt: new Date().toISOString()
    };

    this.sites.push(newSite);
    this.saveSites();
    this.siteLogs.set(id, []);
    this.capturedEmails.set(id, []);
    this.log(id, 'system', `Site cloned successfully from "${original.name}"`);
    return newSite;
  }

  async saveAsBlueprint(siteId, blueprintName) {
    const site = this.sites.find(s => s.id === siteId);
    if (!site) throw new Error('Site not found');

    const cleanName = blueprintName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const blueprintsDir = path.join(__dirname, '..', 'templates', 'blueprints', cleanName);
    fs.mkdirSync(blueprintsDir, { recursive: true });

    // Copy public files (including db, themes, plugins)
    fs.cpSync(site.publicPath, blueprintsDir, { recursive: true });
    return { name: blueprintName, path: blueprintsDir };
  }

  getBlueprints() {
    const blueprintsDir = path.join(__dirname, '..', 'templates', 'blueprints');
    if (!fs.existsSync(blueprintsDir)) return [];
    try {
      return fs.readdirSync(blueprintsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
    } catch {
      return [];
    }
  }

  deleteBlueprint(blueprintName) {
    const cleanName = blueprintName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const bpDir = path.join(__dirname, '..', 'templates', 'blueprints', cleanName);
    if (fs.existsSync(bpDir)) {
      fs.rmSync(bpDir, { recursive: true, force: true });
    }
    return this.getBlueprints();
  }

  saveNotes(siteId, notes) {
    const site = this.sites.find(s => s.id === siteId);
    if (!site) throw new Error('Site not found');
    site.notes = notes || '';
    this.saveSites();
    return site;
  }

  getLogs(siteId) {
    return this.siteLogs.get(siteId) || [];
  }

  getEmails(siteId) {
    return this.capturedEmails.get(siteId) || [];
  }

  clearEmails(siteId) {
    this.capturedEmails.set(siteId, []);
    return [];
  }

  async resolvePhpBinary() {
    // 1. Check bundled portable PHP in project/bin/php
    const bundledPhp = path.join(__dirname, '..', 'bin', 'php', 'php.exe');
    const bundledIni = path.join(__dirname, '..', 'bin', 'php', 'php.ini');
    if (fs.existsSync(bundledPhp)) {
      return { binary: bundledPhp, ini: bundledIni };
    }

    // 2. Check LocalAppData portable PHP
    const appDataPhp = path.join(process.env.LOCALAPPDATA || '', 'FastWP', 'php', 'php.exe');
    const appDataIni = path.join(process.env.LOCALAPPDATA || '', 'FastWP', 'php', 'php.ini');
    if (fs.existsSync(appDataPhp)) {
      return { binary: appDataPhp, ini: appDataIni };
    }

    // 3. Check common Windows paths
    const commonPaths = [
      'C:\\xampp\\php\\php.exe',
      'C:\\laragon\\bin\\php\\current\\php.exe',
      'C:\\tools\\php\\php.exe'
    ];
    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        return { binary: p, ini: null };
      }
    }

    // 4. Fallback to system PATH
    return { binary: 'php', ini: null };
  }

  async checkEnvironment() {
    const { binary, ini } = await this.resolvePhpBinary();
    return new Promise((resolve) => {
      const cmd = `"${binary}" -v`;
      exec(cmd, (err, stdout) => {
        const phpAvailable = !err;
        const phpVersion = phpAvailable ? (stdout.split('\n')[0] || 'Available') : null;
        resolve({
          phpAvailable,
          phpVersion,
          phpPath: binary,
          platform: process.platform,
          arch: process.arch
        });
      });
    });
  }
}

module.exports = SiteManager;

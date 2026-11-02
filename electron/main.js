const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const SiteManager = require('./siteManager');

let mainWindow = null;
let siteManager = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 620,
    frame: true, // Native framed window with Windows controls
    autoHideMenuBar: true,
    show: true,
    center: true,
    backgroundColor: '#13161a',
    title: 'FastWP - Local WordPress',
    icon: path.join(__dirname, '../FastWP-fuchsia.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  if (process.env.VITE_DEV === 'true') {
    mainWindow.loadURL('http://localhost:5173');
  } else if (fs.existsSync(distHtml)) {
    mainWindow.loadFile(distHtml);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.show();
  mainWindow.focus();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const defaultBaseDir = path.join(app.getPath('documents'), 'FastWP Sites');
  if (!fs.existsSync(defaultBaseDir)) {
    fs.mkdirSync(defaultBaseDir, { recursive: true });
  }

  siteManager = new SiteManager(app.getPath('userData'));

  // Register IPC Handlers
  ipcMain.handle('get-sites', () => siteManager.getSites());

  ipcMain.handle('create-site', async (_event, siteData) => {
    return await siteManager.createSite(siteData, defaultBaseDir);
  });

  ipcMain.handle('delete-site', async (_event, id, deleteFiles) => {
    return await siteManager.deleteSite(id, deleteFiles);
  });

  ipcMain.handle('clone-site', async (_event, id, newName) => {
    return await siteManager.cloneSite(id, newName);
  });

  ipcMain.handle('save-as-blueprint', async (_event, id, blueprintName) => {
    return await siteManager.saveAsBlueprint(id, blueprintName);
  });

  ipcMain.handle('get-blueprints', () => {
    return siteManager.getBlueprints();
  });

  ipcMain.handle('delete-blueprint', async (_event, name) => {
    return siteManager.deleteBlueprint(name);
  });

  ipcMain.handle('save-notes', async (_event, id, notes) => {
    return siteManager.saveNotes(id, notes);
  });

  ipcMain.handle('start-site', async (_event, id) => {
    return await siteManager.startSite(
      id,
      (logEntry) => {
        if (mainWindow) mainWindow.webContents.send('log-message', { siteId: id, log: logEntry });
      },
      (statusUpdate) => {
        if (mainWindow) mainWindow.webContents.send('site-status-changed', statusUpdate);
      }
    );
  });

  ipcMain.handle('stop-site', async (_event, id) => {
    return await siteManager.stopSite(id, (statusUpdate) => {
      if (mainWindow) mainWindow.webContents.send('site-status-changed', statusUpdate);
    });
  });

  ipcMain.handle('start-all-sites', async () => {
    return await siteManager.startAllSites(
      (logEntry) => {
        if (mainWindow) mainWindow.webContents.send('log-message', logEntry);
      },
      (statusUpdate) => {
        if (mainWindow) mainWindow.webContents.send('site-status-changed', statusUpdate);
      }
    );
  });

  ipcMain.handle('stop-all-sites', async () => {
    return await siteManager.stopAllSites((statusUpdate) => {
      if (mainWindow) mainWindow.webContents.send('site-status-changed', statusUpdate);
    });
  });

  ipcMain.handle('open-external', (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('open-folder', (_event, targetPath) => {
    shell.openPath(targetPath);
  });

  ipcMain.handle('open-terminal', (_event, targetPath) => {
    if (process.platform === 'win32') {
      spawn('cmd.exe', ['/c', 'start', 'powershell', '-NoExit', '-Command', `Set-Location '${targetPath}'`], {
        detached: true,
        stdio: 'ignore'
      });
    } else {
      shell.openPath(targetPath);
    }
  });

  ipcMain.handle('get-logs', (_event, siteId) => siteManager.getLogs(siteId));
  ipcMain.handle('get-emails', (_event, siteId) => siteManager.getEmails(siteId));
  ipcMain.handle('clear-emails', (_event, siteId) => siteManager.clearEmails(siteId));
  ipcMain.handle('check-environment', async () => siteManager.checkEnvironment());

  // Window control buttons
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });
  ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    }
  });
  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', async () => {
  if (siteManager) {
    await siteManager.stopAllSites();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSites: () => ipcRenderer.invoke('get-sites'),
  createSite: (siteData) => ipcRenderer.invoke('create-site', siteData),
  deleteSite: (id, deleteFiles) => ipcRenderer.invoke('delete-site', id, deleteFiles),
  cloneSite: (id, newName) => ipcRenderer.invoke('clone-site', id, newName),
  saveAsBlueprint: (id, blueprintName) => ipcRenderer.invoke('save-as-blueprint', id, blueprintName),
  getBlueprints: () => ipcRenderer.invoke('get-blueprints'),
  deleteBlueprint: (name) => ipcRenderer.invoke('delete-blueprint', name),
  saveNotes: (id, notes) => ipcRenderer.invoke('save-notes', id, notes),
  startSite: (id) => ipcRenderer.invoke('start-site', id),
  stopSite: (id) => ipcRenderer.invoke('stop-site', id),
  startAllSites: () => ipcRenderer.invoke('start-all-sites'),
  stopAllSites: () => ipcRenderer.invoke('stop-all-sites'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  openTerminal: (path) => ipcRenderer.invoke('open-terminal', path),
  getLogs: (siteId) => ipcRenderer.invoke('get-logs', siteId),
  getEmails: (siteId) => ipcRenderer.invoke('get-emails', siteId),
  clearEmails: (siteId) => ipcRenderer.invoke('clear-emails', siteId),
  checkEnvironment: () => ipcRenderer.invoke('check-environment'),
  downloadPortablePhp: () => ipcRenderer.invoke('download-portable-php'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  onSiteStatusChange: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('site-status-changed', handler);
    return () => ipcRenderer.removeListener('site-status-changed', handler);
  },
  onLogMessage: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('log-message', handler);
    return () => ipcRenderer.removeListener('log-message', handler);
  },
  onEmailReceived: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('email-received', handler);
    return () => ipcRenderer.removeListener('email-received', handler);
  }
});

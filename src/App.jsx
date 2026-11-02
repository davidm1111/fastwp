import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SiteDetails from './components/SiteDetails';
import NewSiteModal from './components/NewSiteModal';
import BlueprintsModal from './components/BlueprintsModal';
import EmptyState from './components/EmptyState';

export default function App() {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlueprintsModalOpen, setIsBlueprintsModalOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState(null);
  const [blueprints, setBlueprints] = useState([]);
  const [siteLogs, setSiteLogs] = useState({});
  const [siteEmails, setSiteEmails] = useState({});

  // Initial load
  useEffect(() => {
    async function loadData() {
      if (window.api) {
        try {
          const loadedSites = await window.api.getSites();
          setSites(loadedSites || []);
          if (loadedSites && loadedSites.length > 0) {
            setSelectedSiteId(loadedSites[0].id);
          }

          const env = await window.api.checkEnvironment();
          setEnvStatus(env);

          const bps = await window.api.getBlueprints();
          setBlueprints(bps || []);
        } catch (e) {
          console.error('Error initializing:', e);
        }
      } else {
        // Browser mode via local API
        try {
          const resSites = await fetch('/api/sites');
          const loadedSites = await resSites.json();
          setSites(loadedSites || []);
          if (loadedSites && loadedSites.length > 0) {
            setSelectedSiteId(loadedSites[0].id);
          }

          const resEnv = await fetch('/api/env');
          const env = await resEnv.json();
          setEnvStatus(env);

          const resBp = await fetch('/api/blueprints');
          const bps = await resBp.json();
          setBlueprints(bps || []);
        } catch (e) {
          console.error('API load failed:', e);
        }
      }
    }

    loadData();

    // Listeners for IPC events
    if (window.api) {
      const unsubStatus = window.api.onSiteStatusChange((data) => {
        setSites((prev) =>
          prev.map((s) => (s.id === data.siteId ? { ...s, status: data.status } : s))
        );
      });

      const unsubLogs = window.api.onLogMessage((data) => {
        if (!data || !data.siteId) return;
        setSiteLogs((prev) => {
          const current = prev[data.siteId] || [];
          return {
            ...prev,
            [data.siteId]: [...current, data.log]
          };
        });
      });

      const unsubEmails = window.api.onEmailReceived((data) => {
        if (!data || !data.siteId) return;
        setSiteEmails((prev) => {
          const current = prev[data.siteId] || [];
          return {
            ...prev,
            [data.siteId]: [data.email, ...current]
          };
        });
      });

      return () => {
        unsubStatus && unsubStatus();
        unsubLogs && unsubLogs();
        unsubEmails && unsubEmails();
      };
    } else {
      // Browser mode: poll logs every 2 seconds
      const interval = setInterval(async () => {
        if (selectedSiteId) {
          try {
            const res = await fetch(`/api/sites/${selectedSiteId}/logs`);
            const logs = await res.json();
            setSiteLogs((prev) => ({ ...prev, [selectedSiteId]: logs || [] }));
          } catch {}
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSiteId]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Actions
  const handleCreateSite = async (siteData) => {
    if (window.api) {
      const newSite = await window.api.createSite(siteData);
      setSites((prev) => [...prev, newSite]);
      setSelectedSiteId(newSite.id);
    } else {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      });
      const newSite = await res.json();
      setSites((prev) => [...prev, newSite]);
      setSelectedSiteId(newSite.id);
    }
  };

  const handleStartSite = async (siteId) => {
    if (window.api) {
      await window.api.startSite(siteId);
    } else {
      await fetch(`/api/sites/${siteId}/start`, { method: 'POST' });
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, status: 'running' } : s))
      );
    }
  };

  const handleStopSite = async (siteId) => {
    if (window.api) {
      await window.api.stopSite(siteId);
    } else {
      await fetch(`/api/sites/${siteId}/stop`, { method: 'POST' });
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, status: 'stopped' } : s))
      );
    }
  };

  const handleStartAll = async () => {
    if (window.api) {
      await window.api.startAllSites();
    } else {
      for (const site of sites) {
        if (site.status !== 'running') await handleStartSite(site.id);
      }
    }
  };

  const handleStopAll = async () => {
    if (window.api) {
      await window.api.stopAllSites();
    } else {
      for (const site of sites) {
        if (site.status === 'running') await handleStopSite(site.id);
      }
    }
  };

  const handleCloneSite = async (siteId, newName) => {
    if (window.api) {
      const cloned = await window.api.cloneSite(siteId, newName);
      setSites((prev) => [...prev, cloned]);
      setSelectedSiteId(cloned.id);
    } else {
      const res = await fetch(`/api/sites/${siteId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      const cloned = await res.json();
      setSites((prev) => [...prev, cloned]);
      setSelectedSiteId(cloned.id);
    }
  };

  const handleSaveBlueprint = async (siteId, bpName) => {
    if (window.api) {
      await window.api.saveAsBlueprint(siteId, bpName);
      const bps = await window.api.getBlueprints();
      setBlueprints(bps || []);
      alert(`¡Plantilla "${bpName}" guardada correctamente! Ahora puedes crear nuevos sitios basados en ella.`);
    } else {
      await fetch(`/api/sites/${siteId}/blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: bpName })
      });
      const resBp = await fetch('/api/blueprints');
      const bps = await resBp.json();
      setBlueprints(bps || []);
      alert(`¡Plantilla "${bpName}" guardada correctamente! Ahora puedes crear nuevos sitios basados en ella.`);
    }
  };

  const handleDeleteBlueprint = async (bpName) => {
    if (window.api) {
      const remaining = await window.api.deleteBlueprint(bpName);
      setBlueprints(remaining || []);
    } else {
      const res = await fetch(`/api/blueprints/${encodeURIComponent(bpName)}`, {
        method: 'DELETE'
      });
      const remaining = await res.json();
      setBlueprints(remaining || []);
    }
  };

  const handleSaveNotes = async (siteId, notes) => {
    if (window.api) {
      await window.api.saveNotes(siteId, notes);
    } else {
      await fetch(`/api/sites/${siteId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
    }
    setSites((prev) => prev.map((s) => (s.id === siteId ? { ...s, notes } : s)));
  };

  const handleDeleteSite = async (siteId, deleteFiles) => {
    if (window.api) {
      const updated = await window.api.deleteSite(siteId, deleteFiles);
      setSites(updated || []);
      if (selectedSiteId === siteId) {
        setSelectedSiteId(updated && updated.length > 0 ? updated[0].id : null);
      }
    } else {
      const res = await fetch(`/api/sites/${siteId}`, { method: 'DELETE' });
      const updated = await res.json();
      setSites(updated || []);
      if (selectedSiteId === siteId) {
        setSelectedSiteId(updated && updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleOpenUrl = (url) => {
    if (window.api) {
      window.api.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleOpenFolder = async (targetPath) => {
    if (window.api) {
      window.api.openFolder(targetPath);
    } else {
      // 1. Trigger registered Windows protocol handler via hidden iframe
      try {
        const clean = targetPath.replace(/\\/g, '/');
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `fastwp://${clean}`;
        document.body.appendChild(iframe);
        setTimeout(() => document.body.removeChild(iframe), 1500);
      } catch (e) {
        console.error(e);
      }

      // 2. Also trigger backend open-folder API
      fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: targetPath })
      }).catch(() => {});
    }
  };

  const handleOpenTerminal = async (targetPath) => {
    if (window.api) {
      window.api.openTerminal(targetPath);
    } else {
      await fetch('/api/open-terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: targetPath })
      });
    }
  };

  const handleClearEmails = (siteId) => {
    if (window.api) {
      window.api.clearEmails(siteId);
    }
    setSiteEmails((prev) => ({ ...prev, [siteId]: [] }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#13161a]">
      {/* Top Header / Titlebar */}
      <Header
        envStatus={envStatus}
        blueprintsCount={blueprints.length}
        onOpenBlueprints={() => setIsBlueprintsModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          sites={sites}
          selectedSiteId={selectedSiteId}
          onSelectSite={setSelectedSiteId}
          onOpenNewSiteModal={() => setIsModalOpen(true)}
          onStartSite={handleStartSite}
          onStopSite={handleStopSite}
          onStartAll={handleStartAll}
          onStopAll={handleStopAll}
          onCloneSite={handleCloneSite}
          onDeleteSite={handleDeleteSite}
        />

        {/* Main Content Area */}
        {selectedSite ? (
          <SiteDetails
            site={selectedSite}
            logs={siteLogs[selectedSite.id] || []}
            emails={siteEmails[selectedSite.id] || []}
            onStart={handleStartSite}
            onStop={handleStopSite}
            onClone={handleCloneSite}
            onSaveBlueprint={handleSaveBlueprint}
            onSaveNotes={handleSaveNotes}
            onOpenFolder={handleOpenFolder}
            onOpenTerminal={handleOpenTerminal}
            onOpenUrl={handleOpenUrl}
            onClearEmails={handleClearEmails}
            onDelete={handleDeleteSite}
          />
        ) : (
          <EmptyState onOpenNewSiteModal={() => setIsModalOpen(true)} />
        )}
      </div>

      {/* Modal for adding site */}
      <NewSiteModal
        isOpen={isModalOpen}
        blueprints={blueprints}
        onClose={() => setIsModalOpen(false)}
        onCreateSite={handleCreateSite}
      />

      {/* Modal for managing blueprints */}
      <BlueprintsModal
        isOpen={isBlueprintsModalOpen}
        blueprints={blueprints}
        onClose={() => setIsBlueprintsModalOpen(false)}
        onDeleteBlueprint={handleDeleteBlueprint}
        onOpenFolder={handleOpenFolder}
      />
    </div>
  );
}

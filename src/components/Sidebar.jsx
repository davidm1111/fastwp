import React, { useState } from 'react';
import { Plus, Search, Play, Square, Globe, Trash2, HardDrive, RefreshCw, Copy } from 'lucide-react';

export default function Sidebar({
  sites,
  selectedSiteId,
  onSelectSite,
  onOpenNewSiteModal,
  onStartSite,
  onStopSite,
  onStartAll,
  onStopAll,
  onCloneSite,
  onDeleteSite
}) {
  const [search, setSearch] = useState('');

  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.domain.toLowerCase().includes(search.toLowerCase())
  );

  const runningCount = sites.filter(s => s.status === 'running').length;

  return (
    <aside className="w-64 bg-[#181b20] border-r border-[#262c36] flex flex-col h-full select-none">
      {/* Search & Actions Bar */}
      <div className="p-3 border-b border-[#262c36] space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar sitios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111418] border border-[#2d3440] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
          <span>{sites.length} {sites.length === 1 ? 'sitio' : 'sitios'} ({runningCount} activos)</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={onStartAll}
              title="Iniciar todos"
              className="p-1 hover:text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
            <button
              onClick={onStopAll}
              title="Detener todos"
              className="p-1 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSites.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {search ? 'No se encontraron sitios' : 'No hay sitios aún. Crea uno abajo.'}
          </div>
        ) : (
          filteredSites.map((site) => {
            const isSelected = site.id === selectedSiteId;
            const isRunning = site.status === 'running';

            return (
              <div
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#252b35] text-white shadow-sm border border-[#343e4d]'
                    : 'text-slate-300 hover:bg-[#1e232b] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {isRunning && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isRunning ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    ></span>
                  </span>

                  <div className="truncate">
                    <div className="font-medium truncate leading-tight">{site.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      :{site.port} &bull; {site.phpVersion}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons on hover */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isRunning ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStopSite(site.id);
                      }}
                      title="Detener"
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded"
                    >
                      <Square className="w-3 h-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartSite(site.id);
                      }}
                      title="Iniciar"
                      className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = prompt(`Nombre para el clon de "${site.name}":`, `${site.name} (Copia)`);
                      if (name) onCloneSite(site.id, name);
                    }}
                    title="Clonar sitio"
                    className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Eliminar el sitio "${site.name}"?`)) {
                        onDeleteSite(site.id, true);
                      }
                    }}
                    title="Eliminar sitio"
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Site Button */}
      <div className="p-3 border-t border-[#262c36] bg-[#14171c]/50">
        <button
          onClick={onOpenNewSiteModal}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-md text-xs shadow-sm shadow-emerald-950/40 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Añadir Sitio Local</span>
        </button>
      </div>
    </aside>
  );
}

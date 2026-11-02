import React from 'react';
import { X, Layers, Trash2, FolderOpen, Box, Sparkles } from 'lucide-react';

export default function BlueprintsModal({ isOpen, onClose, blueprints, onDeleteBlueprint, onOpenFolder }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#181b21] border border-[#2e3745] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262d38] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Gestor de Plantillas (Blueprints)</h2>
              <p className="text-[11px] text-slate-400">Administra o elimina tus plantillas guardadas con temas y plugins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Blueprints */}
        <div className="p-6 max-h-[380px] overflow-y-auto space-y-2.5">
          {blueprints.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-[#12151a] rounded-xl border border-[#262d38]">
              <Box className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <div className="text-xs font-medium text-slate-300">No tienes plantillas personalizadas guardadas</div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Para crear una, abre cualquiera de tus sitios ya configurado con temas y plugins y pulsa el botón <b className="text-slate-400">"Guardar Plantilla"</b>.
              </p>
            </div>
          ) : (
            blueprints.map((bp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-[#1f242c] border border-[#2b333f] hover:border-[#384353] rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{bp}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      templates/blueprints/{bp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar la plantilla "${bp}"?`)) {
                        onDeleteBlueprint(bp);
                      }
                    }}
                    title="Eliminar plantilla"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#262d38] bg-[#14171c]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#29303d] hover:bg-[#343e4f] text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

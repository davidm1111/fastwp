import React from 'react';
import { Zap, Minus, Square, X, Terminal, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

export default function Header({ envStatus, blueprintsCount = 0, onOpenBlueprints }) {
  const handleMinimize = () => window.api?.minimizeWindow();
  const handleMaximize = () => window.api?.maximizeWindow();
  const handleClose = () => window.api?.closeWindow();

  return (
    <header className="h-10 bg-[#14171c] border-b border-[#252b35] flex items-center justify-between px-3 select-none titlebar-drag-region">
      {/* Brand */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center shadow-sm">
          <Zap className="w-3.5 h-3.5 text-white fill-current" />
        </div>
        <span className="font-bold text-xs tracking-wider uppercase text-slate-200">
          Fast<span className="text-fuchsia-400">WP</span>
        </span>
        <span className="text-[10px] bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/60 px-1.5 py-0.5 rounded font-mono font-medium">
          ULTRA SPEED
        </span>
      </div>

      {/* Middle Tools */}
      <div className="flex items-center space-x-3 text-xs no-drag">
        <button
          onClick={onOpenBlueprints}
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#1e232b] hover:bg-[#28303a] border border-[#2d3644] text-slate-300 hover:text-white rounded-md text-[11px] font-medium transition-colors"
          title="Ver y gestionar plantillas con temas y plugins guardados"
        >
          <Layers className="w-3 h-3 text-violet-400" />
          <span>Plantillas ({blueprintsCount})</span>
        </button>

        {envStatus ? (
          envStatus.phpAvailable ? (
            <div className="flex items-center space-x-1.5 text-fuchsia-300 bg-fuchsia-950/40 px-2 py-0.5 rounded border border-fuchsia-900/50 text-[11px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>PHP Listo ({envStatus.phpVersion ? envStatus.phpVersion.split(' ')[1] : 'OK'})</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50 text-[11px]">
              <AlertCircle className="w-3 h-3" />
              <span>PHP no detectado</span>
            </div>
          )
        ) : null}
      </div>

      {/* Window Controls */}
      <div className="flex items-center space-x-1 no-drag">
        <button
          onClick={handleMinimize}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          title="Minimizar"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          title="Maximizar"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

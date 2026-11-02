import React from 'react';
import { Plus, Zap, Cpu, ShieldCheck, Rocket } from 'lucide-react';

export default function EmptyState({ onOpenNewSiteModal }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#1a1e24] text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-950/50">
        <Rocket className="w-8 h-8 text-emerald-400" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Bienvenido a FastWP</h2>
      <p className="text-xs text-slate-400 max-w-md mb-8 leading-relaxed">
        El entorno de desarrollo local de WordPress más rápido para Windows. Sin pesados contenedores, sin latencia de disco y con arranque instantáneo.
      </p>

      <button
        onClick={onOpenNewSiteModal}
        className="flex items-center space-x-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Crear mi primer sitio WordPress</span>
      </button>

      <div className="grid grid-cols-3 gap-6 max-w-xl mt-12 text-left">
        <div className="p-4 bg-[#14171d] rounded-xl border border-[#252c37]">
          <Zap className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-xs font-semibold text-slate-200">Arranque en &lt; 0.5s</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Motor ultra optimizado con SQLite o MySQL directo.
          </div>
        </div>

        <div className="p-4 bg-[#14171d] rounded-xl border border-[#252c37]">
          <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-xs font-semibold text-slate-200">Consumo Mínimo</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Consume hasta un 80% menos de RAM que LocalWP tradicional.
          </div>
        </div>

        <div className="p-4 bg-[#14171d] rounded-xl border border-[#252c37]">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-xs font-semibold text-slate-200">Mail Catcher & Logs</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Captura correos salientes y consulta errores de PHP en vivo.
          </div>
        </div>
      </div>
    </div>
  );
}

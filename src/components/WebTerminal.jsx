import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WebTerminal({ siteId, sitePath }) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([
    {
      type: 'info',
      text: `Terminal interactivo listo en: ${sitePath}\nEscribe cualquier comando (ej: dir, php -v, git status) o pulsa un atajo rápido:`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const runCommand = async (cmdToRun) => {
    const cmd = (cmdToRun || command).trim();
    if (!cmd) return;

    setLoading(true);
    setHistory((prev) => [...prev, { type: 'input', text: cmd }]);
    if (!cmdToRun) setCommand('');

    try {
      const res = await fetch(`/api/sites/${siteId}/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      if (data.stdout) {
        setHistory((prev) => [...prev, { type: 'stdout', text: data.stdout }]);
      }
      if (data.stderr) {
        setHistory((prev) => [...prev, { type: 'stderr', text: data.stderr }]);
      }
      if (!data.stdout && !data.stderr) {
        setHistory((prev) => [...prev, { type: 'stdout', text: '(Comando completado sin salida)' }]);
      }
    } catch (e) {
      setHistory((prev) => [...prev, { type: 'stderr', text: 'Error ejecutando comando: ' + e.message }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const clearHistory = () => {
    setHistory([{ type: 'info', text: 'Consola limpiada.' }]);
  };

  const quickCommands = [
    { label: 'php -v', cmd: 'php -v' },
    { label: 'Listar Archivos (dir)', cmd: 'dir' },
    { label: 'Módulos PHP', cmd: 'php -m' },
    { label: 'Estado Git', cmd: 'git status' }
  ];

  return (
    <div className="flex flex-col h-[520px] bg-[#0f1216] border border-[#262d38] rounded-xl overflow-hidden font-mono text-xs max-w-4xl">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#14171d] border-b border-[#262d38] flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-300">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-xs">Terminal Web Integrado</span>
          <span className="text-[10px] text-slate-500 font-sans">app/public</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick shortcuts */}
          <div className="flex items-center space-x-1.5 font-sans">
            {quickCommands.map((qc, i) => (
              <button
                key={i}
                onClick={() => runCommand(qc.cmd)}
                disabled={loading}
                className="px-2 py-0.5 bg-[#1e232b] hover:bg-[#28303a] text-slate-300 text-[11px] rounded border border-[#2d3542] transition-colors"
              >
                {qc.label}
              </button>
            ))}
          </div>

          <button
            onClick={clearHistory}
            title="Limpiar consola"
            className="p-1 text-slate-500 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output screen */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 select-text leading-relaxed">
        {history.map((entry, idx) => (
          <div key={idx} className="whitespace-pre-wrap">
            {entry.type === 'input' && (
              <div className="text-emerald-400 flex items-start space-x-2">
                <span className="text-slate-500 shrink-0">&gt;</span>
                <span className="font-semibold">{entry.text}</span>
              </div>
            )}
            {entry.type === 'stdout' && <div className="text-slate-200 pl-4">{entry.text}</div>}
            {entry.type === 'stderr' && <div className="text-red-400 pl-4">{entry.text}</div>}
            {entry.type === 'info' && <div className="text-slate-500 italic">{entry.text}</div>}
          </div>
        ))}
        {loading && (
          <div className="text-emerald-400/70 pl-4 flex items-center space-x-2 animate-pulse">
            <span>Ejecutando comando...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Prompt input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand();
        }}
        className="px-3 py-2 bg-[#14171d] border-t border-[#262d38] flex items-center space-x-2"
      >
        <span className="text-emerald-400 font-bold shrink-0">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Escribe un comando y pulsa Enter (ej: dir, php -v)..."
          disabled={loading}
          className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600 text-xs font-mono"
        />
        <button
          type="submit"
          disabled={!command.trim() || loading}
          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-black rounded transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

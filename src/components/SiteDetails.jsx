import React, { useState, useEffect, useRef } from 'react';
import FileBrowser from './FileBrowser';
import WebTerminal from './WebTerminal';
import {
  Globe,
  Lock,
  FolderOpen,
  Terminal,
  Play,
  Square,
  ExternalLink,
  Copy,
  Check,
  Server,
  Database,
  Cpu,
  Mail,
  FileText,
  Key,
  Layers,
  ShieldCheck,
  Trash2,
  BookmarkPlus,
  Download,
  StickyNote
} from 'lucide-react';

export default function SiteDetails({
  site,
  logs,
  emails,
  onStart,
  onStop,
  onClone,
  onSaveBlueprint,
  onSaveNotes,
  onOpenFolder,
  onOpenTerminal,
  onOpenUrl,
  onClearEmails,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedField, setCopiedField] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [notes, setNotes] = useState(site.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setNotes(site.notes || '');
  }, [site.id]);

  const handleNotesChange = (val) => {
    setNotes(val);
    setSavingNotes(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (onSaveNotes) await onSaveNotes(site.id, val);
      setSavingNotes(false);
    }, 600);
  };

  if (!site) return null;

  const isRunning = site.status === 'running';
  const siteUrl = `http://localhost:${site.port}`;
  const wpAdminUrl = `${siteUrl}/wp-admin`;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e232a] overflow-hidden select-none">
      {/* Top Site Bar */}
      <div className="px-8 py-5 border-b border-[#2b333f] bg-[#1a1e24] flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{site.name}</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isRunning
                  ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {isRunning ? `Activo (Puerto ${site.port})` : 'Detenido'}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 flex items-center space-x-2">
            <span>{site.domain}</span>
            <span>&bull;</span>
            <span className="text-emerald-400/90 font-sans font-medium">{site.dbEngine}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {isRunning ? (
            <button
              onClick={() => onStop(site.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white font-medium rounded-lg text-xs shadow-sm shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Detener Sitio</span>
            </button>
          ) : (
            <button
              onClick={() => onStart(site.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs shadow-sm shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Sitio</span>
            </button>
          )}

          <div className="h-6 w-px bg-[#2d3542] mx-1"></div>

          <button
            onClick={() => onOpenUrl(siteUrl)}
            disabled={!isRunning}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isRunning
                ? 'bg-[#29303d] hover:bg-[#343e4f] text-slate-200'
                : 'bg-[#212630] text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Abrir Sitio</span>
          </button>

          <button
            onClick={() => onOpenUrl(wpAdminUrl)}
            disabled={!isRunning}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isRunning
                ? 'bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 text-emerald-300'
                : 'bg-[#212630] text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>WP Admin</span>
          </button>

          <button
            onClick={() => {
              const name = prompt(`Nombre para el clon de "${site.name}":`, `${site.name} (Copia)`);
              if (name) onClone(site.id, name);
            }}
            title="Clonar este sitio completamente en 1 segundo"
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#29303d] hover:bg-[#343e4f] text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clonar</span>
          </button>

          <button
            onClick={() => {
              const bpName = prompt(`Nombre de la plantilla / Blueprint (ej. Tienda Con Elementor):`, `${site.name} Preset`);
              if (bpName) onSaveBlueprint(site.id, bpName);
            }}
            title="Guardar como Plantilla con plugins y temas instalados"
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#29303d] hover:bg-[#343e4f] text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Guardar Plantilla</span>
          </button>

          <button
            onClick={() => onOpenFolder(site.path)}
            title="Abrir carpeta del proyecto en Windows Explorer"
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#29303d] hover:bg-[#343e4f] text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Carpeta</span>
          </button>

          <button
            onClick={() => {
              onOpenTerminal(site.path);
              setActiveTab('terminal');
            }}
            title="Abrir consola terminal interactiva"
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#29303d] hover:bg-[#343e4f] text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Terminal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-[#2b333f] bg-[#1a1e24] flex space-x-6 text-xs font-medium">
        {[
          { id: 'overview', label: 'Resumen', icon: Layers },
          { id: 'notes', label: 'Notas', icon: StickyNote },
          { id: 'files', label: 'Archivos', icon: FolderOpen },
          { id: 'terminal', label: 'Terminal', icon: Terminal },
          { id: 'database', label: 'Base de Datos', icon: Database },
          { id: 'mail', label: 'Mail Catcher', icon: Mail, badge: emails.length },
          { id: 'logs', label: 'Logs en Vivo', icon: FileText, badge: logs.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 border-b-2 transition-colors relative ${
                isActive
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl">
            {/* Environment Grid */}
            <div className="bg-[#181c23] border border-[#2b333f] rounded-xl p-5">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
                Configuración del Entorno
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d] flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-[11px]">Dominio / Host</div>
                    <div className="font-mono text-white font-medium mt-0.5">{site.domain}</div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    localhost:{site.port}
                  </span>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d] flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-[11px]">Servidor Web</div>
                    <div className="text-white font-medium mt-0.5 flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{site.webServer}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">
                    Latencia 1ms
                  </span>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d] flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-[11px]">Versión de PHP</div>
                    <div className="text-white font-medium mt-0.5 flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PHP {site.phpVersion}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    CLI Server
                  </span>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d] flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-[11px]">Motor de Base de Datos</div>
                    <div className="text-white font-medium mt-0.5 flex items-center space-x-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{site.dbEngine}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">
                    Instantánea
                  </span>
                </div>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-[#181c23] border border-[#2b333f] rounded-xl p-5">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center justify-between">
                <span>Acceso Administrativo WP</span>
                <span className="text-[11px] text-emerald-400 lowercase font-normal">Auto-configurado</span>
              </h3>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Usuario Administrador</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-white font-medium">{site.adminUser}</span>
                    <button
                      onClick={() => copyToClipboard(site.adminUser, 'adminUser')}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {copiedField === 'adminUser' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Email Administrador</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-white font-medium truncate">{site.adminEmail}</span>
                    <button
                      onClick={() => copyToClipboard(site.adminEmail, 'adminEmail')}
                      className="text-slate-400 hover:text-white p-1 shrink-0"
                    >
                      {copiedField === 'adminEmail' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Ruta en Disco</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-slate-300 text-[11px] truncate mr-2">{site.path}</span>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onOpenFolder(site.path)}
                        title="Abrir esta carpeta en el explorador de Windows"
                        className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(site.path, 'sitePath')}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                        title="Copiar ruta"
                      >
                        {copiedField === 'sitePath' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4 max-w-4xl h-full flex flex-col">
            <div className="flex items-center justify-between bg-[#181c23] border border-[#2b333f] px-5 py-3 rounded-xl">
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-2">
                  <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notas del Proyecto</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Apunta tareas pendientes, credenciales de staging o recordatorios para este sitio.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className={`text-[11px] font-medium transition-opacity ${savingNotes ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {savingNotes ? 'Guardando...' : 'Autoguardado ✓'}
                </span>

                <button
                  onClick={() => copyToClipboard(notes, 'notesCopy')}
                  className="px-2.5 py-1 bg-[#252c38] hover:bg-[#323b4b] text-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  {copiedField === 'notesCopy' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#181c23] border border-[#2b333f] rounded-xl overflow-hidden p-4 flex flex-col min-h-[380px]">
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Escribe aquí tus notas para este sitio (ejemplo:&#10;- Instalar WooCommerce y configurar Stripe&#10;- Cambiar logo del encabezado&#10;- Credenciales de API de prueba)..."
                className="w-full flex-1 bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none resize-none font-sans text-xs leading-relaxed"
              />
              <div className="pt-2 border-t border-[#232933] flex justify-between text-[11px] text-slate-500 font-mono">
                <span>{notes.length} caracteres &bull; {notes.split(/\s+/).filter(Boolean).length} palabras</span>
                <span>Guardado localmente en sites.json</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <FileBrowser
            siteId={site.id}
            rootPath={site.publicPath}
            onOpenFolder={onOpenFolder}
          />
        )}

        {activeTab === 'terminal' && (
          <WebTerminal
            siteId={site.id}
            sitePath={site.publicPath}
          />
        )}

        {activeTab === 'database' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#181c23] border border-[#2b333f] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Detalles de la Base de Datos
                </h3>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  {site.dbEngine}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Nombre de BD</div>
                  <div className="font-mono text-white font-medium mt-1">{site.dbName}</div>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Host / Socket</div>
                  <div className="font-mono text-white font-medium mt-1">
                    {site.dbEngine.includes('SQLite') ? 'app/public/wp-content/database.sqlite' : 'localhost:3306'}
                  </div>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Usuario</div>
                  <div className="font-mono text-white font-medium mt-1">{site.dbUser}</div>
                </div>

                <div className="p-3 bg-[#1e232b] rounded-lg border border-[#28313d]">
                  <div className="text-slate-400 text-[11px]">Contraseña</div>
                  <div className="font-mono text-white font-medium mt-1">
                    {site.dbPassword ? '••••••••' : '(sin contraseña)'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-slate-300 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-400">Ventaja de velocidad FastWP:</div>
                  <p className="mt-0.5 text-slate-300">
                    Al utilizar el motor ultrarrápido SQLite integrado para WordPress, tu base de datos no requiere un servicio MySQL residente en segundo plano. Esto reduce el consumo de RAM a casi 0 MB y permite clonar o respaldar el sitio en milisegundos con solo copiar un archivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mail' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">FastWP Mail Catcher</h3>
                <p className="text-xs text-slate-400">
                  Captura todos los correos salientes enviados mediante <code className="text-emerald-400">wp_mail()</code> o PHP <code className="text-emerald-400">mail()</code>.
                </p>
              </div>
              {emails.length > 0 && (
                <button
                  onClick={() => onClearEmails(site.id)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  Limpiar bandeja
                </button>
              )}
            </div>

            {emails.length === 0 ? (
              <div className="bg-[#181c23] border border-[#2b333f] rounded-xl p-10 text-center text-slate-500">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="text-sm font-medium text-slate-300">No hay correos capturados todavía</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Cualquier correo enviado por WordPress (restablecimiento de contraseña, notificaciones o WooCommerce) aparecerá aquí de forma instantánea.
                </p>
              </div>
            ) : (
              <div className="bg-[#181c23] border border-[#2b333f] rounded-xl overflow-hidden divide-y divide-[#2b333f]">
                {emails.map((email, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedEmail(email)}
                    className="p-3 text-xs hover:bg-[#1e232b] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{email.subject}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Para: <span className="text-slate-300">{email.to}</span> &bull; De: {email.from}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0 font-mono">{email.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Salida de consola de PHP y servidor web ({logs.length} líneas)</span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const text = logs.map(l => `[${l.timestamp}] [${l.type}] ${l.message}`).join('\n');
                    copyToClipboard(text, 'allLogs');
                  }}
                  disabled={logs.length === 0}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#252c38] hover:bg-[#323b4b] disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  title="Copiar todos los logs al portapapeles"
                >
                  {copiedField === 'allLogs' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">¡Logs Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiar Logs</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const text = logs.map(l => `[${l.timestamp}] [${l.type}] ${l.message}`).join('\n');
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${site.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_logs.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={logs.length === 0}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#252c38] hover:bg-[#323b4b] disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  title="Descargar archivo de texto con los logs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#111418] border border-[#282f3a] rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-1.5 min-h-[350px] max-h-[480px]">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No hay logs registrados para este sitio aún.</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`leading-relaxed text-[11px] ${
                      log.type === 'stderr'
                        ? 'text-red-400'
                        : log.type === 'system'
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

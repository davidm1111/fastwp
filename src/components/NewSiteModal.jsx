import React, { useState } from 'react';
import { X, Zap, Database, Shield, ArrowRight, Check } from 'lucide-react';

export default function NewSiteModal({ isOpen, onClose, onCreateSite, blueprints = [] }) {
  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState('');
  const [domain, setDomain] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState('');
  const [envType, setEnvType] = useState('fast'); // 'fast' | 'custom'
  const [phpVersion, setPhpVersion] = useState('8.2');
  const [dbEngine, setDbEngine] = useState('SQLite (Ultra Fast)');
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('password123');
  const [adminEmail, setAdminEmail] = useState('dev@local.fast');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setSiteName(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setDomain(slug ? `${slug}.local` : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateSite({
        name: siteName.trim(),
        domain: domain.trim(),
        blueprint: selectedBlueprint || undefined,
        phpVersion,
        dbEngine: envType === 'fast' ? 'SQLite (Ultra Fast)' : 'MySQL / MariaDB',
        adminUser,
        adminPassword,
        adminEmail
      });
      // Reset
      setSiteName('');
      setDomain('');
      setSelectedBlueprint('');
      setStep(1);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#181b21] border border-[#2e3745] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262d38] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h2 className="font-bold text-sm text-white">Añadir Nuevo Sitio Local</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ¿Cómo quieres llamar a tu sitio?
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Mi Tienda WordPress"
                  value={siteName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dominio Local
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Plantilla Base / Blueprint
                </label>
                <select
                  value={selectedBlueprint}
                  onChange={(e) => setSelectedBlueprint(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="">🌟 WordPress Base (Limpio)</option>
                  {blueprints.map((bp, i) => (
                    <option key={i} value={bp}>📦 Plantilla: {bp}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Puedes guardar cualquier sitio ya configurado con tus temas y plugins favoritos como plantilla.
                </p>
              </div>

              {/* Engine selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Tipo de Entorno
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setEnvType('fast')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      envType === 'fast'
                        ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white shadow-sm'
                        : 'bg-[#1e232b] border-[#29303c] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold text-fuchsia-400">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Ultra Rápido (Recomendado)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      PHP + SQLite. Cero sobrecarga, inicio en &lt; 0.5s, clonado instantáneo.
                    </p>
                  </div>

                  <div
                    onClick={() => setEnvType('custom')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      envType === 'custom'
                        ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white shadow-sm'
                        : 'bg-[#1e232b] border-[#29303c] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                      <Database className="w-3.5 h-3.5 text-violet-400" />
                      <span>Estándar (MySQL)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Para proyectos que necesitan MySQL/MariaDB tradicional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Credenciales de acceso para entrar a <span className="text-white font-mono">/wp-admin</span>:
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de usuario de WordPress
                </label>
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contraseña de WordPress
                </label>
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Correo electrónico del Administrador
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Versión de PHP
                </label>
                <select
                  value={phpVersion}
                  onChange={(e) => setPhpVersion(e.target.value)}
                  className="w-full bg-[#111418] border border-[#2d3542] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="8.3">PHP 8.3 (Más reciente y veloz)</option>
                  <option value="8.2">PHP 8.2 (Estable recomendada)</option>
                  <option value="8.1">PHP 8.1</option>
                  <option value="8.0">PHP 8.0</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[#262d38] flex items-center justify-between">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                &larr; Volver
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                disabled={!siteName.trim()}
                onClick={() => setStep(2)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all shadow-sm shadow-fuchsia-950/40"
              >
                <span>Continuar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-md shadow-fuchsia-950/40 transition-all"
              >
                {isSubmitting ? (
                  <span>Creando sitio...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Crear Sitio Ahora</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

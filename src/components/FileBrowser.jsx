import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ArrowLeft, FolderOpen, ExternalLink, RefreshCw, Eye, X } from 'lucide-react';

export default function FileBrowser({ siteId, onOpenFolder, rootPath }) {
  const [currentSubpath, setCurrentSubpath] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  const loadFiles = async (sub = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/files?subpath=${encodeURIComponent(sub)}`);
      const data = await res.json();
      setFiles(data || []);
      setCurrentSubpath(sub);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles('');
  }, [siteId]);

  const handleNavigateFolder = (folderName) => {
    const nextPath = currentSubpath ? `${currentSubpath}/${folderName}` : folderName;
    loadFiles(nextPath);
  };

  const handleGoBack = () => {
    if (!currentSubpath) return;
    const parts = currentSubpath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  const handleViewFile = async (fileName) => {
    const filePath = currentSubpath ? `${currentSubpath}/${fileName}` : fileName;
    setContentLoading(true);
    setSelectedFile(fileName);
    try {
      const res = await fetch(`/api/sites/${siteId}/file-content?subpath=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setFileContent(data.content || '');
    } catch (e) {
      setFileContent('Error cargando el archivo: ' + e.message);
    } finally {
      setContentLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const breadcrumbs = currentSubpath ? currentSubpath.split('/') : [];

  return (
    <div className="space-y-4 max-w-4xl h-full flex flex-col">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between bg-[#181c23] border border-[#2b333f] px-4 py-2.5 rounded-xl">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-1.5 text-xs overflow-x-auto min-w-0 py-0.5">
          <button
            onClick={() => loadFiles('')}
            className={`font-semibold transition-colors ${
              !currentSubpath ? 'text-fuchsia-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            app/public
          </button>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const crumbSubpath = breadcrumbs.slice(0, idx + 1).join('/');
            return (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  onClick={() => !isLast && loadFiles(crumbSubpath)}
                  className={`truncate max-w-[120px] transition-colors ${
                    isLast ? 'text-fuchsia-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {crumb}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => loadFiles(currentSubpath)}
            title="Recargar archivos"
            className="p-1.5 bg-[#252c38] hover:bg-[#323b4b] text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              const target = currentSubpath ? `${rootPath}/${currentSubpath}` : rootPath;
              onOpenFolder(target);
            }}
            title="Abrir esta carpeta en el Explorador de Windows"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Abrir en Windows</span>
          </button>
        </div>
      </div>

      {/* Files List View */}
      <div className="flex-1 bg-[#181c23] border border-[#2b333f] rounded-xl overflow-hidden flex flex-col min-h-[360px]">
        {/* Table header */}
        <div className="grid grid-cols-12 px-4 py-2 border-b border-[#2b333f] text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-[#14171d]">
          <div className="col-span-7">Nombre</div>
          <div className="col-span-2 text-right">Tamaño</div>
          <div className="col-span-3 text-right">Modificado</div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#232a35]">
          {currentSubpath && (
            <div
              onClick={handleGoBack}
              className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-[#202631] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>.. (Subir nivel)</span>
            </div>
          )}

          {files.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Carpeta vacía</div>
          ) : (
            files.map((file, idx) => (
              <div
                key={idx}
                onClick={() => (file.isDirectory ? handleNavigateFolder(file.name) : handleViewFile(file.name))}
                className="grid grid-cols-12 px-4 py-2.5 text-xs hover:bg-[#202631] cursor-pointer items-center transition-colors group"
              >
                <div className="col-span-7 flex items-center space-x-2.5 min-w-0 pr-2">
                  {file.isDirectory ? (
                    <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`truncate font-mono text-[11px] ${file.isDirectory ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>
                    {file.name}
                  </span>
                </div>

                <div className="col-span-2 text-right text-[11px] text-slate-500 font-mono">
                  {file.isDirectory ? '-' : formatSize(file.size)}
                </div>

                <div className="col-span-3 text-right text-[11px] text-slate-500 font-mono truncate">
                  {file.mtime ? new Date(file.mtime).toLocaleDateString() : '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* File viewer modal/overlay */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#181b21] border border-[#2e3745] rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-[#262d38] flex items-center justify-between bg-[#14171d]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-fuchsia-400" />
                <span className="font-mono text-xs font-semibold text-white">{selectedFile}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-[#0f1216] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre select-text">
              {contentLoading ? 'Cargando contenido...' : fileContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

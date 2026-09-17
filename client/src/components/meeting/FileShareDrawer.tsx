import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Download, Trash2, FolderUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { SharedFileItem } from '../../types';

interface FileShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

const DEFAULT_FILES: SharedFileItem[] = [
  {
    id: 'spec-doc-01',
    meetingId: 'room-default',
    uploaderId: 'studio-elena',
    uploaderName: 'Elena Vance',
    fileName: 'ConnectSphere_Editorial_System.pdf',
    fileSize: 2457600, // 2.4 MB
    mimeType: 'application/pdf',
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1RpdGxlIChDb25uZWN0U3BoZXJlKQovQXV0aG9yIChTdHVkaW8pCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2NyAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAxNjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDIgMCBSCj4+CnN0YXJ0eHJlZgoyMjUKJCVFT0YK',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'spec-doc-02',
    meetingId: 'room-default',
    uploaderId: 'studio-amara',
    uploaderName: 'Amara Chen',
    fileName: 'Palette_Warm_Accents_Reference.png',
    fileSize: 1048576, // 1.0 MB
    mimeType: 'image/png',
    fileUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="%2301472e" width="400" height="200"/><text fill="%23fefae0" x="50" y="100" font-family="sans-serif" font-size="20">ConnectSphere Studio Reference</text></svg>',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export const FileShareDrawer: React.FC<FileShareDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const [files, setFiles] = useState<SharedFileItem[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_files_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_FILES;
  });

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_files_${meetingId}`, JSON.stringify(files));
    } catch (e) {
      // ignore
    }
  }, [files, meetingId]);

  // Dual-Engine File Sync (BroadcastChannel + Socket.io)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_file_channel_${meetingId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, file, fileId } = event.data;
        if (type === 'file:uploaded' && file) {
          setFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
        } else if (type === 'file:deleted' && fileId) {
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
        }
      };
    } catch (e) {
      console.warn('File BroadcastChannel not supported:', e);
    }

    // Global PeerJS Mesh file listener across countries
    const handleGlobalMeshFile = (e: any) => {
      const file = e.detail;
      if (file) {
        setFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
      }
    };
    window.addEventListener('connectsphere:file-shared', handleGlobalMeshFile);

    if (socket) {
      const handleFileUploaded = (file: SharedFileItem) => {
        setFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
      };

      const handleFileDeleted = (data: { fileId: string }) => {
        setFiles((prev) => prev.filter((f) => f.id !== data.fileId));
      };

      socket.on('file:uploaded', handleFileUploaded);
      socket.on('file:deleted', handleFileDeleted);

      return () => {
        socket.off('file:uploaded', handleFileUploaded);
        socket.off('file:deleted', handleFileDeleted);
        window.removeEventListener('connectsphere:file-shared', handleGlobalMeshFile);
        if (bc) bc.close();
      };
    }

    return () => {
      window.removeEventListener('connectsphere:file-shared', handleGlobalMeshFile);
      if (bc) bc.close();
    };
  }, [socket, meetingId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Security validation
    const forbidden = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.ps1', '.vbs'];
    const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
    if (forbidden.includes(ext)) {
      setErrorMsg('Executable files are prohibited for security.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Read file as Data URL for universal static / cross-tab distribution
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      // Try server upload first
      let createdFile: SharedFileItem;
      try {
        const formData = new FormData();
        formData.append('file', selected);
        formData.append('meetingId', meetingId);
        formData.append('uploaderId', currentUserId);
        formData.append('uploaderName', currentUserName);

        const res = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          createdFile = data.file;
        } else {
          throw new Error('Fallback to browser mesh storage');
        }
      } catch (e) {
        // Safe offline / GitHub Pages blob distribution
        createdFile = {
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          meetingId,
          uploaderId: currentUserId,
          uploaderName: currentUserName,
          fileName: selected.name,
          fileSize: selected.size,
          mimeType: selected.type || 'application/octet-stream',
          fileUrl: dataUrl,
          createdAt: new Date().toISOString()
        };
      }

      setFiles((prev) => [createdFile, ...prev]);

      // Broadcast via socket
      socket?.emit('file:uploaded', { meetingId, file: createdFile });

      // Broadcast via BroadcastChannel across tabs
      broadcastChannelRef.current?.postMessage({
        type: 'file:uploaded',
        file: createdFile
      });

      // Broadcast across countries via Global PeerJS Mesh
      (window as any).csBroadcastGlobalData?.('file', createdFile);

      setUploading(false);
      setSuccessMsg('File uploaded and synced across peers!');
      setTimeout(() => setSuccessMsg(null), 3500);

      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = () => {
      setErrorMsg('Error reading selected file.');
      setUploading(false);
    };

    reader.readAsDataURL(selected);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    socket?.emit('file:deleted', { meetingId, fileId });
    broadcastChannelRef.current?.postMessage({
      type: 'file:deleted',
      fileId
    });

    try {
      fetch(`/api/files/${fileId}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed sm:absolute top-16 bottom-20 right-0 w-full sm:w-96 z-40 bg-cream/95 backdrop-blur-2xl border-l border-forest/15 shadow-deep flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-forest/15 flex items-center justify-between bg-cream">
        <div className="flex items-center space-x-2 text-forest">
          <FolderUp className="w-5 h-5 text-forest" />
          <h3 className="font-display text-xl tracking-tight">COLLABORATIVE FILES</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-forest/10 text-forest/70 hover:text-forest transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload button area */}
      <div className="p-4 border-b border-forest/15 bg-cream">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-3.5 px-4 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-forest-light transition-all shadow-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'PROCESSING ASSET...' : 'SHARE DOCUMENT'}</span>
        </button>

        {errorMsg && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-rose-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-forest/50">
            <span className="editorial-label text-xs mb-2">No Files Uploaded</span>
            <p className="text-xs">
              Upload PDF design decks, mockups, or documents to share instantly with peers.
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isUploader = file.uploaderId === currentUserId;
            return (
              <div
                key={file.id}
                className="p-3.5 rounded-organic-sm bg-olive/40 border border-forest/15 flex items-center justify-between space-x-3 transition-all hover:bg-olive/60"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 rounded-full bg-cream text-forest border border-forest/10 flex-shrink-0">
                    <FileText className="w-5 h-5 text-forest" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold uppercase tracking-wider text-forest truncate">
                      {file.fileName}
                    </div>
                    <div className="text-[10px] text-forest/60 flex items-center space-x-2 mt-0.5">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>·</span>
                      <span>{file.uploaderName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <a
                    href={file.fileUrl}
                    download={file.fileName}
                    className="p-2 rounded-full hover:bg-forest/10 text-forest transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {isUploader && (
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 rounded-full hover:bg-rose-100 text-rose-800 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

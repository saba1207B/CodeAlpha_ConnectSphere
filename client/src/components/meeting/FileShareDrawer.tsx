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
    } catch (e) {}
    return [];
  });

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Save files to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_files_${meetingId}`, JSON.stringify(files));
    } catch (e) {}
  }, [files, meetingId]);

  // Dual-Engine Listeners (BroadcastChannel + Global Mesh + Socket.io)
  useEffect(() => {
    // 1. BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_files_channel_${meetingId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, file, fileId } = event.data;
        if (type === 'file:new' && file) {
          setFiles((prev) => {
            if (prev.some((f) => f.id === file.id)) return prev;
            return [file, ...prev];
          });
        } else if (type === 'file:deleted' && fileId) {
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
        }
      };
    } catch (e) {}

    // 2. Global PeerJS Mesh across countries
    const handleGlobalFile = (e: any) => {
      const file = e.detail;
      if (file) {
        setFiles((prev) => {
          if (prev.some((f) => f.id === file.id)) return prev;
          return [file, ...prev];
        });
      }
    };
    window.addEventListener('connectsphere:file-shared', handleGlobalFile);

    // 3. Socket.io
    if (socket) {
      const handleSocketNewFile = (file: SharedFileItem) => {
        setFiles((prev) => {
          if (prev.some((f) => f.id === file.id)) return prev;
          return [file, ...prev];
        });
      };

      const handleSocketDeleteFile = ({ fileId }: { fileId: string }) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      };

      socket.on('file:shared', handleSocketNewFile);
      socket.on('file:deleted', handleSocketDeleteFile);

      return () => {
        socket.off('file:shared', handleSocketNewFile);
        socket.off('file:deleted', handleSocketDeleteFile);
        window.removeEventListener('connectsphere:file-shared', handleGlobalFile);
        if (bc) bc.close();
      };
    }

    return () => {
      window.removeEventListener('connectsphere:file-shared', handleGlobalFile);
      if (bc) bc.close();
    };
  }, [socket, meetingId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 15 * 1024 * 1024) {
      setErrorMsg('File size must be under 15MB.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      const newFileItem: SharedFileItem = {
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

      setFiles((prev) => [newFileItem, ...prev]);

      // Broadcast across channels
      socket?.emit('file:share', newFileItem);
      broadcastChannelRef.current?.postMessage({
        type: 'file:new',
        file: newFileItem
      });
      (window as any).csBroadcastGlobalData?.('file', newFileItem);

      setUploading(false);
      setSuccessMsg(`"${selected.name}" uploaded successfully.`);
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
    <div className="w-full h-full bg-[#1e2026] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-xl">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderUp className="w-4 h-4 text-zinc-300" />
          <h3 className="font-semibold text-sm text-white">Meeting Files</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Upload button area */}
      <div className="p-3 border-b border-[#2e323e] bg-[#1a1c22]">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
        </button>

        {errorMsg && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <FolderUp className="w-8 h-8 text-zinc-600 mb-2" />
            <span className="text-xs font-medium text-zinc-400">No Files Shared</span>
            <p className="text-[11px] text-zinc-500 mt-1">
              Upload PDF documents or images to share with participants.
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isUploader = file.uploaderId === currentUserId;
            return (
              <div
                key={file.id}
                className="p-2.5 rounded-lg bg-[#252833] border border-[#353949] flex items-center justify-between space-x-2.5 transition-colors hover:bg-[#2c303d]"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 rounded-md bg-[#373b49] text-zinc-200 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white truncate">
                      {file.fileName}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center space-x-2 mt-0.5">
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
                    className="p-1.5 rounded-md hover:bg-[#373b49] text-zinc-300 hover:text-white transition-colors"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {isUploader && (
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 rounded-md hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

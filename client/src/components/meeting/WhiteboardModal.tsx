import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Pen, Eraser, Slash, Square, Circle, Type, 
  StickyNote, Undo2, Redo2, Trash2, Download, MousePointer2 
} from 'lucide-react';
import { Socket } from 'socket.io-client';
import { WhiteboardStroke, WhiteboardTool, WhiteboardPoint, WhiteboardCursor } from '../../types';

interface WhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

const PALETTE = ['#01472e', '#e07a5f', '#e09f3e', '#a3b18a', '#8b261e', '#2c3e50', '#000000'];

export const WhiteboardModal: React.FC<WhiteboardModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const [currentTool, setCurrentTool] = useState<WhiteboardTool>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#01472e');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_whiteboard_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [history, setHistory] = useState<WhiteboardStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardStroke[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, WhiteboardCursor>>(new Map());

  const currentStrokeRef = useRef<WhiteboardPoint[]>([]);

  // Persist strokes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_whiteboard_${meetingId}`, JSON.stringify(strokes));
    } catch (e) {}
  }, [strokes, meetingId]);

  // Repaint canvas whenever strokes change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grid texture
    ctx.strokeStyle = 'rgba(1, 71, 46, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render each stroke
    strokes.forEach((stroke) => {
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
        if (stroke.tool === 'eraser') {
          ctx.strokeStyle = '#fefae0';
          ctx.lineWidth = stroke.size * 3;
        }
        if (stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      } else if (stroke.tool === 'line' && stroke.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
        ctx.stroke();
      } else if (stroke.tool === 'rectangle' && stroke.points.length >= 2) {
        const p1 = stroke.points[0];
        const p2 = stroke.points[stroke.points.length - 1];
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (stroke.tool === 'circle' && stroke.points.length >= 2) {
        const p1 = stroke.points[0];
        const p2 = stroke.points[stroke.points.length - 1];
        const radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (stroke.tool === 'sticky' && stroke.points.length >= 1) {
        const p = stroke.points[0];
        ctx.fillStyle = '#e9edc9';
        ctx.fillRect(p.x, p.y, 140, 100);
        ctx.strokeStyle = '#ccd5ae';
        ctx.strokeRect(p.x, p.y, 140, 100);
        ctx.fillStyle = '#01472e';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(stroke.text || 'Note...', p.x + 12, p.y + 24);
      } else if (stroke.tool === 'text' && stroke.points.length >= 1) {
        const p = stroke.points[0];
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(stroke.text || '', p.x, p.y);
      }
      ctx.restore();
    });
  }, [strokes]);

  useEffect(() => {
    if (isOpen) {
      redrawCanvas();
    }
  }, [isOpen, redrawCanvas]);

  // Adjust canvas resolution to element bounding box
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        redrawCanvas();
      }
    };
    if (isOpen) {
      setTimeout(handleResize, 50);
      window.addEventListener('resize', handleResize);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, redrawCanvas]);

  // Dual-Engine sync for whiteboard events (BroadcastChannel + Socket.io)
  useEffect(() => {
    if (!isOpen) return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_whiteboard_channel_${meetingId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, stroke, strokes: newStrokes, cursor } = event.data;
        if (type === 'whiteboard:draw' && stroke) {
          setStrokes((prev) => [...prev, stroke]);
        } else if (type === 'whiteboard:clear') {
          setStrokes([]);
          setHistory([]);
          setRedoStack([]);
        } else if (type === 'whiteboard:sync' && newStrokes) {
          setStrokes(newStrokes);
        } else if (type === 'whiteboard:cursor' && cursor && cursor.userId !== currentUserId) {
          setRemoteCursors((prev) => {
            const next = new Map(prev);
            next.set(cursor.userId, cursor);
            return next;
          });
        }
      };
    } catch (e) {}

    // Global PeerJS Mesh event listener (across countries on GitHub Pages)
    const handleGlobalMeshWhiteboard = (e: any) => {
      const data = e.detail;
      if (!data) return;
      if (data.action === 'draw' && data.stroke) {
        setStrokes((prev) => [...prev, data.stroke]);
      } else if (data.action === 'clear') {
        setStrokes([]);
        setHistory([]);
        setRedoStack([]);
      } else if (data.action === 'sync' && data.strokes) {
        setStrokes(data.strokes);
      }
    };
    window.addEventListener('connectsphere:whiteboard-event', handleGlobalMeshWhiteboard);

    if (socket) {
      const handleRemoteDraw = (stroke: WhiteboardStroke) => {
        setStrokes((prev) => [...prev, stroke]);
      };

      const handleRemoteClear = () => {
        setStrokes([]);
        setHistory([]);
        setRedoStack([]);
      };

      const handleRemoteCursor = (cursor: WhiteboardCursor) => {
        if (cursor.userId === currentUserId) return;
        setRemoteCursors((prev) => {
          const next = new Map(prev);
          next.set(cursor.userId, cursor);
          return next;
        });
      };

      const handleWhiteboardSync = (data: { strokes: WhiteboardStroke[] }) => {
        if (data && data.strokes) {
          setStrokes(data.strokes);
        }
      };

      socket.on('whiteboard:draw', handleRemoteDraw);
      socket.on('whiteboard:clear', handleRemoteClear);
      socket.on('whiteboard:cursor', handleRemoteCursor);
      socket.on('whiteboard:sync', handleWhiteboardSync);

      socket.emit('whiteboard:get-state', { meetingId });

      return () => {
        socket.off('whiteboard:draw', handleRemoteDraw);
        socket.off('whiteboard:clear', handleRemoteClear);
        socket.off('whiteboard:cursor', handleRemoteCursor);
        socket.off('whiteboard:sync', handleWhiteboardSync);
        window.removeEventListener('connectsphere:whiteboard-event', handleGlobalMeshWhiteboard);
        if (bc) bc.close();
      };
    }

    return () => {
      window.removeEventListener('connectsphere:whiteboard-event', handleGlobalMeshWhiteboard);
      if (bc) bc.close();
    };
  }, [socket, isOpen, meetingId, currentUserId]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): WhiteboardPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    currentStrokeRef.current = [pt];

    if (currentTool === 'text') {
      const text = prompt('Enter editorial annotation:');
      if (text) {
        const stroke: WhiteboardStroke = {
          id: 'strk-' + Date.now(),
          tool: 'text',
          color: currentColor,
          size: brushSize,
          points: [pt],
          text,
          createdBy: currentUserId,
          creatorName: currentUserName
        };
        addStroke(stroke);
      }
      setIsDrawing(false);
    } else if (currentTool === 'sticky') {
      const text = prompt('Enter sticky note content:');
      if (text) {
        const stroke: WhiteboardStroke = {
          id: 'strk-' + Date.now(),
          tool: 'sticky',
          color: currentColor,
          size: brushSize,
          points: [pt],
          text,
          createdBy: currentUserId,
          creatorName: currentUserName
        };
        addStroke(stroke);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    // Broadcast cursor position
    if (socket) {
      socket.emit('whiteboard:cursor', {
        meetingId,
        userId: currentUserId,
        userName: currentUserName,
        color: currentColor,
        x: pt.x,
        y: pt.y
      });
    }

    if (!isDrawing) return;

    currentStrokeRef.current.push(pt);

    // Live preview for freehand pen / eraser
    if (currentTool === 'pen' || currentTool === 'eraser') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = currentTool === 'eraser' ? '#fefae0' : currentColor;
        ctx.lineWidth = currentTool === 'eraser' ? brushSize * 3 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const pts = currentStrokeRef.current;
        if (pts.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      const stroke: WhiteboardStroke = {
        id: 'strk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        tool: currentTool,
        color: currentColor,
        size: brushSize,
        points: [...currentStrokeRef.current],
        createdBy: currentUserId,
        creatorName: currentUserName
      };
      addStroke(stroke);
      currentStrokeRef.current = [];
    }
  };

  const addStroke = (stroke: WhiteboardStroke) => {
    setHistory((prev) => [...prev, strokes]);
    setRedoStack([]);
    setStrokes((prev) => [...prev, stroke]);
    socket?.emit('whiteboard:draw', { meetingId, stroke });
    broadcastChannelRef.current?.postMessage({
      type: 'whiteboard:draw',
      stroke
    });
    (window as any).csBroadcastGlobalData?.('whiteboard', {
      action: 'draw',
      stroke
    });
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    setRedoStack((prev) => [...prev, strokes]);
    const nextStrokes = strokes.slice(0, -1);
    setStrokes(nextStrokes);
    socket?.emit('whiteboard:sync', { meetingId, strokes: nextStrokes });
    broadcastChannelRef.current?.postMessage({
      type: 'whiteboard:sync',
      strokes: nextStrokes
    });
    (window as any).csBroadcastGlobalData?.('whiteboard', {
      action: 'sync',
      strokes: nextStrokes
    });
  };

  const handleClear = () => {
    if (confirm('Clear collaborative whiteboard canvas for all participants?')) {
      setHistory((prev) => [...prev, strokes]);
      setStrokes([]);
      socket?.emit('whiteboard:clear', { meetingId });
      broadcastChannelRef.current?.postMessage({
        type: 'whiteboard:clear'
      });
      (window as any).csBroadcastGlobalData?.('whiteboard', {
        action: 'clear'
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `connectsphere-whiteboard-${meetingId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-forest/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-[92vh] max-w-7xl rounded-card-lg sm:rounded-container-xl bg-cream border border-forest/20 shadow-deep flex flex-col overflow-hidden">
        {/* Whiteboard Header */}
        <div className="h-16 px-6 border-b border-forest/15 flex items-center justify-between bg-cream/90 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="font-display text-2xl text-forest tracking-tight">
              SYNCHRONIZED CANVAS
            </span>
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-olive text-forest text-[10px] font-bold uppercase tracking-widest">
              Live Vector Stream
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-forest/10 text-forest transition-colors"
              title="Export Snapshot"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-forest/10 text-forest transition-colors"
              title="Close Whiteboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Canvas Workspace */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Floating Tool Controls Bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-forest text-cream shadow-floating border border-forest-light flex items-center space-x-2 sm:space-x-3 backdrop-blur-xl">
            {/* Pen */}
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'pen' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Pen"
            >
              <Pen className="w-4 h-4" />
            </button>

            {/* Eraser */}
            <button
              onClick={() => setCurrentTool('eraser')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'eraser' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Line */}
            <button
              onClick={() => setCurrentTool('line')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'line' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Line"
            >
              <Slash className="w-4 h-4" />
            </button>

            {/* Rectangle */}
            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'rectangle' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Circle */}
            <button
              onClick={() => setCurrentTool('circle')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'circle' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </button>

            {/* Sticky */}
            <button
              onClick={() => setCurrentTool('sticky')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'sticky' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Sticky Note"
            >
              <StickyNote className="w-4 h-4" />
            </button>

            {/* Text */}
            <button
              onClick={() => setCurrentTool('text')}
              className={`p-2 rounded-full transition-colors ${currentTool === 'text' ? 'bg-cream text-forest' : 'hover:bg-forest-light text-cream'}`}
              title="Text"
            >
              <Type className="w-4 h-4" />
            </button>

            <span className="h-5 w-px bg-cream/20"></span>

            {/* Color Palette */}
            <div className="flex items-center space-x-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentColor(c)}
                  className={`w-5 h-5 rounded-full border border-cream/40 transition-transform ${currentColor === c ? 'scale-125 ring-2 ring-cream' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <span className="h-5 w-px bg-cream/20"></span>

            {/* Undo */}
            <button
              onClick={handleUndo}
              className="p-2 rounded-full hover:bg-forest-light text-cream transition-colors"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="p-2 rounded-full hover:bg-rose-900 text-cream transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Element */}
          <div className="w-full h-full relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block bg-cream"
            />

            {/* Remote Peer Cursors */}
            {Array.from(remoteCursors.values()).map((cur) => (
              <div
                key={cur.userId}
                className="absolute pointer-events-none transition-all duration-75 flex items-center space-x-1 z-30"
                style={{
                  left: `${cur.x}px`,
                  top: `${cur.y}px`
                }}
              >
                <MousePointer2 className="w-4 h-4 text-forest drop-shadow" fill={cur.color || '#01472e'} />
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest text-cream shadow-sm">
                  {cur.userName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

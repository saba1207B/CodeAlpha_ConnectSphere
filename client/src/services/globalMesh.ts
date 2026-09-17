import { Peer, MediaConnection, DataConnection } from 'peerjs';

export interface GlobalMeshCallbacks {
  onRemoteStream: (peerId: string, userName: string, userId: string, stream: MediaStream) => void;
  onPeerLeave: (peerId: string) => void;
  onChatMessage?: (message: any) => void;
  onWhiteboardEvent?: (data: any) => void;
  onFileShared?: (file: any) => void;
  onReaction?: (senderId: string, emoji: string) => void;
  onMeshStatusChange?: (status: 'connecting' | 'connected' | 'offline', myPeerId?: string) => void;
}

const GOOGLE_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

export class GlobalMeshCoordinator {
  private meetingId: string;
  private currentUserId: string;
  private currentUserName: string;
  private peer: Peer | null = null;
  private mySlotIndex: number = 0;
  private myPeerId: string = '';
  private activeCalls = new Map<string, MediaConnection>();
  private activeDataConns = new Map<string, DataConnection>();
  private localStream: MediaStream | null = null;
  private callbacks: GlobalMeshCallbacks;
  private destroyed: boolean = false;
  private cleanRoomId: string;

  constructor(
    meetingId: string,
    currentUserId: string,
    currentUserName: string,
    callbacks: GlobalMeshCallbacks
  ) {
    this.meetingId = meetingId;
    this.currentUserId = currentUserId;
    this.currentUserName = currentUserName;
    this.callbacks = callbacks;
    this.cleanRoomId = meetingId.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 16) || 'room';
  }

  public setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    // Update ongoing calls with the new stream if possible
    this.activeCalls.forEach((call) => {
      const peerConn = (call as any).peerConnection as RTCPeerConnection;
      if (peerConn) {
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        peerConn.getSenders().forEach((sender) => {
          if (sender.track?.kind === 'video' && videoTrack) {
            sender.replaceTrack(videoTrack).catch(() => {});
          } else if (sender.track?.kind === 'audio' && audioTrack) {
            sender.replaceTrack(audioTrack).catch(() => {});
          }
        });
      }
    });
  }

  // Attempt joining deterministic room slots: cs-<cleanId>-0, cs-<cleanId>-1, ... up to slot 7
  public async start(localStream: MediaStream | null) {
    this.localStream = localStream;
    this.tryRegisterSlot(0);
  }

  private tryRegisterSlot(slotIndex: number) {
    if (this.destroyed) return;
    if (slotIndex > 6) {
      // Fallback: register with a unique random ID
      this.initPeerWithId(`cs-${this.cleanRoomId}-${Math.random().toString(36).substring(2, 6)}`, slotIndex);
      return;
    }

    const candidateId = `cs-${this.cleanRoomId}-${slotIndex}`;
    this.initPeerWithId(candidateId, slotIndex);
  }

  private initPeerWithId(peerId: string, slotIndex: number) {
    if (this.destroyed) return;

    try {
      const p = new Peer(peerId, {
        config: {
          iceServers: GOOGLE_ICE_SERVERS
        }
      });

      let slotClaimed = false;

      p.on('open', (id) => {
        slotClaimed = true;
        this.peer = p;
        this.mySlotIndex = slotIndex;
        this.myPeerId = id;
        this.callbacks.onMeshStatusChange?.('connected', id);

        // Listen for incoming calls from other peers anywhere in the world
        p.on('call', (incomingCall) => {
          const meta = (incomingCall as any).metadata || {};
          const callerName = meta.userName || 'Peer Collaborator';
          const callerUserId = meta.userId || incomingCall.peer;

          if (this.localStream) {
            incomingCall.answer(this.localStream);
          } else {
            // Answer with empty stream if not ready
            incomingCall.answer();
          }

          incomingCall.on('stream', (remoteStream) => {
            this.callbacks.onRemoteStream(incomingCall.peer, callerName, callerUserId, remoteStream);
          });

          incomingCall.on('close', () => {
            this.callbacks.onPeerLeave(incomingCall.peer);
            this.activeCalls.delete(incomingCall.peer);
          });

          this.activeCalls.set(incomingCall.peer, incomingCall);
        });

        // Listen for incoming data connections (chat, whiteboard, files)
        p.on('connection', (conn) => {
          this.setupDataConnection(conn);
        });

        // Connect to all previous slots (0 up to slotIndex - 1)
        this.callExistingPeers(slotIndex);
      });

      p.on('error', (err: any) => {
        if (!slotClaimed && err.type === 'unavailable-id') {
          // Slot is taken by an earlier participant, try the next slot!
          p.destroy();
          setTimeout(() => {
            this.tryRegisterSlot(slotIndex + 1);
          }, 200);
        } else {
          console.warn('PeerJS Mesh Notification:', err.type || err.message);
        }
      });
    } catch (err) {
      console.error('Error creating PeerJS instance:', err);
    }
  }

  // Call all lower slot indices to form full mesh
  private callExistingPeers(mySlot: number) {
    if (!this.peer) return;

    for (let i = 0; i < mySlot; i++) {
      const targetPeerId = `cs-${this.cleanRoomId}-${i}`;
      this.callPeer(targetPeerId);
      this.connectDataPeer(targetPeerId);
    }
  }

  public callPeer(targetPeerId: string) {
    if (!this.peer || targetPeerId === this.myPeerId) return;

    const call = this.peer.call(targetPeerId, this.localStream || new MediaStream(), {
      metadata: {
        userId: this.currentUserId,
        userName: this.currentUserName
      }
    });

    if (!call) return;

    call.on('stream', (remoteStream) => {
      const meta = (call as any).metadata || {};
      this.callbacks.onRemoteStream(
        targetPeerId,
        meta.userName || `Peer ${targetPeerId.slice(-1)}`,
        meta.userId || targetPeerId,
        remoteStream
      );
    });

    call.on('close', () => {
      this.callbacks.onPeerLeave(targetPeerId);
      this.activeCalls.delete(targetPeerId);
    });

    call.on('error', () => {
      this.callbacks.onPeerLeave(targetPeerId);
      this.activeCalls.delete(targetPeerId);
    });

    this.activeCalls.set(targetPeerId, call);
  }

  public connectDataPeer(targetPeerId: string) {
    if (!this.peer || targetPeerId === this.myPeerId) return;

    const conn = this.peer.connect(targetPeerId, {
      metadata: {
        userId: this.currentUserId,
        userName: this.currentUserName
      }
    });

    if (!conn) return;
    this.setupDataConnection(conn);
  }

  private setupDataConnection(conn: DataConnection) {
    this.activeDataConns.set(conn.peer, conn);

    conn.on('data', (data: any) => {
      if (!data) return;
      if (data.type === 'chat' && this.callbacks.onChatMessage) {
        this.callbacks.onChatMessage(data.payload);
      } else if (data.type === 'whiteboard' && this.callbacks.onWhiteboardEvent) {
        this.callbacks.onWhiteboardEvent(data.payload);
      } else if (data.type === 'file' && this.callbacks.onFileShared) {
        this.callbacks.onFileShared(data.payload);
      } else if (data.type === 'reaction' && this.callbacks.onReaction) {
        this.callbacks.onReaction(data.senderId, data.emoji);
      }
    });

    conn.on('close', () => {
      this.activeDataConns.delete(conn.peer);
    });

    conn.on('error', () => {
      this.activeDataConns.delete(conn.peer);
    });
  }

  // Broadcast data payload to all connected peers across the globe
  public broadcastData(type: 'chat' | 'whiteboard' | 'file' | 'reaction', payload: any) {
    const packet = {
      type,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      payload,
      timestamp: Date.now()
    };

    this.activeDataConns.forEach((conn) => {
      if (conn.open) {
        conn.send(packet);
      }
    });
  }

  public destroy() {
    this.destroyed = true;
    this.activeCalls.forEach((call) => call.close());
    this.activeCalls.clear();
    this.activeDataConns.forEach((conn) => conn.close());
    this.activeDataConns.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

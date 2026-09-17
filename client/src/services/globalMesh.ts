import { Peer, MediaConnection, DataConnection } from 'peerjs';

export interface GlobalMeshCallbacks {
  onRemoteStream: (peerId: string, userName: string, userId: string, stream: MediaStream) => void;
  onPeerLeave: (peerId: string) => void;
  onPeerIdentityUpdate?: (peerId: string, userName: string, userId: string) => void;
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
  private remotePeerMeta = new Map<string, { userId: string; userName: string }>();
  private pendingStreams = new Map<string, MediaStream>();
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

  public setUserName(newName: string) {
    this.currentUserName = newName;
    this.broadcastHandshake();
  }

  public async start(localStream: MediaStream | null) {
    this.localStream = localStream;
    this.tryRegisterSlot(0);
  }

  private tryRegisterSlot(slotIndex: number) {
    if (this.destroyed) return;
    if (slotIndex > 8) {
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

        // Listen for incoming calls from peers across the globe
        p.on('call', (incomingCall) => {
          if (incomingCall.peer === this.myPeerId) return;

          const meta = (incomingCall as any).metadata || {};
          if (meta.userId === this.currentUserId) return; // Prevent duplicate self-call

          const callerUserId = meta.userId || incomingCall.peer;
          const callerName = meta.userName || 'Participant';

          this.remotePeerMeta.set(incomingCall.peer, { userId: callerUserId, userName: callerName });

          if (this.localStream) {
            incomingCall.answer(this.localStream);
          } else {
            incomingCall.answer();
          }

          incomingCall.on('stream', (remoteStream) => {
            if (remoteStream.id === this.localStream?.id) return;
            this.callbacks.onRemoteStream(incomingCall.peer, callerName, callerUserId, remoteStream);
          });

          incomingCall.on('close', () => {
            this.callbacks.onPeerLeave(incomingCall.peer);
            this.activeCalls.delete(incomingCall.peer);
            this.remotePeerMeta.delete(incomingCall.peer);
          });

          incomingCall.on('error', () => {
            this.callbacks.onPeerLeave(incomingCall.peer);
            this.activeCalls.delete(incomingCall.peer);
          });

          this.activeCalls.set(incomingCall.peer, incomingCall);
        });

        // Listen for data connections
        p.on('connection', (conn) => {
          if (conn.peer === this.myPeerId) return;
          this.setupDataConnection(conn);
        });

        // Connect to all previous slots (0 up to slotIndex - 1)
        this.callExistingPeers(slotIndex);
      });

      p.on('error', (err: any) => {
        if (!slotClaimed && err.type === 'unavailable-id') {
          p.destroy();
          setTimeout(() => {
            this.tryRegisterSlot(slotIndex + 1);
          }, 200);
        } else {
          console.warn('Global PeerJS event:', err.type || err.message);
        }
      });
    } catch (err) {
      console.error('Error creating PeerJS instance:', err);
    }
  }

  private callExistingPeers(mySlot: number) {
    if (!this.peer) return;

    for (let i = 0; i < mySlot; i++) {
      const targetPeerId = `cs-${this.cleanRoomId}-${i}`;
      if (targetPeerId === this.myPeerId) continue;
      this.callPeer(targetPeerId);
      this.connectDataPeer(targetPeerId);
    }
  }

  public callPeer(targetPeerId: string) {
    if (!this.peer || targetPeerId === this.myPeerId || this.activeCalls.has(targetPeerId)) return;

    const call = this.peer.call(targetPeerId, this.localStream || new MediaStream(), {
      metadata: {
        userId: this.currentUserId,
        userName: this.currentUserName
      }
    });

    if (!call) return;

    call.on('stream', (remoteStream) => {
      if (remoteStream.id === this.localStream?.id) return;
      this.pendingStreams.set(targetPeerId, remoteStream);

      const known = this.remotePeerMeta.get(targetPeerId);
      const name = known?.userName || 'Participant';
      const uid = known?.userId || targetPeerId;

      if (uid !== this.currentUserId) {
        this.callbacks.onRemoteStream(targetPeerId, name, uid, remoteStream);
      }
    });

    call.on('close', () => {
      this.callbacks.onPeerLeave(targetPeerId);
      this.activeCalls.delete(targetPeerId);
      this.remotePeerMeta.delete(targetPeerId);
      this.pendingStreams.delete(targetPeerId);
    });

    call.on('error', () => {
      this.callbacks.onPeerLeave(targetPeerId);
      this.activeCalls.delete(targetPeerId);
      this.pendingStreams.delete(targetPeerId);
    });

    this.activeCalls.set(targetPeerId, call);
  }

  public connectDataPeer(targetPeerId: string) {
    if (!this.peer || targetPeerId === this.myPeerId || this.activeDataConns.has(targetPeerId)) return;

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

    const sendHandshake = () => {
      if (conn.open) {
        conn.send({
          type: 'handshake',
          userId: this.currentUserId,
          userName: this.currentUserName
        });
      }
    };

    conn.on('open', () => {
      sendHandshake();
    });

    conn.on('data', (data: any) => {
      if (!data) return;

      if (data.type === 'handshake') {
        if (data.userId === this.currentUserId) return; // Ignore self

        this.remotePeerMeta.set(conn.peer, {
          userId: data.userId || conn.peer,
          userName: data.userName || 'Participant'
        });

        this.callbacks.onPeerIdentityUpdate?.(
          conn.peer,
          data.userName || 'Participant',
          data.userId || conn.peer
        );

        // If stream arrived before handshake, notify with real name
        const pendingStream = this.pendingStreams.get(conn.peer);
        if (pendingStream) {
          this.callbacks.onRemoteStream(
            conn.peer,
            data.userName || 'Participant',
            data.userId || conn.peer,
            pendingStream
          );
        }
      } else if (data.type === 'chat' && this.callbacks.onChatMessage) {
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

  private broadcastHandshake() {
    this.activeDataConns.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: 'handshake',
          userId: this.currentUserId,
          userName: this.currentUserName
        });
      }
    });
  }

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
    this.remotePeerMeta.clear();
    this.pendingStreams.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

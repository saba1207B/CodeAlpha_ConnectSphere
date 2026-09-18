// Video Effects & Virtual Background Stream Processor for ConnectSphere

export type VisualFilter = 'none' | 'warm' | 'cool' | 'noir' | 'vintage' | 'glow' | 'lighting_boost';
export type VirtualBackground = 'none' | 'blur' | 'office' | 'library' | 'skyline' | 'neon';

export interface VideoEffectSettings {
  filter: VisualFilter;
  background: VirtualBackground;
  brightness: number; // 0.5 to 1.5
  contrast: number;   // 0.5 to 1.5
}

export class VideoEffectsProcessor {
  private rawStream: MediaStream | null = null;
  private processedStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private currentSettings: VideoEffectSettings = {
    filter: 'none',
    background: 'none',
    brightness: 1.0,
    contrast: 1.0
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1280;
      this.canvas.height = 720;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });

      this.videoElement = document.createElement('video');
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;
    }
  }

  public setSettings(newSettings: Partial<VideoEffectSettings>) {
    this.currentSettings = { ...this.currentSettings, ...newSettings };
  }

  public getSettings(): VideoEffectSettings {
    return { ...this.currentSettings };
  }

  public startProcessing(stream: MediaStream): MediaStream {
    this.rawStream = stream;
    if (!this.videoElement || !this.canvas || !this.ctx) return stream;

    this.videoElement.srcObject = stream;
    this.videoElement.play().catch(() => {});

    // Render loop
    const render = () => {
      if (this.ctx && this.canvas && this.videoElement && this.videoElement.readyState >= 2) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const { filter, background, brightness, contrast } = this.currentSettings;

        this.ctx.save();

        // 1. Draw Virtual Background if specified
        if (background !== 'none') {
          this.renderVirtualBackground(this.ctx, background, w, h);
        } else {
          this.ctx.clearRect(0, 0, w, h);
        }

        // 2. Configure CSS filters on context
        let filterString = `brightness(${brightness}) contrast(${contrast})`;
        if (filter === 'warm') filterString += ' sepia(0.25) saturate(1.2)';
        else if (filter === 'cool') filterString += ' hue-rotate(190deg) saturate(0.9)';
        else if (filter === 'noir') filterString += ' grayscale(1) contrast(1.3)';
        else if (filter === 'vintage') filterString += ' sepia(0.4) contrast(0.95)';
        else if (filter === 'glow') filterString += ' brightness(1.15) saturate(1.1)';
        else if (filter === 'lighting_boost') filterString += ' brightness(1.25) contrast(1.1)';

        this.ctx.filter = filterString;

        // 3. Composite video stream
        if (background === 'blur') {
          // Blurred backdrop + sharp subject simulation
          this.ctx.filter = `blur(14px) brightness(0.85)`;
          this.ctx.drawImage(this.videoElement, 0, 0, w, h);

          // Oval spotlight sharp foreground
          this.ctx.filter = filterString;
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.ellipse(w / 2, h / 2 + 30, w * 0.36, h * 0.44, 0, 0, Math.PI * 2);
          this.ctx.clip();
          this.ctx.drawImage(this.videoElement, 0, 0, w, h);
          this.ctx.restore();
        } else if (background !== 'none') {
          // Render foreground silhouette / oval portrait atop background
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.ellipse(w / 2, h / 2 + 20, w * 0.34, h * 0.43, 0, 0, Math.PI * 2);
          this.ctx.clip();
          this.ctx.drawImage(this.videoElement, 0, 0, w, h);
          this.ctx.restore();
        } else {
          // Clean standard draw
          this.ctx.drawImage(this.videoElement, 0, 0, w, h);
        }

        this.ctx.restore();
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();

    if ((this.canvas as any).captureStream) {
      this.processedStream = (this.canvas as any).captureStream(30);
    } else {
      this.processedStream = stream;
    }

    // Pass through audio tracks untouched
    stream.getAudioTracks().forEach((track) => {
      this.processedStream?.addTrack(track);
    });

    return this.processedStream || stream;
  }

  private renderVirtualBackground(
    ctx: CanvasRenderingContext2D,
    bg: VirtualBackground,
    w: number,
    h: number
  ) {
    if (bg === 'office') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stylized window frame
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(w * 0.65, h * 0.15, w * 0.28, h * 0.65);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(w * 0.65, h * 0.15, w * 0.28, h * 0.65);
    } else if (bg === 'library') {
      const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, '#292524');
      grad.addColorStop(0.5, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Bookshelf lines
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.08)';
      ctx.lineWidth = 3;
      for (let y = h * 0.2; y < h; y += 90) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w - 40, y);
        ctx.stroke();
      }
    } else if (bg === 'skyline') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0c4a6e');
      grad.addColorStop(0.4, '#075985');
      grad.addColorStop(0.8, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // City silhouette
      ctx.fillStyle = '#020617';
      const buildings = [
        [40, 260, 90], [140, 320, 110], [260, 200, 120], [390, 290, 85],
        [800, 240, 100], [910, 310, 95], [1020, 210, 130], [1160, 280, 80]
      ];
      buildings.forEach(([x, top, width]) => {
        ctx.fillRect(x, h - top, width, top);
      });
    } else if (bg === 'neon') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#311042');
      grad.addColorStop(0.5, '#120b22');
      grad.addColorStop(1, '#070514');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Neon grid lines
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.6);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    }
  }

  public stopProcessing() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    if (this.processedStream) {
      this.processedStream.getTracks().forEach((t) => t.stop());
      this.processedStream = null;
    }
  }
}

export const videoEffectsProcessor = new VideoEffectsProcessor();

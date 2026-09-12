/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TimelineClip, 
  AspectRatioType, 
  ExportConfig, 
  VideoFilter, 
  VideoEffect, 
  VideoTransition 
} from '../types';

export function getResolutionDimensions(resolution: '720p' | '1080p', aspectRatio: AspectRatioType) {
  const is1080 = resolution === '1080p';

  switch (aspectRatio) {
    case '9:16':
      return is1080 ? { width: 1080, height: 1920 } : { width: 720, height: 1280 };
    case '16:9':
      return is1080 ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
    case '1:1':
      return is1080 ? { width: 1080, height: 1080 } : { width: 720, height: 720 };
    case '4:5':
      return is1080 ? { width: 1080, height: 1350 } : { width: 720, height: 900 };
    default:
      return { width: 1080, height: 1920 };
  }
}

export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export function getCssFilterString(clip: TimelineClip): string {
  const parts: string[] = [];

  // Filter preset
  switch (clip.filter) {
    case 'cinematic':
      parts.push('contrast(1.2) saturate(1.25) hue-rotate(-5deg)');
      break;
    case 'vintage':
      parts.push('sepia(0.35) contrast(1.1) saturate(0.9) brightness(0.95)');
      break;
    case 'warm':
      parts.push('sepia(0.2) saturate(1.3) hue-rotate(-10deg)');
      break;
    case 'cool':
      parts.push('saturate(0.9) hue-rotate(15deg) brightness(1.05)');
      break;
    case 'retro':
      parts.push('contrast(1.25) saturate(1.4) hue-rotate(20deg)');
      break;
    case 'bw':
      parts.push('grayscale(1) contrast(1.3) brightness(0.95)');
      break;
    case 'dramatic':
      parts.push('contrast(1.35) saturate(1.15) brightness(0.9)');
      break;
  }

  // Adjustments
  const adj = clip.adjustments;
  if (adj) {
    if (adj.brightness !== 0) parts.push(`brightness(${1 + adj.brightness / 100})`);
    if (adj.contrast !== 0) parts.push(`contrast(${1 + adj.contrast / 100})`);
    if (adj.saturation !== 0) parts.push(`saturate(${1 + adj.saturation / 100})`);
    if (adj.blur > 0) parts.push(`blur(${adj.blur}px)`);
    if (adj.temperature !== 0) {
      if (adj.temperature > 0) {
        parts.push(`sepia(${adj.temperature * 0.003}) hue-rotate(-${adj.temperature * 0.1}deg)`);
      } else {
        parts.push(`hue-rotate(${Math.abs(adj.temperature) * 0.15}deg)`);
      }
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

export interface RenderProgressCallback {
  (progress: number, currentFrame: number, totalFrames: number): void;
}

export class BrowserVideoRenderer {
  private isCancelled = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  public cancel() {
    this.isCancelled = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('MediaRecorder stop error on cancel', e);
      }
    }
  }

  public async exportVideo(
    clips: TimelineClip[],
    duration: number,
    config: ExportConfig,
    onProgress: RenderProgressCallback
  ): Promise<{ blob: Blob; downloadUrl: string; filename: string }> {
    this.isCancelled = false;
    this.recordedChunks = [];

    const { width, height } = getResolutionDimensions(config.resolution, config.aspectRatio);
    const fps = config.fps || 30;
    const totalFrames = Math.max(1, Math.floor(duration * fps));

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Could not create canvas 2D context for video export.');
    }

    // Set up Audio Context and Destination Stream
    let audioContext: AudioContext | null = null;
    let audioDest: MediaStreamAudioDestinationNode | null = null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioCtx();
      audioDest = audioContext.createMediaStreamDestination();
    } catch (e) {
      console.warn('AudioContext setup skipped or unsupported', e);
    }

    // Preload video elements and audio elements for rendering
    const videoElements: Map<string, HTMLVideoElement> = new Map();
    const videoClips = clips.filter((c) => c.type === 'video' && c.sourceUrl);

    for (const clip of videoClips) {
      if (clip.sourceUrl && !videoElements.has(clip.sourceUrl)) {
        const v = document.createElement('video');
        v.crossOrigin = 'anonymous';
        v.src = clip.sourceUrl;
        v.muted = true;
        v.preload = 'auto';
        await new Promise<void>((resolve) => {
          v.onloadedmetadata = () => resolve();
          v.onerror = () => resolve();
          // Timeout fallback
          setTimeout(resolve, 1500);
        });
        videoElements.set(clip.sourceUrl, v);
      }
    }

    // Stream from canvas
    const canvasStream = canvas.captureStream(fps);
    const combinedStream = new MediaStream();
    
    // Add canvas video tracks
    canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));

    // Add audio tracks if available
    if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
      audioDest.stream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    }

    // Select supported mimeType
    const mimeTypes = [
      'video/mp4;codecs=avc1,mp4a',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    let selectedMimeType = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMimeType = mime;
        break;
      }
    }

    const recorderOptions: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
    const recorder = new MediaRecorder(combinedStream, recorderOptions);
    this.mediaRecorder = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    recorder.start(100); // chunk every 100ms

    // Frame-by-frame rendering loop
    const frameInterval = 1 / fps;

    for (let frame = 0; frame < totalFrames; frame++) {
      if (this.isCancelled) {
        throw new Error('Export cancelled by user.');
      }

      const currentTime = frame * frameInterval;

      // Draw background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Active Video Clips
      const activeVideoClips = clips.filter(
        (c) => c.type === 'video' && currentTime >= c.startTime && currentTime < c.startTime + c.duration
      );

      for (const clip of activeVideoClips) {
        const clipProgressTime = (currentTime - clip.startTime) * (clip.speed || 1.0) + clip.trimIn;
        const vEl = clip.sourceUrl ? videoElements.get(clip.sourceUrl) : null;

        ctx.save();

        // Apply clip opacity
        ctx.globalAlpha = (clip.opacity ?? 100) / 100;

        // Apply Transition In / Out
        const timeIntoClip = currentTime - clip.startTime;
        const timeFromEnd = clip.startTime + clip.duration - currentTime;
        const transDur = clip.transitionDuration || 0.5;

        if (clip.transition === 'fade' && timeIntoClip < transDur) {
          ctx.globalAlpha *= (timeIntoClip / transDur);
        } else if (clip.transition === 'fade' && timeFromEnd < transDur) {
          ctx.globalAlpha *= (timeFromEnd / transDur);
        }

        // Apply Color Adjustments & Filters to Canvas
        const filterStr = getCssFilterString(clip);
        if (filterStr !== 'none') {
          ctx.filter = filterStr;
        }

        // Center coordinates & transforms
        const centerX = width / 2 + (clip.posX / 100) * (width / 2);
        const centerY = height / 2 + (clip.posY / 100) * (height / 2);

        ctx.translate(centerX, centerY);

        if (clip.rotation) {
          ctx.rotate((clip.rotation * Math.PI) / 180);
        }

        if (clip.flipH || clip.flipV) {
          ctx.scale(clip.flipH ? -1 : 1, clip.flipV ? -1 : 1);
        }

        // Scaling (zoom & speed)
        let scaleFactor = (clip.scale || 100) / 100;

        // Apply Effect: Zoom Pulse
        if (clip.effect === 'zoom') {
          scaleFactor *= 1 + Math.sin(currentTime * 8) * 0.08 * ((clip.effectIntensity || 50) / 100);
        }

        ctx.scale(scaleFactor, scaleFactor);

        // Render video frame or thumbnail fallback
        if (vEl && vEl.readyState >= 2) {
          try {
            vEl.currentTime = clipProgressTime % (vEl.duration || 10);
          } catch (e) {
            // ignore seek errors during sync
          }
          this.drawImageCover(ctx, vEl, -width / 2, -height / 2, width, height, clip.cropMode);
        } else if (clip.thumbnail) {
          // Render image placeholder
          const img = new Image();
          img.src = clip.thumbnail;
          this.drawImageCover(ctx, img, -width / 2, -height / 2, width, height, clip.cropMode);
        }

        ctx.restore();

        // 2. Render Overlay Effects (Glitch, Shake, Flash, VHS, Film Grain)
        if (clip.effect && clip.effect !== 'none') {
          this.applyCanvasEffect(ctx, clip.effect, clip.effectIntensity || 50, width, height, currentTime);
        }
      }

      // 3. Draw Active Stickers
      const activeStickers = clips.filter(
        (c) => c.type === 'sticker' && currentTime >= c.startTime && currentTime < c.startTime + c.duration
      );

      for (const sticker of activeStickers) {
        ctx.save();
        ctx.globalAlpha = (sticker.opacity ?? 100) / 100;
        const posX = width / 2 + (sticker.posX / 100) * (width / 2);
        const posY = height / 2 + (sticker.posY / 100) * (height / 2);

        ctx.translate(posX, posY);
        if (sticker.rotation) {
          ctx.rotate((sticker.rotation * Math.PI) / 180);
        }
        const scale = (sticker.scale || 100) / 100;
        ctx.scale(scale, scale);

        if (sticker.stickerCategory === 'badge') {
          // Render creator badge box
          const text = sticker.stickerContent || 'VIRAL';
          ctx.font = `bold ${Math.floor(width * 0.045)}px 'Montserrat', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textMetrics = ctx.measureText(text);
          const padX = 24;
          const padY = 12;
          const boxW = textMetrics.width + padX * 2;
          const boxH = Math.floor(width * 0.075);

          ctx.fillStyle = '#EF4444';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 12;
          ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, 0, 2);
        } else {
          // Emoji or shape
          ctx.font = `${Math.floor(width * 0.12)}px 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sticker.stickerContent || '🔥', 0, 0);
        }

        ctx.restore();
      }

      // 4. Draw Active Text Overlays
      const activeTexts = clips.filter(
        (c) => c.type === 'text' && currentTime >= c.startTime && currentTime < c.startTime + c.duration
      );

      for (const textClip of activeTexts) {
        ctx.save();
        let textOpacity = (textClip.opacity ?? 100) / 100;

        // Text In/Out Animation
        const elapsed = currentTime - textClip.startTime;
        const remaining = textClip.startTime + textClip.duration - currentTime;
        let animatedScale = 1.0;
        let animOffsetY = 0;

        let displayText = textClip.text || '';

        if (textClip.textAnimation === 'fade') {
          if (elapsed < 0.4) textOpacity *= (elapsed / 0.4);
          if (remaining < 0.4) textOpacity *= (remaining / 0.4);
        } else if (textClip.textAnimation === 'zoom') {
          if (elapsed < 0.3) {
            animatedScale = 0.4 + (elapsed / 0.3) * 0.6;
          }
        } else if (textClip.textAnimation === 'slide') {
          if (elapsed < 0.3) {
            animOffsetY = (1 - elapsed / 0.3) * 40;
          }
        } else if (textClip.textAnimation === 'typewriter') {
          const chars = textClip.text?.length || 0;
          const progress = Math.min(1, elapsed / (textClip.duration * 0.6));
          displayText = (textClip.text || '').slice(0, Math.floor(chars * progress));
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, textOpacity));

        const posX = width / 2 + (textClip.posX / 100) * (width / 2);
        const posY = height / 2 + (textClip.posY / 100) * (height / 2) + animOffsetY;

        ctx.translate(posX, posY);
        if (textClip.rotation) {
          ctx.rotate((textClip.rotation * Math.PI) / 180);
        }

        const scale = ((textClip.scale || 100) / 100) * animatedScale;
        ctx.scale(scale, scale);

        // Font styling
        const fontSizePx = Math.floor((textClip.fontSize || 32) * (width / 400));
        const fontWeight = textClip.isBold ? 'bold ' : '';
        const fontStyle = textClip.isItalic ? 'italic ' : '';
        const fontFamily = textClip.fontFamily || 'Montserrat';

        ctx.font = `${fontStyle}${fontWeight}${fontSizePx}px '${fontFamily}', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow
        if (textClip.shadowBlur) {
          ctx.shadowColor = textClip.shadowColor || 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = textClip.shadowBlur * (width / 400);
        }

        // Stroke
        if (textClip.strokeWidth && textClip.strokeWidth > 0) {
          ctx.lineWidth = textClip.strokeWidth * (width / 400);
          ctx.strokeStyle = textClip.strokeColor || '#000000';
          ctx.strokeText(displayText, 0, 0);
        }

        // Fill
        ctx.fillStyle = textClip.textColor || '#FFFFFF';
        ctx.fillText(displayText, 0, 0);

        ctx.restore();
      }

      // Update progress
      const progressPercent = Math.min(99, Math.floor(((frame + 1) / totalFrames) * 100));
      onProgress(progressPercent, frame + 1, totalFrames);

      // Brief delay to allow MediaRecorder time to capture the canvas frame smoothly
      await new Promise((r) => setTimeout(r, 16));
    }

    // Finish recording
    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        try {
          const blobType = selectedMimeType || 'video/mp4';
          const finalBlob = new Blob(this.recordedChunks, { type: blobType });
          const downloadUrl = URL.createObjectURL(finalBlob);
          const extension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
          const filename = `ClipForge_Edit_${Date.now()}.${extension}`;
          
          onProgress(100, totalFrames, totalFrames);
          resolve({ blob: finalBlob, downloadUrl, filename });
        } catch (err) {
          reject(err);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        reject(err);
      }
    });
  }

  private drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
    cropMode: 'fit' | 'fill' | 'stretch' = 'fill'
  ) {
    if (cropMode === 'stretch') {
      ctx.drawImage(img, x, y, w, h);
      return;
    }

    const imgW = (img as HTMLVideoElement).videoWidth || (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width || w;
    const imgH = (img as HTMLVideoElement).videoHeight || (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height || h;

    const imgAspect = imgW / imgH;
    const canvasAspect = w / h;

    let drawW = w;
    let drawH = h;
    let drawX = x;
    let drawY = y;

    if (cropMode === 'fit') {
      if (imgAspect > canvasAspect) {
        drawH = w / imgAspect;
        drawY = y + (h - drawH) / 2;
      } else {
        drawW = h * imgAspect;
        drawX = x + (w - drawW) / 2;
      }
    } else {
      // 'fill'
      if (imgAspect > canvasAspect) {
        drawW = h * imgAspect;
        drawX = x + (w - drawW) / 2;
      } else {
        drawH = w / imgAspect;
        drawY = y + (h - drawH) / 2;
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  private applyCanvasEffect(
    ctx: CanvasRenderingContext2D,
    effect: VideoEffect,
    intensity: number,
    width: number,
    height: number,
    time: number
  ) {
    const factor = intensity / 100;

    switch (effect) {
      case 'glitch': {
        // Slice and shift horizontal bands
        const bands = 4;
        for (let i = 0; i < bands; i++) {
          const bandY = Math.random() * height;
          const bandH = Math.random() * (height * 0.08);
          const shiftX = (Math.random() - 0.5) * (width * 0.06 * factor);
          ctx.drawImage(ctx.canvas, 0, bandY, width, bandH, shiftX, bandY, width, bandH);
        }
        break;
      }

      case 'vhs': {
        // Scanlines
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
        // VHS REC stamp
        ctx.font = `bold ${Math.floor(width * 0.035)}px monospace`;
        ctx.fillStyle = '#EF4444';
        ctx.fillText('● REC', width * 0.05, height * 0.08);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`PLAY SP 00:${Math.floor(time).toString().padStart(2, '0')}`, width * 0.05, height * 0.12);
        ctx.restore();
        break;
      }

      case 'flash': {
        ctx.save();
        const flashAlpha = Math.max(0, Math.sin(time * 12)) * 0.4 * factor;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        break;
      }

      case 'rgbSplit': {
        // Subtle red/cyan offset overlay
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 0, 80, ${0.15 * factor})`;
        ctx.fillRect(width * 0.01 * factor, 0, width, height);
        ctx.fillStyle = `rgba(0, 240, 255, ${0.15 * factor})`;
        ctx.fillRect(-width * 0.01 * factor, 0, width, height);
        ctx.restore();
        break;
      }

      case 'noise':
      case 'filmGrain': {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * factor})`;
        for (let i = 0; i < 400; i++) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          ctx.fillRect(rx, ry, 2, 2);
        }
        ctx.restore();
        break;
      }

      default:
        break;
    }
  }
}

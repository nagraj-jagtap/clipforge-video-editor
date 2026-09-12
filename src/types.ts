/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AspectRatioType = '9:16' | '16:9' | '1:1' | '4:5';

export type SidebarTab = 
  | 'media' 
  | 'audio' 
  | 'text' 
  | 'stickers' 
  | 'effects' 
  | 'transitions' 
  | 'filters' 
  | 'adjust';

export type ClipType = 'video' | 'audio' | 'text' | 'sticker';

export type VideoFilter = 
  | 'none' 
  | 'cinematic' 
  | 'vintage' 
  | 'warm' 
  | 'cool' 
  | 'retro' 
  | 'bw' 
  | 'dramatic';

export type VideoEffect = 
  | 'none' 
  | 'glitch' 
  | 'vhs' 
  | 'shake' 
  | 'blur' 
  | 'rgbSplit' 
  | 'flash' 
  | 'zoom' 
  | 'filmGrain' 
  | 'pixelate' 
  | 'noise';

export type VideoTransition = 
  | 'none' 
  | 'fade' 
  | 'dissolve' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'zoom' 
  | 'wipe' 
  | 'flash' 
  | 'blur' 
  | 'spin';

export type TextAnimation = 
  | 'none' 
  | 'fade' 
  | 'slide' 
  | 'zoom' 
  | 'typewriter';

export interface ColorAdjustments {
  brightness: number; // -100 to 100 (0 default)
  contrast: number;   // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  exposure: number;   // -100 to 100 (0 default)
  temperature: number;// -100 to 100 (0 default)
  tint: number;       // -100 to 100 (0 default)
  blur: number;       // 0 to 50 (0 default)
  sharpness: number;  // 0 to 100 (0 default)
  opacity: number;    // 0 to 100 (100 default)
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration: number; // in seconds
  thumbnail: string;
  fileSize?: string;
  width?: number;
  height?: number;
  audioWaveform?: number[];
  category?: string;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  assetId?: string;
  type: ClipType;
  name: string;
  startTime: number; // start on timeline in seconds
  duration: number;  // duration in seconds
  trimIn: number;    // in-point within original asset
  
  // Media source
  sourceUrl?: string;
  thumbnail?: string;
  waveform?: number[];

  // Spatial / visual properties
  scale: number;     // 10 to 400 (%)
  rotation: number;  // -180 to 180 (deg)
  posX: number;      // offset from center X
  posY: number;      // offset from center Y
  flipH: boolean;
  flipV: boolean;
  cropMode: 'fit' | 'fill' | 'stretch';
  opacity: number;   // 0 to 100

  // Speed & Audio
  speed: number;     // 0.25 to 4.0 (1.0 default)
  volume: number;    // 0 to 200 (100 default)
  muted: boolean;
  fadeIn: number;    // seconds
  fadeOut: number;   // seconds

  // Text specific properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  textAnimation?: TextAnimation;

  // Sticker specific
  stickerContent?: string;
  stickerCategory?: 'emoji' | 'badge' | 'shape';

  // Effects & Filter
  filter: VideoFilter;
  effect: VideoEffect;
  effectIntensity: number; // 0 to 100
  transition: VideoTransition;
  transitionDuration: number; // in seconds (e.g. 0.5)

  // Adjustments
  adjustments: ColorAdjustments;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'sticker';
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

export interface ExportConfig {
  resolution: '720p' | '1080p';
  aspectRatio: AspectRatioType;
  fps: number;
  format: 'mp4' | 'webm';
}

export interface ExportState {
  isExporting: boolean;
  progress: number; // 0 - 100
  currentFrame: number;
  totalFrames: number;
  status: 'idle' | 'rendering' | 'completed' | 'cancelled' | 'error';
  errorMessage?: string;
  downloadUrl?: string;
  downloadFilename?: string;
}

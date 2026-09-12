/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AspectRatioType = '9:16' | '16:9' | '1:1' | '4:5';
export type SidebarTab = 'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'transitions' | 'filters' | 'adjust';
export type ClipType = 'video' | 'audio' | 'text' | 'sticker';
export type VideoFilter = 'none' | 'cinematic' | 'vintage' | 'warm' | 'cool' | 'retro' | 'bw' | 'dramatic';
export type VideoEffect = 'none' | 'glitch' | 'vhs' | 'shake' | 'blur' | 'rgbSplit' | 'flash' | 'zoom' | 'filmGrain' | 'pixelate' | 'noise';
export type VideoTransition = 'none' | 'fade' | 'dissolve' | 'slideLeft' | 'slideRight' | 'zoom' | 'wipe' | 'flash' | 'blur' | 'spin';
export type TextAnimation = 'none' | 'fade' | 'slide' | 'zoom' | 'typewriter';

export interface ColorAdjustments {
  brightness: number; contrast: number; saturation: number; exposure: number; temperature: number; tint: number; blur: number; sharpness: number; opacity: number;
}
export interface MediaAsset {
  id: string; name: string; type: 'video' | 'audio' | 'image'; url: string; duration: number; thumbnail: string; fileSize?: string; width?: number; height?: number; audioWaveform?: number[]; category?: string;
}
export interface TimelineClip {
  id: string; trackId: string; assetId?: string; type: ClipType; name: string; startTime: number; duration: number; trimIn: number;
  sourceUrl?: string; thumbnail?: string; waveform?: number[];
  scale: number; rotation: number; posX: number; posY: number; flipH: boolean; flipV: boolean; cropMode: 'fit' | 'fill' | 'stretch'; opacity: number;
  speed: number; volume: number; muted: boolean; fadeIn: number; fadeOut: number;
  text?: string; fontFamily?: string; fontSize?: number; textColor?: string; isBold?: boolean; isItalic?: boolean; strokeColor?: string; strokeWidth?: number; shadowColor?: string; shadowBlur?: number; textAnimation?: TextAnimation;
  stickerContent?: string; stickerCategory?: 'emoji' | 'badge' | 'shape';
  filter: VideoFilter; effect: VideoEffect; effectIntensity: number; transition: VideoTransition; transitionDuration: number;
  bodyEffect?: string;
  adjustments: ColorAdjustments;
}
export interface TimelineTrack {
  id: string; name: string; type: 'video' | 'audio' | 'text' | 'sticker'; muted: boolean; locked: boolean; visible: boolean;
}
export interface ExportConfig { resolution: '720p' | '1080p'; aspectRatio: AspectRatioType; fps: number; format: 'mp4' | 'webm'; }
export interface ExportState { isExporting: boolean; progress: number; currentFrame: number; totalFrames: number; status: 'idle' | 'rendering' | 'completed' | 'cancelled' | 'error'; errorMessage?: string; downloadUrl?: string; downloadFilename?: string; }

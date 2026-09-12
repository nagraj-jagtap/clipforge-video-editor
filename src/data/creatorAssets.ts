/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  MediaAsset, 
  TimelineTrack, 
  TimelineClip, 
  ColorAdjustments,
  VideoFilter,
  VideoEffect,
  VideoTransition
} from '../types';

export const DEFAULT_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  blur: 0,
  sharpness: 0,
  opacity: 100
};

export const INITIAL_CREATOR_TRACKS: TimelineTrack[] = [
  { id: 'track-text', name: 'Text & Titles', type: 'text', muted: false, locked: false, visible: true },
  { id: 'track-stickers', name: 'Stickers & GFX', type: 'sticker', muted: false, locked: false, visible: true },
  { id: 'track-video', name: 'Main Video', type: 'video', muted: false, locked: false, visible: true },
  { id: 'track-overlay', name: 'PIP / Overlay', type: 'video', muted: false, locked: false, visible: true },
  { id: 'track-audio-music', name: 'BGM Music', type: 'audio', muted: false, locked: false, visible: true },
  { id: 'track-audio-sfx', name: 'Sound FX', type: 'audio', muted: false, locked: false, visible: true }
];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'asset-neon-night',
    name: 'Cyber Neon Walk.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    duration: 15.0,
    fileSize: '8.4 MB',
    width: 1080,
    height: 1920,
    category: 'Cyberpunk & City'
  },
  {
    id: 'asset-sunset-drone',
    name: 'Golden Coast Sunset.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    duration: 15.0,
    fileSize: '12.1 MB',
    width: 1920,
    height: 1080,
    category: 'Nature & Travel'
  },
  {
    id: 'asset-skater-action',
    name: 'Skatepark Pop Shuvit.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=400&q=80',
    duration: 15.0,
    fileSize: '7.9 MB',
    width: 1080,
    height: 1920,
    category: 'Action & Sports'
  },
  {
    id: 'asset-coffee-vlog',
    name: 'Morning Espresso Pour.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    duration: 15.0,
    fileSize: '6.2 MB',
    width: 1080,
    height: 1920,
    category: 'Lifestyle & Vlog'
  },
  {
    id: 'asset-music-trap',
    name: 'Neon Phonk Drill (Royalty Free).mp3',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    duration: 30.0,
    fileSize: '2.1 MB',
    audioWaveform: [30, 45, 80, 95, 60, 40, 75, 90, 85, 40, 65, 85, 95, 70, 45, 80, 100, 75, 50, 65],
    category: 'Trending Music'
  },
  {
    id: 'asset-music-lofi',
    name: 'Late Night Chill Hop.mp3',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
    duration: 25.0,
    fileSize: '1.8 MB',
    audioWaveform: [20, 35, 50, 45, 60, 55, 65, 60, 70, 65, 50, 45, 60, 55, 65, 50, 40, 35, 30, 25],
    category: 'Lofi & Chill'
  }
];

export const INITIAL_CREATOR_CLIPS: TimelineClip[] = [
  {
    id: 'clip-main-1',
    trackId: 'track-video',
    assetId: 'asset-neon-night',
    type: 'video',
    name: 'Cyber Neon Walk',
    startTime: 0,
    duration: 4.5,
    trimIn: 0,
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    scale: 100,
    rotation: 0,
    posX: 0,
    posY: 0,
    flipH: false,
    flipV: false,
    cropMode: 'fill',
    opacity: 100,
    speed: 1.0,
    volume: 100,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    filter: 'cinematic',
    effect: 'none',
    effectIntensity: 50,
    transition: 'dissolve',
    transitionDuration: 0.5,
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 15, saturation: 20 }
  },
  {
    id: 'clip-main-2',
    trackId: 'track-video',
    assetId: 'asset-skater-action',
    type: 'video',
    name: 'Skatepark Trick',
    startTime: 4.5,
    duration: 4.0,
    trimIn: 1.2,
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=400&q=80',
    scale: 100,
    rotation: 0,
    posX: 0,
    posY: 0,
    flipH: false,
    flipV: false,
    cropMode: 'fill',
    opacity: 100,
    speed: 1.2,
    volume: 100,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    filter: 'dramatic',
    effect: 'rgbSplit',
    effectIntensity: 40,
    transition: 'wipe',
    transitionDuration: 0.4,
    adjustments: { ...DEFAULT_ADJUSTMENTS, brightness: 5, saturation: 10 }
  },
  {
    id: 'clip-main-3',
    trackId: 'track-video',
    assetId: 'asset-coffee-vlog',
    type: 'video',
    name: 'Morning Espresso',
    startTime: 8.5,
    duration: 3.5,
    trimIn: 0.5,
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    scale: 100,
    rotation: 0,
    posX: 0,
    posY: 0,
    flipH: false,
    flipV: false,
    cropMode: 'fill',
    opacity: 100,
    speed: 1.0,
    volume: 100,
    muted: false,
    fadeIn: 0,
    fadeOut: 0.8,
    filter: 'warm',
    effect: 'none',
    effectIntensity: 0,
    transition: 'fade',
    transitionDuration: 0.5,
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 20 }
  },
  {
    id: 'clip-text-hook',
    trackId: 'track-text',
    type: 'text',
    name: 'WAIT FOR THE DROP 🔥',
    text: 'WAIT FOR THE DROP 🔥',
    startTime: 0.5,
    duration: 3.5,
    trimIn: 0,
    scale: 100,
    rotation: 0,
    posX: 0,
    posY: -35, // percentage position from center
    flipH: false,
    flipV: false,
    cropMode: 'fit',
    opacity: 100,
    speed: 1.0,
    volume: 0,
    muted: true,
    fadeIn: 0.2,
    fadeOut: 0.2,
    fontFamily: 'Montserrat',
    fontSize: 34,
    textColor: '#FFE600',
    isBold: true,
    isItalic: false,
    strokeColor: '#000000',
    strokeWidth: 4,
    shadowColor: 'rgba(0,0,0,0.85)',
    shadowBlur: 10,
    textAnimation: 'zoom',
    filter: 'none',
    effect: 'none',
    effectIntensity: 0,
    transition: 'none',
    transitionDuration: 0,
    adjustments: DEFAULT_ADJUSTMENTS
  },
  {
    id: 'clip-sticker-viral',
    trackId: 'track-stickers',
    type: 'sticker',
    name: 'VIRAL Badge',
    stickerContent: '⚡ VIRAL',
    stickerCategory: 'badge',
    startTime: 4.5,
    duration: 3.0,
    trimIn: 0,
    scale: 110,
    rotation: -4,
    posX: 28,
    posY: -36,
    flipH: false,
    flipV: false,
    cropMode: 'fit',
    opacity: 100,
    speed: 1.0,
    volume: 0,
    muted: true,
    fadeIn: 0.2,
    fadeOut: 0.2,
    filter: 'none',
    effect: 'none',
    effectIntensity: 0,
    transition: 'none',
    transitionDuration: 0,
    adjustments: DEFAULT_ADJUSTMENTS
  },
  {
    id: 'clip-audio-bgm',
    trackId: 'track-audio-music',
    assetId: 'asset-music-trap',
    type: 'audio',
    name: 'Neon Phonk Drill',
    startTime: 0,
    duration: 12.0,
    trimIn: 0,
    sourceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    scale: 100,
    rotation: 0,
    posX: 0,
    posY: 0,
    flipH: false,
    flipV: false,
    cropMode: 'fit',
    opacity: 100,
    speed: 1.0,
    volume: 85,
    muted: false,
    fadeIn: 0.5,
    fadeOut: 1.2,
    waveform: [35, 60, 85, 95, 70, 50, 80, 90, 85, 45, 70, 90, 100, 75, 55, 85, 95, 70, 50, 60],
    filter: 'none',
    effect: 'none',
    effectIntensity: 0,
    transition: 'none',
    transitionDuration: 0,
    adjustments: DEFAULT_ADJUSTMENTS
  }
];

export const CREATOR_EFFECTS: { id: VideoEffect; name: string; icon: string; description: string }[] = [
  { id: 'none', name: 'Normal', icon: '✨', description: 'Clean original clip' },
  { id: 'glitch', name: 'Cyber Glitch', icon: '⚡', description: 'RGB digital jitter' },
  { id: 'vhs', name: '90s VHS Cam', icon: '📼', description: 'Retro tape distortion' },
  { id: 'shake', name: 'Camera Shake', icon: '📳', description: 'High-energy beat pulse' },
  { id: 'blur', name: 'Motion Blur', icon: '💨', description: 'Silky smooth fast pan' },
  { id: 'rgbSplit', name: 'RGB Split', icon: '🔴', description: 'Chromatic 3D offset' },
  { id: 'flash', name: 'White Flash', icon: '💥', description: 'High-impact drop hit' },
  { id: 'zoom', name: 'Beat Zoom', icon: '🔍', description: 'Rhythmic bass impact' },
  { id: 'filmGrain', name: '16mm Grain', icon: '🎞️', description: 'Analog cinematic grit' },
  { id: 'pixelate', name: 'Pixel 8-Bit', icon: '👾', description: 'Retro arcade blocks' },
  { id: 'noise', name: 'Noise Static', icon: '📻', description: 'Textured analog grain' }
];

export const CREATOR_FILTERS: { id: VideoFilter; name: string; previewColor: string; cssFilter: string }[] = [
  { id: 'none', name: 'Original', previewColor: '#64748B', cssFilter: 'none' },
  { id: 'cinematic', name: 'Cinematic', previewColor: '#0EA5E9', cssFilter: 'contrast(1.18) saturate(1.25) hue-rotate(-5deg)' },
  { id: 'vintage', name: 'Vintage', previewColor: '#D97706', cssFilter: 'sepia(0.35) contrast(1.1) saturate(0.9) brightness(0.95)' },
  { id: 'warm', name: 'Sunset Warm', previewColor: '#F59E0B', cssFilter: 'sepia(0.2) saturate(1.3) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Arctic Cool', previewColor: '#38BDF8', cssFilter: 'saturate(0.9) hue-rotate(15deg) brightness(1.05)' },
  { id: 'retro', name: 'Retro 80s', previewColor: '#EC4899', cssFilter: 'contrast(1.25) saturate(1.4) hue-rotate(20deg)' },
  { id: 'bw', name: 'B&W Film', previewColor: '#475569', cssFilter: 'grayscale(1) contrast(1.3) brightness(0.95)' },
  { id: 'dramatic', name: 'Dramatic', previewColor: '#8B5CF6', cssFilter: 'contrast(1.35) saturate(1.15) brightness(0.9)' }
];

export const CREATOR_TRANSITIONS: { id: VideoTransition; name: string; icon: string }[] = [
  { id: 'none', name: 'Cut (None)', icon: '✂️' },
  { id: 'fade', name: 'Fade Black', icon: '🌑' },
  { id: 'dissolve', name: 'Cross Dissolve', icon: '🔀' },
  { id: 'slideLeft', name: 'Slide Left', icon: '⬅️' },
  { id: 'slideRight', name: 'Slide Right', icon: '➡️' },
  { id: 'zoom', name: 'Zoom Warp', icon: '🔎' },
  { id: 'wipe', name: 'Speed Wipe', icon: '🧹' },
  { id: 'flash', name: 'White Flash', icon: '⚡' },
  { id: 'blur', name: 'Blur Transition', icon: '💧' },
  { id: 'spin', name: 'Spin Twist', icon: '🔄' }
];

export const CREATOR_STICKERS = [
  { category: 'emoji', items: ['🔥', '❤️', '😂', '⚡', '🚀', '🎬', '✨', '💯', '👑', '💥', '👀', '🍿', '🎧', '💸', '🏆', '🎯'] },
  { category: 'badge', items: ['SUBSCRIBE', 'LIKE & SAVE', 'NEW VIDEO', 'VIRAL', '100%', 'LINK IN BIO', 'PART 2', 'WAIT FOR IT'] },
  { category: 'shape', items: ['➡️ ARROW', '⭐ STAR', '⭕ CIRCLE', '❤️ HEART', '⚡ BOLT', '📍 PIN'] }
];

export const CREATOR_SOUND_EFFECTS = [
  { id: 'sfx-whoosh', name: 'Fast Whoosh Transition', duration: 0.8, url: 'https://actions.google.com/sounds/v1/foley/whoosh_air.ogg' },
  { id: 'sfx-ding', name: 'Achievement Ding Bell', duration: 1.2, url: 'https://actions.google.com/sounds/v1/cartoon/bell_ding.ogg' },
  { id: 'sfx-pop', name: 'Bubble Pop Notification', duration: 0.4, url: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg' },
  { id: 'sfx-shutter', name: 'Camera Shutter Click', duration: 0.6, url: 'https://actions.google.com/sounds/v1/foley/camera_shutter.ogg' },
  { id: 'sfx-subdrop', name: 'Deep Bass Sub Drop', duration: 2.0, url: 'https://actions.google.com/sounds/v1/impacts/low_frequency_rumble.ogg' }
];

export const CREATOR_FONTS = [
  { id: 'Montserrat', name: 'Montserrat (Bold & Modern)' },
  { id: 'Bebas Neue', name: 'Bebas Neue (Impact Headline)' },
  { id: 'Inter', name: 'Inter (Clean Neutral)' },
  { id: 'Caveat', name: 'Caveat (Handwritten Viral)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta (Tech Creator)' }
];

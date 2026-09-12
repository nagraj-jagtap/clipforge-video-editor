/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Repeat, 
  Volume2, 
  VolumeX,
  Sparkles
} from 'lucide-react';
import { TimelineClip, AspectRatioType, VideoFilter, VideoEffect } from '../types';
import { formatTimecode, getCssFilterString } from '../utils/videoExporter';

interface CenterPreviewProps {
  aspectRatio: AspectRatioType;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLooping: boolean;
  clips: TimelineClip[];
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onStepFrame: (delta: number) => void;
}

export const CenterPreview: React.FC<CenterPreviewProps> = ({
  aspectRatio,
  currentTime,
  duration,
  isPlaying,
  isLooping,
  clips,
  onPlayPause,
  onSeek,
  onToggleLoop,
  onStepFrame
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active Main Video Clip at currentTime
  const activeVideoClip = clips.find(
    (c) => (c.type === 'video' || c.type === 'image') && currentTime >= c.startTime && currentTime < c.startTime + c.duration
  );

  // Active Text Clips at currentTime
  const activeTextClips = clips.filter(
    (c) => c.type === 'text' && currentTime >= c.startTime && currentTime < c.startTime + c.duration
  );

  // Active Sticker Clips at currentTime
  const activeStickerClips = clips.filter(
    (c) => c.type === 'sticker' && currentTime >= c.startTime && currentTime < c.startTime + c.duration
  );

  // Synchronize HTML5 video element with timeline currentTime
  useEffect(() => {
    if (!videoRef.current || !activeVideoClip || activeVideoClip.type !== 'video') return;

    const clipTime = (currentTime - activeVideoClip.startTime) * (activeVideoClip.speed || 1.0) + activeVideoClip.trimIn;
    const video = videoRef.current;

    // Avoid jerky micro-seeks during continuous playback
    if (Math.abs(video.currentTime - clipTime) > 0.3) {
      video.currentTime = clipTime;
    }

    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [currentTime, isPlaying, activeVideoClip]);

  // Fullscreen helper
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Aspect ratio classes for responsive canvas frame
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[88%] w-auto max-w-full';
      case '16:9':
        return 'aspect-[16/9] w-[90%] max-w-[850px]';
      case '1:1':
        return 'aspect-square max-h-[85%] w-auto max-w-full';
      case '4:5':
        return 'aspect-[4/5] max-h-[88%] w-auto max-w-full';
      default:
        return 'aspect-[9/16] max-h-[88%] w-auto';
    }
  };

  // Visual Effect class or inline styles
  const getEffectStyle = (effect?: VideoEffect, intensity: number = 50): React.CSSProperties => {
    if (!effect || effect === 'none') return {};

    switch (effect) {
      case 'shake':
        return {
          animation: isPlaying ? 'shake 0.15s infinite' : 'none'
        };
      case 'zoom':
        return {
          transform: isPlaying ? `scale(${1 + Math.sin(currentTime * 8) * 0.05})` : 'scale(1)'
        };
      case 'rgbSplit':
        return {
          filter: 'drop-shadow(3px 0 0 rgba(255,0,80,0.7)) drop-shadow(-3px 0 0 rgba(0,240,255,0.7))'
        };
      case 'blur':
        return {
          filter: 'blur(4px)'
        };
      case 'pixelate':
        return {
          imageRendering: 'pixelated'
        };
      default:
        return {};
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D12] overflow-hidden relative">
      {/* Top Floating Badge: Aspect Ratio & Resolution Info */}
      <div className="absolute top-2 left-4 z-20 flex items-center space-x-2">
        <span className="px-2 py-0.5 rounded-full bg-[#171B24]/90 backdrop-blur-md border border-[#222733] text-[10px] font-mono font-semibold text-[#CBD5E1]">
          {aspectRatio} {aspectRatio === '9:16' ? '• Shorts / TikTok' : aspectRatio === '16:9' ? '• YouTube' : '• Post'}
        </span>
        {activeVideoClip && (
          <span className="px-2 py-0.5 rounded-full bg-[#171B24]/90 backdrop-blur-md border border-[#222733] text-[10px] font-mono text-[#00F0FF]">
            {activeVideoClip.name}
          </span>
        )}
      </div>

      {/* Main Preview Center Stage */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(#1A1E29_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {/* Aspect Ratio Canvas Monitor */}
        <div 
          className={`relative bg-black rounded-lg overflow-hidden shadow-2xl border border-[#222733] flex items-center justify-center select-none ${getAspectRatioStyle()}`}
        >
          {/* Main Video Layer */}
          {activeVideoClip ? (
            <div 
              className="w-full h-full relative overflow-hidden flex items-center justify-center transition-all"
              style={{
                ...getEffectStyle(activeVideoClip.effect, activeVideoClip.effectIntensity),
                filter: [getCssFilterString(activeVideoClip), activeVideoClip.effect === 'rgbSplit' ? 'drop-shadow(3px 0 0 rgba(255,0,80,0.7)) drop-shadow(-3px 0 0 rgba(0,240,255,0.7))' : activeVideoClip.effect === 'blur' ? 'blur(4px)' : ''].filter(Boolean).join(' '),
                opacity: (activeVideoClip.opacity ?? 100) / 100
              }}
            >
              {activeVideoClip.sourceUrl ? (
                <video
                  ref={videoRef}
                  src={activeVideoClip.sourceUrl}
                  playsInline
                  muted={activeVideoClip.muted}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    transform: `
                      scale(${(activeVideoClip.scale || 100) / 100})
                      rotate(${activeVideoClip.rotation || 0}deg)
                      translate(${activeVideoClip.posX}px, ${activeVideoClip.posY}px)
                      scaleX(${activeVideoClip.flipH ? -1 : 1})
                      scaleY(${activeVideoClip.flipV ? -1 : 1})
                    `
                  }}
                />
              ) : (
                <img
                  src={activeVideoClip.thumbnail}
                  alt={activeVideoClip.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    transform: `
                      scale(${(activeVideoClip.scale || 100) / 100})
                      rotate(${activeVideoClip.rotation || 0}deg)
                      translate(${activeVideoClip.posX}px, ${activeVideoClip.posY}px)
                      scaleX(${activeVideoClip.flipH ? -1 : 1})
                      scaleY(${activeVideoClip.flipV ? -1 : 1})
                    `
                  }}
                />
              )}

              {/* In-Preview VHS Effect Layer */}
              {activeVideoClip.effect === 'vhs' && (
                <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-gradient-to-b from-transparent via-black/10 to-transparent flex flex-col justify-between p-3 font-mono text-[10px] text-white/80">
                  <div className="flex items-center space-x-1 text-red-500 font-bold">
                    <span className="animate-pulse">●</span>
                    <span>REC</span>
                  </div>
                  <div>PLAY SP 00:{Math.floor(currentTime).toString().padStart(2, '0')}</div>
                </div>
              )}

              {/* In-Preview Glitch Effect Layer */}
              {activeVideoClip.effect === 'glitch' && isPlaying && (
                <div className="absolute inset-0 pointer-events-none bg-[#00F0FF]/15 mix-blend-color-dodge animate-pulse"></div>
              )}

              {/* In-Preview White Flash Effect Layer */}
              {activeVideoClip.effect === 'flash' && isPlaying && (
                <div 
                  className="absolute inset-0 pointer-events-none bg-white transition-opacity duration-75"
                  style={{ opacity: Math.max(0, Math.sin(currentTime * 12)) * 0.5 }}
                />
              )}
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <Sparkles className="w-8 h-8 text-[#00F0FF]/50 mx-auto" />
              <p className="text-xs font-semibold text-[#94A3B8]">No media at this playhead position</p>
              <p className="text-[10px] text-[#475569]">Drag clips or press Play to preview</p>
            </div>
          )}

          {/* Active Stickers Layer */}
          {activeStickerClips.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute pointer-events-none transition-transform"
              style={{
                left: `calc(50% + ${sticker.posX}%)`,
                top: `calc(50% + ${sticker.posY}%)`,
                transform: `translate(-50%, -50%) scale(${(sticker.scale || 100) / 100}) rotate(${sticker.rotation || 0}deg)`,
                opacity: (sticker.opacity ?? 100) / 100
              }}
            >
              {sticker.stickerCategory === 'badge' ? (
                <div className="px-3 py-1.5 bg-[#EF4444] text-white font-extrabold text-xs uppercase tracking-wider rounded-md shadow-lg font-['Montserrat']">
                  {sticker.stickerContent}
                </div>
              ) : (
                <div className="text-4xl drop-shadow-md select-none">
                  {sticker.stickerContent}
                </div>
              )}
            </div>
          ))}

          {/* Active Text Layer with Live Animations */}
          {activeTextClips.map((textClip) => {
            const elapsed = currentTime - textClip.startTime;
            let animStyle: React.CSSProperties = {};

            if (textClip.textAnimation === 'fade') {
              animStyle = {
                opacity: Math.min(1, elapsed / 0.3)
              };
            } else if (textClip.textAnimation === 'zoom') {
              const scaleProgress = Math.min(1, elapsed / 0.3);
              animStyle = {
                transform: `scale(${0.4 + scaleProgress * 0.6})`
              };
            } else if (textClip.textAnimation === 'slide') {
              const slideOffset = Math.max(0, (1 - elapsed / 0.3) * 30);
              animStyle = {
                transform: `translateY(${slideOffset}px)`
              };
            }

            let displayText = textClip.text || '';
            if (textClip.textAnimation === 'typewriter') {
              const chars = textClip.text?.length || 0;
              const progress = Math.min(1, elapsed / (textClip.duration * 0.6));
              displayText = (textClip.text || '').slice(0, Math.floor(chars * progress));
            }

            return (
              <div
                key={textClip.id}
                className="absolute pointer-events-none text-center select-none w-full px-4"
                style={{
                  left: `calc(50% + ${textClip.posX}%)`,
                  top: `calc(50% + ${textClip.posY}%)`,
                  transform: `translate(-50%, -50%) scale(${(textClip.scale || 100) / 100}) rotate(${textClip.rotation || 0}deg)`
                }}
              >
                <div style={animStyle}>
                  <p
                    style={{
                      fontFamily: `'${textClip.fontFamily || 'Montserrat'}', sans-serif`,
                      fontSize: `${textClip.fontSize || 32}px`,
                      color: textClip.textColor || '#FFFFFF',
                      fontWeight: textClip.isBold ? 800 : 500,
                      fontStyle: textClip.isItalic ? 'italic' : 'normal',
                      WebkitTextStroke: textClip.strokeWidth ? `${textClip.strokeWidth}px ${textClip.strokeColor || '#000'}` : undefined,
                      textShadow: textClip.shadowBlur ? `0 0 ${textClip.shadowBlur}px ${textClip.shadowColor || 'rgba(0,0,0,0.8)'}` : undefined,
                      opacity: (textClip.opacity ?? 100) / 100
                    }}
                    className="leading-tight break-words"
                  >
                    {displayText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transport Controls Bar */}
      <div className="h-12 bg-[#12141A] border-t border-[#222733] px-4 flex items-center justify-between shrink-0 select-none z-10">
        {/* Current Timecode vs Total Duration */}
        <div className="flex items-center space-x-2 font-mono text-xs text-[#CBD5E1]">
          <span className="text-[#00F0FF] font-bold">{formatTimecode(currentTime)}</span>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#94A3B8]">{formatTimecode(duration)}</span>
        </div>

        {/* Center Transport Buttons */}
        <div className="flex items-center space-x-2">
          {/* Jump to start */}
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1A1E27] transition-colors"
            title="Jump to start (Home)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            onClick={() => onStepFrame(-1 / 30)}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1A1E27] transition-colors"
            title="Previous Frame (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={onPlayPause}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md ${
              isPlaying
                ? 'bg-[#00F0FF] text-[#0B0D12] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-white text-[#0B0D12] hover:bg-[#00F0FF]'
            }`}
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => onStepFrame(1 / 30)}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1A1E27] transition-colors"
            title="Next Frame (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Loop Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded-md transition-colors ${
              isLooping ? 'text-[#00F0FF] bg-[#00F0FF]/15' : 'text-[#64748B] hover:text-white'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Fullscreen Canvas */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1A1E27] transition-colors"
            title="Toggle Fullscreen Preview"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

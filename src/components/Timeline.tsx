/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  Scissors, 
  Trash2, 
  Copy, 
  ZoomIn, 
  ZoomOut, 
  Magnet, 
  Video, 
  Music, 
  Type, 
  Smile, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { TimelineClip, TimelineTrack } from '../types';
import { formatTimecode } from '../utils/videoExporter';

interface TimelineProps {
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
  onSeek: (time: number) => void;
  onUpdateClips: (clips: TimelineClip[]) => void;
  onSplitClip: () => void;
  onTrimClipStart: () => void;
  onTrimClipEnd: () => void;
  onDuplicateClip: () => void;
  onDeleteClip: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  clips,
  currentTime,
  duration,
  selectedClipId,
  onSelectClip,
  onSeek,
  onUpdateClips,
  onSplitClip,
  onTrimClipStart,
  onTrimClipEnd,
  onDuplicateClip,
  onDeleteClip
}) => {
  const [zoom, setZoom] = useState(60); // pixels per second
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Dragging clip state
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragInitialTime, setDragInitialTime] = useState(0);

  // Trimming handle state: 'start' | 'end' | null
  const [trimmingHandle, setTrimmingHandle] = useState<{ clipId: string; type: 'start' | 'end' } | null>(null);

  // Calculate timeline width
  const timelineWidth = Math.max(800, duration * zoom + 200);

  // Scrub playhead handler
  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!timelineBodyRef.current) return;
    const rect = timelineBodyRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineBodyRef.current.scrollLeft;
    const newTime = Math.max(0, Math.min(duration, clickX / zoom));
    onSeek(newTime);
    setIsScrubbing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing && timelineBodyRef.current) {
        const rect = timelineBodyRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left + timelineBodyRef.current.scrollLeft;
        const newTime = Math.max(0, Math.min(duration, clickX / zoom));
        onSeek(newTime);
      } else if (draggingClipId) {
        // Drag moving clip horizontally
        const deltaX = e.clientX - dragStartX;
        const deltaTime = deltaX / zoom;
        let newStartTime = Math.max(0, dragInitialTime + deltaTime);

        if (isSnapEnabled) {
          // Snap to 0 or playhead
          if (Math.abs(newStartTime - currentTime) < 0.2) newStartTime = currentTime;
          if (Math.abs(newStartTime) < 0.2) newStartTime = 0;
        }

        onUpdateClips(
          clips.map((c) => (c.id === draggingClipId ? { ...c, startTime: newStartTime } : c))
        );
      } else if (trimmingHandle) {
        // Trimming clip length
        const targetClip = clips.find((c) => c.id === trimmingHandle.clipId);
        if (targetClip && timelineBodyRef.current) {
          const rect = timelineBodyRef.current.getBoundingClientRect();
          const pointerX = e.clientX - rect.left + timelineBodyRef.current.scrollLeft;
          const pointerTime = Math.max(0, pointerX / zoom);

          if (trimmingHandle.type === 'start') {
            const originalEndTime = targetClip.startTime + targetClip.duration;
            const newStartTime = Math.min(originalEndTime - 0.2, Math.max(0, pointerTime));
            const newDuration = originalEndTime - newStartTime;
            const trimDelta = newStartTime - targetClip.startTime;

            onUpdateClips(
              clips.map((c) =>
                c.id === trimmingHandle.clipId
                  ? {
                      ...c,
                      startTime: newStartTime,
                      duration: newDuration,
                      trimIn: Math.max(0, c.trimIn + trimDelta)
                    }
                  : c
              )
            );
          } else {
            // Trim end
            const newDuration = Math.max(0.2, pointerTime - targetClip.startTime);
            onUpdateClips(
              clips.map((c) => (c.id === trimmingHandle.clipId ? { ...c, duration: newDuration } : c))
            );
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClipId(null);
      setTrimmingHandle(null);
    };

    if (isScrubbing || draggingClipId || trimmingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, draggingClipId, trimmingHandle, dragStartX, dragInitialTime, zoom, duration, clips, currentTime, isSnapEnabled, onSeek, onUpdateClips]);

  return (
    <div className="h-64 bg-[#12141A] border-t border-[#222733] flex flex-col shrink-0 select-none overflow-hidden z-20">
      {/* Timeline Quick Action Toolbar */}
      <div className="h-9 bg-[#171B24] border-b border-[#222733] px-3 flex items-center justify-between shrink-0">
        {/* Left: Edit Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Split (Razor) */}
          <button
            onClick={onSplitClip}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1F2430] hover:bg-[#00F0FF] hover:text-[#0B0D12] text-xs font-semibold text-white transition-colors"
            title="Split selected clip at playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          {/* Trim Left */}
          <button
            onClick={onTrimClipStart}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1F2430] hover:bg-[#2A3142] text-xs font-medium text-[#CBD5E1] transition-colors"
            title="Trim clip start to playhead"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trim Start</span>
          </button>

          {/* Trim Right */}
          <button
            onClick={onTrimClipEnd}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1F2430] hover:bg-[#2A3142] text-xs font-medium text-[#CBD5E1] transition-colors"
            title="Trim clip end to playhead"
          >
            <span>Trim End</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-[#262C3A] mx-1"></div>

          {/* Duplicate */}
          <button
            onClick={onDuplicateClip}
            className="p-1.5 rounded bg-[#1F2430] hover:bg-[#2A3142] text-[#CBD5E1] hover:text-white transition-colors"
            title="Duplicate selected clip (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={onDeleteClip}
            className="p-1.5 rounded bg-[#1F2430] hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            title="Delete selected clip (Delete / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Magnet & Timeline Zoom Controls */}
        <div className="flex items-center space-x-3">
          {/* Snap toggle */}
          <button
            onClick={() => setIsSnapEnabled(!isSnapEnabled)}
            className={`p-1.5 rounded transition-colors ${
              isSnapEnabled ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'text-[#64748B] hover:text-white'
            }`}
            title="Toggle Magnet / Snapping"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Slider */}
          <div className="flex items-center space-x-1.5">
            <ZoomOut 
              className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer hover:text-white" 
              onClick={() => setZoom(Math.max(25, zoom - 15))}
            />
            <input
              type="range"
              min={25}
              max={150}
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-20 accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
            <ZoomIn 
              className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer hover:text-white" 
              onClick={() => setZoom(Math.min(150, zoom + 15))}
            />
          </div>
        </div>
      </div>

      {/* Main Multitrack Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers Column */}
        <div className="w-36 bg-[#171B24] border-r border-[#222733] flex flex-col shrink-0 select-none z-10">
          {/* Ruler Header Space */}
          <div className="h-6 border-b border-[#222733] px-2 flex items-center text-[10px] font-mono text-[#94A3B8] uppercase">
            Tracks
          </div>

          {/* Track Labels */}
          <div className="flex-1 overflow-y-hidden divide-y divide-[#222733]">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-10 px-2 flex items-center justify-between text-xs text-[#CBD5E1]"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  {track.type === 'video' && <Video className="w-3 h-3 text-[#38BDF8]" />}
                  {track.type === 'text' && <Type className="w-3 h-3 text-[#FACC15]" />}
                  {track.type === 'sticker' && <Smile className="w-3 h-3 text-[#EC4899]" />}
                  {track.type === 'audio' && <Music className="w-3 h-3 text-[#34D399]" />}
                  <span className="truncate text-[11px] font-medium">{track.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Tracks & Timeline Body */}
        <div
          ref={timelineBodyRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0E1015]"
          onMouseDown={handleTimelineMouseDown}
        >
          <div style={{ width: `${timelineWidth}px` }} className="h-full relative flex flex-col">
            {/* Time Ruler */}
            <div className="h-6 bg-[#151821] border-b border-[#222733] relative shrink-0">
              {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-[#262C3A] text-[9px] font-mono text-[#64748B] pl-1 pt-0.5 pointer-events-none"
                  style={{ left: `${i * zoom}px` }}
                >
                  {formatTimecode(i)}
                </div>
              ))}
            </div>

            {/* Tracks Body */}
            <div className="flex-1 divide-y divide-[#1F2430]/70 relative">
              {tracks.map((track) => {
                const trackClips = clips.filter((c) => c.trackId === track.id);

                return (
                  <div key={track.id} className="h-10 relative bg-[#0E1015]/80">
                    {/* Render Clips in this track */}
                    {trackClips.map((clip) => {
                      const isSelected = selectedClipId === clip.id;
                      const clipLeft = clip.startTime * zoom;
                      const clipWidth = Math.max(16, clip.duration * zoom);

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClip(clip.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            onSelectClip(clip.id);
                            setDraggingClipId(clip.id);
                            setDragStartX(e.clientX);
                            setDragInitialTime(clip.startTime);
                          }}
                          className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-move transition-shadow flex items-center group select-none ${
                            isSelected
                              ? 'ring-2 ring-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.4)] z-10'
                              : 'hover:ring-1 hover:ring-[#38BDF8]'
                          } ${
                            clip.type === 'video'
                              ? 'bg-[#1E293B] border border-[#334155]'
                              : clip.type === 'text'
                              ? 'bg-[#854D0E] border border-[#CA8A04]'
                              : clip.type === 'sticker'
                              ? 'bg-[#831843] border border-[#DB2777]'
                              : 'bg-[#064E3B] border border-[#059669]'
                          }`}
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`
                          }}
                        >
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setTrimmingHandle({ clipId: clip.id, type: 'start' });
                            }}
                            className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#00F0FF] cursor-ew-resize opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"
                          >
                            <div className="w-0.5 h-3 bg-white rounded-full"></div>
                          </div>

                          {/* Clip Body Content */}
                          <div className="flex items-center space-x-1.5 px-2 w-full h-full overflow-hidden">
                            {clip.thumbnail && (
                              <img
                                src={clip.thumbnail}
                                alt={clip.name}
                                referrerPolicy="no-referrer"
                                className="h-full aspect-video object-cover rounded pointer-events-none"
                              />
                            )}
                            <span className="text-[11px] font-semibold text-white truncate drop-shadow-sm">
                              {clip.type === 'text' ? clip.text || clip.name : clip.name}
                            </span>
                            <span className="text-[9px] font-mono text-white/70 ml-auto shrink-0">
                              {clip.duration.toFixed(1)}s
                            </span>
                          </div>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setTrimmingHandle({ clipId: clip.id, type: 'end' });
                            }}
                            className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#00F0FF] cursor-ew-resize opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"
                          >
                            <div className="w-0.5 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Red Scrub Playhead Needle */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
              style={{ left: `${currentTime * zoom}px`, transform: 'translateX(-50%)' }}
            >
              {/* Playhead Handle */}
              <div className="w-3.5 h-4 bg-[#EF4444] rounded-t-xs shadow-md clip-polygon flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              {/* Vertical Laser Needle Line */}
              <div className="w-[1.5px] flex-1 bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.8)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

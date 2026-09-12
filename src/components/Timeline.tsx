/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Scissors, Trash2, Copy, ZoomIn, ZoomOut, Magnet, Video, Music, Type, Smile, ChevronRight, ChevronLeft, Plus, X, Sparkles, Wand2 } from 'lucide-react';
import { TimelineClip, TimelineTrack } from '../types';
import { formatTimecode } from '../utils/videoExporter';
import { CREATOR_TRANSITIONS, CREATOR_EFFECTS } from '../data/creatorAssets';

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

export const Timeline: React.FC<TimelineProps> = ({ tracks, clips, currentTime, duration, selectedClipId, onSelectClip, onSeek, onUpdateClips, onSplitClip, onTrimClipStart, onTrimClipEnd, onDuplicateClip, onDeleteClip }) => {
  const [zoom, setZoom] = useState(60);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragInitialTime, setDragInitialTime] = useState(0);
  const [trimmingHandle, setTrimmingHandle] = useState<{ clipId: string; type: 'start' | 'end' } | null>(null);
  const [effectsTargetId, setEffectsTargetId] = useState<string | null>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const timelineWidth = Math.max(800, duration * zoom + 240);

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!timelineBodyRef.current) return;
    const rect = timelineBodyRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineBodyRef.current.scrollLeft;
    onSeek(Math.max(0, Math.min(duration, clickX / zoom)));
    setIsScrubbing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing && timelineBodyRef.current) {
        const rect = timelineBodyRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left + timelineBodyRef.current.scrollLeft;
        onSeek(Math.max(0, Math.min(duration, clickX / zoom)));
        return;
      }
      if (draggingClipId) {
        const deltaTime = (e.clientX - dragStartX) / zoom;
        let newStartTime = Math.max(0, dragInitialTime + deltaTime);
        if (isSnapEnabled) {
          if (Math.abs(newStartTime - currentTime) < 0.2) newStartTime = currentTime;
          if (Math.abs(newStartTime) < 0.2) newStartTime = 0;
        }
        onUpdateClips(clips.map((c) => c.id === draggingClipId ? { ...c, startTime: newStartTime } : c));
        return;
      }
      if (trimmingHandle && timelineBodyRef.current) {
        const target = clips.find((c) => c.id === trimmingHandle.clipId);
        if (!target) return;
        const rect = timelineBodyRef.current.getBoundingClientRect();
        const pointerTime = Math.max(0, (e.clientX - rect.left + timelineBodyRef.current.scrollLeft) / zoom);
        if (trimmingHandle.type === 'start') {
          const end = target.startTime + target.duration;
          const newStart = Math.min(end - 0.2, pointerTime);
          onUpdateClips(clips.map((c) => c.id === target.id ? { ...c, startTime: newStart, duration: end - newStart, trimIn: Math.max(0, c.trimIn + newStart - c.startTime) } : c));
        } else {
          onUpdateClips(clips.map((c) => c.id === target.id ? { ...c, duration: Math.max(0.2, pointerTime - c.startTime) } : c));
        }
      }
    };
    const handleMouseUp = () => { setIsScrubbing(false); setDraggingClipId(null); setTrimmingHandle(null); };
    if (isScrubbing || draggingClipId || trimmingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isScrubbing, draggingClipId, trimmingHandle, dragStartX, dragInitialTime, zoom, duration, clips, currentTime, isSnapEnabled, onSeek, onUpdateClips]);

  const applyTransition = (clipId: string, transition: TimelineClip['transition']) => {
    onUpdateClips(clips.map((c) => c.id === clipId ? { ...c, transition, transitionDuration: transition === 'none' ? 0 : Math.min(0.8, Math.max(0.2, c.transitionDuration || 0.5)) } : c));
    onSelectClip(clipId);
  };

  const applyEffect = (clipId: string, effect: TimelineClip['effect']) => {
    onUpdateClips(clips.map((c) => c.id === clipId ? { ...c, effect, effectIntensity: effect === 'none' ? 0 : 50 } : c));
    onSelectClip(clipId);
  };

  return (
    <div className="h-64 bg-[#12141A] border-t border-[#222733] flex flex-col shrink-0 select-none overflow-hidden z-20 relative">
      {/* CapCut-style + menu: Transitions + Effects */}
      {effectsTargetId && (
        <div className="absolute top-10 right-3 z-50 w-[330px] max-h-[245px] overflow-y-auto rounded-xl border border-[#334155] bg-[#11151D] shadow-2xl shadow-black/60 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-white">Add to clip</p>
              <p className="text-[9px] text-[#64748B]">Transitions & Effects</p>
            </div>
            <button onClick={() => setEffectsTargetId(null)} className="p-1 rounded hover:bg-[#222733] text-[#94A3B8] hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2 text-[#00F0FF]"><LayersIcon /><span className="text-[11px] font-bold">Transitions</span></div>
            <div className="grid grid-cols-3 gap-1.5">
              {CREATOR_TRANSITIONS.map((trans) => {
                const target = clips.find((c) => c.id === effectsTargetId);
                const active = target?.transition === trans.id;
                return <button key={trans.id} onClick={() => applyTransition(effectsTargetId, trans.id)} className={`p-1.5 rounded-lg border text-center transition-all ${active ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#171B24] border-[#262C3A] text-white hover:border-[#00F0FF]/60'}`}><div className="text-sm">{trans.icon}</div><div className="text-[8px] font-semibold truncate">{trans.name}</div></button>;
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#222733]">
            <div className="flex items-center gap-1.5 mb-2 text-[#00F0FF]"><Wand2 className="w-3.5 h-3.5" /><span className="text-[11px] font-bold">Effects</span></div>
            <div className="grid grid-cols-3 gap-1.5">
              {CREATOR_EFFECTS.map((effect) => {
                const target = clips.find((c) => c.id === effectsTargetId);
                const active = target?.effect === effect.id;
                return <button key={effect.id} onClick={() => applyEffect(effectsTargetId, effect.id)} className={`p-1.5 rounded-lg border text-center transition-all ${active ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#171B24] border-[#262C3A] text-white hover:border-[#00F0FF]/60'}`}><div className="text-sm">{effect.icon}</div><div className="text-[8px] font-semibold truncate">{effect.name}</div></button>;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="h-9 bg-[#171B24] border-b border-[#222733] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1.5">
          <button onClick={onSplitClip} className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1F2430] hover:bg-[#00F0FF] hover:text-[#0B0D12] text-xs font-semibold text-white"><Scissors className="w-3.5 h-3.5" /><span>Split</span></button>
          <button onClick={onTrimClipStart} className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1F2430] hover:bg-[#2A3142] text-xs font-medium text-[#CBD5E1]"><ChevronLeft className="w-3.5 h-3.5" /><span>Trim Start</span></button>
          <button onClick={onTrimClipEnd} className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1F2430] hover:bg-[#2A3142] text-xs font-medium text-[#CBD5E1]"><span>Trim End</span><ChevronRight className="w-3.5 h-3.5" /></button>
          <div className="h-4 w-px bg-[#262C3A] mx-1" />
          <button onClick={onDuplicateClip} className="p-1.5 rounded bg-[#1F2430] hover:bg-[#2A3142] text-[#CBD5E1]"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={onDeleteClip} className="p-1.5 rounded bg-[#1F2430] hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsSnapEnabled(!isSnapEnabled)} className={`p-1.5 rounded ${isSnapEnabled ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'text-[#64748B]'}`}><Magnet className="w-3.5 h-3.5" /></button>
          <div className="flex items-center space-x-1.5"><ZoomOut className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer" onClick={() => setZoom(Math.max(25, zoom - 15))} /><input type="range" min={25} max={150} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-20 accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer" /><ZoomIn className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer" onClick={() => setZoom(Math.min(150, zoom + 15))} /></div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-36 bg-[#171B24] border-r border-[#222733] flex flex-col shrink-0 z-10">
          <div className="h-6 border-b border-[#222733] px-2 flex items-center text-[10px] font-mono text-[#94A3B8] uppercase">Tracks</div>
          <div className="flex-1 overflow-y-hidden divide-y divide-[#222733]">{tracks.map((track) => <div key={track.id} className="h-10 px-2 flex items-center text-xs text-[#CBD5E1]">{track.type === 'video' && <Video className="w-3 h-3 text-[#38BDF8] mr-1.5" />}{track.type === 'text' && <Type className="w-3 h-3 text-[#FACC15] mr-1.5" />}{track.type === 'sticker' && <Smile className="w-3 h-3 text-[#EC4899] mr-1.5" />}{track.type === 'audio' && <Music className="w-3 h-3 text-[#34D399] mr-1.5" />}<span className="truncate text-[11px] font-medium">{track.name}</span></div>)}</div>
        </div>

        <div ref={timelineBodyRef} className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0E1015]" onMouseDown={handleTimelineMouseDown}>
          <div style={{ width: `${timelineWidth}px` }} className="h-full relative flex flex-col">
            <div className="h-6 bg-[#151821] border-b border-[#222733] relative shrink-0">{Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => <div key={i} className="absolute top-0 bottom-0 border-l border-[#262C3A] text-[9px] font-mono text-[#64748B] pl-1 pt-0.5 pointer-events-none" style={{ left: `${i * zoom}px` }}>{formatTimecode(i)}</div>)}</div>
            <div className="flex-1 divide-y divide-[#1F2430]/70 relative">
              {tracks.map((track) => {
                const trackClips = clips.filter((c) => c.trackId === track.id).sort((a, b) => a.startTime - b.startTime);
                return <div key={track.id} className="h-10 relative bg-[#0E1015]/80">
                  {trackClips.map((clip, index) => {
                    const isSelected = selectedClipId === clip.id;
                    const clipLeft = clip.startTime * zoom;
                    const clipWidth = Math.max(18, clip.duration * zoom);
                    const nextClip = trackClips[index + 1];
                    const hasJunction = nextClip && Math.abs((clip.startTime + clip.duration) - nextClip.startTime) < 0.08;
                    const junctionLeft = hasJunction ? (clip.startTime + clip.duration) * zoom : 0;
                    return <React.Fragment key={clip.id}>
                      <div onClick={(e) => { e.stopPropagation(); onSelectClip(clip.id); }} onMouseDown={(e) => { e.stopPropagation(); onSelectClip(clip.id); setDraggingClipId(clip.id); setDragStartX(e.clientX); setDragInitialTime(clip.startTime); }} className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-move transition-shadow flex items-center group select-none ${isSelected ? 'ring-2 ring-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.4)] z-10' : 'hover:ring-1 hover:ring-[#38BDF8]'} ${clip.type === 'video' ? 'bg-[#1E293B] border border-[#334155]' : clip.type === 'text' ? 'bg-[#854D0E] border border-[#CA8A04]' : clip.type === 'sticker' ? 'bg-[#831843] border border-[#DB2777]' : 'bg-[#064E3B] border border-[#059669]'}`} style={{ left: `${clipLeft}px`, width: `${clipWidth}px` }}>
                        <div onMouseDown={(e) => { e.stopPropagation(); setTrimmingHandle({ clipId: clip.id, type: 'start' }); }} className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#00F0FF] cursor-ew-resize opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"><div className="w-0.5 h-3 bg-white rounded-full" /></div>
                        <div className="flex items-center gap-1.5 px-2 w-full h-full overflow-hidden">{clip.thumbnail && <img src={clip.thumbnail} alt={clip.name} referrerPolicy="no-referrer" className="h-full aspect-video object-cover rounded pointer-events-none" />}<span className="text-[11px] font-semibold text-white truncate drop-shadow-sm">{clip.type === 'text' ? clip.text || clip.name : clip.name}</span>{clip.effect && clip.effect !== 'none' && <Sparkles className="w-3 h-3 text-[#00F0FF] shrink-0" title="Effect applied" />}<span className="text-[9px] font-mono text-white/70 ml-auto shrink-0">{clip.duration.toFixed(1)}s</span></div>
                        <div onMouseDown={(e) => { e.stopPropagation(); setTrimmingHandle({ clipId: clip.id, type: 'end' }); }} className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#00F0FF] cursor-ew-resize opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"><div className="w-0.5 h-3 bg-white rounded-full" /></div>
                      </div>
                      {hasJunction && <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setEffectsTargetId(nextClip.id); }} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-6 h-6 rounded-full bg-[#1B2430] border-2 border-[#CBD5E1] hover:border-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#0B0D12] text-white flex items-center justify-center shadow-lg transition-all" style={{ left: `${junctionLeft}px` }} title="Transitions & Effects"><Plus className="w-3.5 h-3.5" /></button>}
                    </React.Fragment>;
                  })}
                </div>;
              })}
            </div>
            <div className="absolute top-0 bottom-0 pointer-events-none z-40 flex flex-col items-center" style={{ left: `${currentTime * zoom}px`, transform: 'translateX(-50%)' }}><div className="w-3.5 h-4 bg-[#EF4444] rounded-t-xs shadow-md flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full" /></div><div className="w-[1.5px] flex-1 bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.8)]" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LayersIcon = () => <span className="text-sm">🔀</span>;

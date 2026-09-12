/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Scissors, Trash2, Copy, ZoomIn, ZoomOut, Magnet, Video, Music, Type, Smile, ChevronRight, ChevronLeft, Plus, X, Wand2, Layers3, Image as ImageIcon } from 'lucide-react';
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

  const targetClip = effectsTargetId ? clips.find((c) => c.id === effectsTargetId) : null;
  const targetImage = targetClip?.thumbnail || targetClip?.sourceUrl || '';
  const previewClassForTransition = (id: TimelineClip['transition']) => `cf-transition-preview cf-${id}`;
  const previewClassForEffect = (id: TimelineClip['effect']) => `cf-effect-preview cf-effect-${id}`;

  return (
    <div className="h-64 bg-[#12141A] border-t border-[#222733] flex flex-col shrink-0 select-none overflow-hidden z-20 relative">
      <style>{`
        @keyframes cfFadeIn { 0%,35%{opacity:0} 65%,100%{opacity:1} }
        @keyframes cfDissolve { 0%,20%{opacity:0;filter:blur(7px)} 55%{opacity:.6;filter:blur(2px)} 100%{opacity:1;filter:blur(0)} }
        @keyframes cfSlideL { 0%{transform:translateX(100%);opacity:0} 45%,100%{transform:translateX(0);opacity:1} }
        @keyframes cfSlideR { 0%{transform:translateX(-100%);opacity:0} 45%,100%{transform:translateX(0);opacity:1} }
        @keyframes cfZoomWarp { 0%{transform:scale(.45);opacity:0} 55%,100%{transform:scale(1);opacity:1} }
        @keyframes cfWipe { 0%{clip-path:inset(0 100% 0 0)} 55%,100%{clip-path:inset(0 0 0 0)} }
        @keyframes cfFlash { 0%,38%{opacity:.1} 45%{opacity:1;filter:brightness(2)} 52%,100%{opacity:1;filter:brightness(1)} }
        @keyframes cfBlurIn { 0%{filter:blur(12px);opacity:.25} 65%,100%{filter:blur(0);opacity:1} }
        @keyframes cfSpin { 0%{transform:rotate(-70deg) scale(.45);opacity:0} 65%,100%{transform:rotate(0) scale(1);opacity:1} }
        @keyframes cfShake { 0%,100%{transform:translate(0,0) scale(1)} 20%{transform:translate(-3px,2px) scale(1.02)} 40%{transform:translate(3px,-2px) scale(1.02)} 60%{transform:translate(-2px,-2px) scale(1.01)} 80%{transform:translate(2px,2px) scale(1.02)} }
        @keyframes cfGlitch { 0%,100%{transform:none;filter:none} 18%{transform:translate(-2px,0);filter:hue-rotate(30deg)} 22%{transform:translate(2px,0);filter:hue-rotate(-25deg)} 46%{transform:translate(0,1px);filter:contrast(1.25)} 50%{transform:translate(-3px,0);filter:saturate(1.7)} 54%{transform:none;filter:none} }
        @keyframes cfRgb { 0%,100%{filter:none;transform:none} 35%{filter:drop-shadow(-3px 0 0 rgba(255,0,0,.7)) drop-shadow(3px 0 0 rgba(0,255,255,.7));transform:translateX(-1px)} 55%{filter:drop-shadow(3px 0 0 rgba(255,0,0,.7)) drop-shadow(-3px 0 0 rgba(0,255,255,.7));transform:translateX(1px)} }
        @keyframes cfVhs { 0%,100%{filter:contrast(1) saturate(1)} 35%{filter:contrast(1.2) saturate(.75) sepia(.08)} 55%{filter:contrast(.9) saturate(1.2) sepia(.12)} }
        @keyframes cfGrain { 0%,100%{filter:contrast(1)} 50%{filter:contrast(1.18) brightness(.96)} }
        @keyframes cfPixel { 0%,100%{filter:none} 45%{filter:contrast(1.35) saturate(1.25)} }
        @keyframes cfNoise { 0%,100%{filter:contrast(1)} 30%{filter:contrast(1.4) brightness(1.1)} 34%{filter:contrast(.8) brightness(.9)} 70%{filter:contrast(1.25)} }
        @keyframes cfFlashEffect { 0%,70%,100%{filter:none} 75%{filter:brightness(2.2)} 80%{filter:brightness(1)} }
        @keyframes cfBeatZoom { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes cfDiamond { 0%,100%{transform:scale(1) rotate(0deg);filter:none} 35%{transform:scale(1.08) rotate(.7deg);filter:saturate(1.35) contrast(1.15) blur(.4px)} 65%{transform:scale(.98) rotate(-.7deg);filter:saturate(1.5) contrast(1.2)} }
        .cf-preview-stage{position:relative;height:58px;border-radius:7px;overflow:hidden;background:#0B0D12;border:1px solid #303A4C}
        .cf-preview-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:center;will-change:transform,filter,opacity,clip-path}
        .cf-preview-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#64748B;background:linear-gradient(135deg,#202A3A,#0B0D12)}
        .cf-fade .cf-preview-image{animation:cfFadeIn 1.2s infinite}
        .cf-dissolve .cf-preview-image{animation:cfDissolve 1.2s infinite}
        .cf-slideLeft .cf-preview-image{animation:cfSlideL 1.2s infinite}
        .cf-slideRight .cf-preview-image{animation:cfSlideR 1.2s infinite}
        .cf-zoom .cf-preview-image{animation:cfZoomWarp 1.2s infinite}
        .cf-wipe .cf-preview-image{animation:cfWipe 1.2s infinite}
        .cf-flash .cf-preview-image{animation:cfFlash 1.2s infinite}
        .cf-blur .cf-preview-image{animation:cfBlurIn 1.2s infinite}
        .cf-spin .cf-preview-image{animation:cfSpin 1.2s infinite}
        .cf-effect-glitch .cf-preview-image{animation:cfGlitch 1s infinite}
        .cf-effect-vhs .cf-preview-image{animation:cfVhs 1.6s infinite}
        .cf-effect-shake .cf-preview-image{animation:cfShake .7s infinite}
        .cf-effect-blur .cf-preview-image{animation:cfBlurIn 1.2s infinite}
        .cf-effect-rgbSplit .cf-preview-image{animation:cfRgb 1s infinite}
        .cf-effect-flash .cf-preview-image{animation:cfFlashEffect 1.1s infinite}
        .cf-effect-zoom .cf-preview-image{animation:cfBeatZoom .8s infinite}
        .cf-effect-filmGrain .cf-preview-image{animation:cfGrain 1.3s infinite}
        .cf-effect-pixelate .cf-preview-image{animation:cfPixel 1.1s infinite}
        .cf-effect-noise .cf-preview-image{animation:cfNoise .9s infinite}
        .cf-effect-diamond .cf-preview-image{animation:cfDiamond 1.25s infinite}
        .cf-none .cf-preview-image,.cf-effect-none .cf-preview-image{animation:none}
        .cf-transition-plus{box-shadow:0 0 0 0 rgba(0,240,255,.5);animation:cfPlusPulse 1.7s infinite}
        @keyframes cfPlusPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,240,255,0)}50%{box-shadow:0 0 0 5px rgba(0,240,255,.08)}}
      `}</style>

      {effectsTargetId && (
        <div className="absolute top-10 right-3 z-50 w-[360px] max-h-[calc(100%-48px)] overflow-y-auto rounded-xl border border-[#334155] bg-[#11151D] shadow-2xl shadow-black/60 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-white">Transitions & Effects</p>
              <p className="text-[9px] text-[#64748B]">Live preview using the selected clip</p>
            </div>
            <button onClick={() => setEffectsTargetId(null)} className="p-1 rounded hover:bg-[#222733] text-[#94A3B8] hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>

          <div className="mb-3 rounded-lg border border-[#262C3A] bg-[#0B0D12] p-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-[#00F0FF]"><ImageIcon className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold">Clip preview</span></div>
            <div className="h-28 rounded-md overflow-hidden bg-[#151821] relative">
              {targetImage ? <img src={targetImage} alt="Selected clip preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#64748B] text-[10px]">Add a video or image to preview it here</div>}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2 text-[#00F0FF]"><Layers3 className="w-3.5 h-3.5" /><span className="text-[11px] font-bold">Transitions</span><span className="text-[8px] text-[#64748B] ml-auto">Animated</span></div>
            <div className="grid grid-cols-2 gap-2">
              {CREATOR_TRANSITIONS.map((trans) => {
                const target = clips.find((c) => c.id === effectsTargetId);
                const active = target?.transition === trans.id;
                return <button key={trans.id} onClick={() => applyTransition(effectsTargetId, trans.id)} className={`p-1.5 rounded-lg border text-left transition-all ${active ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#171B24] border-[#262C3A] text-white hover:border-[#00F0FF]/60'}`}>
                  <div className={previewClassForTransition(trans.id)}>
                    {targetImage ? <img src={targetImage} alt="" referrerPolicy="no-referrer" className="cf-preview-image" /> : <div className="cf-preview-fallback">No media</div>}
                  </div>
                  <div className="mt-1 text-[9px] font-semibold truncate">{trans.name}</div>
                </button>;
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#222733]">
            <div className="flex items-center gap-1.5 mb-2 text-[#00F0FF]"><Wand2 className="w-3.5 h-3.5" /><span className="text-[11px] font-bold">Effects</span><span className="text-[8px] text-[#64748B] ml-auto">Live clip preview</span></div>
            <div className="grid grid-cols-2 gap-2">
              {CREATOR_EFFECTS.map((effect) => {
                const target = clips.find((c) => c.id === effectsTargetId);
                const active = target?.effect === effect.id;
                return <button key={effect.id} onClick={() => applyEffect(effectsTargetId, effect.id)} className={`p-1.5 rounded-lg border text-left transition-all ${active ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#171B24] border-[#262C3A] text-white hover:border-[#00F0FF]/60'}`}>
                  <div className={previewClassForEffect(effect.id)}>
                    {targetImage ? <img src={targetImage} alt="" referrerPolicy="no-referrer" className="cf-preview-image" /> : <div className="cf-preview-fallback">No media</div>}
                  </div>
                  <div className="mt-1 text-[9px] font-semibold truncate">{effect.name}</div>
                </button>;
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
                        <div className="flex items-center gap-1.5 px-2 w-full h-full overflow-hidden">{clip.thumbnail && <img src={clip.thumbnail} alt={clip.name} referrerPolicy="no-referrer" className="h-full aspect-video object-cover rounded pointer-events-none" />}<span className="text-[11px] font-semibold text-white truncate drop-shadow-sm">{clip.type === 'text' ? clip.text || clip.name : clip.name}</span>{clip.effect && clip.effect !== 'none' && <Wand2 className="w-3 h-3 text-[#00F0FF] shrink-0" title="Effect applied" />}<span className="text-[9px] font-mono text-white/70 ml-auto shrink-0">{clip.duration.toFixed(1)}s</span></div>
                        <div onMouseDown={(e) => { e.stopPropagation(); setTrimmingHandle({ clipId: clip.id, type: 'end' }); }} className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-[#00F0FF] cursor-ew-resize opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"><div className="w-0.5 h-3 bg-white rounded-full" /></div>
                      </div>
                      {hasJunction && <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setEffectsTargetId(nextClip.id); }} className="cf-transition-plus absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-6 h-6 rounded-full bg-[#1B2430] border-2 border-[#CBD5E1] hover:border-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#0B0D12] text-white flex items-center justify-center shadow-lg transition-all" style={{ left: `${junctionLeft}px` }} title="Transitions & Effects"><Plus className="w-3.5 h-3.5" /></button>}
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

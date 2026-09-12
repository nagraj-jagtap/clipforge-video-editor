import React, { useEffect, useRef, useState } from 'react';
import { Scissors, Trash2, Copy, ZoomIn, ZoomOut, Magnet, Video, Music, Type, Smile, ChevronRight, ChevronLeft, Wand2, Layers3, Sparkles, UserRound } from 'lucide-react';
import { TimelineClip, TimelineTrack } from '../types';
import { formatTimecode } from '../utils/videoExporter';

interface TimelineProps {
  tracks: TimelineTrack[]; clips: TimelineClip[]; currentTime: number; duration: number; selectedClipId: string | null;
  onSelectClip: (id: string | null) => void; onSeek: (time: number) => void; onUpdateClips: (clips: TimelineClip[]) => void;
  onSplitClip: () => void; onTrimClipStart: () => void; onTrimClipEnd: () => void; onDuplicateClip: () => void; onDeleteClip: () => void;
}

type ToolTab = 'transitions' | 'video' | 'body';
type Category = { name: string; items: { name: string; id?: TimelineClip['transition'] | TimelineClip['effect'] | string; desc: string }[] };

const transitionCategories: Category[] = [
  { name: 'Basic & Movement', items: [
    { name: 'Clean Cut', id: 'none', desc: 'Instant cut' }, { name: 'Fade to Black', id: 'fade', desc: 'Smooth dark fade' }, { name: 'Fade to White', id: 'flash', desc: 'Bright flash fade' }, { name: 'Dissolve', id: 'dissolve', desc: 'Soft blend' },
    { name: 'Pull In / Pull Out', id: 'zoom', desc: 'Scale movement' }, { name: 'Whip Pan', id: 'slideLeft', desc: 'Fast lateral motion' }, { name: 'Spin', id: 'spin', desc: 'Rotational transition' }, { name: 'Tilt Up / Down', id: 'slideRight', desc: 'Directional motion' }
  ]},
  { name: 'Speed & Velocity', items: [
    { name: 'Speed Ramp Push', id: 'zoom', desc: 'Velocity push' }, { name: 'Motion Blur Swipe', id: 'blur', desc: 'Blurred movement' }, { name: 'Zoom In / Out', id: 'zoom', desc: 'Punch zoom' }, { name: 'Fast Forward Push', id: 'slideLeft', desc: 'Quick push' }
  ]},
  { name: 'Glitch & Digital Distortion', items: [
    { name: 'RGB Split', id: 'slideLeft', desc: 'Chromatic split' }, { name: 'Glitch Wave', id: 'wipe', desc: 'Digital wave' }, { name: 'Static Noise', id: 'blur', desc: 'Static distortion' }, { name: 'Pixelate Shift', id: 'zoom', desc: 'Pixel movement' }, { name: 'Flicker', id: 'flash', desc: 'Rapid flicker' }, { name: 'CRT Switch', id: 'wipe', desc: 'Screen switch' }
  ]},
  { name: 'Light & Color Effects', items: [
    { name: 'Glare', id: 'flash', desc: 'Lens glare' }, { name: 'Film Burn', id: 'fade', desc: 'Film burn' }, { name: 'Light Leak', id: 'flash', desc: 'Light leak' }, { name: 'Flash', id: 'flash', desc: 'Impact flash' }, { name: 'Glow', id: 'dissolve', desc: 'Soft glow' }, { name: 'Bloom', id: 'blur', desc: 'Bloom blend' }
  ]},
  { name: 'Masking & Shapes', items: [
    { name: 'Circle Reveal', id: 'wipe', desc: 'Shape reveal' }, { name: 'Star Reveal', id: 'wipe', desc: 'Shape reveal' }, { name: 'Heart Reveal', id: 'wipe', desc: 'Shape reveal' }, { name: 'Horizontal Banding', id: 'wipe', desc: 'Band reveal' }, { name: 'Blinds', id: 'wipe', desc: 'Slatted reveal' }, { name: 'Auto Cutout Transition', id: 'dissolve', desc: 'Subject-style blend' }
  ]},
  { name: '3D & Motion Graphics', items: [
    { name: '3D Cube', id: 'spin', desc: 'Cube-like spin' }, { name: 'Page Turn', id: 'slideRight', desc: 'Page motion' }, { name: 'Collage Swap', id: 'dissolve', desc: 'Collage blend' }, { name: 'Flip Card', id: 'spin', desc: 'Card flip' }
  ]}
];

const videoCategories: Category[] = [
  { name: 'Trending / Popular', items: [
    { name: 'Chromatic Blur', id: 'blur', desc: 'Color blur' }, { name: 'Edge Glow', id: 'flash', desc: 'Edge highlight' }, { name: 'Flash', id: 'flash', desc: 'Bright impact' }, { name: 'Bokeh Lights', id: 'filmGrain', desc: 'Soft light texture' }, { name: 'Soft Glow', id: 'blur', desc: 'Dreamy glow' }
  ]},
  { name: 'Retro & Film', items: [
    { name: 'Film Grain', id: 'filmGrain', desc: 'Analog grain' }, { name: 'VHS Glitch', id: 'vhs', desc: 'Tape distortion' }, { name: 'Light Leaks', id: 'flash', desc: 'Film light leaks' }, { name: 'Dust Particles', id: 'noise', desc: 'Dust texture' }, { name: 'Polaroid Frames', id: 'vintage', desc: 'Retro frame look' }, { name: 'Retro Camera', id: 'vhs', desc: 'Old camera look' }
  ]},
  { name: 'Glitch & Distortion', items: [
    { name: 'Signal Interference', id: 'noise', desc: 'Signal noise' }, { name: 'RGB Split', id: 'rgbSplit', desc: 'RGB offset' }, { name: 'Pixelate', id: 'pixelate', desc: 'Pixel blocks' }, { name: 'Fish-eye Distortion', id: 'zoom', desc: 'Lens distortion' }, { name: 'Mirror', id: 'rgbSplit', desc: 'Mirror pulse' }
  ]},
  { name: 'Nature & Atmospheric', items: [
    { name: 'Rain', id: 'noise', desc: 'Rain texture' }, { name: 'Snowfall', id: 'blur', desc: 'Snow atmosphere' }, { name: 'Smoke', id: 'vhs', desc: 'Soft haze' }, { name: 'Fire Rays', id: 'flash', desc: 'Warm energy' }, { name: 'Lens Flare', id: 'flash', desc: 'Lens light' }, { name: 'Fog', id: 'blur', desc: 'Atmospheric fog' }
  ]},
  { name: 'Blur & Focus', items: [
    { name: 'Motion Blur', id: 'blur', desc: 'Motion softness' }, { name: 'Radial Blur', id: 'blur', desc: 'Radial focus' }, { name: 'Tilt-Shift Blur', id: 'blur', desc: 'Miniature focus' }, { name: 'Halo Blur', id: 'blur', desc: 'Halo softness' }
  ]},
  { name: 'AI & Style Transfer', items: [
    { name: '3D Zoom', id: 'zoom', desc: 'Depth zoom' }, { name: 'Anime Style', id: 'vhs', desc: 'Anime-inspired grade' }, { name: 'Comic Book', id: 'pixelate', desc: 'Comic texture' }, { name: 'Cyberpunk', id: 'rgbSplit', desc: 'Neon digital grade' }, { name: 'Oil Painting Overlay', id: 'filmGrain', desc: 'Painterly texture' }
  ]}
];

const bodyCategories: Category[] = [
  { name: 'Body Outline & Neon', items: [
    { name: 'Electric Rays', desc: 'Tracked electric outline' }, { name: 'Neon Glow Outline', desc: 'Glowing subject edge' }, { name: 'Lightning Strokes', desc: 'Body-anchored lightning' }, { name: 'Laser Aura', desc: 'Laser body aura' }
  ]},
  { name: 'Face & Head Effects', items: [
    { name: 'Glowing Eyes', desc: 'Tracked eye glow' }, { name: 'Halo Ring', desc: 'Head-anchored halo' }, { name: 'Angel Wings', desc: 'Back-anchored wings' }, { name: 'Demon Horns', desc: 'Head-anchored horns' }, { name: 'Floating Crown', desc: 'Head crown tracker' }
  ]},
  { name: 'Clone & Motion Trails', items: [
    { name: 'Disappearing Clone', desc: 'Motion clone trail' }, { name: 'Shadow Trail', desc: 'Tracked shadow' }, { name: 'RGB Echo', desc: 'Chromatic motion echo' }, { name: 'Speed Phantom', desc: 'Velocity ghosting' }
  ]},
  { name: 'Energy & Aura', items: [
    { name: 'Super Saiyan Flame', desc: 'Energy flame aura' }, { name: 'Particle Burst', desc: 'Tracked particles' }, { name: 'Galaxy Sparkles', desc: 'Cosmic particles' }, { name: 'Cosmic Pulse', desc: 'Pulsing aura' }
  ]},
  { name: 'Background Isolation', items: [
    { name: 'Background Matrix', desc: 'Subject-isolated matrix' }, { name: 'Fire Ring Behind', desc: 'Behind-subject ring' }, { name: 'Grid Aura', desc: 'Tracked grid aura' }
  ]}
];

const iconForTrack = (type: TimelineTrack['type']) => type === 'video' ? <Video className="w-3.5 h-3.5" /> : type === 'audio' ? <Music className="w-3.5 h-3.5" /> : type === 'text' ? <Type className="w-3.5 h-3.5" /> : <Smile className="w-3.5 h-3.5" />;

export const Timeline: React.FC<TimelineProps> = (props) => {
  const { tracks, clips, currentTime, duration, selectedClipId, onSelectClip, onSeek, onUpdateClips, onSplitClip, onTrimClipStart, onTrimClipEnd, onDuplicateClip, onDeleteClip } = props;
  const [zoom, setZoom] = useState(60); const [snap, setSnap] = useState(true); const [dragId, setDragId] = useState<string | null>(null); const [dragX, setDragX] = useState(0); const [dragTime, setDragTime] = useState(0);
  const [trim, setTrim] = useState<{ id: string; side: 'start' | 'end' } | null>(null); const [toolTab, setToolTab] = useState<ToolTab>('transitions'); const [category, setCategory] = useState('All');
  const bodyRef = useRef<HTMLDivElement>(null); const timelineWidth = Math.max(900, duration * zoom + 220); const selectedClip = clips.find(c => c.id === selectedClipId) || null; const showEffects = !!selectedClip && (selectedClip.type === 'video' || selectedClip.type === 'image');

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragId) { let t = Math.max(0, dragTime + (e.clientX - dragX) / zoom); if (snap && Math.abs(t - currentTime) < .2) t = currentTime; onUpdateClips(clips.map(c => c.id === dragId ? { ...c, startTime: t } : c)); }
      if (trim && bodyRef.current) { const r = bodyRef.current.getBoundingClientRect(); const t = Math.max(0, (e.clientX - r.left + bodyRef.current.scrollLeft) / zoom); const c = clips.find(x => x.id === trim.id); if (!c) return; if (trim.side === 'end') onUpdateClips(clips.map(x => x.id === c.id ? { ...x, duration: Math.max(.2, t - x.startTime) } : x)); else { const end = c.startTime + c.duration; const ns = Math.min(end - .2, t); onUpdateClips(clips.map(x => x.id === c.id ? { ...x, startTime: ns, duration: end - ns, trimIn: Math.max(0, x.trimIn + ns - x.startTime) } : x)); } }
    };
    const up = () => { setDragId(null); setTrim(null); }; if (dragId || trim) { window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); } return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragId, trim, dragX, dragTime, zoom, snap, currentTime, clips, onUpdateClips]);

  const apply = (id: string) => {
    if (!selectedClip || !showEffects) return;
    if (toolTab === 'body') onUpdateClips(clips.map(c => c.id === selectedClip.id ? { ...c, bodyEffect: id } : c));
    else if (toolTab === 'transitions') onUpdateClips(clips.map(c => c.id === selectedClip.id ? { ...c, transition: id as TimelineClip['transition'], transitionDuration: id === 'none' ? 0 : .5 } : c));
    else onUpdateClips(clips.map(c => c.id === selectedClip.id ? { ...c, effect: id as TimelineClip['effect'], effectIntensity: id === 'none' ? 0 : 50 } : c));
  };

  const categories = toolTab === 'transitions' ? transitionCategories : toolTab === 'video' ? videoCategories : bodyCategories;
  const visibleCategories = category === 'All' ? categories : categories.filter(c => c.name === category);

  return <div className={`${showEffects ? 'h-[330px]' : 'h-[180px]'} bg-[#12141A] border-t border-[#222733] flex flex-col shrink-0 select-none overflow-hidden z-20 relative transition-[height] duration-150`}>
    <div className="h-10 bg-[#171B24] border-b border-[#222733] px-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1">
        <button onClick={onSplitClip} className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2430] hover:bg-[#00F0FF] hover:text-[#0B0D12] text-xs font-semibold text-white"><Scissors className="w-3.5 h-3.5"/>Split</button>
        <button onClick={onTrimClipStart} className="flex items-center gap-1 px-2 py-1 rounded bg-[#1F2430] text-xs text-[#CBD5E1]"><ChevronLeft className="w-3.5 h-3.5"/>Trim Start</button>
        <button onClick={onTrimClipEnd} className="flex items-center gap-1 px-2 py-1 rounded bg-[#1F2430] text-xs text-[#CBD5E1]">Trim End<ChevronRight className="w-3.5 h-3.5"/></button>
        <button onClick={onDuplicateClip} className="p-1.5 rounded bg-[#1F2430] text-[#CBD5E1]"><Copy className="w-3.5 h-3.5"/></button><button onClick={onDeleteClip} className="p-1.5 rounded bg-[#1F2430] text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
      </div>
      <div className="flex items-center gap-3"><button onClick={() => setSnap(!snap)} className={`p-1.5 rounded ${snap ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'text-[#64748B]'}`}><Magnet className="w-3.5 h-3.5"/></button><ZoomOut className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer" onClick={() => setZoom(Math.max(25, zoom - 15))}/><input type="range" min={25} max={150} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-20 accent-[#00F0FF]"/><ZoomIn className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer" onClick={() => setZoom(Math.min(150, zoom + 15))}/></div>
    </div>

    <div className="flex-1 flex overflow-hidden">
      <div className="w-36 bg-[#171B24] border-r border-[#222733] flex flex-col shrink-0"><div className="h-7 px-2 flex items-center text-[9px] uppercase tracking-wider text-[#64748B]">Tracks</div>{tracks.map(t => <div key={t.id} className="h-10 border-t border-[#222733] px-2 flex items-center gap-2 text-[#CBD5E1]">{iconForTrack(t.type)}<span className="truncate text-[10px]">{t.name}</span>{clips.some(c => c.trackId === t.id) && <span className="ml-auto text-[8px] text-[#64748B]">{clips.filter(c => c.trackId === t.id).length}</span>}</div>)}</div>
      <div ref={bodyRef} className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0E1015]" onMouseDown={e => { if (!bodyRef.current) return; const r = bodyRef.current.getBoundingClientRect(); onSeek(Math.max(0, Math.min(duration, (e.clientX-r.left+bodyRef.current.scrollLeft)/zoom))); }}>
        <div style={{width: timelineWidth}} className="h-full relative flex flex-col"><div className="h-7 bg-[#151821] border-b border-[#222733] relative">{Array.from({length: Math.ceil(duration)+1}).map((_,i)=><div key={i} className="absolute top-0 bottom-0 border-l border-[#262C3A] text-[8px] text-[#64748B] pl-1 pt-1" style={{left:i*zoom}}>{formatTimecode(i)}</div>)}</div><div className="flex-1">{tracks.map(t => <div key={t.id} className="h-10 border-b border-[#1F2430] relative">{clips.filter(c=>c.trackId===t.id).sort((a,b)=>a.startTime-b.startTime).map(c => <div key={c.id} onMouseDown={e=>{e.stopPropagation();onSelectClip(c.id);setDragId(c.id);setDragX(e.clientX);setDragTime(c.startTime);}} className={`absolute top-1 bottom-1 rounded-md overflow-hidden flex items-center cursor-move ${selectedClipId===c.id?'ring-2 ring-[#00F0FF] z-10':'hover:ring-1 hover:ring-[#38BDF8]'} ${c.type==='video'?'bg-[#1E293B] border border-[#334155]':c.type==='audio'?'bg-[#064E3B] border border-[#059669]':c.type==='text'?'bg-[#854D0E] border border-[#CA8A04]':'bg-[#831843] border border-[#DB2777]'}`} style={{left:c.startTime*zoom,width:Math.max(20,c.duration*zoom)}}><div onMouseDown={e=>{e.stopPropagation();setTrim({id:c.id,side:'start'})}} className="absolute left-0 inset-y-0 w-2 bg-white/10 hover:bg-[#00F0FF] opacity-0 group-hover:opacity-100"/><div className="flex items-center gap-1.5 px-2 w-full overflow-hidden">{c.thumbnail&&<img src={c.thumbnail} alt="" className="h-full aspect-video object-cover rounded"/>}<span className="text-[10px] text-white font-semibold truncate">{c.type==='text'?c.text||c.name:c.name}</span>{c.effect!=='none'&&<Wand2 className="w-3 h-3 text-[#00F0FF] shrink-0"/>}{c.bodyEffect&&<UserRound className="w-3 h-3 text-[#F472B6] shrink-0"/>}<span className="ml-auto text-[8px] text-white/60">{c.duration.toFixed(1)}s</span></div><div onMouseDown={e=>{e.stopPropagation();setTrim({id:c.id,side:'end'})}} className="absolute right-0 inset-y-0 w-2 bg-white/10 hover:bg-[#00F0FF] opacity-0 group-hover:opacity-100"/></div>)}</div>)}</div><div className="absolute top-0 bottom-0 w-px bg-[#EF4444] z-30 pointer-events-none" style={{left:currentTime*zoom}}/></div>
      </div>
    </div>

    {showEffects && <div className="h-[150px] border-t border-[#222733] bg-[#10131A] flex flex-col shrink-0">
      <div className="h-9 flex items-center gap-1 px-2 border-b border-[#222733]"><button onClick={()=>{setToolTab('transitions');setCategory('All')}} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold ${toolTab==='transitions'?'bg-[#00F0FF]/15 text-[#00F0FF]':'text-[#94A3B8]'}`}><Layers3 className="w-3.5 h-3.5"/>Transitions</button><button onClick={()=>{setToolTab('video');setCategory('All')}} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold ${toolTab==='video'?'bg-[#00F0FF]/15 text-[#00F0FF]':'text-[#94A3B8]'}`}><Wand2 className="w-3.5 h-3.5"/>Video Effects</button><button onClick={()=>{setToolTab('body');setCategory('All')}} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-semibold ${toolTab==='body'?'bg-[#00F0FF]/15 text-[#00F0FF]':'text-[#94A3B8]'}`}><UserRound className="w-3.5 h-3.5"/>Body Effects</button><span className="ml-auto text-[9px] text-[#64748B]">{selectedClip ? `Target: ${selectedClip.name}` : ''}</span></div>
      <div className="h-7 flex items-center gap-1 px-2 overflow-x-auto">{['All',...categories.map(c=>c.name)].map(x=><button key={x} onClick={()=>setCategory(x)} className={`px-2 py-1 rounded text-[8px] whitespace-nowrap ${category===x?'bg-[#273244] text-white':'text-[#64748B] hover:text-white'}`}>{x}</button>)}</div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-2 pb-2"><div className="flex gap-2 min-w-max">{visibleCategories.flatMap(c=>c.items).map((item,i)=><button key={`${item.name}-${i}`} onClick={()=>item.id&&apply(item.id)} className={`w-[112px] h-[74px] rounded-lg border p-2 text-left shrink-0 transition hover:border-[#00F0FF]/70 ${(selectedClip?.transition===item.id||selectedClip?.effect===item.id||selectedClip?.bodyEffect===item.id)?'border-[#00F0FF] bg-[#00F0FF]/10':'border-[#262C3A] bg-[#171B24]'}`}><div className="h-7 rounded bg-gradient-to-br from-[#202A3A] to-[#0B0D12] mb-1.5 flex items-center justify-center">{toolTab==='body'?<UserRound className="w-4 h-4 text-[#F472B6]"/>:toolTab==='transitions'?<Layers3 className="w-4 h-4 text-[#38BDF8]"/>:<Sparkles className="w-4 h-4 text-[#A78BFA]"/>}</div><div className="text-[9px] text-white font-semibold truncate">{item.name}</div><div className="text-[7px] text-[#64748B] truncate">{item.desc}</div></button>)}</div></div>
    </div>}
  </div>;
};
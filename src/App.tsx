import React, { useCallback, useEffect, useState } from 'react';
import { SidebarTab, AspectRatioType, MediaAsset, TimelineTrack, TimelineClip } from './types';
import { INITIAL_CREATOR_TRACKS, DEFAULT_ADJUSTMENTS } from './data/creatorAssets';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterPreview } from './components/CenterPreview';
import { RightPanel } from './components/RightPanel';
import { Timeline } from './components/Timeline';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [activeTab, setActiveTab] = useState<SidebarTab>('media');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [tracks] = useState<TimelineTrack[]>(INITIAL_CREATOR_TRACKS);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [historyStack, setHistoryStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const duration = Math.max(1, ...clips.map(c => c.startTime + c.duration));
  const selectedClip = clips.find(c => c.id === selectedClipId) ?? null;

  const pushHistory = useCallback((snapshot: TimelineClip[]) => {
    setHistoryStack(prev => [...prev.slice(-19), snapshot]);
    setRedoStack([]);
  }, []);

  const updateClips = useCallback((next: TimelineClip[]) => {
    setClips(prev => {
      if (prev === next) return prev;
      setHistoryStack(h => [...h.slice(-19), prev]);
      setRedoStack([]);
      return next;
    });
  }, []);

  const updateSelectedClip = useCallback((updates: Partial<TimelineClip>) => {
    if (!selectedClipId) return;
    setClips(prev => {
      setHistoryStack(h => [...h.slice(-19), prev]);
      setRedoStack([]);
      return prev.map(c => c.id === selectedClipId ? { ...c, ...updates } : c);
    });
  }, [selectedClipId]);

  const undo = useCallback(() => {
    setHistoryStack(prev => {
      if (!prev.length) return prev;
      const previous = prev[prev.length - 1];
      setClips(current => {
        setRedoStack(r => [current, ...r].slice(0, 20));
        return previous;
      });
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (!prev.length) return prev;
      const next = prev[0];
      setClips(current => {
        setHistoryStack(h => [...h.slice(-19), current]);
        return next;
      });
      return prev.slice(1);
    });
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (isPlaying) {
        setCurrentTime(t => {
          const next = t + delta;
          if (next >= duration) {
            if (isLooping) return 0;
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, duration, isLooping]);

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, time)));
  }, [duration]);

  const stepFrame = useCallback((delta: number) => seek(currentTime + delta), [currentTime, seek]);
  const playPause = useCallback(() => setIsPlaying(v => !v), []);
  const toggleLoop = useCallback(() => setIsLooping(v => !v), []);

  const addMediaToTimeline = useCallback((asset: MediaAsset) => {
    const videoClips = clips.filter(c => c.type === 'video');
    const start = videoClips.length ? Math.max(...videoClips.map(c => c.startTime + c.duration)) : 0;
    const clip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      trackId: 'track-video',
      assetId: asset.id,
      type: 'video',
      name: asset.name,
      startTime: start,
      duration: Math.min(asset.duration || 5, 60),
      trimIn: 0,
      sourceUrl: asset.type === 'video' ? asset.url : undefined,
      thumbnail: asset.thumbnail,
      scale: 100,
      rotation: 0,
      posX: 0,
      posY: 0,
      flipH: false,
      flipV: false,
      cropMode: 'fill',
      opacity: 100,
      speed: 1,
      volume: 100,
      muted: false,
      fadeIn: 0,
      fadeOut: 0,
      filter: 'none',
      effect: 'none',
      effectIntensity: 50,
      transition: 'none',
      transitionDuration: 0.5,
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };
    pushHistory(clips);
    setClips(prev => [...prev, clip]);
    setSelectedClipId(clip.id);
  }, [clips, pushHistory]);

  const addText = useCallback((text?: string, style?: Partial<TimelineClip>) => {
    const clip: TimelineClip = {
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      trackId: 'track-text',
      type: 'text',
      name: text || 'Heading Title',
      text: text || 'Heading Title',
      startTime: currentTime,
      duration: 3.5,
      trimIn: 0,
      scale: 100,
      rotation: 0,
      posX: 0,
      posY: -25,
      flipH: false,
      flipV: false,
      cropMode: 'fit',
      opacity: 100,
      speed: 1,
      volume: 0,
      muted: true,
      fadeIn: 0.2,
      fadeOut: 0.2,
      fontFamily: style?.fontFamily || 'Montserrat',
      fontSize: style?.fontSize || 34,
      textColor: style?.textColor || '#FFFFFF',
      isBold: style?.isBold ?? true,
      isItalic: style?.isItalic ?? false,
      strokeColor: style?.strokeColor || '#000000',
      strokeWidth: style?.strokeWidth ?? 3,
      shadowColor: style?.shadowColor || 'rgba(0,0,0,0.8)',
      shadowBlur: style?.shadowBlur ?? 8,
      textAnimation: style?.textAnimation || 'fade',
      filter: 'none',
      effect: 'none',
      effectIntensity: 0,
      transition: 'none',
      transitionDuration: 0,
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };
    pushHistory(clips);
    setClips(prev => [...prev, clip]);
    setSelectedClipId(clip.id);
  }, [clips, currentTime, pushHistory]);

  const addSticker = useCallback((content: string, category: 'emoji' | 'badge' | 'shape') => {
    const clip: TimelineClip = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      trackId: 'track-stickers',
      type: 'sticker',
      name: category === 'badge' ? content : `Sticker ${content}`,
      stickerContent: content,
      stickerCategory: category,
      startTime: currentTime,
      duration: 3,
      trimIn: 0,
      scale: 100,
      rotation: 0,
      posX: 0,
      posY: 0,
      flipH: false,
      flipV: false,
      cropMode: 'fit',
      opacity: 100,
      speed: 1,
      volume: 0,
      muted: true,
      fadeIn: 0.2,
      fadeOut: 0.2,
      filter: 'none',
      effect: 'none',
      effectIntensity: 0,
      transition: 'none',
      transitionDuration: 0,
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };
    pushHistory(clips);
    setClips(prev => [...prev, clip]);
    setSelectedClipId(clip.id);
  }, [clips, currentTime, pushHistory]);

  const addAudio = useCallback((audio: { name: string; url: string; duration: number }) => {
    const clip: TimelineClip = {
      id: `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      trackId: 'track-audio-music',
      type: 'audio',
      name: audio.name,
      startTime: currentTime,
      duration: audio.duration,
      trimIn: 0,
      sourceUrl: audio.url,
      scale: 100,
      rotation: 0,
      posX: 0,
      posY: 0,
      flipH: false,
      flipV: false,
      cropMode: 'fit',
      opacity: 100,
      speed: 1,
      volume: 85,
      muted: false,
      fadeIn: 0.5,
      fadeOut: 0.5,
      filter: 'none',
      effect: 'none',
      effectIntensity: 0,
      transition: 'none',
      transitionDuration: 0,
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };
    pushHistory(clips);
    setClips(prev => [...prev, clip]);
    setSelectedClipId(clip.id);
  }, [clips, currentTime, pushHistory]);

  const createVideoThumbnail = (video: HTMLVideoElement): string => {
    try {
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      const maxWidth = 640;
      const scale = Math.min(1, maxWidth / width);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.82);
    } catch {
      return '';
    }
  };

  const uploadMedia = useCallback((file: File) => {
    if (!file || file.size === 0) return;
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, '');
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.playsInline = true;
      v.src = url;
      v.onloadedmetadata = () => {
        const finish = () => {
          const thumbnail = createVideoThumbnail(v) || url;
          const asset: MediaAsset = {
            id,
            name,
            type: 'video',
            url,
            duration: Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 5,
            thumbnail,
            width: v.videoWidth,
            height: v.videoHeight
          };
          setMediaAssets(prev => [asset, ...prev]);
          addMediaToTimeline(asset);
          v.remove();
        };
        if (v.readyState >= 2) {
          if (v.duration > 0.15) {
            try { v.currentTime = Math.min(0.15, v.duration / 2); } catch { finish(); return; }
            v.onseeked = finish;
          } else {
            finish();
          }
        } else {
          v.onloadeddata = finish;
        }
      };
      v.onerror = () => URL.revokeObjectURL(url);
      return;
    }

    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const asset: MediaAsset = {
          id,
          name,
          type: 'image',
          url,
          duration: 5,
          thumbnail: url,
          width: img.width,
          height: img.height
        };
        setMediaAssets(prev => [asset, ...prev]);
        addMediaToTimeline(asset);
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
      return;
    }

    if (file.type.startsWith('audio/')) {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = url;
      audio.onloadedmetadata = () => {
        addAudio({ name, url, duration: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 15 });
      };
      audio.onerror = () => URL.revokeObjectURL(url);
    }
  }, [addAudio, addMediaToTimeline]);

  const split = useCallback(() => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) return;
    const offset = currentTime - selectedClip.startTime;
    const first = { ...selectedClip, duration: offset };
    const second = { ...selectedClip, id: `${selectedClip.id}-part2-${Date.now()}`, name: `${selectedClip.name} (Part 2)`, startTime: currentTime, duration: selectedClip.duration - offset, trimIn: selectedClip.trimIn + offset * (selectedClip.speed || 1) };
    pushHistory(clips);
    setClips(prev => prev.flatMap(c => c.id === selectedClip.id ? [first, second] : [c]));
    setSelectedClipId(second.id);
  }, [selectedClip, currentTime, clips, pushHistory]);

  const trimStart = useCallback(() => {
    if (!selectedClip || currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) return;
    const delta = currentTime - selectedClip.startTime;
    pushHistory(clips);
    setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, startTime: currentTime, duration: c.duration - delta, trimIn: c.trimIn + delta * (c.speed || 1) } : c));
  }, [selectedClip, currentTime, clips, pushHistory]);

  const trimEnd = useCallback(() => {
    if (!selectedClip || currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) return;
    pushHistory(clips);
    setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, duration: currentTime - c.startTime } : c));
  }, [selectedClip, currentTime, clips, pushHistory]);

  const duplicate = useCallback(() => {
    if (!selectedClip) return;
    const copy = { ...selectedClip, id: `${selectedClip.id}-copy-${Date.now()}`, name: `${selectedClip.name} (Copy)`, startTime: selectedClip.startTime + selectedClip.duration + 0.1 };
    pushHistory(clips);
    setClips(prev => [...prev, copy]);
    setSelectedClipId(copy.id);
  }, [selectedClip, clips, pushHistory]);

  const remove = useCallback(() => {
    if (!selectedClipId) return;
    pushHistory(clips);
    setClips(prev => prev.filter(c => c.id !== selectedClipId));
    setSelectedClipId(null);
  }, [selectedClipId, clips, pushHistory]);

  const save = useCallback(() => {
    try { localStorage.setItem('clipforge-project', JSON.stringify({ projectName, aspectRatio, clips })); } catch {}
  }, [projectName, aspectRatio, clips]);

  return (
    <div className="h-screen w-screen bg-[#0B0D12] text-white flex flex-col overflow-hidden font-sans">
      <Header projectName={projectName} onUpdateProjectName={setProjectName} aspectRatio={aspectRatio} onChangeAspectRatio={setAspectRatio} canUndo={historyStack.length > 0} canRedo={redoStack.length > 0} onUndo={undo} onRedo={redo} onSave={save} onOpenExport={() => setIsExportOpen(true)} />
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <LeftSidebar activeTab={activeTab} onSelectTab={setActiveTab} mediaAssets={mediaAssets} onUploadMedia={uploadMedia} onAddMediaToTimeline={addMediaToTimeline} onAddTextToTimeline={addText} onAddStickerToTimeline={addSticker} onAddAudioToTimeline={addAudio} selectedClip={selectedClip} onUpdateSelectedClip={updateSelectedClip} />
        <CenterPreview aspectRatio={aspectRatio} currentTime={currentTime} duration={duration} isPlaying={isPlaying} isLooping={isLooping} clips={clips} onPlayPause={playPause} onSeek={seek} onToggleLoop={toggleLoop} onStepFrame={stepFrame} />
        <RightPanel selectedClip={selectedClip} onUpdateClip={updateSelectedClip} onDuplicateClip={duplicate} onDeleteClip={remove} onSplitClip={split} aspectRatio={aspectRatio} onChangeAspectRatio={setAspectRatio} duration={duration} />
      </div>
      <Timeline tracks={tracks} clips={clips} currentTime={currentTime} duration={duration} selectedClipId={selectedClipId} onSelectClip={setSelectedClipId} onSeek={seek} onUpdateClips={updateClips} onSplitClip={split} onTrimClipStart={trimStart} onTrimClipEnd={trimEnd} onDuplicateClip={duplicate} onDeleteClip={remove} />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} clips={clips} duration={duration} aspectRatio={aspectRatio} projectName={projectName} />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SidebarTab, 
  AspectRatioType, 
  MediaAsset, 
  TimelineTrack, 
  TimelineClip 
} from './types';
import { 
  INITIAL_MEDIA_ASSETS, 
  INITIAL_CREATOR_TRACKS, 
  INITIAL_CREATOR_CLIPS, 
  DEFAULT_ADJUSTMENTS 
} from './data/creatorAssets';
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
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS.filter((a) => a.type === 'video'));
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL_CREATOR_TRACKS);
  const [clips, setClips] = useState<TimelineClip[]>(INITIAL_CREATOR_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(INITIAL_CREATOR_CLIPS[0]?.id || null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [historyStack, setHistoryStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const pushHistory = useCallback((currentClips: TimelineClip[]) => {
    setHistoryStack((prev) => [...prev.slice(-20), currentClips]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [clips, ...prev]);
    setHistoryStack((prev) => prev.slice(0, -1));
    setClips(previous);
  }, [historyStack, clips]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistoryStack((prev) => [...prev, clips]);
    setRedoStack((prev) => prev.slice(1));
    setClips(next);
  }, [redoStack, clips]);

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= duration) {
            if (isLooping) return 0;
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, duration, isLooping]);

  useEffect(() => {
    let maxEndTime = 10.0;
    for (const clip of clips) {
      const end = clip.startTime + clip.duration;
      if (end > maxEndTime) maxEndTime = end;
    }
    setDuration(Math.ceil(maxEndTime + 1));
  }, [clips]);

  const handleUpdateClips = useCallback((newClips: TimelineClip[]) => {
    pushHistory(clips);
    setClips(newClips);
  }, [clips, pushHistory]);

  const handleUpdateSelectedClip = useCallback((updates: Partial<TimelineClip>) => {
    if (!selectedClipId) return;
    pushHistory(clips);
    setClips((prev) => prev.map((c) => (c.id === selectedClipId ? { ...c, ...updates } : c)));
  }, [selectedClipId, clips, pushHistory]);

  const handleUploadMedia = (file: File) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');
    if (isVideo) {
      const v = document.createElement('video');
      v.src = url;
      v.onloadedmetadata = () => {
        const newAsset: MediaAsset = { id: `media-upload-${Date.now()}`, name: file.name.replace(/\.[^/.]+$/, ''), type: 'video', url, duration: v.duration || 5, thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&auto=format&fit=crop&q=80', width: v.videoWidth || 1080, height: v.videoHeight || 1920 };
        setMediaAssets((prev) => [newAsset, ...prev]);
        handleAddMediaToTimeline(newAsset);
      };
    } else if (file.type.startsWith('image')) {
      const img = new Image();
      img.onload = () => {
        const newAsset: MediaAsset = { id: `media-upload-${Date.now()}`, name: file.name.replace(/\.[^/.]+$/, ''), type: 'image', url, duration: 5, thumbnail: url, width: img.width, height: img.height };
        setMediaAssets((prev) => [newAsset, ...prev]);
        handleAddMediaToTimeline(newAsset);
      };
      img.src = url;
    } else if (isAudio) {
      handleAddAudioToTimeline({ name: file.name.replace(/\.[^/.]+$/, ''), url, duration: 15 });
    }
  };

  const handleAddMediaToTimeline = (asset: MediaAsset) => {
    pushHistory(clips);
    const videoClips = clips.filter((c) => c.type === 'video');
    let start = 0;
    if (videoClips.length > 0) {
      const last = videoClips[videoClips.length - 1];
      start = last.startTime + last.duration;
    }
    const newClip: TimelineClip = { id: `clip-video-${Date.now()}`, name: asset.name, type: 'video', trackId: 'track-video', startTime: start, duration: Math.min(10, asset.duration || 5), trimIn: 0, sourceUrl: asset.type === 'video' ? asset.url : undefined, thumbnail: asset.thumbnail, speed: 1, volume: 100, muted: false, fadeIn: 0, fadeOut: 0, cropMode: 'fill', scale: 100, rotation: 0, flipH: false, flipV: false, opacity: 100, filter: 'none', effect: 'none', effectIntensity: 50, transition: 'none', transitionDuration: 0.5, adjustments: { ...DEFAULT_ADJUSTMENTS }, posX: 0, posY: 0 };
    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
  };

  const handleAddTextToTimeline = (presetText?: string, styleOptions?: Partial<TimelineClip>) => {
    pushHistory(clips);
    const newTextClip: TimelineClip = { id: `clip-text-${Date.now()}`, name: presetText || 'Heading Title', type: 'text', trackId: 'track-text', startTime: currentTime, duration: 3.5, trimIn: 0, text: presetText || 'Heading Title', fontFamily: styleOptions?.fontFamily || 'Montserrat', fontSize: styleOptions?.fontSize || 34, textColor: styleOptions?.textColor || '#FFFFFF', isBold: styleOptions?.isBold ?? true, isItalic: styleOptions?.isItalic ?? false, strokeColor: styleOptions?.strokeColor || '#000000', strokeWidth: styleOptions?.strokeWidth ?? 2, shadowColor: styleOptions?.shadowColor || 'rgba(0,0,0,0.8)', shadowBlur: styleOptions?.shadowBlur ?? 8, textAnimation: styleOptions?.textAnimation || 'fade', posX: 0, posY: 25, scale: 100, rotation: 0, flipH: false, flipV: false, opacity: 100, speed: 1, volume: 100, muted: false, fadeIn: 0, fadeOut: 0, cropMode: 'fill', filter: 'none', effect: 'none', effectIntensity: 50, transition: 'none', transitionDuration: 0.5, adjustments: { ...DEFAULT_ADJUSTMENTS } };
    setClips((prev) => [...prev, newTextClip]);
    setSelectedClipId(newTextClip.id);
  };

  const handleAddStickerToTimeline = (sticker: string, category: 'emoji' | 'badge' | 'shape') => {
    pushHistory(clips);
    const newStickerClip: TimelineClip = { id: `clip-sticker-${Date.now()}`, name: category === 'badge' ? sticker : `Sticker ${sticker}`, type: 'sticker', trackId: 'track-stickers', startTime: currentTime, duration: 3, trimIn: 0, stickerContent: sticker, stickerCategory: category, scale: 100, rotation: 0, posX: 0, posY: 0, flipH: false, flipV: false, opacity: 100, speed: 1, volume: 100, muted: false, fadeIn: 0, fadeOut: 0, cropMode: 'fill', filter: 'none', effect: 'none', effectIntensity: 50, transition: 'none', transitionDuration: 0.5, adjustments: { ...DEFAULT_ADJUSTMENTS } };
    setClips((prev) => [...prev, newStickerClip]);
    setSelectedClipId(newStickerClip.id);
  };

  const handleAddAudioToTimeline = (audioItem: { name: string; url: string; duration: number }) => {
    pushHistory(clips);
    const newAudioClip: TimelineClip = { id: `clip-audio-${Date.now()}`, name: audioItem.name, type: 'audio', trackId: 'track-audio-music', startTime: currentTime, duration: audioItem.duration, trimIn: 0, sourceUrl: audioItem.url, volume: 85, muted: false, fadeIn: 0.5, fadeOut: 0.5, speed: 1, cropMode: 'fill', scale: 100, rotation: 0, flipH: false, flipV: false, opacity: 100, filter: 'none', effect: 'none', effectIntensity: 50, transition: 'none', transitionDuration: 0.5, adjustments: { ...DEFAULT_ADJUSTMENTS }, posX: 0, posY: 0 };
    setClips((prev) => [...prev, newAudioClip]);
    setSelectedClipId(newAudioClip.id);
  };

  const handleSplitClip = useCallback(() => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) return;
    pushHistory(clips);
    const splitOffset = currentTime - selectedClip.startTime;
    const clip1: TimelineClip = { ...selectedClip, duration: splitOffset };
    const clip2: TimelineClip = { ...selectedClip, id: `${selectedClip.id}-split-${Date.now()}`, name: `${selectedClip.name} (Part 2)`, startTime: currentTime, duration: selectedClip.duration - splitOffset, trimIn: selectedClip.trimIn + splitOffset * (selectedClip.speed || 1) };
    setClips((prev) => prev.map((c) => (c.id === selectedClip.id ? clip1 : c)).concat(clip2));
    setSelectedClipId(clip2.id);
  }, [selectedClip, currentTime, clips, pushHistory]);

  const handleTrimClipStart = useCallback(() => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) return;
    pushHistory(clips);
    const trimDelta = currentTime - selectedClip.startTime;
    setClips((prev) => prev.map((c) => c.id === selectedClip.id ? { ...c, startTime: currentTime, duration: c.duration - trimDelta, trimIn: c.trimIn + trimDelta * (c.speed || 1) } : c));
  }, [selectedClip, currentTime, clips, pushHistory]);

  const handleTrimClipEnd = useCallback(() => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) return;
    pushHistory(clips);
    setClips((prev) => prev.map((c) => c.id === selectedClip.id ? { ...c, duration: currentTime - c.startTime } : c));
  }, [selectedClip, currentTime, clips, pushHistory]);

  const handleDuplicateClip = useCallback(() => {
    if (!selectedClip) return;
    pushHistory(clips);
    const duplicated: TimelineClip = { ...selectedClip, id: `${selectedClip.id}-copy-${Date.now()}`, name: `${selectedClip.name} (Copy)`, startTime: selectedClip.startTime + selectedClip.duration + 0.1 };
    setClips((prev) => [...prev, duplicated]);
    setSelectedClipId(duplicated.id);
  }, [selectedClip, clips, pushHistory]);

  const handleDeleteClip = useCallback(() => {
    if (!selectedClipId) return;
    pushHistory(clips);
    setClips((prev) => prev.filter((c) => c.id !== selectedClipId));
    setSelectedClipId(null);
  }, [selectedClipId, clips, pushHistory]);

  const handleStepFrame = (delta: number) => setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + delta)));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying((p) => !p); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); handleStepFrame(-1 / 30); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); handleStepFrame(1 / 30); }
      else if (e.code === 'Delete' || e.code === 'Backspace') { e.preventDefault(); handleDeleteClip(); }
      else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handleSplitClip(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); handleRedo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); handleDuplicateClip(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteClip, handleSplitClip, handleUndo, handleRedo, handleDuplicateClip]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0D12] text-white overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <Header projectName={projectName} onUpdateProjectName={setProjectName} aspectRatio={aspectRatio} onChangeAspectRatio={setAspectRatio} canUndo={historyStack.length > 0} canRedo={redoStack.length > 0} onUndo={handleUndo} onRedo={handleRedo} onSave={() => localStorage.setItem('clipforge_project', JSON.stringify({ projectName, clips, aspectRatio }))} onOpenExport={() => setIsExportOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar activeTab={activeTab} onSelectTab={setActiveTab} mediaAssets={mediaAssets} onUploadMedia={handleUploadMedia} onAddMediaToTimeline={handleAddMediaToTimeline} onAddTextToTimeline={handleAddTextToTimeline} onAddStickerToTimeline={handleAddStickerToTimeline} onAddAudioToTimeline={handleAddAudioToTimeline} selectedClip={selectedClip} onUpdateSelectedClip={handleUpdateSelectedClip} />
        <div className="cf-preview-shell min-w-0 flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-[#0B0D12]">
          <div className="cf-preview-scaled w-[133.333%] h-[133.333%] scale-75 origin-center shrink-0">
            <CenterPreview aspectRatio={aspectRatio} currentTime={currentTime} duration={duration} isPlaying={isPlaying} isLooping={isLooping} clips={clips} onPlayPause={() => setIsPlaying(!isPlaying)} onSeek={setCurrentTime} onToggleLoop={() => setIsLooping(!isLooping)} onStepFrame={handleStepFrame} />
          </div>
        </div>
        <RightPanel selectedClip={selectedClip} onUpdateClip={handleUpdateSelectedClip} onDuplicateClip={handleDuplicateClip} onDeleteClip={handleDeleteClip} onSplitClip={handleSplitClip} aspectRatio={aspectRatio} onChangeAspectRatio={setAspectRatio} duration={duration} />
      </div>
      <Timeline tracks={tracks} clips={clips} currentTime={currentTime} duration={duration} selectedClipId={selectedClipId} onSelectClip={setSelectedClipId} onSeek={setCurrentTime} onUpdateClips={handleUpdateClips} onSplitClip={handleSplitClip} onTrimClipStart={handleTrimClipStart} onTrimClipEnd={handleTrimClipEnd} onDuplicateClip={handleDuplicateClip} onDeleteClip={handleDeleteClip} />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} clips={clips} duration={duration} aspectRatio={aspectRatio} projectName={projectName} />
    </div>
  );
}

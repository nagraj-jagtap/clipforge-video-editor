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
  // Project settings
  const [projectName, setProjectName] = useState('My Viral Short #1');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [activeTab, setActiveTab] = useState<SidebarTab>('media');

  // Media Library
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS.filter((a) => a.type === 'video'));

  // Multi-track state
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL_CREATOR_TRACKS);
  const [clips, setClips] = useState<TimelineClip[]>(INITIAL_CREATOR_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-v1');

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  // Undo / Redo history stacks
  const [historyStack, setHistoryStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Push state to undo stack
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

  // Selected clip helper
  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  // Real-time playback loop
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
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, duration, isLooping]);

  // Recalculate duration whenever clips change
  useEffect(() => {
    let maxEndTime = 10.0;
    for (const clip of clips) {
      const end = clip.startTime + clip.duration;
      if (end > maxEndTime) {
        maxEndTime = end;
      }
    }
    setDuration(Math.ceil(maxEndTime + 1));
  }, [clips]);

  // Update clips with undo record
  const handleUpdateClips = useCallback((newClips: TimelineClip[]) => {
    pushHistory(clips);
    setClips(newClips);
  }, [clips, pushHistory]);

  // Update selected clip properties
  const handleUpdateSelectedClip = useCallback((updates: Partial<TimelineClip>) => {
    if (!selectedClipId) return;
    pushHistory(clips);
    setClips((prev) =>
      prev.map((c) => (c.id === selectedClipId ? { ...c, ...updates } : c))
    );
  }, [selectedClipId, clips, pushHistory]);

  // Upload Media File
  const handleUploadMedia = (file: File) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');

    if (isVideo) {
      const v = document.createElement('video');
      v.src = url;
      v.onloadedmetadata = () => {
        const newAsset: MediaAsset = {
          id: `media-upload-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'video',
          url,
          duration: v.duration || 5.0,
          thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&auto=format&fit=crop&q=80',
          width: v.videoWidth || 1080,
          height: v.videoHeight || 1920
        };
        setMediaAssets((prev) => [newAsset, ...prev]);
        handleAddMediaToTimeline(newAsset);
      };
    } else if (isAudio) {
      handleAddAudioToTimeline({
        name: file.name.replace(/\.[^/.]+$/, ''),
        url,
        duration: 15.0
      });
    }
  };

  // Add Media Clip to timeline
  const handleAddMediaToTimeline = (asset: MediaAsset) => {
    pushHistory(clips);
    // Find latest video clip end time
    const videoClips = clips.filter((c) => c.type === 'video');
    let start = 0;
    if (videoClips.length > 0) {
      const last = videoClips[videoClips.length - 1];
      start = last.startTime + last.duration;
    }

    const newClip: TimelineClip = {
      id: `clip-video-${Date.now()}`,
      name: asset.name,
      type: 'video',
      trackId: 'track-v1',
      startTime: start,
      duration: Math.min(10.0, asset.duration || 5.0),
      trimIn: 0,
      sourceUrl: asset.url,
      thumbnail: asset.thumbnail,
      speed: 1.0,
      volume: 100,
      muted: false,
      fadeIn: 0,
      fadeOut: 0,
      cropMode: 'fill',
      scale: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      opacity: 100,
      filter: 'none',
      effect: 'none',
      effectIntensity: 50,
      transition: 'none',
      transitionDuration: 0.5,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      posX: 0,
      posY: 0
    };

    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
  };

  // Add Text to timeline
  const handleAddTextToTimeline = (presetText?: string, styleOptions?: Partial<TimelineClip>) => {
    pushHistory(clips);
    const newTextClip: TimelineClip = {
      id: `clip-text-${Date.now()}`,
      name: presetText || 'Heading Title',
      type: 'text',
      trackId: 'track-txt1',
      startTime: currentTime,
      duration: 3.5,
      trimIn: 0,
      text: presetText || 'Heading Title',
      fontFamily: styleOptions?.fontFamily || 'Montserrat',
      fontSize: styleOptions?.fontSize || 34,
      textColor: styleOptions?.textColor || '#FFFFFF',
      isBold: styleOptions?.isBold ?? true,
      isItalic: styleOptions?.isItalic ?? false,
      strokeColor: styleOptions?.strokeColor || '#000000',
      strokeWidth: styleOptions?.strokeWidth ?? 2,
      shadowColor: styleOptions?.shadowColor || 'rgba(0,0,0,0.8)',
      shadowBlur: styleOptions?.shadowBlur ?? 8,
      textAnimation: styleOptions?.textAnimation || 'fade',
      posX: 0,
      posY: 25,
      scale: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      opacity: 100,
      speed: 1.0,
      volume: 100,
      muted: false,
      fadeIn: 0,
      fadeOut: 0,
      cropMode: 'fill',
      filter: 'none',
      effect: 'none',
      effectIntensity: 50,
      transition: 'none',
      transitionDuration: 0.5,
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };

    setClips((prev) => [...prev, newTextClip]);
    setSelectedClipId(newTextClip.id);
  };

  // Add Sticker to timeline
  const handleAddStickerToTimeline = (sticker: string, category: 'emoji' | 'badge' | 'shape') => {
    pushHistory(clips);
    const newStickerClip: TimelineClip = {
      id: `clip-sticker-${Date.now()}`,
      name: category === 'badge' ? sticker : `Sticker ${sticker}`,
      type: 'sticker',
      trackId: 'track-stk1',
      startTime: currentTime,
      duration: 3.0,
      trimIn: 0,
      stickerContent: sticker,
      stickerCategory: category,
      scale: 100,
      rotation: 0,
      posX: 0,
      posY: 0,
      flipH: false,
      flipV: false,
      opacity: 100,
      speed: 1.0,
      volume: 100,
      muted: false,
      fadeIn: 0,
      fadeOut: 0,
      cropMode: 'fill',
      filter: 'none',
      effect: 'none',
      effectIntensity: 50,
      transition: 'none',
      transitionDuration: 0.5,
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };

    setClips((prev) => [...prev, newStickerClip]);
    setSelectedClipId(newStickerClip.id);
  };

  // Add Audio to timeline
  const handleAddAudioToTimeline = (audioItem: { name: string; url: string; duration: number }) => {
    pushHistory(clips);
    const newAudioClip: TimelineClip = {
      id: `clip-audio-${Date.now()}`,
      name: audioItem.name,
      type: 'audio',
      trackId: 'track-a1',
      startTime: currentTime,
      duration: audioItem.duration,
      trimIn: 0,
      sourceUrl: audioItem.url,
      volume: 85,
      muted: false,
      fadeIn: 0.5,
      fadeOut: 0.5,
      speed: 1.0,
      cropMode: 'fill',
      scale: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      opacity: 100,
      filter: 'none',
      effect: 'none',
      effectIntensity: 50,
      transition: 'none',
      transitionDuration: 0.5,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      posX: 0,
      posY: 0
    };

    setClips((prev) => [...prev, newAudioClip]);
    setSelectedClipId(newAudioClip.id);
  };

  // Split selected clip at playhead
  const handleSplitClip = useCallback(() => {
    if (!selectedClip) return;
    // Check if playhead intersects the clip
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) {
      return;
    }

    pushHistory(clips);

    const splitOffset = currentTime - selectedClip.startTime;
    const clip1: TimelineClip = {
      ...selectedClip,
      duration: splitOffset
    };

    const clip2: TimelineClip = {
      ...selectedClip,
      id: `${selectedClip.id}-split-${Date.now()}`,
      name: `${selectedClip.name} (Part 2)`,
      startTime: currentTime,
      duration: selectedClip.duration - splitOffset,
      trimIn: selectedClip.trimIn + splitOffset * (selectedClip.speed || 1.0)
    };

    setClips((prev) =>
      prev.map((c) => (c.id === selectedClip.id ? clip1 : c)).concat(clip2)
    );
    setSelectedClipId(clip2.id);
  }, [selectedClip, currentTime, clips, pushHistory]);

  // Trim Start to playhead
  const handleTrimClipStart = useCallback(() => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) {
      return;
    }
    pushHistory(clips);
    const trimDelta = currentTime - selectedClip.startTime;
    const newDuration = selectedClip.duration - trimDelta;

    setClips((prev) =>
      prev.map((c) =>
        c.id === selectedClip.id
          ? {
              ...c,
              startTime: currentTime,
              duration: newDuration,
              trimIn: c.trimIn + trimDelta * (c.speed || 1.0)
            }
          : c
      )
    );
  }, [selectedClip, currentTime, clips, pushHistory]);

  // Trim End to playhead
  const handleTrimClipEnd = useCallback(() => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) {
      return;
    }
    pushHistory(clips);
    const newDuration = currentTime - selectedClip.startTime;

    setClips((prev) =>
      prev.map((c) =>
        c.id === selectedClip.id
          ? {
              ...c,
              duration: newDuration
            }
          : c
      )
    );
  }, [selectedClip, currentTime, clips, pushHistory]);

  // Duplicate selected clip
  const handleDuplicateClip = useCallback(() => {
    if (!selectedClip) return;
    pushHistory(clips);

    const duplicated: TimelineClip = {
      ...selectedClip,
      id: `${selectedClip.id}-copy-${Date.now()}`,
      name: `${selectedClip.name} (Copy)`,
      startTime: selectedClip.startTime + selectedClip.duration + 0.1
    };

    setClips((prev) => [...prev, duplicated]);
    setSelectedClipId(duplicated.id);
  }, [selectedClip, clips, pushHistory]);

  // Delete selected clip
  const handleDeleteClip = useCallback(() => {
    if (!selectedClipId) return;
    pushHistory(clips);
    setClips((prev) => prev.filter((c) => c.id !== selectedClipId));
    setSelectedClipId(null);
  }, [selectedClipId, clips, pushHistory]);

  // Step Frame
  const handleStepFrame = (delta: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + delta)));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      // Arrow Left / Right: Frame step
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepFrame(-1 / 30);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepFrame(1 / 30);
      }
      // Delete or Backspace
      else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        handleDeleteClip();
      }
      // 'S' key: Split at playhead
      else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleSplitClip();
      }
      // Ctrl+Z: Undo
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+D: Duplicate
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateClip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteClip, handleSplitClip, handleUndo, handleRedo, handleDuplicateClip]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0D12] text-white overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <Header
        projectName={projectName}
        onUpdateProjectName={setProjectName}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        canUndo={historyStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => {
          localStorage.setItem('clipforge_project', JSON.stringify({ projectName, clips, aspectRatio }));
        }}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Center Section */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Media, Audio, Text, Stickers, Effects, Transitions, Filters, Adjust) */}
        <LeftSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mediaAssets={mediaAssets}
          onUploadMedia={handleUploadMedia}
          onAddMediaToTimeline={handleAddMediaToTimeline}
          onAddTextToTimeline={handleAddTextToTimeline}
          onAddStickerToTimeline={handleAddStickerToTimeline}
          onAddAudioToTimeline={handleAddAudioToTimeline}
          selectedClip={selectedClip}
          onUpdateSelectedClip={handleUpdateSelectedClip}
        />

        {/* Center Live Video Preview Stage */}
        <CenterPreview
          aspectRatio={aspectRatio}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isLooping={isLooping}
          clips={clips}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onSeek={setCurrentTime}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onStepFrame={handleStepFrame}
        />

        {/* Right Inspector Panel */}
        <RightPanel
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateSelectedClip}
          onDuplicateClip={handleDuplicateClip}
          onDeleteClip={handleDeleteClip}
          onSplitClip={handleSplitClip}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          duration={duration}
        />
      </div>

      {/* Bottom Multi-Track Timeline */}
      <Timeline
        tracks={tracks}
        clips={clips}
        currentTime={currentTime}
        duration={duration}
        selectedClipId={selectedClipId}
        onSelectClip={setSelectedClipId}
        onSeek={setCurrentTime}
        onUpdateClips={handleUpdateClips}
        onSplitClip={handleSplitClip}
        onTrimClipStart={handleTrimClipStart}
        onTrimClipEnd={handleTrimClipEnd}
        onDuplicateClip={handleDuplicateClip}
        onDeleteClip={handleDeleteClip}
      />

      {/* Real Browser Video Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        clips={clips}
        duration={duration}
        aspectRatio={aspectRatio}
        projectName={projectName}
      />
    </div>
  );
}

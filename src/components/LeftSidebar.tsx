/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FolderPlus, 
  Music, 
  Type, 
  Smile, 
  Wand2, 
  SlidersHorizontal, 
  Layers, 
  Palette, 
  Upload, 
  Plus, 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  SidebarTab, 
  MediaAsset, 
  VideoEffect, 
  VideoFilter, 
  VideoTransition, 
  ColorAdjustments,
  TimelineClip
} from '../types';
import { 
  INITIAL_MEDIA_ASSETS, 
  CREATOR_EFFECTS, 
  CREATOR_FILTERS, 
  CREATOR_TRANSITIONS, 
  CREATOR_STICKERS,
  CREATOR_SOUND_EFFECTS,
  DEFAULT_ADJUSTMENTS
} from '../data/creatorAssets';

interface LeftSidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  mediaAssets: MediaAsset[];
  onUploadMedia: (file: File) => void;
  onAddMediaToTimeline: (asset: MediaAsset) => void;
  onAddTextToTimeline: (presetText?: string, styleOptions?: Partial<TimelineClip>) => void;
  onAddStickerToTimeline: (sticker: string, category: 'emoji' | 'badge' | 'shape') => void;
  onAddAudioToTimeline: (audioItem: { name: string; url: string; duration: number }) => void;
  selectedClip: TimelineClip | null;
  onUpdateSelectedClip: (updates: Partial<TimelineClip>) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onSelectTab,
  mediaAssets,
  onUploadMedia,
  onAddMediaToTimeline,
  onAddTextToTimeline,
  onAddStickerToTimeline,
  onAddAudioToTimeline,
  selectedClip,
  onUpdateSelectedClip
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Audio preview playback toggle
  const toggleAudioPreview = (url: string) => {
    if (playingPreviewUrl === url) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPlayingPreviewUrl(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.onended = () => setPlayingPreviewUrl(null);
      audio.play().catch(() => {});
      previewAudioRef.current = audio;
      setPlayingPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadMedia(e.dataTransfer.files[0]);
    }
  };

  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'media', label: 'Media', icon: <FolderPlus className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'stickers', label: 'Stickers', icon: <Smile className="w-4 h-4" /> },
    { id: 'effects', label: 'Effects', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'transitions', label: 'Transitions', icon: <Layers className="w-4 h-4" /> },
    { id: 'filters', label: 'Filters', icon: <Palette className="w-4 h-4" /> },
    { id: 'adjust', label: 'Adjust', icon: <SlidersHorizontal className="w-4 h-4" /> }
  ];

  return (
    <div className="w-80 bg-[#12141A] border-r border-[#222733] flex shrink-0 h-full overflow-hidden select-none">
      {/* Tab Navigation Rail */}
      <div className="w-16 bg-[#0E1015] border-r border-[#222733] flex flex-col items-center py-2 space-y-1 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`w-14 py-2.5 rounded-lg flex flex-col items-center justify-center space-y-1 text-[10px] font-medium transition-all ${
                isActive
                  ? 'bg-[#1C212D] text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161922]'
              }`}
            >
              {tab.icon}
              <span className="tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Drawer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12141A]">
        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Media Library</h3>
              <span className="text-[10px] text-[#94A3B8]">{mediaAssets.length} clips</span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#00F0FF] bg-[#00F0FF]/10'
                  : 'border-[#262C3A] hover:border-[#384257] bg-[#171B24]'
              }`}
            >
              <Upload className="w-6 h-6 text-[#00F0FF] mb-2" />
              <p className="text-xs font-semibold text-white">Upload MP4, WebM or MOV</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Drag & drop or browse files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onUploadMedia(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Asset Items Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Creator Clips</span>
              <div className="grid grid-cols-2 gap-2">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative bg-[#171B24] border border-[#222733] hover:border-[#00F0FF] rounded-lg overflow-hidden transition-all flex flex-col"
                  >
                    <div className="aspect-video bg-black relative overflow-hidden">
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                        {asset.duration.toFixed(1)}s
                      </span>
                    </div>

                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-white truncate max-w-[90px]">
                        {asset.name}
                      </span>
                      <button
                        onClick={() => onAddMediaToTimeline(asset)}
                        className="p-1 rounded-md bg-[#00F0FF] hover:brightness-110 text-[#0B0D12] transition-colors"
                        title="Add to timeline"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Audio & Sound FX</h3>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1C212D] text-[10px] text-[#00F0FF] hover:bg-[#252C3C] border border-[#00F0FF]/30"
              >
                <Upload className="w-3 h-3" />
                <span>Upload MP3</span>
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const url = URL.createObjectURL(file);
                    onAddAudioToTimeline({
                      name: file.name.replace(/\.[^/.]+$/, ''),
                      url,
                      duration: 15.0
                    });
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Trending Royalty-Free Music */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Royalty-Free Beats</span>
              {INITIAL_MEDIA_ASSETS.filter((a) => a.type === 'audio').map((track) => {
                const isPlaying = playingPreviewUrl === track.url;
                return (
                  <div
                    key={track.id}
                    className="p-2.5 bg-[#171B24] border border-[#222733] hover:border-[#384257] rounded-lg flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 truncate max-w-[170px]">
                      <button
                        onClick={() => toggleAudioPreview(track.url)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isPlaying ? 'bg-[#00F0FF] text-black' : 'bg-[#222733] text-white hover:bg-[#2E3547]'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{track.name}</p>
                        <p className="text-[10px] text-[#94A3B8]">{track.category || 'Creator BGM'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddAudioToTimeline({ name: track.name, url: track.url, duration: track.duration })}
                      className="p-1.5 rounded-md bg-[#1F2430] hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] transition-colors"
                      title="Add to timeline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sound FX Library */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Creator Sound Effects</span>
              <div className="space-y-1.5">
                {CREATOR_SOUND_EFFECTS.map((sfx) => {
                  const isPlaying = playingPreviewUrl === sfx.url;
                  return (
                    <div
                      key={sfx.id}
                      className="p-2 bg-[#171B24] border border-[#222733] hover:border-[#384257] rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <button
                          onClick={() => toggleAudioPreview(sfx.url)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isPlaying ? 'bg-[#00F0FF] text-black' : 'bg-[#222733] text-white'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                        </button>
                        <span className="text-xs text-white truncate">{sfx.name}</span>
                      </div>

                      <button
                        onClick={() => onAddAudioToTimeline({ name: sfx.name, url: sfx.url, duration: sfx.duration })}
                        className="p-1 rounded bg-[#1F2430] hover:bg-[#00F0FF] hover:text-black text-[#94A3B8] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Text & Titles</h3>
            </div>

            {/* Quick Add Simple Text */}
            <button
              onClick={() => onAddTextToTimeline('Double Click to Edit')}
              className="w-full py-2.5 rounded-lg bg-[#1C212D] hover:bg-[#252C3C] border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Default Text</span>
            </button>

            {/* Trending Creator Text Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Viral Text Styles</span>
              <div className="space-y-2">
                {/* Preset 1: Viral Hook */}
                <div
                  onClick={() =>
                    onAddTextToTimeline('WAIT FOR THE DROP 🔥', {
                      fontFamily: 'Montserrat',
                      fontSize: 36,
                      textColor: '#FFE600',
                      isBold: true,
                      strokeColor: '#000000',
                      strokeWidth: 4,
                      textAnimation: 'zoom'
                    })
                  }
                  className="p-3 bg-[#171B24] border border-[#222733] hover:border-[#00F0FF] rounded-lg cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="font-['Montserrat'] font-extrabold text-sm text-[#FFE600] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    WAIT FOR THE DROP 🔥
                  </span>
                  <Plus className="w-4 h-4 text-[#94A3B8]" />
                </div>

                {/* Preset 2: Minimal Aesthetic Subtitle */}
                <div
                  onClick={() =>
                    onAddTextToTimeline('aesthetic day in my life ✨', {
                      fontFamily: 'Caveat',
                      fontSize: 32,
                      textColor: '#FFFFFF',
                      isBold: false,
                      strokeWidth: 0,
                      textAnimation: 'fade'
                    })
                  }
                  className="p-3 bg-[#171B24] border border-[#222733] hover:border-[#00F0FF] rounded-lg cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="font-['Caveat'] text-base text-white">
                    aesthetic day in my life ✨
                  </span>
                  <Plus className="w-4 h-4 text-[#94A3B8]" />
                </div>

                {/* Preset 3: Impact Punchline */}
                <div
                  onClick={() =>
                    onAddTextToTimeline('NO WAY THIS HAPPENED 😱', {
                      fontFamily: 'Bebas Neue',
                      fontSize: 42,
                      textColor: '#FFFFFF',
                      isBold: true,
                      strokeColor: '#EF4444',
                      strokeWidth: 3,
                      textAnimation: 'slide'
                    })
                  }
                  className="p-3 bg-[#171B24] border border-[#222733] hover:border-[#00F0FF] rounded-lg cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="font-['Bebas_Neue'] text-lg tracking-wider text-white">
                    NO WAY THIS HAPPENED 😱
                  </span>
                  <Plus className="w-4 h-4 text-[#94A3B8]" />
                </div>

                {/* Preset 4: Neon Cyber Title */}
                <div
                  onClick={() =>
                    onAddTextToTimeline('NIGHT CITY REEL', {
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 34,
                      textColor: '#00F0FF',
                      isBold: true,
                      strokeWidth: 0,
                      shadowColor: '#00F0FF',
                      shadowBlur: 14,
                      textAnimation: 'typewriter'
                    })
                  }
                  className="p-3 bg-[#171B24] border border-[#222733] hover:border-[#00F0FF] rounded-lg cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="font-bold text-sm text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                    NIGHT CITY REEL
                  </span>
                  <Plus className="w-4 h-4 text-[#94A3B8]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STICKERS TAB */}
        {activeTab === 'stickers' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Stickers & Badges</h3>

            {CREATOR_STICKERS.map((group) => (
              <div key={group.category} className="space-y-2">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">
                  {group.category}
                </span>

                {group.category === 'badge' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((badge) => (
                      <button
                        key={badge}
                        onClick={() => onAddStickerToTimeline(badge, 'badge')}
                        className="py-2 px-2 bg-[#EF4444] hover:brightness-110 text-white font-extrabold text-[10px] rounded-md shadow-md text-center transition-transform active:scale-95"
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => onAddStickerToTimeline(item, group.category as 'emoji' | 'shape')}
                        className="aspect-square bg-[#171B24] hover:bg-[#222733] border border-[#222733] hover:border-[#00F0FF] rounded-lg flex items-center justify-center text-xl transition-transform active:scale-95"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Creator Effects</h3>
              {selectedClip && (
                <span className="text-[10px] text-[#00F0FF] truncate max-w-[120px]">
                  Clip: {selectedClip.name}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#94A3B8]">
              {selectedClip 
                ? 'Click an effect to apply it to your selected clip.'
                : 'Select a video clip on the timeline to apply an effect.'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CREATOR_EFFECTS.map((eff) => {
                const isCurrent = selectedClip?.effect === eff.id;
                return (
                  <div
                    key={eff.id}
                    onClick={() => {
                      if (selectedClip) {
                        onUpdateSelectedClip({ effect: eff.id, effectIntensity: 50 });
                      }
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col space-y-1 ${
                      isCurrent
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-[#171B24] border-[#222733] text-white hover:border-[#384257]'
                    } ${!selectedClip ? 'opacity-65' : ''}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="text-base">{eff.icon}</span>
                      <span className="text-xs font-bold truncate">{eff.name}</span>
                    </div>
                    <span className="text-[9px] text-[#94A3B8]">{eff.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TRANSITIONS TAB */}
        {activeTab === 'transitions' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Transitions</h3>
              {selectedClip && (
                <span className="text-[10px] text-[#00F0FF] truncate max-w-[120px]">
                  Clip: {selectedClip.name}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#94A3B8]">
              Select a clip and pick a transition for its entry cut.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CREATOR_TRANSITIONS.map((trans) => {
                const isCurrent = selectedClip?.transition === trans.id;
                return (
                  <button
                    key={trans.id}
                    onClick={() => {
                      if (selectedClip) {
                        onUpdateSelectedClip({ transition: trans.id, transitionDuration: 0.5 });
                      }
                    }}
                    className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                      isCurrent
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-[#171B24] border-[#222733] text-white hover:border-[#384257]'
                    } ${!selectedClip ? 'opacity-65' : ''}`}
                  >
                    <span className="text-base">{trans.icon}</span>
                    <span className="text-xs font-semibold truncate">{trans.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTERS TAB */}
        {activeTab === 'filters' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Video Filters</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CREATOR_FILTERS.map((f) => {
                const isCurrent = selectedClip?.filter === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (selectedClip) {
                        onUpdateSelectedClip({ filter: f.id });
                      }
                    }}
                    className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col space-y-1.5 ${
                      isCurrent
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF]'
                        : 'bg-[#171B24] border-[#222733] hover:border-[#384257]'
                    }`}
                  >
                    <div
                      className="h-12 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-inner"
                      style={{ backgroundColor: f.previewColor }}
                    >
                      {f.name}
                    </div>
                    <span className="text-xs font-medium text-white truncate text-center">
                      {f.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADJUSTMENTS TAB */}
        {activeTab === 'adjust' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Color Adjust</h3>
              <button
                onClick={() => {
                  if (selectedClip) {
                    onUpdateSelectedClip({ adjustments: DEFAULT_ADJUSTMENTS });
                  }
                }}
                className="flex items-center space-x-1 text-[10px] text-[#94A3B8] hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {selectedClip ? (
              <div className="space-y-3 text-xs">
                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[#CBD5E1]">
                    <span>Brightness</span>
                    <span className="font-mono text-[10px]">{selectedClip.adjustments?.brightness || 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={selectedClip.adjustments?.brightness || 0}
                    onChange={(e) =>
                      onUpdateSelectedClip({
                        adjustments: { ...selectedClip.adjustments, brightness: parseInt(e.target.value) }
                      })
                    }
                    className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[#CBD5E1]">
                    <span>Contrast</span>
                    <span className="font-mono text-[10px]">{selectedClip.adjustments?.contrast || 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={selectedClip.adjustments?.contrast || 0}
                    onChange={(e) =>
                      onUpdateSelectedClip({
                        adjustments: { ...selectedClip.adjustments, contrast: parseInt(e.target.value) }
                      })
                    }
                    className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[#CBD5E1]">
                    <span>Saturation</span>
                    <span className="font-mono text-[10px]">{selectedClip.adjustments?.saturation || 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={selectedClip.adjustments?.saturation || 0}
                    onChange={(e) =>
                      onUpdateSelectedClip({
                        adjustments: { ...selectedClip.adjustments, saturation: parseInt(e.target.value) }
                      })
                    }
                    className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[#CBD5E1]">
                    <span>Temperature</span>
                    <span className="font-mono text-[10px]">{selectedClip.adjustments?.temperature || 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={selectedClip.adjustments?.temperature || 0}
                    onChange={(e) =>
                      onUpdateSelectedClip({
                        adjustments: { ...selectedClip.adjustments, temperature: parseInt(e.target.value) }
                      })
                    }
                    className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[#CBD5E1]">
                    <span>Blur</span>
                    <span className="font-mono text-[10px]">{selectedClip.adjustments?.blur || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={selectedClip.adjustments?.blur || 0}
                    onChange={(e) =>
                      onUpdateSelectedClip({
                        adjustments: { ...selectedClip.adjustments, blur: parseInt(e.target.value) }
                      })
                    }
                    className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[#CBD5E1]">
                    <span>Clip Opacity</span>
                    <span className="font-mono text-[10px]">{selectedClip.opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedClip.opacity ?? 100}
                    onChange={(e) => onUpdateSelectedClip({ opacity: parseInt(e.target.value) })}
                    className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] text-center py-8">
                Select a clip on the timeline to adjust color & exposure.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

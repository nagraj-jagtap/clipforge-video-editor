/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Trash2, 
  Copy, 
  Scissors, 
  Type, 
  Sparkles, 
  Palette, 
  Layers, 
  Wand2,
  Maximize2,
  Music
} from 'lucide-react';
import { TimelineClip, AspectRatioType } from '../types';
import { 
  CREATOR_FONTS, 
  CREATOR_EFFECTS, 
  CREATOR_FILTERS, 
  CREATOR_TRANSITIONS 
} from '../data/creatorAssets';

interface RightPanelProps {
  selectedClip: TimelineClip | null;
  onUpdateClip: (updates: Partial<TimelineClip>) => void;
  onDuplicateClip: () => void;
  onDeleteClip: () => void;
  onSplitClip: () => void;
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
  duration: number;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  selectedClip,
  onUpdateClip,
  onDuplicateClip,
  onDeleteClip,
  onSplitClip,
  aspectRatio,
  onChangeAspectRatio,
  duration
}) => {
  if (!selectedClip) {
    return (
      <div className="w-72 bg-[#12141A] border-l border-[#222733] flex flex-col p-4 shrink-0 overflow-y-auto select-none space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#222733] pb-2">
          <Sliders className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Project Settings</h3>
        </div>

        {/* Canvas Aspect Ratio */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#CBD5E1]">Canvas Aspect Ratio</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: '9:16', label: '9:16 Vertical', sub: 'TikTok / Shorts' },
              { id: '16:9', label: '16:9 Wide', sub: 'YouTube' },
              { id: '1:1', label: '1:1 Square', sub: 'Instagram' },
              { id: '4:5', label: '4:5 Portrait', sub: 'Social Feed' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => onChangeAspectRatio(r.id as AspectRatioType)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  aspectRatio === r.id
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                    : 'bg-[#171B24] border-[#222733] text-white hover:border-[#384257]'
                }`}
              >
                <p className="font-bold">{r.label}</p>
                <p className="text-[10px] text-[#94A3B8]">{r.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#171B24] border border-[#222733] space-y-1.5 text-xs text-[#94A3B8]">
          <p className="text-white font-semibold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>ClipForge Tip</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            Click on any video, text, sticker, or audio track on the timeline below to customize its speed, animation, volume, or visual style.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#12141A] border-l border-[#222733] flex flex-col p-3 shrink-0 overflow-y-auto select-none space-y-4">
      {/* Header & Quick Actions */}
      <div className="flex items-center justify-between border-b border-[#222733] pb-2">
        <div className="truncate max-w-[140px]">
          <span className="text-xs font-bold text-white truncate block">{selectedClip.name}</span>
          <span className="text-[10px] text-[#00F0FF] uppercase font-mono font-semibold">
            {selectedClip.type} clip
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onSplitClip}
            className="p-1 rounded bg-[#171B24] hover:bg-[#222733] text-[#94A3B8] hover:text-white"
            title="Split clip at playhead"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicateClip}
            className="p-1 rounded bg-[#171B24] hover:bg-[#222733] text-[#94A3B8] hover:text-white"
            title="Duplicate clip"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteClip}
            className="p-1 rounded bg-[#171B24] hover:bg-red-500/20 text-red-400 hover:text-red-300"
            title="Delete clip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIDEO CLIP PROPERTIES */}
      {selectedClip.type === 'video' && (
        <div className="space-y-4 text-xs">
          {/* Speed: 0.25x to 4x */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Playback Speed</span>
              <span className="font-mono text-[#00F0FF] font-bold">{selectedClip.speed}x</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={selectedClip.speed}
              onChange={(e) => onUpdateClip({ speed: parseFloat(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
              <button onClick={() => onUpdateClip({ speed: 0.5 })} className="hover:text-white">0.5x</button>
              <button onClick={() => onUpdateClip({ speed: 1.0 })} className="hover:text-white">1x</button>
              <button onClick={() => onUpdateClip({ speed: 2.0 })} className="hover:text-white">2x</button>
              <button onClick={() => onUpdateClip({ speed: 4.0 })} className="hover:text-white">4x</button>
            </div>
          </div>

          {/* Volume & Mute */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[#CBD5E1]">
              <span className="font-semibold">Volume</span>
              <button
                onClick={() => onUpdateClip({ muted: !selectedClip.muted })}
                className={`p-1 rounded text-xs flex items-center space-x-1 ${
                  selectedClip.muted ? 'text-red-400 bg-red-400/15' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {selectedClip.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{selectedClip.muted ? 'Muted' : `${selectedClip.volume}%`}</span>
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              disabled={selectedClip.muted}
              value={selectedClip.volume}
              onChange={(e) => onUpdateClip({ volume: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Scale & Zoom */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Scale / Zoom</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.scale}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              value={selectedClip.scale}
              onChange={(e) => onUpdateClip({ scale: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
          </div>

          {/* Crop Mode: Fit / Fill / Stretch */}
          <div className="space-y-1">
            <span className="text-[#CBD5E1] font-semibold">Framing Mode</span>
            <div className="grid grid-cols-3 gap-1">
              {(['fill', 'fit', 'stretch'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateClip({ cropMode: mode })}
                  className={`py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                    selectedClip.cropMode === mode
                      ? 'bg-[#00F0FF] text-[#0B0D12] font-bold'
                      : 'bg-[#171B24] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation & Flips */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Rotation</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedClip.rotation}
              onChange={(e) => onUpdateClip({ rotation: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => onUpdateClip({ rotation: (selectedClip.rotation + 90) % 360 })}
                className="flex-1 py-1 px-2 rounded bg-[#171B24] hover:bg-[#222733] text-white flex items-center justify-center space-x-1"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[11px]">+90°</span>
              </button>
              <button
                onClick={() => onUpdateClip({ flipH: !selectedClip.flipH })}
                className={`flex-1 py-1 px-2 rounded flex items-center justify-center space-x-1 ${
                  selectedClip.flipH ? 'bg-[#00F0FF] text-[#0B0D12]' : 'bg-[#171B24] text-white hover:bg-[#222733]'
                }`}
                title="Flip horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span className="text-[11px]">Flip H</span>
              </button>
              <button
                onClick={() => onUpdateClip({ flipV: !selectedClip.flipV })}
                className={`flex-1 py-1 px-2 rounded flex items-center justify-center space-x-1 ${
                  selectedClip.flipV ? 'bg-[#00F0FF] text-[#0B0D12]' : 'bg-[#171B24] text-white hover:bg-[#222733]'
                }`}
                title="Flip vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span className="text-[11px]">Flip V</span>
              </button>
            </div>
          </div>

          {/* Active Filter & Effect */}
          <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#222733] space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#94A3B8]">Filter:</span>
              <span className="text-[#00F0FF] font-semibold uppercase">{selectedClip.filter}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#94A3B8]">Effect:</span>
              <span className="text-[#00F0FF] font-semibold uppercase">{selectedClip.effect}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#94A3B8]">Transition In:</span>
              <span className="text-white font-semibold uppercase">{selectedClip.transition}</span>
            </div>
          </div>
        </div>
      )}

      {/* TEXT CLIP PROPERTIES */}
      {selectedClip.type === 'text' && (
        <div className="space-y-3.5 text-xs">
          {/* Content Textarea */}
          <div className="space-y-1">
            <span className="text-[#CBD5E1] font-semibold">Text Content</span>
            <textarea
              value={selectedClip.text || ''}
              onChange={(e) => onUpdateClip({ text: e.target.value })}
              rows={3}
              className="w-full bg-[#171B24] border border-[#222733] focus:border-[#00F0FF] rounded-lg p-2 text-white outline-none font-medium resize-none"
            />
          </div>

          {/* Font Family */}
          <div className="space-y-1">
            <span className="text-[#CBD5E1] font-semibold">Font Family</span>
            <select
              value={selectedClip.fontFamily || 'Montserrat'}
              onChange={(e) => onUpdateClip({ fontFamily: e.target.value })}
              className="w-full bg-[#171B24] border border-[#222733] rounded-lg p-1.5 text-white outline-none cursor-pointer"
            >
              {CREATOR_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size & Color */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[#CBD5E1] font-semibold">Size ({selectedClip.fontSize || 32}px)</span>
              <input
                type="range"
                min={16}
                max={80}
                value={selectedClip.fontSize || 32}
                onChange={(e) => onUpdateClip({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[#CBD5E1] font-semibold">Text Color</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="color"
                  value={selectedClip.textColor || '#FFFFFF'}
                  onChange={(e) => onUpdateClip({ textColor: e.target.value })}
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                  {selectedClip.textColor || '#FFFFFF'}
                </span>
              </div>
            </div>
          </div>

          {/* Bold & Italic Style */}
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdateClip({ isBold: !selectedClip.isBold })}
              className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors ${
                selectedClip.isBold
                  ? 'bg-[#00F0FF] text-[#0B0D12] border-[#00F0FF]'
                  : 'bg-[#171B24] text-white border-[#222733]'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => onUpdateClip({ isItalic: !selectedClip.isItalic })}
              className={`flex-1 py-1.5 rounded-lg italic border transition-colors ${
                selectedClip.isItalic
                  ? 'bg-[#00F0FF] text-[#0B0D12] border-[#00F0FF]'
                  : 'bg-[#171B24] text-white border-[#222733]'
              }`}
            >
              Italic
            </button>
          </div>

          {/* Text Animation */}
          <div className="space-y-1">
            <span className="text-[#CBD5E1] font-semibold">Text Animation</span>
            <div className="grid grid-cols-3 gap-1">
              {(['none', 'fade', 'slide', 'zoom', 'typewriter'] as const).map((anim) => (
                <button
                  key={anim}
                  onClick={() => onUpdateClip({ textAnimation: anim })}
                  className={`py-1 rounded text-[10px] font-medium uppercase transition-colors ${
                    selectedClip.textAnimation === anim
                      ? 'bg-[#00F0FF] text-[#0B0D12] font-bold'
                      : 'bg-[#171B24] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {anim}
                </button>
              ))}
            </div>
          </div>

          {/* Text Position Y */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Vertical Position</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.posY}%</span>
            </div>
            <input
              type="range"
              min={-45}
              max={45}
              value={selectedClip.posY}
              onChange={(e) => onUpdateClip({ posY: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* STICKER CLIP PROPERTIES */}
      {selectedClip.type === 'sticker' && (
        <div className="space-y-3.5 text-xs">
          <div className="text-center p-3 bg-[#171B24] rounded-lg">
            <span className="text-4xl">{selectedClip.stickerContent}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Size</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.scale}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={250}
              value={selectedClip.scale}
              onChange={(e) => onUpdateClip({ scale: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Position X</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.posX}%</span>
            </div>
            <input
              type="range"
              min={-45}
              max={45}
              value={selectedClip.posX}
              onChange={(e) => onUpdateClip({ posX: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#CBD5E1]">
              <span className="font-semibold">Position Y</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.posY}%</span>
            </div>
            <input
              type="range"
              min={-45}
              max={45}
              value={selectedClip.posY}
              onChange={(e) => onUpdateClip({ posY: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* AUDIO CLIP PROPERTIES */}
      {selectedClip.type === 'audio' && (
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[#CBD5E1]">
              <span className="font-semibold">Track Volume</span>
              <span className="font-mono text-[#00F0FF]">{selectedClip.volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={selectedClip.volume}
              onChange={(e) => onUpdateClip({ volume: parseInt(e.target.value) })}
              className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[#CBD5E1] font-semibold">Fade In ({selectedClip.fadeIn}s)</span>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={selectedClip.fadeIn}
                onChange={(e) => onUpdateClip({ fadeIn: parseFloat(e.target.value) })}
                className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[#CBD5E1] font-semibold">Fade Out ({selectedClip.fadeOut}s)</span>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={selectedClip.fadeOut}
                onChange={(e) => onUpdateClip({ fadeOut: parseFloat(e.target.value) })}
                className="w-full accent-[#00F0FF] h-1.5 bg-[#262C3A] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Download, 
  Smartphone, 
  Monitor, 
  Square, 
  Check, 
  Film
} from 'lucide-react';
import { AspectRatioType } from '../types';

interface HeaderProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onUpdateProjectName,
  aspectRatio,
  onChangeAspectRatio,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onOpenExport
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onUpdateProjectName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="h-13 bg-[#111318] border-b border-[#222733] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Brand Logo & Project Title */}
      <div className="flex items-center space-x-3">
        {/* ClipForge Brand Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] via-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.35)]">
            <Film className="w-4 h-4 text-[#0B0D12] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Clip<span className="text-[#00F0FF]">Forge</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#1C212D] text-[#00F0FF] rounded border border-[#00F0FF]/30">
                100% FREE
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#222733] mx-1"></div>

        {/* Project Name Editable Input */}
        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') setIsEditingName(false);
            }}
            autoFocus
            className="bg-[#1C212D] border border-[#00F0FF] rounded px-2 py-0.5 text-xs text-white outline-none w-52 font-medium"
          />
        ) : (
          <button
            onClick={() => {
              setTempName(projectName);
              setIsEditingName(true);
            }}
            className="text-xs text-[#CBD5E1] hover:text-white font-medium px-2 py-1 rounded hover:bg-[#1A1E27] transition-colors truncate max-w-[200px]"
            title="Click to rename project"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* Center: Canvas Aspect Ratio Switcher */}
      <div className="flex items-center bg-[#181B23] border border-[#222733] p-0.5 rounded-lg space-x-1">
        <button
          onClick={() => onChangeAspectRatio('9:16')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            aspectRatio === '9:16'
              ? 'bg-[#00F0FF] text-[#0B0D12] shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#202531]'
          }`}
          title="TikTok / Shorts / Reels (9:16)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>9:16</span>
        </button>

        <button
          onClick={() => onChangeAspectRatio('16:9')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            aspectRatio === '16:9'
              ? 'bg-[#00F0FF] text-[#0B0D12] shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#202531]'
          }`}
          title="YouTube / Landscape (16:9)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>16:9</span>
        </button>

        <button
          onClick={() => onChangeAspectRatio('1:1')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            aspectRatio === '1:1'
              ? 'bg-[#00F0FF] text-[#0B0D12] shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#202531]'
          }`}
          title="Instagram Square (1:1)"
        >
          <Square className="w-3.5 h-3.5" />
          <span>1:1</span>
        </button>

        <button
          onClick={() => onChangeAspectRatio('4:5')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            aspectRatio === '4:5'
              ? 'bg-[#00F0FF] text-[#0B0D12] shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#202531]'
          }`}
          title="Feed Portrait (4:5)"
        >
          <span>4:5</span>
        </button>
      </div>

      {/* Right: History, Save, and Prominent Export */}
      <div className="flex items-center space-x-2">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition-colors ${
            canUndo ? 'text-[#94A3B8] hover:text-white hover:bg-[#1F2430]' : 'text-[#475569] cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition-colors ${
            canRedo ? 'text-[#94A3B8] hover:text-white hover:bg-[#1F2430]' : 'text-[#475569] cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Save */}
        <button
          onClick={handleSaveClick}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-[#181B23] hover:bg-[#202531] border border-[#222733] text-xs font-medium text-[#CBD5E1] transition-colors"
          title="Save project locally"
        >
          {saveToast ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saveToast ? 'Saved' : 'Save'}</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#0EA5E9] hover:brightness-110 text-[#0B0D12] text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer active:scale-95"
          title="Export real MP4 video"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};

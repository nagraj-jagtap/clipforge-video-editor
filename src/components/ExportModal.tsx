/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Film, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  RotateCw
} from 'lucide-react';
import { ExportConfig, TimelineClip, AspectRatioType } from '../types';
import { BrowserVideoRenderer } from '../utils/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: TimelineClip[];
  duration: number;
  aspectRatio: AspectRatioType;
  projectName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clips,
  duration,
  aspectRatio,
  projectName
}) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'mp4',
    resolution: '1080p',
    fps: 30,
    aspectRatio: aspectRatio
  });

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [downloadResult, setDownloadResult] = useState<{ downloadUrl: string; filename: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rendererInstance, setRendererInstance] = useState<BrowserVideoRenderer | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setErrorMessage(null);
    setDownloadResult(null);

    const renderer = new BrowserVideoRenderer();
    setRendererInstance(renderer);

    try {
      const result = await renderer.exportVideo(
        clips,
        duration,
        { ...config, aspectRatio },
        (progress, curFrame, totFrames) => {
          setRenderProgress(progress);
          setCurrentFrame(curFrame);
          setTotalFrames(totFrames);
        }
      );

      setDownloadResult({
        downloadUrl: result.downloadUrl,
        filename: `${projectName.replace(/\s+/g, '_')}_${config.resolution}.${config.format}`
      });

      // Auto-trigger download for convenient creator workflow
      const a = document.createElement('a');
      a.href = result.downloadUrl;
      a.download = `${projectName.replace(/\s+/g, '_')}_${config.resolution}.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('cancelled')) {
        setErrorMessage('Export was cancelled.');
      } else {
        setErrorMessage((err as Error)?.message || 'Failed to render video.');
      }
    } finally {
      setIsRendering(false);
      setRendererInstance(null);
    }
  };

  const handleCancelExport = () => {
    if (rendererInstance) {
      rendererInstance.cancel();
    }
    setIsRendering(false);
    setRenderProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#12141A] border border-[#222733] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222733] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-[#0EA5E9] flex items-center justify-center">
              <Download className="w-4 h-4 text-[#0B0D12] stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export Video</h2>
              <p className="text-[10px] text-[#94A3B8]">Browser-powered local MP4 rendering</p>
            </div>
          </div>

          {!isRendering && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1A1E27]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Free No-Watermark Promise Badge */}
          <div className="p-2.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center space-x-2.5 text-xs text-[#CBD5E1]">
            <ShieldCheck className="w-5 h-5 text-[#00F0FF] shrink-0" />
            <div>
              <p className="font-bold text-white">100% Free & No Watermark</p>
              <p className="text-[10px] text-[#94A3B8]">
                Export in crisp resolution without subscriptions, fees, or branding locks.
              </p>
            </div>
          </div>

          {!isRendering && !downloadResult && (
            <div className="space-y-4">
              {/* Resolution Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#CBD5E1]">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig({ ...config, resolution: '1080p' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.resolution === '1080p'
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-[#171B24] border-[#222733] text-white hover:border-[#384257]'
                    }`}
                  >
                    <p className="text-xs font-bold">1080p Full HD</p>
                    <p className="text-[10px] text-[#94A3B8]">Best quality for TikTok & Reels</p>
                  </button>

                  <button
                    onClick={() => setConfig({ ...config, resolution: '720p' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.resolution === '720p'
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-[#171B24] border-[#222733] text-white hover:border-[#384257]'
                    }`}
                  >
                    <p className="text-xs font-bold">720p HD</p>
                    <p className="text-[10px] text-[#94A3B8]">Fast rendering speed</p>
                  </button>
                </div>
              </div>

              {/* Format & FPS Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#222733] space-y-1">
                  <span className="text-[#94A3B8] text-[10px]">Format:</span>
                  <p className="font-bold text-white uppercase">MP4 Video</p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#222733] space-y-1">
                  <span className="text-[#94A3B8] text-[10px]">Frame Rate:</span>
                  <p className="font-bold text-white">30 FPS</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#222733] flex justify-between text-xs text-[#94A3B8]">
                <span>Canvas Aspect:</span>
                <span className="text-white font-mono font-bold">{aspectRatio}</span>
              </div>
            </div>
          )}

          {/* ACTIVE RENDERING PROGRESS STATE */}
          {isRendering && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#00F0FF]/10 border-2 border-[#00F0FF] flex items-center justify-center mx-auto relative">
                <Film className="w-6 h-6 text-[#00F0FF] animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Rendering Your Video</h3>
                <p className="text-xs text-[#94A3B8]">
                  Processing cuts, filters, text layers, and audio tracks...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-3 bg-[#1F2430] rounded-full overflow-hidden border border-[#262C3A]">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0EA5E9] transition-all duration-150 rounded-full"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-[#94A3B8]">
                  <span>Frame {currentFrame} / {totalFrames}</span>
                  <span className="text-[#00F0FF] font-bold text-sm">{renderProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* COMPLETED EXPORT STATE */}
          {downloadResult && !isRendering && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Your Video is Ready!</h3>
                <p className="text-xs text-[#94A3B8]">
                  Rendered locally in {config.resolution} ({aspectRatio})
                </p>
              </div>

              <a
                href={downloadResult.downloadUrl}
                download={downloadResult.filename}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0EA5E9] text-[#0B0D12] font-bold text-sm flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download MP4 File</span>
              </a>
            </div>
          )}

          {/* ERROR NOTIFICATION */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 border-t border-[#222733] bg-[#0E1015] flex items-center justify-end space-x-2">
          {isRendering ? (
            <button
              onClick={handleCancelExport}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-colors"
            >
              Cancel Export
            </button>
          ) : downloadResult ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1F2430] hover:bg-[#2A3142] text-white text-xs font-medium transition-colors"
            >
              Done & Return to Editor
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExport}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#0EA5E9] hover:brightness-110 text-[#0B0D12] text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Start Export
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

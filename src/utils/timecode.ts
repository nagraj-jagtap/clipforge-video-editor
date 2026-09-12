/**
 * Studio Obsidian Timecode Utilities
 * Standard broadcast drop/non-drop frame timecode math
 */

export function secondsToTimecode(totalSeconds: number, fps: number = 60): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  
  const totalFrames = Math.floor(totalSeconds * fps);
  const frames = totalFrames % fps;
  const totalSecs = Math.floor(totalFrames / fps);
  const seconds = totalSecs % 60;
  const totalMinutes = Math.floor(totalSecs / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, '0')}.${ms}s`;
}

export function formatDecibel(db: number): string {
  if (db <= -60) return '-inf dB';
  return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
}

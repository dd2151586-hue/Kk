import React from 'react';
import { Volume2, VolumeX, Maximize, Minimize, Pause, Play, RotateCcw, Info, Clapperboard } from 'lucide-react';
import { RealmType } from '../types/cosmic';

interface HeaderProps {
  realm: RealmType;
  onSelectRealm: (realm: RealmType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetCamera: () => void;
  onReplayIntro: () => void;
  onOpenInfo: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  realm,
  onSelectRealm,
  soundEnabled,
  onToggleSound,
  isPaused,
  onTogglePause,
  onResetCamera,
  onReplayIntro,
  onOpenInfo,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-black/60 border border-white/10 backdrop-blur-none text-xs sm:text-sm font-mono-hud tracking-widest uppercase">
          <span className="text-amber-400 font-bold">[+]</span>
          <span className="font-semibold text-white tracking-wider">Two Horizons</span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className={`text-[11px] font-medium hidden sm:inline ${realm === 'aurum' ? 'text-amber-400' : 'text-purple-400'}`}>
            {realm === 'aurum' ? 'SECTOR 01 // AURUM' : 'SECTOR 02 // VIOLA'}
          </span>
        </div>
      </div>

      {/* Center Realm Switcher (as in video) */}
      <div className="pointer-events-auto flex items-center bg-black/70 border border-white/15 p-1 rounded-full text-xs font-mono-hud shadow-lg">
        <button
          onClick={() => onSelectRealm('aurum')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
            realm === 'aurum'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Aurum</span>
        </button>
        <span className="text-white/20 px-1 text-[10px]">⇄</span>
        <button
          onClick={() => onSelectRealm('viola')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
            realm === 'viola'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span>Viola</span>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Replay Cinematic Intro */}
        <button
          onClick={onReplayIntro}
          title="Replay Cinematic Intro"
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-sm bg-black/60 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-mono-hud flex items-center gap-1.5 cursor-pointer"
        >
          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Intro</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Space Soundscape' : 'Unmute Space Soundscape'}
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-sm border transition-all text-xs font-mono-hud flex items-center gap-1.5 cursor-pointer ${
            soundEnabled
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-black/60 hover:bg-white/10 border-white/10 text-white/70'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-white/50" />
          )}
          <span className="hidden md:inline">{soundEnabled ? 'Audio On' : 'Muted'}</span>
        </button>

        {/* Pause/Resume */}
        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          className="p-2 rounded-sm bg-black/60 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-white/70" />}
        </button>

        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          title="Reset Camera View"
          className="p-2 rounded-sm bg-black/60 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/70" />
        </button>

        {/* Astrophysics & Info Modal */}
        <button
          onClick={onOpenInfo}
          title="Astrophysics & Universe Guide"
          className="p-2 rounded-sm bg-black/60 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 rounded-sm bg-black/60 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-white/70" /> : <Maximize className="w-3.5 h-3.5 text-white/70" />}
        </button>
      </div>
    </header>
  );
};

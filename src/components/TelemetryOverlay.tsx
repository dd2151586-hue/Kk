import React, { useEffect, useState } from 'react';
import { RealmType, TelemetryData } from '../types/cosmic';

interface TelemetryOverlayProps {
  realm: RealmType;
  telemetry: TelemetryData;
  onSetFocalLength: (mm: number) => void;
  focalLength: number;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  realm,
  telemetry,
  onSetFocalLength,
  focalLength,
}) => {
  // Mission timer elapsed clock
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMissionTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `T ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const focalSteps = [24, 35, 50, 70, 85];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono-hud select-none">
      {/* 1. TOP-LEFT REALM TITLES & POETICS (Exact match to reference video) */}
      <div className="absolute top-16 sm:top-20 left-4 sm:left-8 max-w-xs sm:max-w-md pointer-events-auto transition-all duration-700">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 mb-1 flex items-center gap-2">
          <span>TWO HORIZONS</span>
          <span className="w-8 h-[1px] bg-white/20"></span>
        </div>
        <h1
          className={`text-3xl sm:text-5xl font-cinzel font-normal tracking-wide transition-colors duration-700 ${
            realm === 'aurum'
              ? 'text-amber-200 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]'
              : 'text-purple-200 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]'
          }`}
        >
          {realm === 'aurum' ? 'Aurum' : 'Viola'}
        </h1>
        <p className="text-xs sm:text-sm text-white/70 mt-1.5 font-light tracking-wider leading-relaxed">
          {realm === 'aurum'
            ? 'The last farm before the event horizon.'
            : 'A violet field beneath the arc of the disk.'}
        </p>

        {/* Mini technical coordinate stamp */}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-white/40 tracking-wider">
          <span>RA 17h 45m 40s</span>
          <span>•</span>
          <span>DEC -29° 00′ 28″</span>
          <span>•</span>
          <span className={realm === 'aurum' ? 'text-amber-400/80' : 'text-purple-400/80'}>
            {realm === 'aurum' ? 'CLASS: SUPERMASSIVE KERR' : 'CLASS: RELATIVISTIC SINGULARITY'}
          </span>
        </div>
      </div>

      {/* 2. RIGHT-EDGE FOCAL LENGTH SCALE & OPTICAL RETICLE */}
      <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3 pointer-events-auto">
        <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">OPTICS</div>
        <div className="flex flex-col items-end gap-2.5 bg-black/60 border border-white/10 p-2 rounded-sm shadow-md">
          {focalSteps.map((mm) => {
            const isSelected = Math.abs(focalLength - mm) <= 7;
            return (
              <button
                key={mm}
                onClick={() => onSetFocalLength(mm)}
                title={`Set focal length to ${mm}mm`}
                className={`flex items-center gap-2 group cursor-pointer transition-all ${
                  isSelected ? 'text-amber-300 font-semibold' : 'text-white/40 hover:text-white/80'
                }`}
              >
                <span className="text-[10px] tracking-wider">{mm}mm</span>
                <span
                  className={`w-3.5 h-[1.5px] transition-all ${
                    isSelected ? 'w-6 bg-amber-400' : 'bg-white/20 group-hover:bg-white/60'
                  }`}
                ></span>
              </button>
            );
          })}
        </div>
        <div className="text-[9px] text-white/40 tracking-wider mt-1">
          FOV: {Math.round(2 * Math.atan(12 / focalLength) * (180 / Math.PI))}°
        </div>
      </div>

      {/* 3. BOTTOM-LEFT SCIENTIFIC TELEMETRY READOUTS (Exact match to reference video) */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1.5 text-[10px] sm:text-[11px] text-white/60 tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">ALT</span>
          <span className="text-white font-medium">{telemetry.altitude.toFixed(2)} M</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-white/40">HORIZON</span>
          <span className="text-white font-medium">{telemetry.horizonAngle.toFixed(1)}°</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-white font-medium">{formatMissionTime(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-white font-medium">{telemetry.fps} FPS</span>
          <span className="text-emerald-400/90 text-[9px]">100%</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-white/40">LORENTZ Γ</span>
          <span className="text-amber-400 font-medium">{telemetry.relativityGamma.toFixed(2)}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-white/40">DILATION</span>
          <span className="text-white font-medium">{telemetry.timeDilationRatio}</span>
        </div>
      </div>

      {/* 4. FOUR-CORNER SCI-FI RETICLE BRACKETS */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20"></div>
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20"></div>
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20"></div>

      {/* Subtle center crosshair guide (very faint) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-15">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white"></div>
      </div>
    </div>
  );
};

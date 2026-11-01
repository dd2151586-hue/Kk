import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Sliders,
  Wind,
  Atom,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { CAMERA_PRESETS } from '../scene/CosmicScene';
import { CosmicSettings, RealmType } from '../types/cosmic';

interface ControlDockProps {
  settings: CosmicSettings;
  onUpdateSettings: (newSettings: Partial<CosmicSettings>) => void;
  onSelectPreset: (presetId: string) => void;
  onSelectRealm: (realm: RealmType) => void;
  onResetControls: () => void;
}

type TabType = 'views' | 'optics' | 'atmosphere' | 'physics';

export const ControlDock: React.FC<ControlDockProps> = ({
  settings,
  onUpdateSettings,
  onSelectPreset,
  onSelectRealm,
  onResetControls,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('views');

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 transition-transform duration-500 ease-out select-none pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
      }`}
      style={{ width: 'min(920px, 94vw)' }}
    >
      {/* Top Dock Header & Collapse Toggle */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2 rounded-t-lg bg-black/80 border-t border-x border-white/15 backdrop-blur-none shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setActiveTab('views');
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono-hud flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'views' && !isCollapsed
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Views & Realm</span>
            <span className="sm:hidden">Views</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('optics');
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono-hud flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'optics' && !isCollapsed
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Relativistic Optics</span>
            <span className="sm:hidden">Optics</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('atmosphere');
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono-hud flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'atmosphere' && !isCollapsed
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Atmosphere</span>
            <span className="sm:hidden">Atmo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('physics');
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded text-xs font-mono-hud flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'physics' && !isCollapsed
                ? 'bg-white/15 text-white font-medium border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Atom className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Astrophysics</span>
            <span className="sm:hidden">Physics</span>
          </button>
        </div>

        {/* Collapse / Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-hud text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Dock Content Panel */}
      <div className="bg-black/90 border-b border-x border-white/15 rounded-b-lg p-3 sm:p-5 shadow-2xl backdrop-blur-none">
        {/* TAB 1: VIEWS & REALM */}
        {activeTab === 'views' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono-hud text-white/50 uppercase tracking-widest block">
                  ACTIVE REALM & SETTLEMENT
                </span>
                <span className="text-xs text-white/70">
                  Switch between the rustic farmhouse and the cosmic violet flower field
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectRealm('aurum')}
                  className={`px-3 py-1.5 rounded text-xs font-mono-hud transition-all cursor-pointer flex items-center gap-2 ${
                    settings.realm === 'aurum'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Aurum (The Farmhouse)</span>
                </button>
                <button
                  onClick={() => onSelectRealm('viola')}
                  className={`px-3 py-1.5 rounded text-xs font-mono-hud transition-all cursor-pointer flex items-center gap-2 ${
                    settings.realm === 'viola'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>Viola (The Violet Field)</span>
                </button>
              </div>
            </div>

            {/* Camera Presets Grid */}
            <div>
              <span className="text-[11px] font-mono-hud text-white/50 uppercase tracking-widest block mb-2">
                CINEMATIC CAMERA TRAJECTORIES
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className="p-2 sm:p-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-mono-hud text-white group-hover:text-amber-300 flex items-center justify-between">
                      <span>{preset.name}</span>
                      <Eye className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                    </div>
                    <div className="text-[10px] text-white/40 mt-1 line-clamp-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono-hud text-white/40 flex items-center justify-between pt-1 border-t border-white/5">
              <span>DESKTOP: Drag mouse to look around • Scroll wheel to zoom</span>
              <span className="hidden sm:inline">MOBILE: Drag to orbit • Pinch to zoom</span>
            </div>
          </div>
        )}

        {/* TAB 2: RELATIVISTIC OPTICS */}
        {activeTab === 'optics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Black Hole Spin */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-hud">
                <span className="text-white/60">KERR SPIN RATE (a)</span>
                <span className="text-amber-300 font-semibold">{settings.blackHoleSpin.toFixed(2)} c</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.2"
                step="0.05"
                value={settings.blackHoleSpin}
                onChange={(e) => onUpdateSettings({ blackHoleSpin: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-white/40 block">Angular velocity of relativistic plasma</span>
            </div>

            {/* Accretion Disk Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-hud">
                <span className="text-white/60">DISK LUMINOSITY</span>
                <span className="text-amber-300 font-semibold">{settings.diskBrightness.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={settings.diskBrightness}
                onChange={(e) => onUpdateSettings({ diskBrightness: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-white/40 block">Photon radiance across the event horizon</span>
            </div>

            {/* Doppler Beaming Relativistic Asymmetry */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-hud">
                <span className="text-white/60">DOPPLER BEAMING</span>
                <span className="text-amber-300 font-semibold">{settings.dopplerBeaming.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={settings.dopplerBeaming}
                onChange={(e) => onUpdateSettings({ dopplerBeaming: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-white/40 block">Asymmetric boost on the approaching side</span>
            </div>

            {/* Gravitational Lensing Strength */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-hud">
                <span className="text-white/60">GRAVITATIONAL LENSING</span>
                <span className="text-amber-300 font-semibold">{settings.lensingStrength.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={settings.lensingStrength}
                onChange={(e) => onUpdateSettings({ lensingStrength: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-white/40 block">Curvature of the upper and lower crown arcs</span>
            </div>
          </div>
        )}

        {/* TAB 3: ATMOSPHERE & MATTER */}
        {activeTab === 'atmosphere' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Horizon Wind Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-hud">
                <span className="text-white/60">HORIZON WIND VELOCITY</span>
                <span className="text-emerald-300 font-semibold">{settings.windSpeed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={settings.windSpeed}
                onChange={(e) => onUpdateSettings({ windSpeed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-white/40 block">Affects wheat grass & cosmic violet flora sway</span>
            </div>

            {/* Atmospheric Fog */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-hud">
                <span className="text-white/60">COSMIC HAZE DENSITY</span>
                <span className="text-emerald-300 font-semibold">{(settings.fogDensity * 1000).toFixed(1)}‰</span>
              </div>
              <input
                type="range"
                min="0.002"
                max="0.015"
                step="0.001"
                value={settings.fogDensity}
                onChange={(e) => onUpdateSettings({ fogDensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-white/40 block">Volumetric horizon mist and light scattering</span>
            </div>

            {/* Quick Reset */}
            <div className="flex flex-col justify-end">
              <button
                onClick={onResetControls}
                className="px-3 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono-hud text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Parameters to Default</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ASTROPHYSICS TELEMETRY */}
        {activeTab === 'physics' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono-hud">
              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">SCHWARZSCHILD RADIUS</div>
                <div className="text-sm text-white font-semibold mt-1">Rs = 2GM / c²</div>
                <div className="text-[10px] text-amber-400/90 mt-0.5">Boundary of no return</div>
              </div>

              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">PHOTON SPHERE</div>
                <div className="text-sm text-white font-semibold mt-1">Rph = 1.5 Rs</div>
                <div className="text-[10px] text-cyan-400/90 mt-0.5">Circular photon geodesics</div>
              </div>

              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">ISCO ACCRETION INNER RIM</div>
                <div className="text-sm text-white font-semibold mt-1">Risco = 3.0 Rs</div>
                <div className="text-[10px] text-purple-400/90 mt-0.5">Innermost stable orbit</div>
              </div>

              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">TIME DILATION FACTOR</div>
                <div className="text-sm text-white font-semibold mt-1">t' = t √(1 - Rs/r)</div>
                <div className="text-[10px] text-emerald-400/90 mt-0.5">1 hour = 7 Earth years</div>
              </div>
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed font-light">
              This simulation executes real-time numerical approximations of the Kerr metric for a rotating supermassive black hole. The luminous upper and lower crown arcs represent photons emitted from the far side of the accretion disk, gravitationally deflected across curved spacetime into the observer's line of sight.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

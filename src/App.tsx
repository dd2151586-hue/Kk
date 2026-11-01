import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CosmicCanvas } from './components/CosmicCanvas';
import { Header } from './components/Header';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { ControlDock } from './components/ControlDock';
import { InfoModal } from './components/InfoModal';
import { CosmicSceneManager } from './scene/CosmicScene';
import { CosmicSettings, RealmType, TelemetryData } from './types/cosmic';
import { cosmicAudio } from './audio/CosmicAudio';

const DEFAULT_SETTINGS: CosmicSettings = {
  realm: 'aurum',
  blackHoleSpin: 0.85,
  diskBrightness: 1.25,
  lensingStrength: 1.0,
  dopplerBeaming: 0.85,
  particleCount: 3000,
  windSpeed: 1.2,
  fogDensity: 0.0075,
  focalLength: 50,
  isCinematicPlaying: true,
  isPaused: false,
  soundEnabled: false,
  volume: 0.7,
};

const DEFAULT_TELEMETRY: TelemetryData = {
  fps: 60,
  altitude: 2.89,
  horizonAngle: 17.8,
  relativityGamma: 1.42,
  timeDilationRatio: '1 HR = 7 YRS',
  eventHorizonRadius: '10.4 M-KM',
  focalLength: 50,
};

export default function App() {
  const [settings, setSettings] = useState<CosmicSettings>(DEFAULT_SETTINGS);
  const [telemetry, setTelemetry] = useState<TelemetryData>(DEFAULT_TELEMETRY);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const sceneManagerRef = useRef<CosmicSceneManager | null>(null);

  // Handle scene manager ready
  const handleSceneReady = useCallback((manager: CosmicSceneManager) => {
    sceneManagerRef.current = manager;
    // Sync initial settings
    manager.setRealm(DEFAULT_SETTINGS.realm);
    manager.blackHole.setSpinSpeed(DEFAULT_SETTINGS.blackHoleSpin);
    manager.blackHole.setBrightness(DEFAULT_SETTINGS.diskBrightness);
    manager.blackHole.setLensingStrength(DEFAULT_SETTINGS.lensingStrength);
    manager.blackHole.setDopplerBeaming(DEFAULT_SETTINGS.dopplerBeaming);
    manager.terrain.setWindSpeed(DEFAULT_SETTINGS.windSpeed);
    manager.setFocalLength(DEFAULT_SETTINGS.focalLength);
  }, []);

  // Update Telemetry from Three.js render loop
  const handleTelemetryUpdate = useCallback((data: TelemetryData) => {
    setTelemetry(data);
  }, []);

  // Realm switch handler
  const handleSelectRealm = useCallback((realm: RealmType) => {
    setSettings((prev) => ({ ...prev, realm }));
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setRealm(realm);
    }
  }, []);

  // Preset camera selection
  const handleSelectPreset = useCallback((presetId: string) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.applyPreset(presetId);
    }
  }, []);

  // Focal length change
  const handleSetFocalLength = useCallback((mm: number) => {
    setSettings((prev) => ({ ...prev, focalLength: mm }));
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setFocalLength(mm);
    }
  }, []);

  // Reset camera view
  const handleResetCamera = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resetCamera();
    }
  }, []);

  // Replay intro cinematic
  const handleReplayIntro = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.restartIntro();
    }
  }, []);

  // Toggle pause
  const handleTogglePause = useCallback(() => {
    setSettings((prev) => {
      const nextPaused = !prev.isPaused;
      if (sceneManagerRef.current) {
        sceneManagerRef.current.setPaused(nextPaused);
      }
      return { ...prev, isPaused: nextPaused };
    });
  }, []);

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    const isActive = cosmicAudio.toggleMute();
    setSettings((prev) => ({ ...prev, soundEnabled: isActive }));
  }, []);

  // Toggle Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Update Settings from Control Dock
  const handleUpdateSettings = useCallback((newPartial: Partial<CosmicSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      const manager = sceneManagerRef.current;
      if (manager) {
        if (newPartial.blackHoleSpin !== undefined) {
          manager.blackHole.setSpinSpeed(newPartial.blackHoleSpin);
        }
        if (newPartial.diskBrightness !== undefined) {
          manager.blackHole.setBrightness(newPartial.diskBrightness);
        }
        if (newPartial.lensingStrength !== undefined) {
          manager.blackHole.setLensingStrength(newPartial.lensingStrength);
        }
        if (newPartial.dopplerBeaming !== undefined) {
          manager.blackHole.setDopplerBeaming(newPartial.dopplerBeaming);
        }
        if (newPartial.windSpeed !== undefined) {
          manager.terrain.setWindSpeed(newPartial.windSpeed);
        }
      }
      return updated;
    });
  }, []);

  // Reset controls to default
  const handleResetControls = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    const manager = sceneManagerRef.current;
    if (manager) {
      manager.blackHole.setSpinSpeed(DEFAULT_SETTINGS.blackHoleSpin);
      manager.blackHole.setBrightness(DEFAULT_SETTINGS.diskBrightness);
      manager.blackHole.setLensingStrength(DEFAULT_SETTINGS.lensingStrength);
      manager.blackHole.setDopplerBeaming(DEFAULT_SETTINGS.dopplerBeaming);
      manager.terrain.setWindSpeed(DEFAULT_SETTINGS.windSpeed);
    }
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePause();
      } else if (e.key === '1') {
        handleSelectRealm('aurum');
      } else if (e.key === '2') {
        handleSelectRealm('viola');
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetCamera();
      } else if (e.key === 'i' || e.key === 'I') {
        setIsInfoOpen((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleToggleSound, handleTogglePause, handleSelectRealm, handleResetCamera]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none text-white font-sans">
      {/* 1. Main 3D WebGL Canvas (100% Unobstructed) */}
      <CosmicCanvas
        onSceneReady={handleSceneReady}
        onTelemetryUpdate={handleTelemetryUpdate}
      />

      {/* 2. Top Sci-Fi Header */}
      <Header
        realm={settings.realm}
        onSelectRealm={handleSelectRealm}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        isPaused={settings.isPaused}
        onTogglePause={handleTogglePause}
        onResetCamera={handleResetCamera}
        onReplayIntro={handleReplayIntro}
        onOpenInfo={() => setIsInfoOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 3. Viewport HUD Telemetry Overlay (Titles, Optics scale, Telemetry bar) */}
      <TelemetryOverlay
        realm={settings.realm}
        telemetry={telemetry}
        onSetFocalLength={handleSetFocalLength}
        focalLength={settings.focalLength}
      />

      {/* 4. Sleek Collapsible Bottom Dock (Zero center obstruction) */}
      <ControlDock
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onSelectPreset={handleSelectPreset}
        onSelectRealm={handleSelectRealm}
        onResetControls={handleResetControls}
      />

      {/* 5. Science & Lore Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Subtle cinematic letterbox vignette */}
      <div className="pointer-events-none fixed inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] z-10" />
    </div>
  );
}

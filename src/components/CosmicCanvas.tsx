import React, { useEffect, useRef } from 'react';
import { CosmicSceneManager } from '../scene/CosmicScene';
import { TelemetryData } from '../types/cosmic';

interface CosmicCanvasProps {
  onSceneReady: (manager: CosmicSceneManager) => void;
  onTelemetryUpdate: (data: TelemetryData) => void;
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  onSceneReady,
  onTelemetryUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<CosmicSceneManager | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new CosmicSceneManager(mountRef.current, onTelemetryUpdate);
    managerRef.current = manager;
    onSceneReady(manager);

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-black select-none touch-none"
    />
  );
};

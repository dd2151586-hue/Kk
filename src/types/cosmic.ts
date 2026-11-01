export type RealmType = 'aurum' | 'viola';

export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface CosmicSettings {
  realm: RealmType;
  blackHoleSpin: number;          // 0.1 to 2.5
  diskBrightness: number;         // 0.5 to 2.5
  lensingStrength: number;        // 0.5 to 2.0
  dopplerBeaming: number;         // 0.0 to 1.5
  particleCount: number;          // 500 to 5000
  windSpeed: number;              // 0.5 to 2.0
  fogDensity: number;             // 0.001 to 0.02
  focalLength: number;            // 24, 35, 50, 70, 85 mm
  isCinematicPlaying: boolean;
  isPaused: boolean;
  soundEnabled: boolean;
  volume: number;
}

export interface TelemetryData {
  fps: number;
  altitude: number;
  horizonAngle: number;
  relativityGamma: number;
  timeDilationRatio: string;
  eventHorizonRadius: string;
  focalLength: number;
}

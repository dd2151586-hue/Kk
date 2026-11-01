import React from 'react';
import { X, Sparkles, Orbit, Radio, Compass, Layers } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-none select-none">
      <div className="relative w-full max-w-2xl bg-black/95 border border-white/20 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-mono-hud text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-cinzel font-semibold tracking-wider text-white">
              Two Horizons // Expedition Archive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-white/80 leading-relaxed">
          {/* Section 1: The Two Horizons Concept */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-300 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              1. The Two Horizons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="font-semibold text-amber-300 block mb-1">HORIZON I: AURUM</span>
                <p className="text-white/70 italic mb-2">"The last farm before the event horizon."</p>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  A nostalgic tribute to Earthly tranquility. A weathered two-story homestead and a vintage pickup truck resting on a rolling wheat field under the staggering, golden-amber crown of a supermassive Kerr black hole.
                </p>
              </div>

              <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20">
                <span className="font-semibold text-purple-300 block mb-1">HORIZON II: VIOLA</span>
                <p className="text-white/70 italic mb-2">"A violet field beneath the arc of the disk."</p>
                <p className="text-white/60 text-[11px] leading-relaxed">
                  An extraterrestrial vista where a solitary spacefarer stands in quiet contemplation amidst a vast sea of bioluminescent violet flora, observing the stark, radiant white arc of spacetime.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Physics of Kerr Black Holes */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
              <Orbit className="w-3.5 h-3.5" />
              2. Relativistic Astrophysics & Lensing
            </h3>
            <p className="text-xs text-white/70">
              The visual simulation models the extreme gravitational field around a rotating (Kerr) black hole, inspired by Kip Thorne’s equations and real astronomical observations:
            </p>
            <ul className="space-y-2 text-xs text-white/60 list-disc list-inside">
              <li>
                <strong className="text-white">Gravitational Lensing:</strong> Light emitted from the back side of the equatorial accretion disk is bent over and under the black hole shadow, creating the iconic double-arc crown and under-belly.
              </li>
              <li>
                <strong className="text-white">Relativistic Doppler Beaming:</strong> Plasma on the left side orbits toward the camera at near light-speed, blueshifting and intensifying photon flux, while receding plasma is dimmed.
              </li>
              <li>
                <strong className="text-white">Photon Sphere ($1.5 R_s$):</strong> The critical unstable boundary where photons travel in circular orbits around the event horizon.
              </li>
              <li>
                <strong className="text-white">Extreme Time Dilation:</strong> Due to General Relativity, gravitational potential dilates time so that one hour spent near the inner horizon equates to years for distant observers.
              </li>
            </ul>
          </div>

          {/* Section 3: Navigation & Controls */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              3. Viewport Interaction & Optics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <span className="font-medium text-white block">Camera Control</span>
                <span className="text-white/50 text-[11px]">
                  Click and drag to rotate the camera. Scroll or pinch to zoom.
                </span>
              </div>
              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <span className="font-medium text-white block">Optical Scale</span>
                <span className="text-white/50 text-[11px]">
                  Click the 24mm to 85mm optical focal length scale on the right edge to alter camera field-of-view.
                </span>
              </div>
              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <span className="font-medium text-white block">Soundscape</span>
                <span className="text-white/50 text-[11px]">
                  Unmute the audio toggle for an ambient space drone, harmonic pad chords, and gravitational rumble synthesized in real time via Web Audio API.
                </span>
              </div>
              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <span className="font-medium text-white block">Control Dock</span>
                <span className="text-white/50 text-[11px]">
                  Adjust accretion luminosity, Kerr spin rate, and horizon wind speed via the bottom dock.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between text-[11px] text-white/50">
          <span>Zero external 3D models or textures • 100% Procedural Three.js WebGL</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

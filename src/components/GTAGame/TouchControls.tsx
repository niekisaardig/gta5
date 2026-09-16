import React from 'react';
import { 
  Car, 
  Crosshair, 
  Flame, 
  Volume2, 
  ShieldAlert,
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Hand,
  RotateCw,
  LifeBuoy
} from 'lucide-react';
import { GTAGameEngine } from './gameEngine';

interface TouchControlsProps {
  engine: GTAGameEngine;
  inVehicle: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine, inVehicle }) => {
  const handleKeyTouch = (key: string, isDown: boolean) => {
    engine.keys[key] = isDown;
  };

  const handleShootTouch = (isDown: boolean) => {
    engine.isMouseDown = isDown;
    if (isDown) engine.shoot();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 select-none">
      {/* Top Mobile Quick Actions */}
      <div className="flex justify-between items-center gap-2 pointer-events-auto">
        <button
          onTouchStart={() => engine.cycleWeapon(1)}
          onClick={() => engine.cycleWeapon(1)}
          className="bg-slate-900/80 active:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-black/40"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Wapen</span>
        </button>

        <button
          onTouchStart={() => engine.unstuckPlayerOrVehicle()}
          onClick={() => engine.unstuckPlayerOrVehicle()}
          className="bg-amber-600/90 active:bg-amber-500 text-white font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 border border-amber-400/40"
          title="Teleporteer veilig naar de boulevard als je vastzit"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Ontkoppel</span>
        </button>

        <button
          onTouchStart={() => engine.enterNearbyVehicle()}
          onClick={() => engine.enterNearbyVehicle()}
          className="bg-blue-600 active:bg-blue-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/40"
        >
          <Car className="w-4 h-4" />
          <span>{inVehicle ? 'Verlaten' : 'Instappen'}</span>
        </button>
      </div>

      {/* Bottom Controls Area */}
      <div className="flex justify-between items-end gap-4 w-full">
        {/* Left Side: Directional D-Pad */}
        <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36">
          <div />
          <button
            onTouchStart={() => handleKeyTouch('KeyW', true)}
            onTouchEnd={() => handleKeyTouch('KeyW', false)}
            onMouseDown={() => handleKeyTouch('KeyW', true)}
            onMouseUp={() => handleKeyTouch('KeyW', false)}
            className="bg-slate-900/80 active:bg-blue-600 text-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-lg shadow-md"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          <button
            onTouchStart={() => handleKeyTouch('KeyA', true)}
            onTouchEnd={() => handleKeyTouch('KeyA', false)}
            onMouseDown={() => handleKeyTouch('KeyA', true)}
            onMouseUp={() => handleKeyTouch('KeyA', false)}
            className="bg-slate-900/80 active:bg-blue-600 text-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-lg shadow-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => handleKeyTouch('KeyS', true)}
            onTouchEnd={() => handleKeyTouch('KeyS', false)}
            onMouseDown={() => handleKeyTouch('KeyS', true)}
            onMouseUp={() => handleKeyTouch('KeyS', false)}
            className="bg-slate-900/80 active:bg-blue-600 text-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-lg shadow-md"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => handleKeyTouch('KeyD', true)}
            onTouchEnd={() => handleKeyTouch('KeyD', false)}
            onMouseDown={() => handleKeyTouch('KeyD', true)}
            onMouseUp={() => handleKeyTouch('KeyD', false)}
            className="bg-slate-900/80 active:bg-blue-600 text-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-lg shadow-md"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Right Side: Action Trigger Buttons */}
        <div className="pointer-events-auto flex flex-col gap-2 items-end">
          {inVehicle ? (
            <div className="flex gap-2">
              <button
                onTouchStart={() => handleKeyTouch('Space', true)}
                onTouchEnd={() => handleKeyTouch('Space', false)}
                onMouseDown={() => handleKeyTouch('Space', true)}
                onMouseUp={() => handleKeyTouch('Space', false)}
                className="w-14 h-14 rounded-2xl bg-amber-600 active:bg-amber-500 text-white font-black flex flex-col items-center justify-center border border-amber-400/40 shadow-lg text-xs"
              >
                <Hand className="w-5 h-5 mb-0.5" />
                <span>DRIFT</span>
              </button>
              <button
                onTouchStart={() => handleKeyTouch('KeyH', true)}
                onTouchEnd={() => handleKeyTouch('KeyH', false)}
                className="w-14 h-14 rounded-2xl bg-slate-800 active:bg-slate-700 text-slate-200 font-black flex flex-col items-center justify-center border border-slate-600 shadow-lg text-xs"
              >
                <Volume2 className="w-5 h-5 mb-0.5" />
                <span>CLAXON</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onTouchStart={() => handleKeyTouch('ShiftLeft', true)}
                onTouchEnd={() => handleKeyTouch('ShiftLeft', false)}
                onMouseDown={() => handleKeyTouch('ShiftLeft', true)}
                onMouseUp={() => handleKeyTouch('ShiftLeft', false)}
                className="w-14 h-14 rounded-2xl bg-emerald-600 active:bg-emerald-500 text-white font-bold flex flex-col items-center justify-center border border-emerald-400/40 shadow-lg text-xs"
              >
                <Flame className="w-5 h-5 mb-0.5" />
                <span>SPRINT</span>
              </button>
              <button
                onTouchStart={() => handleShootTouch(true)}
                onTouchEnd={() => handleShootTouch(false)}
                onMouseDown={() => handleShootTouch(true)}
                onMouseUp={() => handleShootTouch(false)}
                className="w-16 h-16 rounded-2xl bg-rose-600 active:bg-rose-500 text-white font-black flex flex-col items-center justify-center border-2 border-rose-400 shadow-xl text-xs"
              >
                <Crosshair className="w-7 h-7 mb-0.5" />
                <span>VUUR</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

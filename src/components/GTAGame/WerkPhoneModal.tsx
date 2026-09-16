import React from 'react';
import { GTAGameEngine } from './gameEngine';
import { gtaAudio } from './audioEngine';
import { 
  Phone, 
  X, 
  CreditCard, 
  Car, 
  Sun, 
  Moon, 
  CloudRain, 
  Clock, 
  Trophy, 
  Skull, 
  ShieldAlert, 
  Utensils, 
  DollarSign, 
  ChevronRight,
  Flame,
  Radio
} from 'lucide-react';

interface WerkPhoneModalProps {
  engine: GTAGameEngine;
  onClose: () => void;
  onDepositBank: () => void;
}

export const WerkPhoneModal: React.FC<WerkPhoneModalProps> = ({
  engine,
  onClose,
  onDepositBank
}) => {
  const [activeApp, setActiveApp] = React.useState<'home' | 'bank' | 'contacts' | 'weather' | 'stats'>('home');
  const [callingContact, setCallingContact] = React.useState<string | null>(null);

  const handleCallMechanic = () => {
    gtaAudio.phoneRing();
    setCallingContact('Automonteur Johnny');
    setTimeout(() => {
      // Spawn sports car right next to player!
      const p = engine.player;
      const spawnX = p.x + Math.cos(p.angle + Math.PI / 2) * 50;
      const spawnY = p.y + Math.sin(p.angle + Math.PI / 2) * 50;
      engine.spawnVehicle('sports', spawnX, spawnY, p.angle, null, '#f59e0b');
      engine.showNotification('🚗 Monteur: "Je gloednieuwe Pfister Comet GT staat voor je klaar!"', 4.0);
      setCallingContact(null);
    }, 1800);
  };

  const handleCallDylan = () => {
    gtaAudio.phoneRing();
    setCallingContact('Dylan (Werkdonalds)');
    setTimeout(() => {
      engine.player.health = 100;
      engine.player.armor = 100;
      gtaAudio.cashPickup();
      engine.showNotification('🍔 Dylan: "Spoedbezorging onderweg! Je HP & Armor zijn weer 100%!"', 4.0);
      setCallingContact(null);
    }, 1800);
  };

  const handleCallLester = () => {
    gtaAudio.phoneRing();
    setCallingContact('Lester Crest');
    setTimeout(() => {
      if (engine.player.wantedLevel > 0) {
        if (engine.player.cash >= 300) {
          engine.player.cash -= 300;
          engine.player.wantedLevel = 0;
          engine.player.wantedTimer = 0;
          gtaAudio.cashPickup();
          engine.showNotification('🕶️ Lester: "Ik heb de politieomroepen gewist. Je bent van de radar."', 4.0);
        } else {
          engine.showNotification('Lester: "Ik werk niet gratis! Je hebt minstens $300 nodig."', 3.0);
        }
      } else {
        engine.showNotification('Lester: "Kijk in je missielijst (M) voor de grote Geldwagen Heist!"', 3.5);
      }
      setCallingContact(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:pr-16 bg-black/40 backdrop-blur-sm animate-fadeIn">
      {/* Phone Case */}
      <div className="relative w-80 h-[560px] bg-slate-900 border-4 border-slate-700 rounded-[44px] shadow-2xl overflow-hidden flex flex-col p-3 ring-8 ring-black/80">
        
        {/* Notch / Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center gap-2 z-20">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-blue-950 rounded-full" />
        </div>

        {/* Screen Bezel */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-[34px] overflow-hidden flex flex-col text-white pt-6 pb-2 px-3 border border-slate-800/80">
          
          {/* Top Status Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold px-2 py-1 mb-2">
            <span>{Math.floor(engine.timeOfDay).toString().padStart(2, '0')}:00</span>
            <span className="text-amber-400 font-black">WERKPHONE 15</span>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex">
                <div className="w-3 h-full bg-emerald-400 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Calling Overlay */}
          {callingContact && (
            <div className="absolute inset-0 bg-slate-950/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center mb-4 animate-pulse">
                <Phone className="w-10 h-10 text-blue-400 animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-white">{callingContact}</h3>
              <p className="text-xs text-blue-400 mt-1 animate-pulse">Bellen naar netwerk...</p>
            </div>
          )}

          {/* HOME SCREEN */}
          {activeApp === 'home' && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="text-center my-2">
                <div className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                  <span className="text-emerald-400">${engine.player.cash}</span>
                </div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Los Werkos Contant</p>
              </div>

              {/* App Grid */}
              <div className="grid grid-cols-3 gap-3 p-2">
                {/* Bank App */}
                <button
                  onClick={() => setActiveApp('bank')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-active:scale-95 transition-transform">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">WerkPay</span>
                </button>

                {/* Contacts App */}
                <button
                  onClick={() => setActiveApp('contacts')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-active:scale-95 transition-transform">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Contacten</span>
                </button>

                {/* Mechanic / Vehicles */}
                <button
                  onClick={handleCallMechanic}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-active:scale-95 transition-transform">
                    <Car className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Monteur</span>
                </button>

                {/* Weather & Time */}
                <button
                  onClick={() => setActiveApp('weather')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-active:scale-95 transition-transform">
                    <Sun className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Klimaat</span>
                </button>

                {/* Stats */}
                <button
                  onClick={() => setActiveApp('stats')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-active:scale-95 transition-transform">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Statistiek</span>
                </button>

                {/* Quick Radio */}
                <button
                  onClick={() => {
                    gtaAudio.nextRadioStation();
                    engine.showNotification(`Radio gewisseld met WerkPhone`, 2.0);
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-active:scale-95 transition-transform">
                    <Radio className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Autoradio</span>
                </button>
              </div>

              {/* Bottom Quick Bar */}
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-2 flex items-center justify-around mt-4 border border-slate-700/50">
                <button 
                  onClick={onDepositBank}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Stort Buit</span>
                </button>
                <button 
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-all"
                >
                  Sluiten
                </button>
              </div>
            </div>
          )}

          {/* CONTACTS APP */}
          {activeApp === 'contacts' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <h3 className="font-black text-sm text-white">Contacten</h3>
                <button onClick={() => setActiveApp('home')} className="text-xs text-blue-400 font-bold">Terug</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <div 
                  onClick={handleCallMechanic}
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl cursor-pointer flex items-center justify-between border border-slate-700/50 transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                      🚗
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Johnny Monteur</div>
                      <div className="text-[10px] text-slate-400">Breng gratis Sportwagen</div>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>

                <div 
                  onClick={handleCallDylan}
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl cursor-pointer flex items-center justify-between border border-slate-700/50 transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                      🍔
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Dylan (Werkdonalds)</div>
                      <div className="text-[10px] text-slate-400">Spoed Big Werk Menu (+HP)</div>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>

                <div 
                  onClick={handleCallLester}
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl cursor-pointer flex items-center justify-between border border-slate-700/50 transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                      🕶️
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Lester Crest</div>
                      <div className="text-[10px] text-slate-400">Verwijder Wanted Stars ($300)</div>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          )}

          {/* BANK APP */}
          {activeApp === 'bank' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h3 className="font-black text-sm text-cyan-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>WerkPay Mobile</span>
                  </h3>
                  <button onClick={() => setActiveApp('home')} className="text-xs text-blue-400 font-bold">Terug</button>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/60 to-slate-900 p-3.5 rounded-2xl border border-cyan-500/30 mb-3">
                  <span className="text-[10px] uppercase font-bold text-cyan-300">Contant op Zak</span>
                  <div className="text-2xl font-black text-white mt-0.5">${engine.player.cash}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Direct te storten naar je officiële WerkPay rekening</div>
                </div>

                <button
                  onClick={() => {
                    onDepositBank();
                    setActiveApp('home');
                  }}
                  disabled={engine.player.cash <= 0}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-98"
                >
                  Stort Alles naar WerkPay Bank
                </button>
              </div>

              <button 
                onClick={() => setActiveApp('home')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Sluiten
              </button>
            </div>
          )}

          {/* WEATHER & TIME APP */}
          {activeApp === 'weather' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h3 className="font-black text-sm text-purple-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Klimaat & Tijd</span>
                </h3>
                <button onClick={() => setActiveApp('home')} className="text-xs text-blue-400 font-bold">Terug</button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-xs font-bold text-slate-300 mb-2">Tijd van de Dag ({Math.floor(engine.timeOfDay)}:00)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        engine.timeOfDay = 12.0;
                        engine.showNotification('☀️ Tijd ingesteld op Middag (12:00)', 2);
                      }}
                      className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Sun className="w-3.5 h-3.5" /> Dag (12:00)
                    </button>
                    <button
                      onClick={() => {
                        engine.timeOfDay = 22.0;
                        engine.showNotification('🌙 Tijd ingesteld op Nacht (22:00)', 2);
                      }}
                      className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Moon className="w-3.5 h-3.5" /> Nacht (22:00)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-xs font-bold text-slate-300 mb-2">Weertype ({engine.weather.toUpperCase()})</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        engine.weather = 'sunny';
                        engine.showNotification('☀️ Helder & Zonnig weer geactiveerd', 2);
                      }}
                      className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Sun className="w-3.5 h-3.5" /> Zonnig
                    </button>
                    <button
                      onClick={() => {
                        engine.weather = 'rain';
                        engine.showNotification('🌧️ Los Werkos Regenstorm geactiveerd', 2);
                      }}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <CloudRain className="w-3.5 h-3.5" /> Regenstorm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATS APP */}
          {activeApp === 'stats' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <h3 className="font-black text-sm text-rose-400">Crimineel Dossier</h3>
                <button onClick={() => setActiveApp('home')} className="text-xs text-blue-400 font-bold">Terug</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400">Voetgangers Uitgeschakeld:</span>
                  <span className="font-bold text-white">{engine.player.kills}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400">Agenten Uitgeschakeld:</span>
                  <span className="font-bold text-rose-400">{engine.player.copsKilled}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400">Voertuigen Gekaapt:</span>
                  <span className="font-bold text-amber-400">{engine.player.carsStolen}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400">Stunt Jump Score:</span>
                  <span className="font-bold text-emerald-400">{engine.player.stuntScore} pts</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400">Missies Voltooid:</span>
                  <span className="font-bold text-cyan-400">{engine.player.missionsCompleted}</span>
                </div>
              </div>
            </div>
          )}

          {/* Phone Bottom Home Bar */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setActiveApp('home')}
              className="w-28 h-1 bg-white/40 hover:bg-white rounded-full transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

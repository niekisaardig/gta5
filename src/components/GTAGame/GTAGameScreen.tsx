import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GTAGameEngine, WEAPONS } from './gameEngine';
import { TouchControls } from './TouchControls';
import { WerkPhoneModal } from './WerkPhoneModal';
import { gtaAudio } from './audioEngine';
import { 
  Shield, 
  Heart, 
  Zap, 
  DollarSign, 
  Crosshair, 
  Radio, 
  Car, 
  Trophy, 
  Skull, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Sun,
  Moon,
  CloudRain,
  Target,
  LifeBuoy
} from 'lucide-react';
import { WeaponType, MultiplayerChatMessage, BuildingInterior } from './types';
import { MultiplayerManager } from './multiplayerManager';
import { BUILDING_INTERIORS } from './interiorsData';
import {
  Users,
  Wifi,
  MessageSquare,
  Copy,
  Send,
  LogOut,
  DoorOpen
} from 'lucide-react';

export const GTAGameScreen: React.FC = () => {
  const { currentBankAccount, quickMoneyAccount, topUpWerkPay } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GTAGameEngine | null>(null);

  // UI state synced with engine
  const [hudStats, setHudStats] = useState({
    health: 100,
    maxHealth: 100,
    armor: 50,
    maxArmor: 100,
    stamina: 100,
    cash: 500,
    wantedLevel: 0,
    currentWeapon: 'pistol' as WeaponType,
    ammo: 60,
    clipRemaining: 15,
    isReloading: false,
    inVehicle: false,
    vehicleSpeed: 0,
    vehicleHealth: 100,
    vehicleMaxHealth: 300,
    vehicleName: '',
    kills: 0,
    missionsCompleted: 0,
    timeOfDay: 14.5,
    weather: 'sunny'
  });

  const [notification, setNotification] = useState<string>('');
  const [radioToast, setRadioToast] = useState<string>('');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [isWasted, setIsWasted] = useState<boolean>(false);
  const [interiorName, setInteriorName] = useState<string | null>(null);
  const [showMissionsModal, setShowMissionsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState<boolean>(false);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('LOS-WERKOS');
  const [playerNameInput, setPlayerNameInput] = useState<string>(() => 'Speler_' + Math.floor(100 + Math.random() * 900));
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [isMultiplayerConnected, setIsMultiplayerConnected] = useState<boolean>(false);
  const [remotePlayerCount, setRemotePlayerCount] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<MultiplayerChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [bankDepositSuccess, setBankDepositSuccess] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(gtaAudio.isSoundMuted());

  const multiplayerRef = useRef<MultiplayerManager | null>(null);

  // Initialize Game Engine
  useEffect(() => {
    const engine = new GTAGameEngine();
    engineRef.current = engine;

    const mp = new MultiplayerManager({
      onRoomJoined: (roomCode) => {
        setCurrentRoomCode(roomCode);
        setIsMultiplayerConnected(true);
        engine.showNotification(`🌐 Verbonden met kamer: ${roomCode}!`, 4.0);
      },
      onRoomLeft: () => {
        setCurrentRoomCode(null);
        setIsMultiplayerConnected(false);
        setRemotePlayerCount(0);
        engine.showNotification(`🌐 Kamer verlaten. Nu in offline modus.`, 3.0);
      },
      onPlayerJoined: (player) => {
        engine.showNotification(`👋 ${player.name} is de kamer binnengekomen!`, 3.0);
        gtaAudio.cashPickup();
      },
      onPlayerLeft: () => {
        engine.showNotification(`🏃 Een speler heeft de sessie verlaten.`, 2.5);
      },
      onPlayersUpdate: (players) => {
        setRemotePlayerCount(players.size);
      },
      onChatMessage: (msg) => {
        setChatMessages(prev => [...prev.slice(-25), msg]);
        const sender = engine.multiplayer?.remotePlayers.get(msg.playerId);
        if (sender) {
          engine.addSpeech(`${msg.playerName}: ${msg.message}`, sender.x, sender.y - 25, sender.color || '#38bdf8');
        } else if (msg.playerId === engine.multiplayer?.localPlayerId) {
          engine.addSpeech(msg.message, engine.player.x, engine.player.y - 25, '#38bdf8');
        }
      },
      onError: (err) => {
        engine.showNotification(`⚠️ Multiplayer: ${err}`, 3.5);
      }
    });

    engine.setMultiplayer(mp);
    multiplayerRef.current = mp;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 60; // minus top header height
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event Listeners for Keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      engine.keys[e.code] = true;

      // Quick hotkeys
      if (e.code === 'Digit1') engine.setWeapon('fist');
      if (e.code === 'Digit2') engine.setWeapon('pistol');
      if (e.code === 'Digit3') engine.setWeapon('smg');
      if (e.code === 'Digit4') engine.setWeapon('shotgun');
      if (e.code === 'Digit5') engine.setWeapon('sniper');
      if (e.code === 'Digit6') engine.setWeapon('grenade');
      if (e.code === 'Digit7') engine.setWeapon('rpg');
      if (e.code === 'KeyM') setShowMissionsModal(prev => !prev);
      if (e.code === 'KeyP') setShowPhoneModal(prev => !prev);
      if (e.code === 'KeyK') engine.unstuckPlayerOrVehicle();
      if (e.code === 'KeyT') setShowChat(prev => !prev);
      if (e.code === 'Slash') setShowHelpModal(prev => !prev);

      // In-car radio switch
      if (e.code === 'KeyR' && engine.player.inVehicleId) {
        gtaAudio.nextRadioStation();
        const cur = gtaAudio.getCurrentStation();
        engine.radioToast = `📻 ${cur.name} (${cur.freq}) - ${cur.genre}`;
        engine.radioToastTimer = 3.0;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      engine.mousePos.x = e.clientX - rect.left;
      engine.mousePos.y = e.clientY - rect.top;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.isMouseDown = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.isMouseDown = false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      engine.cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    // Main Game Render Loop
    let animationFrameId: number;
    let frameCount = 0;

    const gameLoop = (timestamp: number) => {
      engine.update(timestamp);
      renderGame(ctx, engine, canvas.width, canvas.height);

      // Sync state to React HUD every 3 frames for optimal 60fps performance
      frameCount++;
      if (frameCount % 3 === 0) {
        const car = engine.player.inVehicleId ? engine.getVehicle(engine.player.inVehicleId) : null;
        setHudStats({
          health: Math.round(engine.player.health),
          maxHealth: engine.player.maxHealth,
          armor: Math.round(engine.player.armor),
          maxArmor: engine.player.maxArmor,
          stamina: Math.round(engine.player.stamina),
          cash: engine.player.cash,
          wantedLevel: engine.player.wantedLevel,
          currentWeapon: engine.player.currentWeapon,
          ammo: engine.player.ammo[engine.player.currentWeapon] || 0,
          clipRemaining: engine.player.clipRemaining[engine.player.currentWeapon] || 0,
          isReloading: engine.player.isReloading,
          inVehicle: !!engine.player.inVehicleId,
          vehicleSpeed: car ? Math.round(Math.abs(car.speed) * 15) : 0,
          vehicleHealth: car ? Math.max(0, Math.round(car.health)) : 100,
          vehicleMaxHealth: car ? car.maxHealth : 300,
          vehicleName: car ? car.name : '',
          kills: engine.player.kills,
          missionsCompleted: engine.player.missionsCompleted,
          timeOfDay: engine.timeOfDay,
          weather: engine.weather
        });

        setNotification(engine.notification);
        setRadioToast(engine.radioToast);
        setInteractionPrompt(engine.interactionPrompt);
        setIsWasted(engine.isWasted);
        setInteriorName(engine.currentInterior ? engine.currentInterior.name : null);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      gtaAudio.stopRadio();
      gtaAudio.stopEngine();
      gtaAudio.setPoliceSiren(false);
      mp.disconnect();
    };
  }, []);

  // --- RENDERING PIPELINE ---
  const renderGame = (
    ctx: CanvasRenderingContext2D,
    engine: GTAGameEngine,
    viewW: number,
    viewH: number
  ) => {
    ctx.clearRect(0, 0, viewW, viewH);

    // If inside a building interior, render interior view!
    if (engine.currentInterior) {
      renderInterior(ctx, engine.currentInterior, engine, viewW, viewH);
      renderRadar(ctx, engine, viewW, viewH);
      return;
    }

    ctx.save();
    // Camera Transform
    ctx.translate(viewW / 2, viewH / 2);
    ctx.scale(engine.camera.zoom, engine.camera.zoom);
    ctx.translate(-engine.camera.x, -engine.camera.y);

    // 1. Draw Ground / Asphalt Background
    ctx.fillStyle = '#0f172a'; // Deep slate base
    ctx.fillRect(0, 0, engine.width, engine.height);

    // 1.1 Draw Green Zones (Parks, Golf Greens, Sandy Beaches)
    for (const gz of engine.greenZones) {
      if (gz.type === 'beach') {
        ctx.fillStyle = '#e2d5b5'; // Warm beach sand
        ctx.fillRect(gz.x, gz.y, gz.width, gz.height);
        // Sand texture speckles
        ctx.fillStyle = '#d4c39c';
        for (let i = 0; i < 40; i++) {
          const sx = gz.x + ((i * 137) % gz.width);
          const sy = gz.y + ((i * 249) % gz.height);
          ctx.fillRect(sx, sy, 4, 4);
        }
      } else if (gz.type === 'golf') {
        ctx.fillStyle = '#14532d'; // Manicured golf green
        ctx.fillRect(gz.x, gz.y, gz.width, gz.height);
        ctx.fillStyle = '#166534';
        ctx.fillRect(gz.x + 20, gz.y + 20, gz.width - 40, gz.height - 40);
      } else {
        ctx.fillStyle = '#1e392a'; // Lush park grass
        ctx.fillRect(gz.x, gz.y, gz.width, gz.height);
        ctx.fillStyle = '#166534';
        ctx.fillRect(gz.x + 15, gz.y + 15, gz.width - 30, gz.height - 30);
      }
    }

    // 1.2 Draw Water Zones (Pacific Ocean, Alamo Sea, Harbor, Mirror Lake)
    const timeNow = Date.now();
    for (const wz of engine.waterZones) {
      const waterGrad = ctx.createLinearGradient(wz.x, wz.y, wz.x + wz.width, wz.y + wz.height);
      waterGrad.addColorStop(0, '#0369a1');
      waterGrad.addColorStop(0.5, '#0284c7');
      waterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(wz.x, wz.y, wz.width, wz.height);

      // Rolling animated water wave caustics
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 2.5;
      const waveOffset = (timeNow / 800) % 60;
      for (let wy = wz.y + 30; wy < wz.y + wz.height; wy += 90) {
        ctx.beginPath();
        for (let wx = wz.x; wx <= wz.x + wz.width; wx += 40) {
          const waveH = Math.sin((wx + timeNow / 400) / 35) * 6;
          if (wx === wz.x) ctx.moveTo(wx, wy + waveH);
          else ctx.lineTo(wx, wy + waveH);
        }
        ctx.stroke();
      }

      // Shoreline white foam breaklines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(wz.x, wz.y, wz.width, wz.height);
    }

    // Pavement Blocks
    ctx.fillStyle = '#1e293b';
    for (let bx = 0; bx < engine.width; bx += 600) {
      for (let by = 0; by < engine.height; by += 600) {
        ctx.fillRect(bx + 140, by + 140, 320, 320);
      }
    }

    // 2. Draw Roads with markings
    for (const r of engine.roads) {
      ctx.fillStyle = '#182030';
      ctx.fillRect(r.x, r.y, r.width, r.height);

      ctx.fillStyle = '#475569';
      if (r.direction === 'horizontal') {
        ctx.fillRect(r.x, r.y, r.width, 10);
        ctx.fillRect(r.x, r.y + r.height - 10, r.width, 10);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([25, 20]);
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + r.height / 2);
        ctx.lineTo(r.x + r.width, r.y + r.height / 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + r.height * 0.25);
        ctx.lineTo(r.x + r.width, r.y + r.height * 0.25);
        ctx.moveTo(r.x, r.y + r.height * 0.75);
        ctx.lineTo(r.x + r.width, r.y + r.height * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillRect(r.x, r.y, 10, r.height);
        ctx.fillRect(r.x + r.width - 10, r.y, 10, r.height);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([25, 20]);
        ctx.beginPath();
        ctx.moveTo(r.x + r.width / 2, r.y);
        ctx.lineTo(r.x + r.width / 2, r.y + r.height);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x + r.width * 0.25, r.y);
        ctx.lineTo(r.x + r.width * 0.25, r.y + r.height);
        ctx.moveTo(r.x + r.width * 0.75, r.y);
        ctx.lineTo(r.x + r.width * 0.75, r.y + r.height);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 2.1 Draw Crosswalk Zebra Stripes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (const cw of engine.crosswalks) {
      if (cw.direction === 'horizontal') {
        const barWidth = 10;
        const barGap = 8;
        for (let bx = cw.x; bx < cw.x + cw.width; bx += barWidth + barGap) {
          ctx.fillRect(bx, cw.y, barWidth, cw.height);
        }
      } else {
        const barHeight = 10;
        const barGap = 8;
        for (let by = cw.y; by < cw.y + cw.height; by += barHeight + barGap) {
          ctx.fillRect(cw.x, by, cw.width, barHeight);
        }
      }
    }

    // 3. Draw Tire Skid Marks
    for (const skid of engine.skidMarks) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${skid.alpha})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(skid.x1, skid.y1);
      ctx.lineTo(skid.x2, skid.y2);
      ctx.stroke();
    }

    // 4. Draw Buildings & Landmarks
    for (const b of engine.buildings) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(b.x + 12, b.y + 12, b.width, b.height);

      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);

      ctx.fillStyle = b.roofColor;
      ctx.fillRect(b.x + 6, b.y + 6, b.width - 12, b.height - 12);

      // Special Landmark Logos & Neon
      if (b.type === 'werkdonalds') {
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('W', b.x + b.width / 2, b.y + b.height / 2);

        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('WERKDONALDS', b.x + b.width / 2, b.y + b.height / 2 + 25);
      } else if (b.type === 'bank') {
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(b.x + 20, b.y + 20, b.width - 40, b.height - 40);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💳', b.x + b.width / 2, b.y + b.height / 2);
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('WERKPAY BANK', b.x + b.width / 2, b.y + b.height / 2 + 22);
      } else if (b.type === 'ammu') {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯', b.x + b.width / 2, b.y + b.height / 2);
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('AMMU-NATION', b.x + b.width / 2, b.y + b.height / 2 + 22);
      } else if (b.type === 'paynspray') {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔧', b.x + b.width / 2, b.y + b.height / 2);
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('PAY \'N\' SPRAY', b.x + b.width / 2, b.y + b.height / 2 + 20);
      } else if (b.type === 'hospital') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(b.x + b.width / 2 - 6, b.y + b.height / 2 - 20, 12, 40);
        ctx.fillRect(b.x + b.width / 2 - 20, b.y + b.height / 2 - 6, 40, 12);
      } else if (b.type === 'police') {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚨', b.x + b.width / 2, b.y + b.height / 2);
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LSPD PRECINCT', b.x + b.width / 2, b.y + b.height / 2 + 22);
      }

      // Illuminated 3D entrance doorway if building has an interior
      if (b.entrance && BUILDING_INTERIORS[b.id]) {
        const ent = b.entrance;
        const pulse = (Math.sin(Date.now() / 240) + 1) / 2;
        ctx.save();
        ctx.fillStyle = `rgba(34, 197, 94, ${0.25 + pulse * 0.35})`;
        ctx.fillRect(ent.x - 6, ent.y, ent.width + 12, ent.height + 16);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(ent.x - 6, ent.y, ent.width + 12, ent.height + 16);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 INGANG [E]', ent.x + ent.width / 2, ent.y + ent.height + 25);
        ctx.restore();
      }
    }

    // 5. Draw Props (Hydrants, ATMs, Trash, Streetlamps, Stunt Ramps, Palms, Trees, Containers, Cacti)
    for (const prop of engine.props) {
      ctx.save();
      ctx.translate(prop.x, prop.y);
      ctx.rotate(prop.angle);

      if (prop.type === 'hydrant') {
        ctx.fillStyle = prop.isDestroyed ? '#475569' : '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-3, -3, 6, 6);
      } else if (prop.type === 'trash') {
        ctx.fillStyle = prop.isDestroyed ? '#334155' : '#475569';
        ctx.fillRect(-9, -9, 18, 18);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-9, -9, 18, 18);
      } else if (prop.type === 'atm') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -7, 20, 14);
        ctx.fillStyle = '#22c55e'; // ATM glowing screen
        ctx.fillRect(-6, -4, 12, 6);
      } else if (prop.type === 'lamp') {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (prop.type === 'ramp') {
        // High visibility yellow/black stunt ramp with jump arrows!
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height);
        // Jump Chevrons
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲', 0, 4);
      } else if (prop.type === 'palm') {
        // California / Vespucci Palm Tree
        // Trunk shadow & ring
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        // 6 lush green curved palm fronds
        for (let fi = 0; fi < 6; fi++) {
          const fa = (fi * Math.PI) / 3;
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(Math.cos(fa) * 16, Math.sin(fa) * 16, Math.cos(fa + 0.2) * 28, Math.sin(fa + 0.2) * 28);
          ctx.stroke();
        }
        // Coconuts in center
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(2, 2, 3, 0, Math.PI * 2);
        ctx.arc(-2, -2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (prop.type === 'tree') {
        // Oak Tree canopy with shaded foliage
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(4, 4, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(-4, -4, 13, 0, Math.PI * 2);
        ctx.fill();
      } else if (prop.type === 'container') {
        // Industrial Shipping Freight Container
        const cColors = ['#1d4ed8', '#c2410c', '#15803d', '#b91c1c', '#475569'];
        const cColor = cColors[Math.abs(Math.floor(prop.x / 20)) % cColors.length];
        ctx.fillStyle = cColor;
        ctx.fillRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height);
        // Corrugated metal rib lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 2;
        for (let cx = -prop.width / 2 + 8; cx < prop.width / 2; cx += 10) {
          ctx.beginPath();
          ctx.moveTo(cx, -prop.height / 2);
          ctx.lineTo(cx, prop.height / 2);
          ctx.stroke();
        }
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height);
      } else if (prop.type === 'cactus') {
        // Sandy Shores Saguaro Cactus
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Cactus arms
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(-10, -6);
        ctx.lineTo(-10, 0);
        ctx.moveTo(10, -6);
        ctx.lineTo(10, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 6. Draw Traffic Lights
    for (const tl of engine.trafficLights) {
      ctx.save();
      ctx.translate(tl.x, tl.y);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -16, 16, 32);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(-8, -16, 16, 32);

      // Red bulb
      ctx.fillStyle = tl.state === 'red' ? '#ef4444' : '#450a0a';
      ctx.beginPath();
      ctx.arc(0, -9, 4, 0, Math.PI * 2);
      ctx.fill();

      // Yellow bulb
      ctx.fillStyle = tl.state === 'yellow' ? '#facc15' : '#422006';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Green bulb
      ctx.fillStyle = tl.state === 'green' ? '#22c55e' : '#052e16';
      ctx.beginPath();
      ctx.arc(0, 9, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Interactive Rings (Locations across 6400x6400 map)
    drawPulsingRing(ctx, 3415, 4000, '#facc15', '🍔 Werkdonalds');
    drawPulsingRing(ctx, 615, 3210, '#facc15', '🍔 Pier Diner');
    drawPulsingRing(ctx, 2515, 3780, '#4ade80', '🔧 Pay \'n\' Spray');
    drawPulsingRing(ctx, 4315, 5580, '#4ade80', '🔧 Harbor Spray');
    drawPulsingRing(ctx, 4305, 3090, '#ef4444', '🔫 Ammu-Nation');
    drawPulsingRing(ctx, 5185, 1260, '#ef4444', '🔫 Desert Guns');
    drawPulsingRing(ctx, 2540, 3120, '#38bdf8', '💳 WerkPay Bank');
    drawPulsingRing(ctx, 2540, 1980, '#f43f5e', '🏥 Hospitaal');

    // 8. Draw Active Mission Marker
    if (engine.activeMission) {
      const m = engine.activeMission;
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(m.targetX, m.targetY, m.targetRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🎯 ${m.subtitle.toUpperCase()}`, m.targetX, m.targetY - m.targetRadius - 10);
      ctx.restore();
    }

    // 9. Draw Pedestrians
    for (const ped of engine.pedestrians) {
      ctx.save();
      ctx.translate(ped.x, ped.y);
      ctx.rotate(ped.angle);

      if (ped.state === 'dead') {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.75)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = ped.shirtColor;
        ctx.fillRect(-10, -6, 20, 12);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(2, 2, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated walking stride
        const stride = Math.sin(Date.now() / 120) * (ped.state === 'walking' || ped.state === 'panicking' ? 5 : 0);
        ctx.fillStyle = ped.pantsColor;
        ctx.fillRect(-4 + stride, -8, 8, 4);
        ctx.fillRect(-4 - stride, 4, 8, 4);

        ctx.fillStyle = ped.shirtColor;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = ped.skinColor;
        ctx.beginPath();
        ctx.arc(2, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        if (ped.isPolice) {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(0, -4, 4, 8);
          ctx.fillStyle = '#475569';
          ctx.fillRect(6, 2, 7, 3);
        }
      }
      ctx.restore();
    }

    // 10. Draw Speech Bubbles
    for (const sb of engine.speechBubbles) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = sb.color;
      ctx.lineWidth = 1.5;
      ctx.font = 'bold 11px sans-serif';
      const textWidth = ctx.measureText(sb.text).width;
      const bW = textWidth + 14;
      const bH = 22;
      const bX = sb.x - bW / 2;
      const bY = sb.y - 34;

      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = sb.color;
      ctx.textAlign = 'center';
      ctx.fillText(sb.text, sb.x, bY + 15);
      ctx.restore();
    }

    // 11. Draw Vehicles
    for (const v of engine.vehicles) {
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate(v.angle);

      // Air stunt scale
      const airScale = v.inAir ? 1.25 : 1.0;
      ctx.scale(airScale, airScale);

      // Vehicle Shadow
      ctx.fillStyle = v.inAir ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-v.length / 2 + (v.inAir ? 16 : 5), -v.width / 2 + (v.inAir ? 16 : 5), v.length, v.width);

      // Wheels
      ctx.fillStyle = '#0f172a';
      const wheelW = 10;
      const wheelH = 5;
      ctx.fillRect(-v.length / 2 + 8, -v.width / 2 - 3, wheelW, wheelH);
      ctx.fillRect(v.length / 2 - 18, -v.width / 2 - 3, wheelW, wheelH);
      ctx.fillRect(-v.length / 2 + 8, v.width / 2 - 2, wheelW, wheelH);
      ctx.fillRect(v.length / 2 - 18, v.width / 2 - 2, wheelW, wheelH);

      // Body Base
      ctx.fillStyle = v.isDead ? '#18181b' : v.color;
      ctx.beginPath();
      ctx.roundRect(-v.length / 2, -v.width / 2, v.length, v.width, 8);
      ctx.fill();

      // Windshield & Glass
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-2, -v.width / 2 + 4, 12, v.width - 8);
      ctx.fillRect(-v.length / 2 + 10, -v.width / 2 + 4, 7, v.width - 8);

      // Roof
      ctx.fillStyle = v.isDead ? '#09090b' : v.color;
      ctx.fillRect(-v.length / 2 + 18, -v.width / 2 + 4, v.length - 34, v.width - 8);

      // Headlights
      ctx.fillStyle = v.lightsOn ? '#fef08a' : '#cbd5e1';
      ctx.fillRect(v.length / 2 - 2, -v.width / 2 + 3, 3, 6);
      ctx.fillRect(v.length / 2 - 2, v.width / 2 - 9, 3, 6);

      // Taillights / Brake lights
      ctx.fillStyle = v.brakeLights ? '#ef4444' : '#991b1b';
      ctx.fillRect(-v.length / 2 - 1, -v.width / 2 + 3, 3, 5);
      ctx.fillRect(-v.length / 2 - 1, v.width / 2 - 8, 3, 5);

      // Police Lightbar
      if (v.isPolice) {
        const isRed = Math.floor(Date.now() / 140) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
        ctx.fillRect(-6, -v.width / 2 + 2, 10, v.width - 4);
      }

      // Sports/Muscle Spoiler
      if (v.type === 'sports' || v.type === 'muscle') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-v.length / 2 - 3, -v.width / 2 + 2, 4, v.width - 4);
      }

      ctx.restore();
    }

    // 12. Draw Player (if on foot)
    if (!engine.player.inVehicleId) {
      ctx.save();
      ctx.translate(engine.player.x, engine.player.y);
      ctx.rotate(engine.player.angle);

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(3, 3, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Blue jacket)
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(4, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Weapon in hands
      if (engine.player.currentWeapon !== 'fist') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 2, 13, 4);
      }

      ctx.restore();
    }

    // 12.1 Draw Remote Multiplayer Players (Outdoors)
    if (engine.multiplayer && engine.multiplayer.isConnected()) {
      engine.multiplayer.remotePlayers.forEach(rp => {
        // Only render if in the same realm (both outdoors)
        if (rp.interiorId) return;

        ctx.save();
        ctx.translate(rp.x, rp.y);
        ctx.rotate(rp.angle);

        if (rp.inVehicle) {
          // Vehicle
          ctx.fillStyle = rp.vehicleColor || '#38bdf8';
          ctx.fillRect(-22, -12, 44, 24);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-10, -9, 20, 18);
        } else {
          // Walking Player
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.beginPath();
          ctx.ellipse(3, 3, 10, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = rp.color || '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(4, 0, 6, 0, Math.PI * 2);
          ctx.fill();

          if (rp.currentWeapon && rp.currentWeapon !== 'fist') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(8, 2, 13, 4);
          }
        }
        ctx.restore();

        // Player Name Tag & Health bar
        ctx.save();
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = rp.color || '#38bdf8';
        ctx.fillText(rp.name, rp.x, rp.y - 24);

        const hpPct = Math.max(0, Math.min(1, rp.health / rp.maxHealth));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(rp.x - 18, rp.y - 20, 36, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(rp.x - 18, rp.y - 20, 36 * hpPct, 4);
        ctx.restore();
      });
    }

    // 13. Draw Bullets & Grenades
    for (const b of engine.bullets) {
      ctx.strokeStyle = b.shooter === 'player' ? '#facc15' : '#ef4444';
      ctx.lineWidth = b.weapon === 'rpg' ? 6 : (b.weapon === 'sniper' ? 4 : 2);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
      ctx.stroke();
    }

    for (const g of engine.grenades) {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(g.x - 2, g.y - 2, 4, 4);
    }

    // 14. Draw Particles (Smoke, Fire, Sparks, Blood, Water)
    for (const p of engine.particles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 15. DYNAMIC ATMOSPHERE & NIGHT / SUNSET / HEADLIGHT ILLUMINATION
    renderAtmosphereAndLights(ctx, engine);

    // 16. Police Helicopter Searchlight (5 Stars)
    if (engine.heli.active) {
      ctx.save();
      const hX = engine.heli.x;
      const hY = engine.heli.y;

      const beamGrad = ctx.createRadialGradient(hX, hY, 20, hX, hY, 180);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      beamGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.3)');
      beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(hX, hY, 180, 0, Math.PI * 2);
      ctx.fill();

      // Helicopter shadow
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(hX - 30, hY - 12, 60, 24);
      ctx.restore();
    }

    ctx.restore(); // Restore camera transform

    // 17. GTA V STYLE MINIMAP (Bottom-Left)
    renderRadar(ctx, engine, viewW, viewH);
  };

  // --- DYNAMIC ATMOSPHERE & VEHICLE CONICAL HEADLIGHTS ---
  const renderAtmosphereAndLights = (ctx: CanvasRenderingContext2D, engine: GTAGameEngine) => {
    const time = engine.timeOfDay;
    // Ambient darkness factor
    let darkAlpha = 0;
    let ambientColor = 'rgba(8, 15, 35, 0.74)';

    if (time >= 21 || time <= 5) {
      darkAlpha = 0.72; // Deep night
    } else if (time >= 18 && time < 21) {
      // Sunset
      const t = (time - 18) / 3;
      darkAlpha = t * 0.65;
      ambientColor = `rgba(124, 45, 18, ${darkAlpha * 0.8})`;
    } else if (time > 5 && time <= 7) {
      // Dawn
      const t = 1 - (time - 5) / 2;
      darkAlpha = t * 0.65;
    }

    if (darkAlpha > 0.05) {
      ctx.save();
      // Apply dark ambient veil
      ctx.fillStyle = ambientColor;
      ctx.fillRect(0, 0, engine.width, engine.height);

      // Cut out light cones using 'destination-out' or additive blending
      ctx.globalCompositeOperation = 'destination-out';

      // 1. Car headlights
      for (const v of engine.vehicles) {
        if (v.lightsOn) {
          const coneLength = 220;
          const coneSpread = 0.45;
          const fX = v.x + Math.cos(v.angle) * (v.length / 2);
          const fY = v.y + Math.sin(v.angle) * (v.length / 2);

          const grad = ctx.createRadialGradient(fX, fY, 10, fX, fY, coneLength);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.45)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(fX, fY);
          ctx.arc(fX, fY, coneLength, v.angle - coneSpread, v.angle + coneSpread);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 2. Streetlamp pools
      for (const prop of engine.props) {
        if (prop.type === 'lamp' && !prop.isDestroyed) {
          const lampGrad = ctx.createRadialGradient(prop.x, prop.y, 5, prop.x, prop.y, 90);
          lampGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          lampGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = lampGrad;
          ctx.beginPath();
          ctx.arc(prop.x, prop.y, 90, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Player flashlight on foot
      if (!engine.player.inVehicleId) {
        const pGrad = ctx.createRadialGradient(engine.player.x, engine.player.y, 10, engine.player.x, engine.player.y, 70);
        pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(engine.player.x, engine.player.y, 70, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  };

  // --- PULSING INTERACTION RING HELPER ---
  const drawPulsingRing = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    label: string
  ) => {
    const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
    const r = 38 + pulse * 6;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - r - 8);
    ctx.restore();
  };

  // --- BUILDING INTERIOR RENDERER ---
  const renderInterior = (
    ctx: CanvasRenderingContext2D,
    interior: BuildingInterior,
    engine: GTAGameEngine,
    viewW: number,
    viewH: number
  ) => {
    // 1. Dark room background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.save();
    // Center camera on interior smoothly
    ctx.translate(viewW / 2, viewH / 2);
    ctx.scale(engine.camera.zoom, engine.camera.zoom);
    ctx.translate(-engine.camera.x, -engine.camera.y);

    // 2. Interior Floor
    ctx.fillStyle = interior.floorColor;
    ctx.fillRect(0, 0, interior.width, interior.height);

    // Floor tile grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    for (let tx = 0; tx <= interior.width; tx += 60) {
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx, interior.height);
      ctx.stroke();
    }
    for (let ty = 0; ty <= interior.height; ty += 60) {
      ctx.beginPath();
      ctx.moveTo(0, ty);
      ctx.lineTo(interior.width, ty);
      ctx.stroke();
    }

    // 3. Thick Outer Architectural Walls
    ctx.strokeStyle = interior.wallColor;
    ctx.lineWidth = 26;
    ctx.strokeRect(13, 13, interior.width - 26, interior.height - 26);

    // 4. Exit Doorway
    const ex = interior.exitPoint;
    const pulse = (Math.sin(Date.now() / 240) + 1) / 2;
    ctx.fillStyle = `rgba(34, 197, 94, ${0.35 + pulse * 0.25})`;
    ctx.fillRect(ex.x, ex.y, ex.width, ex.height);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.strokeRect(ex.x, ex.y, ex.width, ex.height);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 UITGANG (E)', ex.x + ex.width / 2, ex.y + ex.height / 2 + 5);

    // 5. Furniture & Props
    for (const f of interior.furniture) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(f.x + 4, f.y + 4, f.width, f.height);

      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, f.width, f.height);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(f.x, f.y, f.width, f.height);

      if (f.label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.label, f.x + f.width / 2, f.y + f.height / 2);
      }
      ctx.restore();
    }

    // 6. Interactive Zones
    for (const zone of interior.interactionZones) {
      drawPulsingRing(ctx, zone.x, zone.y, '#38bdf8', zone.name);
    }

    // 7. NPCs
    for (const npc of interior.npcs) {
      ctx.save();
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.angle);

      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(4, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(npc.name, npc.x, npc.y - 20);
      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`[${npc.role}]`, npc.x, npc.y - 9);
      ctx.restore();
    }

    // 8. Remote Multiplayer Players in this interior
    if (engine.multiplayer && engine.multiplayer.isConnected()) {
      engine.multiplayer.remotePlayers.forEach(rp => {
        if (rp.interiorId !== interior.id) return;
        ctx.save();
        ctx.translate(rp.x, rp.y);
        ctx.rotate(rp.angle);

        ctx.fillStyle = rp.color || '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(4, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        if (rp.currentWeapon && rp.currentWeapon !== 'fist') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(6, 2, 10, 3);
        }
        ctx.restore();

        ctx.save();
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = rp.color || '#38bdf8';
        ctx.fillText(rp.name, rp.x, rp.y - 22);

        const hpPct = Math.max(0, Math.min(1, rp.health / rp.maxHealth));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(rp.x - 16, rp.y - 18, 32, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(rp.x - 16, rp.y - 18, 32 * hpPct, 4);
        ctx.restore();
      });
    }

    // 9. Local Player
    ctx.save();
    ctx.translate(engine.player.x, engine.player.y);
    ctx.rotate(engine.player.angle);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(2, 2, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = engine.player.skin === 'franklin' ? '#0284c7' : engine.player.skin === 'trevor' ? '#ea580c' : '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(4, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    if (engine.player.currentWeapon !== 'fist') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, 2, 12, 3);
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(engine.multiplayer?.playerName || 'Jij (Speler)', engine.player.x, engine.player.y - 22);
    ctx.restore();

    // 10. Bullets & Particles inside
    for (const b of engine.bullets) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
      ctx.stroke();
    }

    for (const p of engine.particles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const sb of engine.speechBubbles) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = sb.color;
      ctx.lineWidth = 1.5;
      const metrics = ctx.measureText(sb.text);
      const bubbleW = metrics.width + 16;
      ctx.beginPath();
      ctx.roundRect(sb.x - bubbleW / 2, sb.y - 18, bubbleW, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sb.text, sb.x, sb.y - 7);
      ctx.restore();
    }

    ctx.restore(); // Camera transform restore

    // Interior Top Banner
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(viewW / 2 - 200, 16, 400, 36, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🏛️ ${interior.name.toUpperCase()} (Binnen)`, viewW / 2, 34);
    ctx.restore();
  };

  // --- GTA V RADAR / MINIMAP ---
  const renderRadar = (
    ctx: CanvasRenderingContext2D,
    engine: GTAGameEngine,
    viewW: number,
    viewH: number
  ) => {
    const mapSize = 175;
    const mapX = 24;
    const mapY = viewH - mapSize - 32;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapSize, mapSize, 18);
    ctx.fill();
    ctx.stroke();
    ctx.clip();

    // If inside interior, render interior map!
    if (engine.currentInterior) {
      const interior = engine.currentInterior;
      const intScale = (mapSize - 40) / Math.max(interior.width, interior.height);

      ctx.translate(mapX + mapSize / 2, mapY + mapSize / 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-mapSize / 2 + 10, -mapSize / 2 + 10, mapSize - 20, mapSize - 20);

      // Furniture boxes on minimap
      ctx.fillStyle = '#475569';
      for (const f of interior.furniture) {
        ctx.fillRect(
          (f.x - interior.width / 2) * intScale,
          (f.y - interior.height / 2) * intScale,
          f.width * intScale,
          f.height * intScale
        );
      }

      // Exit point
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(
        (interior.exitPoint.x - interior.width / 2) * intScale,
        (interior.exitPoint.y - interior.height / 2) * intScale,
        interior.exitPoint.width * intScale,
        interior.exitPoint.height * intScale
      );

      // Player arrow
      ctx.save();
      ctx.translate((engine.player.x - interior.width / 2) * intScale, (engine.player.y - interior.height / 2) * intScale);
      ctx.rotate(engine.player.angle);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-5, -4);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();

      // District / Room banner
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(mapX, mapY + mapSize + 4, mapSize, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(interior.name.toUpperCase(), mapX + mapSize / 2, mapY + mapSize + 14);
      ctx.restore();
      return;
    }

    const scale = mapSize / 2400;
    const pX = engine.player.x;
    const pY = engine.player.y;

    ctx.translate(mapX + mapSize / 2, mapY + mapSize / 2);

    // Green zones on radar
    for (const gz of engine.greenZones) {
      ctx.fillStyle = gz.type === 'beach' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(22, 101, 52, 0.45)';
      ctx.fillRect((gz.x - pX) * scale, (gz.y - pY) * scale, gz.width * scale, gz.height * scale);
    }

    // Water zones on radar
    ctx.fillStyle = 'rgba(2, 132, 199, 0.65)';
    for (const wz of engine.waterZones) {
      ctx.fillRect((wz.x - pX) * scale, (wz.y - pY) * scale, wz.width * scale, wz.height * scale);
    }

    // Buildings silhouette on radar
    ctx.fillStyle = 'rgba(51, 65, 85, 0.5)';
    for (const b of engine.buildings) {
      ctx.fillRect((b.x - pX) * scale, (b.y - pY) * scale, b.width * scale, b.height * scale);
    }

    // Roads on radar
    ctx.fillStyle = 'rgba(100, 116, 139, 0.9)';
    for (const r of engine.roads) {
      ctx.fillRect((r.x - pX) * scale, (r.y - pY) * scale, r.width * scale, r.height * scale);
    }

    // Police Blips (flashing red and blue)
    for (const v of engine.vehicles) {
      if (v.isPolice) {
        ctx.fillStyle = Math.floor(Date.now() / 150) % 2 === 0 ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc((v.x - pX) * scale, (v.y - pY) * scale, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mission objective blip
    if (engine.activeMission) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc((engine.activeMission.targetX - pX) * scale, (engine.activeMission.targetY - pY) * scale, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Landmark blips across expanded map
    const drawBlip = (bx: number, by: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect((bx - pX) * scale - 3, (by - pY) * scale - 3, 6, 6);
    };

    drawBlip(3415, 4000, '#facc15'); // Werkdonalds HQ
    drawBlip(615, 3210, '#facc15');  // Werkdonalds Pier
    drawBlip(2540, 3120, '#38bdf8'); // Bank
    drawBlip(4305, 3090, '#ef4444'); // Ammu Downtown
    drawBlip(5185, 1260, '#ef4444'); // Ammu Sandy
    drawBlip(2515, 3780, '#4ade80'); // Pay n Spray Downtown
    drawBlip(4315, 5580, '#4ade80'); // Pay n Spray Harbor
    drawBlip(2540, 1980, '#f43f5e'); // Hospital

    // Player arrow (center)
    ctx.rotate(engine.player.angle);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-7, -5);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-7, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // GTA V District Name Banner below radar
    const districtName = engine.getCurrentDistrict().toUpperCase();
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(mapX, mapY + mapSize + 4, mapSize, 20, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(districtName, mapX + mapSize / 2, mapY + mapSize + 14);
    ctx.restore();
  };

  // Transfer GTA Cash to WerkPay Bank
  const handleDepositToWerkPay = () => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    if (engine.player.cash < 50) {
      engine.showNotification('Je hebt minstens $50 nodig om te storten op je WerkPay bankrekening!', 2.5);
      return;
    }

    const depositAmount = engine.player.cash;
    engine.player.cash = 0;

    if (currentBankAccount) {
      quickMoneyAccount(currentBankAccount.id, depositAmount);
    } else {
      topUpWerkPay(depositAmount);
    }

    gtaAudio.cashPickup();
    setBankDepositSuccess(`🎉 $${depositAmount} gestort op WerkPay Bank!`);
    setTimeout(() => setBankDepositSuccess(null), 4000);
  };

  // Multiplayer Actions
  const handleJoinRoom = () => {
    if (!roomCodeInput.trim() || !playerNameInput.trim()) return;
    multiplayerRef.current?.connect(roomCodeInput.trim().toUpperCase(), playerNameInput.trim());
    setShowMultiplayerModal(false);
  };

  const handleLeaveRoom = () => {
    multiplayerRef.current?.disconnect();
    setCurrentRoomCode(null);
    setIsMultiplayerConnected(false);
    setShowMultiplayerModal(false);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    if (multiplayerRef.current && isMultiplayerConnected) {
      multiplayerRef.current.sendChat(chatInput.trim());
    } else if (engineRef.current) {
      engineRef.current.addSpeech(chatInput.trim(), engineRef.current.player.x, engineRef.current.player.y - 25, '#38bdf8');
    }
    setChatInput('');
  };

  const toggleSound = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    gtaAudio.setMuted(next);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-950 overflow-hidden select-none">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Touch / Mobile Controls */}
      {engineRef.current && (
        <TouchControls 
          engine={engineRef.current} 
          inVehicle={hudStats.inVehicle} 
        />
      )}

      {/* --- GTA V STYLE TOP-RIGHT HUD --- */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Time & Weather */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-800 text-xs font-bold text-slate-300">
          <span>{Math.floor(hudStats.timeOfDay).toString().padStart(2, '0')}:00</span>
          <span>{hudStats.weather === 'rain' ? '🌧️ Regen' : (hudStats.timeOfDay > 20 || hudStats.timeOfDay < 6 ? '🌙 Helder' : '☀️ Zonnig')}</span>
        </div>

        {/* Cash Counter */}
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-xl border border-emerald-500/40 text-emerald-400 font-mono font-black text-2xl tracking-wider shadow-lg">
          <span>${hudStats.cash.toLocaleString()}</span>
        </div>

        {/* Wanted Stars (⭐⭐⭐⭐⭐) */}
        {hudStats.wantedLevel > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-amber-500/50 animate-pulse">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={`text-lg transition-transform ${
                  star <= hudStats.wantedLevel ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-700'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* Health & Armor Bars */}
        <div className="w-52 p-2 bg-black/80 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-xl flex flex-col gap-1.5">
          {/* Health Bar (Green) */}
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-emerald-950">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, (hudStats.health / hudStats.maxHealth) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-300 w-6 text-right">{hudStats.health}</span>
          </div>

          {/* Armor Bar (Cyan) */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, (hudStats.armor / hudStats.maxArmor) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-cyan-300 w-6 text-right">{hudStats.armor}</span>
          </div>

          {/* Stamina Bar (Amber) */}
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-950">
              <div 
                className="h-full bg-amber-400 transition-all duration-100"
                style={{ width: `${hudStats.stamina}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weapon & Ammo Card */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/80 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-xl">
          <div className="text-2xl">{WEAPONS[hudStats.currentWeapon].icon}</div>
          <div>
            <div className="text-xs font-black text-white">{WEAPONS[hudStats.currentWeapon].name}</div>
            <div className="text-[11px] font-mono text-amber-400">
              {hudStats.currentWeapon === 'fist' ? (
                '∞'
              ) : hudStats.isReloading ? (
                <span className="text-rose-400 animate-pulse font-bold">HERLADEN...</span>
              ) : (
                `${hudStats.clipRemaining} / ${hudStats.ammo}`
              )}
            </div>
          </div>
        </div>

        {/* In-Vehicle Speedometer */}
        {hudStats.inVehicle && (
          <div className="flex items-center gap-3 px-3 py-2 bg-black/80 backdrop-blur-md rounded-xl border border-blue-500/40 shadow-xl">
            <Car className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-xs font-black text-white">{hudStats.vehicleName}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-mono font-black text-blue-400">{hudStats.vehicleSpeed}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">km/u</span>
              </div>
            </div>
            <div className="w-14 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div 
                className={`h-full ${hudStats.vehicleHealth < 100 ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`}
                style={{ width: `${Math.max(0, (hudStats.vehicleHealth / hudStats.vehicleMaxHealth) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM INTERACTION & WEAPON SELECTOR BAR --- */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 flex-wrap justify-center max-w-[95vw]">
        {/* Interior Exit button if inside */}
        {interiorName && (
          <button
            onClick={() => engineRef.current?.exitInterior()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-xl font-black text-xs transition-all active:scale-95 animate-pulse"
            title="Verlaat het gebouw en ga terug naar buiten (E)"
          >
            <DoorOpen className="w-4 h-4" />
            <span>Naar Buiten (E)</span>
          </button>
        )}

        {/* Multiplayer Button */}
        <button
          onClick={() => setShowMultiplayerModal(true)}
          className={`flex items-center gap-1.5 px-3 py-2 ${
            isMultiplayerConnected 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50' 
              : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-sky-400/30'
          } font-black text-xs rounded-xl shadow-lg border transition-all active:scale-95`}
          title="Multiplayer Kamer Joinen of Maken"
        >
          <Users className="w-4 h-4" />
          <span>{isMultiplayerConnected ? `Online (${remotePlayerCount + 1})` : 'Multiplayer'}</span>
        </button>

        {/* Chat Button */}
        <button
          onClick={() => setShowChat(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 ${
            showChat ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          } font-black text-xs rounded-xl shadow-lg border border-slate-700 transition-all active:scale-95`}
          title="Open Chat (T)"
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Chat (T)</span>
        </button>

        {/* WerkPhone Smartphone Button */}
        <button
          onClick={() => setShowPhoneModal(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-xl font-black text-xs transition-all active:scale-95"
          title="Open WerkPhone Smartphone (P)"
        >
          <Phone className="w-4 h-4" />
          <span>Phone (P)</span>
        </button>

        {/* Deposit Bank Button */}
        <button
          onClick={handleDepositToWerkPay}
          className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
          title="Stort contant geld op je WerkPay bankrekening"
        >
          <DollarSign className="w-4 h-4" />
          <span>Stort Buit</span>
        </button>

        {/* Missions Button */}
        <button
          onClick={() => setShowMissionsModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
        >
          <Trophy className="w-4 h-4" />
          <span>Missies (M)</span>
        </button>

        {/* Unstuck / Ontkoppel Button (K) */}
        <button
          onClick={() => engineRef.current?.unstuckPlayerOrVehicle()}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-lg border border-rose-400/40 transition-all active:scale-95"
          title="Teleporteer veilig naar de dichtstbijzijnde boulevard als je vastzit (K)"
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Ontkoppel (K)</span>
        </button>

        {/* Claxon Horn Button (H) */}
        {hudStats.inVehicle && (
          <button
            onClick={() => engineRef.current?.blowHorn()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs rounded-xl shadow-lg border border-amber-500/40 transition-all active:scale-95"
            title="Claxon Toeteren (H)"
          >
            <Volume2 className="w-4 h-4" />
            <span>Toeter (H)</span>
          </button>
        )}

        {/* Weather / Time Cycle */}
        <button
          onClick={() => engineRef.current?.cycleTimeOfDay()}
          className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl shadow-md transition-all"
          title="Wissel Tijd van de Dag"
        >
          <Sun className="w-4 h-4 text-amber-400" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl shadow-md transition-all"
        >
          {audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Help Button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl shadow-md transition-all"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* --- ON-SCREEN INTERACTION PROMPT --- */}
      {interactionPrompt && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 bg-slate-900/95 backdrop-blur-md border border-amber-500/70 text-amber-300 font-black text-sm rounded-2xl shadow-2xl animate-bounce">
          {interactionPrompt}
        </div>
      )}

      {/* --- NOTIFICATION TOAST --- */}
      {notification && (
        <div className="absolute top-6 left-6 z-30 max-w-md px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white font-bold text-xs rounded-xl shadow-2xl animate-slideDown">
          {notification}
        </div>
      )}

      {/* --- IN-CAR RADIO TOAST --- */}
      {radioToast && (
        <div className="absolute top-16 left-6 z-30 px-4 py-2 bg-purple-900/90 backdrop-blur-md border border-purple-500 text-purple-200 font-black text-xs rounded-xl shadow-2xl animate-fadeIn">
          {radioToast}
        </div>
      )}

      {/* --- BANK DEPOSIT SUCCESS POPUP --- */}
      {bankDepositSuccess && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{bankDepositSuccess}</span>
        </div>
      )}

      {/* --- WASTED / BUSTED OVERLAY --- */}
      {isWasted && (
        <div className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center animate-fadeIn">
          <h1 className="text-7xl font-black tracking-widest text-rose-600 drop-shadow-[0_0_35px_rgba(225,29,72,0.9)] animate-pulse">
            WASTED
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-3">Je wordt vervoerd naar Pillbox Hospital...</p>
        </div>
      )}

      {/* --- WERKPHONE SMARTPHONE MODAL --- */}
      {showPhoneModal && engineRef.current && (
        <WerkPhoneModal 
          engine={engineRef.current} 
          onClose={() => setShowPhoneModal(false)}
          onDepositBank={handleDepositToWerkPay}
        />
      )}

      {/* --- MISSIONS MODAL --- */}
      {showMissionsModal && engineRef.current && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>Los Werkos Missies</span>
              </h2>
              <button onClick={() => setShowMissionsModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {engineRef.current.missions.map(m => (
                <div key={m.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">{m.title}</span>
                    <span className="font-mono text-emerald-400 font-black text-xs">+${m.rewardCash}</span>
                  </div>
                  <p className="text-xs text-slate-300">{m.description}</p>
                  <button
                    onClick={() => {
                      engineRef.current?.startMission(m.id);
                      setShowMissionsModal(false);
                    }}
                    disabled={engineRef.current.activeMission?.id === m.id}
                    className="mt-1 w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98"
                  >
                    {engineRef.current.activeMission?.id === m.id ? 'Bezig met missie...' : 'Start Missie'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- IN-GAME CHAT OVERLAY --- */}
      {showChat && (
        <div className="absolute top-20 left-4 z-40 w-80 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-sky-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Multiplayer Chat ({currentRoomCode || 'Lokaal'})</span>
            </span>
            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
          </div>

          <div className="h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-slate-500 italic py-6 text-center">Nog geen berichten. Typ iets hieronder...</div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-sky-400">{msg.playerName}</span>
                    <span className="text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-200 mt-0.5 break-words">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Typ een bericht... (Enter)"
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* --- MULTIPLAYER ROOM MODAL --- */}
      {showMultiplayerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-black text-sky-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Multiplayer Lobby & Join Code</span>
              </h2>
              <button onClick={() => setShowMultiplayerModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-3 rounded-2xl flex items-center gap-3 border ${
                isMultiplayerConnected 
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}>
                <Wifi className={`w-5 h-5 ${isMultiplayerConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <div className="flex-1 text-xs">
                  <div className="font-bold">
                    {isMultiplayerConnected ? `Verbonden met kamer: ${currentRoomCode}` : 'Offline / Single Player'}
                  </div>
                  <div className="text-[11px] opacity-80">
                    {isMultiplayerConnected 
                      ? `${remotePlayerCount + 1} speler(s) actief in deze sessie` 
                      : 'Voer een join code in om samen in dezelfde wereld te spelen'}
                  </div>
                </div>
              </div>

              {/* Player Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Jouw Spelersnaam</label>
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={e => setPlayerNameInput(e.target.value)}
                  maxLength={18}
                  placeholder="Bijv. Trevor, Franklin..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Room Join Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kamer Join Code (Deel deze met je vrienden)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="BIJV. LOS-WERKOS"
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono tracking-wider font-bold text-sky-400 uppercase focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(roomCodeInput);
                      if (engineRef.current) engineRef.current.showNotification(`📋 Join code gekopieerd: ${roomCodeInput}`, 2.5);
                    }}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1"
                    title="Kopieer Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                {isMultiplayerConnected ? (
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Kamer Verlaten (Offline)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleJoinRoom}
                    className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Verbinden met Kamer ({roomCodeInput || 'LOS-WERKOS'})</span>
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1.5">Snelle Openbare Kamers:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['LOS-WERKOS', 'GANG-WARS', 'WERK-HEIST', 'SANDY-SHORES'].map(code => (
                    <button
                      key={code}
                      onClick={() => setRoomCodeInput(code)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-mono text-sky-300 border border-slate-700"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HELP / CONTROLS MODAL --- */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Besturing & Tips</span>
              </h2>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Lopen / Sturen:</span>
                <span className="text-amber-400 font-mono">W, A, S, D of Pijltjestoetsen</span>
              </div>
              <div className="flex justify-between p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                <span className="font-bold text-emerald-300">🚪 Gebouw Binnengaan / Uitgaan:</span>
                <span className="text-emerald-400 font-mono font-bold">E (bij de deur)</span>
              </div>
              <div className="flex justify-between p-2 bg-sky-950/40 border border-sky-800/40 rounded-lg">
                <span className="font-bold text-sky-300">🌐 Multiplayer Chat:</span>
                <span className="text-sky-400 font-mono font-bold">T (of knop onderaan)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Richten & Schieten:</span>
                <span className="text-amber-400 font-mono">Muis + Linkerklik</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Auto In/Uitstappen:</span>
                <span className="text-amber-400 font-mono">F of Enter</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Wapen Herladen:</span>
                <span className="text-amber-400 font-mono">R (op voet)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">WerkPhone Smartphone:</span>
                <span className="text-amber-400 font-mono">P (of knop onderaan)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Wapens Wisselen:</span>
                <span className="text-amber-400 font-mono">1 t/m 7 of Muiswiel</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Handrem / Driften:</span>
                <span className="text-amber-400 font-mono">Spatiebalk</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/60 rounded-lg">
                <span className="font-bold text-white">Claxon Toeteren:</span>
                <span className="text-amber-400 font-mono">H (in auto)</span>
              </div>
              <div className="flex justify-between p-2 bg-rose-950/40 border border-rose-800/40 rounded-lg">
                <span className="font-bold text-rose-300">Vast? Ontkoppel / Vrijmaken:</span>
                <span className="text-amber-400 font-mono">K (of knop onderaan)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

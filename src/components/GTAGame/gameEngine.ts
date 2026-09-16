import {
  Player,
  Vehicle,
  Pedestrian,
  Bullet,
  Grenade,
  Particle,
  SkidMark,
  Building,
  Road,
  WorldProp,
  TrafficLight,
  SpeechBubble,
  Mission,
  WeaponDef,
  WeaponType,
  VehicleType,
  WeatherType,
  District,
  WaterZone,
  GreenZone,
  Crosswalk,
  BuildingInterior,
  InteriorInteractionZone
} from './types';
import { gtaAudio } from './audioEngine';
import { BUILDING_INTERIORS } from './interiorsData';
import { MultiplayerManager } from './multiplayerManager';

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  fist: {
    id: 'fist',
    name: 'Vuisten',
    damage: 25,
    fireRate: 350,
    range: 45,
    spread: 0.1,
    clipSize: 9999,
    reloadTime: 0,
    bulletSpeed: 0,
    price: 0,
    ammoPrice: 0,
    icon: '👊'
  },
  pistol: {
    id: 'pistol',
    name: '9mm Semi-Auto Pistool',
    damage: 38,
    fireRate: 260,
    range: 480,
    spread: 0.04,
    clipSize: 15,
    reloadTime: 1200,
    bulletSpeed: 20,
    price: 350,
    ammoPrice: 50,
    icon: '🔫'
  },
  smg: {
    id: 'smg',
    name: 'Micro SMG',
    damage: 24,
    fireRate: 85,
    range: 560,
    spread: 0.11,
    clipSize: 30,
    reloadTime: 1500,
    bulletSpeed: 23,
    price: 1200,
    ammoPrice: 100,
    icon: '⚡'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Pump Action Shotgun',
    damage: 22, // 6 spread pellets
    fireRate: 750,
    range: 360,
    spread: 0.26,
    clipSize: 8,
    reloadTime: 2000,
    bulletSpeed: 17,
    price: 2200,
    ammoPrice: 150,
    icon: '💥'
  },
  sniper: {
    id: 'sniper',
    name: 'Heavy Sniper Rifle',
    damage: 160,
    fireRate: 950,
    range: 950,
    spread: 0.008,
    clipSize: 6,
    reloadTime: 2200,
    bulletSpeed: 30,
    price: 4500,
    ammoPrice: 250,
    icon: '🎯'
  },
  grenade: {
    id: 'grenade',
    name: 'Fragmentatie Granaat',
    damage: 240,
    fireRate: 1100,
    range: 320,
    spread: 0.05,
    clipSize: 5,
    reloadTime: 1000,
    bulletSpeed: 11,
    price: 850,
    ammoPrice: 150,
    icon: '💣'
  },
  rpg: {
    id: 'rpg',
    name: 'RPG Raketwerper',
    damage: 280,
    fireRate: 1500,
    range: 800,
    spread: 0.02,
    clipSize: 1,
    reloadTime: 2500,
    bulletSpeed: 15,
    price: 7500,
    ammoPrice: 500,
    icon: '🚀'
  }
};

export const VEHICLE_PRESETS: Record<VehicleType, {
  name: string;
  maxSpeed: number;
  accel: number;
  turnSpeed: number;
  width: number;
  length: number;
  colors: string[];
  maxHealth: number;
}> = {
  sedan: {
    name: 'Albany Premier',
    maxSpeed: 8.8,
    accel: 0.24,
    turnSpeed: 0.046,
    width: 32,
    length: 60,
    colors: ['#3b82f6', '#475569', '#0284c7', '#64748b', '#dc2626'],
    maxHealth: 320
  },
  sports: {
    name: 'Pfister Comet GT',
    maxSpeed: 12.5,
    accel: 0.42,
    turnSpeed: 0.062,
    width: 34,
    length: 62,
    colors: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'],
    maxHealth: 260
  },
  muscle: {
    name: 'Vapid Dominator Muscle',
    maxSpeed: 11.5,
    accel: 0.38,
    turnSpeed: 0.056,
    width: 35,
    length: 64,
    colors: ['#dc2626', '#1e293b', '#eab308', '#2563eb', '#991b1b'],
    maxHealth: 360
  },
  suv: {
    name: 'Mammoth Patriot',
    maxSpeed: 8.0,
    accel: 0.22,
    turnSpeed: 0.038,
    width: 38,
    length: 68,
    colors: ['#1e293b', '#334155', '#78350f', '#064e3b'],
    maxHealth: 480
  },
  cab: {
    name: 'Downtown Cab',
    maxSpeed: 8.4,
    accel: 0.24,
    turnSpeed: 0.045,
    width: 32,
    length: 60,
    colors: ['#eab308'],
    maxHealth: 320
  },
  police: {
    name: 'LSPD Vapid Cruiser',
    maxSpeed: 11.0,
    accel: 0.35,
    turnSpeed: 0.055,
    width: 34,
    length: 64,
    colors: ['#0f172a'],
    maxHealth: 420
  },
  swat: {
    name: 'Brute Enforcer SWAT',
    maxSpeed: 7.8,
    accel: 0.26,
    turnSpeed: 0.035,
    width: 44,
    length: 76,
    colors: ['#18181b'],
    maxHealth: 850
  },
  armored_van: {
    name: 'WerkPay Cash Van',
    maxSpeed: 7.2,
    accel: 0.2,
    turnSpeed: 0.032,
    width: 42,
    length: 72,
    colors: ['#0284c7'],
    maxHealth: 950
  }
};

export class GTAGameEngine {
  public width: number = 9600;
  public height: number = 9600;

  public currentInterior: BuildingInterior | null = null;
  public multiplayer: MultiplayerManager | null = null;
  private lastMultiplayerSyncTime: number = 0;

  public player: Player;
  public vehicles: Vehicle[] = [];
  public pedestrians: Pedestrian[] = [];
  public bullets: Bullet[] = [];
  public grenades: Grenade[] = [];
  public particles: Particle[] = [];
  public skidMarks: SkidMark[] = [];
  public buildings: Building[] = [];
  public roads: Road[] = [];
  public props: WorldProp[] = [];
  public trafficLights: TrafficLight[] = [];
  public speechBubbles: SpeechBubble[] = [];
  public missions: Mission[] = [];
  public activeMission: Mission | null = null;

  // Expanded World Zones & Districts
  public districts: District[] = [];
  public waterZones: WaterZone[] = [];
  public greenZones: GreenZone[] = [];
  public crosswalks: Crosswalk[] = [];

  // Environment & Atmosphere
  public timeOfDay: number = 14.5; // 0 - 24 hours
  public weather: WeatherType = 'sunny';
  private weatherTimer: number = 0;

  // Camera coordinates (centered initially around Downtown Los Werkos)
  public camera = { x: 3100, y: 3200, zoom: 1 };

  // Inputs
  public keys: Record<string, boolean> = {};
  public mousePos = { x: 0, y: 0 };
  public isMouseDown = false;

  // Game flow states
  public isWasted: boolean = false;
  public isBusted: boolean = false;
  public wastedTimer: number = 0;
  public notification: string = '';
  public notificationTimer: number = 0;
  public radioToast: string = '';
  public radioToastTimer: number = 0;

  // Police Helicopter
  public heli = { x: 3100, y: 3100, angle: 0, active: false };

  // Interaction prompts
  public interactionPrompt: string | null = null;

  // Timers
  private lastTime: number = 0;
  private spawnTrafficTimer: number = 0;
  private spawnPedTimer: number = 0;
  private policeSpawnTimer: number = 0;
  private ambientDispatchTimer: number = 0;

  constructor() {
    this.player = {
      x: 3100,
      y: 3250,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 0,
      maxSpeed: 4.3,
      health: 100,
      maxHealth: 100,
      armor: 50,
      maxArmor: 100,
      cash: 500,
      wantedLevel: 0,
      wantedTimer: 0,
      inVehicleId: null,
      currentWeapon: 'pistol',
      ammo: {
        fist: 999,
        pistol: 120,
        smg: 150,
        shotgun: 32,
        sniper: 18,
        grenade: 6,
        rpg: 4
      },
      clipRemaining: {
        fist: 9999,
        pistol: 15,
        smg: 30,
        shotgun: 8,
        sniper: 6,
        grenade: 5,
        rpg: 1
      },
      isReloading: false,
      reloadTimer: 0,
      isSprinting: false,
      isShooting: false,
      lastShotTime: 0,
      kills: 0,
      copsKilled: 0,
      carsStolen: 0,
      missionsCompleted: 0,
      stamina: 100,
      stuntScore: 0,
      isInAir: false,
      airTimer: 0
    };

    this.initMap();
    this.initPropsAndLights();
    this.initMissions();
    this.seedWorld();
  }

  // --- MAP & CITY INITIALIZATION (EXPANDED 6400x6400 LOS WERKOS) ---
  private initMap() {
    const roadWidth = 140;

    // 1. DISTRICT DEFINITIONS
    this.districts = [
      {
        id: 'downtown',
        name: 'Downtown Los Werkos',
        type: 'downtown',
        x: 1800,
        y: 1600,
        width: 2800,
        height: 2700,
        color: '#2563eb',
        tagline: 'Wolkenkrabbers, Maze Bank & Financieel Centrum'
      },
      {
        id: 'vespucci',
        name: 'Vespucci Beach & Pier',
        type: 'beach',
        x: 0,
        y: 1400,
        width: 1800,
        height: 3300,
        color: '#0284c7',
        tagline: 'Zandstrand, Zee, Kermis Pier & Kust Boulevard'
      },
      {
        id: 'vinewood',
        name: 'Vinewood Hills',
        type: 'suburbs',
        x: 1400,
        y: 0,
        width: 3200,
        height: 1600,
        color: '#8b5cf6',
        tagline: 'Luxe Villa\'s, Zwembaden & Panoramisch Uitzicht'
      },
      {
        id: 'sandyshores',
        name: 'Sandy Shores Desert & Airfield',
        type: 'desert',
        x: 4600,
        y: 0,
        width: 1800,
        height: 3100,
        color: '#d97706',
        tagline: 'Woestijn, Runway Vliegveld & Motels'
      },
      {
        id: 'harbor',
        name: 'Port of Los Werkos',
        type: 'harbor',
        x: 1400,
        y: 4300,
        width: 3400,
        height: 2100,
        color: '#059669',
        tagline: 'Vrachtterminals, Containers & Industriële Dokken'
      },
      {
        id: 'industrial',
        name: 'East Industrial Corridor',
        type: 'industrial',
        x: 4800,
        y: 3100,
        width: 1600,
        height: 3300,
        color: '#64748b',
        tagline: 'Fabrieken, Pay \'n\' Spray & Spoorterminals'
      }
    ];

    // 2. WATER ZONES
    this.waterZones = [
      // Western Pacific Ocean
      {
        id: 'ocean_west',
        name: 'Pacific Ocean',
        type: 'ocean',
        x: 0,
        y: 0,
        width: 750,
        height: this.height
      },
      // Port of Los Werkos Shipping Channel
      {
        id: 'harbor_channel',
        name: 'Los Werkos Shipping Channel',
        type: 'ocean',
        x: 750,
        y: 5750,
        width: 3200,
        height: 650
      },
      // Central Mirror Park Pond
      {
        id: 'park_pond',
        name: 'City Park Pond',
        type: 'river',
        x: 3400,
        y: 2300,
        width: 340,
        height: 220
      },
      // Vinewood Hills Mansion Pools
      { id: 'pool_mansion_1', name: 'Villa Infinity Pool', type: 'pool', x: 2450, y: 880, width: 110, height: 65 },
      { id: 'pool_mansion_2', name: 'Vinewood Penthouse Pool', type: 'pool', x: 3350, y: 920, width: 120, height: 75 },
      { id: 'pool_mansion_3', name: 'Producer Mansion Pool', type: 'pool', x: 4250, y: 840, width: 100, height: 60 }
    ];

    // 3. GREEN ZONES, BEACHES & PIER
    this.greenZones = [
      // Vespucci Sandy Beach Strip
      {
        id: 'beach_sand',
        name: 'Vespucci Sandy Beach',
        type: 'sand',
        x: 750,
        y: 1200,
        width: 650,
        height: 3600
      },
      // Del Perro Wooden Pier
      {
        id: 'vespucci_pier',
        name: 'Del Perro Pier Boardwalk',
        type: 'pier',
        x: 320,
        y: 3040,
        width: 1080,
        height: 200
      },
      // Central Mirror Park Gardens
      {
        id: 'city_park',
        name: 'Mirror Park Gardens',
        type: 'park',
        x: 3200,
        y: 2150,
        width: 750,
        height: 550
      },
      // Sandy Shores McKenzie Airstrip Runway
      {
        id: 'sandy_runway',
        name: 'McKenzie Field Runway',
        type: 'runway',
        x: 4800,
        y: 1280,
        width: 1450,
        height: 150
      },
      // Vinewood Hills Estate Lawns
      { id: 'lawn_1', name: 'Estate Lawn West', type: 'park', x: 2250, y: 700, width: 450, height: 350 },
      { id: 'lawn_2', name: 'Estate Lawn Central', type: 'park', x: 3150, y: 700, width: 450, height: 350 },
      { id: 'lawn_3', name: 'Estate Lawn East', type: 'park', x: 4050, y: 700, width: 450, height: 350 }
    ];

    // 4. HIGHWAYS & ROAD NETWORK (Across 6400x6400 world)
    // Outer Highway Loop (Interstate 5 Freeway)
    this.roads.push({
      x: 1400,
      y: 200 - roadWidth / 2,
      width: 4800,
      height: roadWidth + 20,
      direction: 'horizontal',
      lanes: 4
    });
    this.roads.push({
      x: 1400,
      y: 6100 - roadWidth / 2,
      width: 4800,
      height: roadWidth + 20,
      direction: 'horizontal',
      lanes: 4
    });
    this.roads.push({
      x: 1400 - roadWidth / 2,
      y: 200,
      width: roadWidth + 20,
      height: 5900,
      direction: 'vertical',
      lanes: 4
    });
    this.roads.push({
      x: 6200 - roadWidth / 2,
      y: 200,
      width: roadWidth + 20,
      height: 5900,
      direction: 'vertical',
      lanes: 4
    });

    // Horizontal Avenues
    const horizAvenues = [1000, 1900, 2800, 3700, 4600, 5500];
    horizAvenues.forEach(y => {
      this.roads.push({
        x: 1400,
        y: y - roadWidth / 2,
        width: 4800,
        height: roadWidth,
        direction: 'horizontal',
        lanes: 4
      });
    });

    // Vertical Boulevards
    const vertBoulevards = [2300, 3200, 4100, 5000, 5700];
    vertBoulevards.forEach(x => {
      this.roads.push({
        x: x - roadWidth / 2,
        y: 200,
        width: roadWidth,
        height: 5900,
        direction: 'vertical',
        lanes: 4
      });
    });

    // Pier Access Boardwalk Road (connecting beach to Pier)
    this.roads.push({
      x: 320,
      y: 3140 - 55,
      width: 1080,
      height: 110,
      direction: 'horizontal',
      lanes: 2
    });

    // Sandy Shores Airport Access Road
    this.roads.push({
      x: 4800,
      y: 1460 - 50,
      width: 1400,
      height: 100,
      direction: 'horizontal',
      lanes: 2
    });

    // 5. CROSSWALKS AT INTERSECTIONS (Pedestrian zebra stripes)
    vertBoulevards.forEach(vx => {
      horizAvenues.forEach(hy => {
        // West & East crosswalks
        this.crosswalks.push({
          id: `cw_w_${vx}_${hy}`,
          x: vx - roadWidth / 2 - 25,
          y: hy - roadWidth / 2 + 10,
          width: 30,
          height: roadWidth - 20,
          direction: 'horizontal'
        });
        this.crosswalks.push({
          id: `cw_e_${vx}_${hy}`,
          x: vx + roadWidth / 2 - 5,
          y: hy - roadWidth / 2 + 10,
          width: 30,
          height: roadWidth - 20,
          direction: 'horizontal'
        });
        // North & South crosswalks
        this.crosswalks.push({
          id: `cw_n_${vx}_${hy}`,
          x: vx - roadWidth / 2 + 10,
          y: hy - roadWidth / 2 - 25,
          width: roadWidth - 20,
          height: 30,
          direction: 'vertical'
        });
        this.crosswalks.push({
          id: `cw_s_${vx}_${hy}`,
          x: vx - roadWidth / 2 + 10,
          y: hy + roadWidth / 2 - 5,
          width: roadWidth - 20,
          height: 30,
          direction: 'vertical'
        });
      });
    });

    // 6. LANDMARK BUILDINGS & LOCATIONS
    // 6.1 Central Werkdonalds Flagship Restaurant & Drive-Thru (Downtown)
    this.buildings.push({
      id: 'werkdonalds_hq',
      type: 'werkdonalds',
      name: 'Werkdonalds Flagship Restaurant & Drive-Thru',
      x: 3280,
      y: 3780,
      width: 270,
      height: 220,
      color: '#991b1b',
      roofColor: '#dc2626',
      accentColor: '#facc15',
      entrance: { x: 3415, y: 4000, width: 80, height: 25 }
    });

    // 6.2 Werkdonalds Del Perro Beach Diner on Pier
    this.buildings.push({
      id: 'werkdonalds_beach',
      type: 'werkdonalds',
      name: 'Werkdonalds Del Perro Pier Diner',
      x: 520,
      y: 3060,
      width: 190,
      height: 150,
      color: '#b91c1c',
      roofColor: '#ef4444',
      accentColor: '#facc15',
      entrance: { x: 615, y: 3210, width: 70, height: 20 }
    });

    // 6.3 WerkPay Central Bank & Safe Vault (Downtown)
    this.buildings.push({
      id: 'werkpay_bank',
      type: 'bank',
      name: 'WerkPay Bank & Vault Tower',
      x: 2380,
      y: 2880,
      width: 320,
      height: 240,
      color: '#0f172a',
      roofColor: '#0284c7',
      accentColor: '#38bdf8',
      entrance: { x: 2540, y: 3120, width: 90, height: 25 }
    });

    // 6.4 Maze Bank Tower (50-story skyscraper with rooftop Helipad)
    this.buildings.push({
      id: 'maze_bank_tower',
      type: 'office',
      name: 'Maze Bank Tower (Rooftop Helipad)',
      x: 3280,
      y: 2880,
      width: 320,
      height: 300,
      color: '#1e293b',
      roofColor: '#0f172a',
      accentColor: '#e11d48',
      entrance: { x: 3440, y: 3180, width: 90, height: 25 }
    });

    // 6.5 Ammu-Nation Downtown Mega Gun Store
    this.buildings.push({
      id: 'ammu_nation',
      type: 'ammu',
      name: 'Ammu-Nation Downtown Mega Store',
      x: 4180,
      y: 2880,
      width: 250,
      height: 210,
      color: '#14532d',
      roofColor: '#166534',
      accentColor: '#facc15',
      entrance: { x: 4305, y: 3090, width: 70, height: 25 }
    });

    // 6.6 Ammu-Nation Sandy Shores Desert Depot
    this.buildings.push({
      id: 'ammu_sandy',
      type: 'ammu',
      name: 'Ammu-Nation Sandy Shores Depot',
      x: 5080,
      y: 1080,
      width: 210,
      height: 180,
      color: '#14532d',
      roofColor: '#15803d',
      accentColor: '#facc15',
      entrance: { x: 5185, y: 1260, width: 65, height: 20 }
    });

    // 6.7 Pay 'n' Spray Downtown Garage
    this.buildings.push({
      id: 'pay_n_spray',
      type: 'paynspray',
      name: 'Pay \'n\' Spray Downtown Custom Garage',
      x: 2380,
      y: 3780,
      width: 270,
      height: 220,
      color: '#d97706',
      roofColor: '#b45309',
      accentColor: '#f59e0b',
      entrance: { x: 2515, y: 3780, width: 90, height: 25 }
    });

    // 6.8 Pay 'n' Spray Harbor Docks
    this.buildings.push({
      id: 'pay_n_spray_harbor',
      type: 'paynspray',
      name: 'Pay \'n\' Spray Harbor Marine Garage',
      x: 4180,
      y: 5580,
      width: 270,
      height: 220,
      color: '#d97706',
      roofColor: '#b45309',
      accentColor: '#f59e0b',
      entrance: { x: 4315, y: 5580, width: 90, height: 25 }
    });

    // 6.9 Pillbox Hill Medical Center (Hospital)
    this.buildings.push({
      id: 'hospital',
      type: 'hospital',
      name: 'Pillbox Hill Medical Center',
      x: 2380,
      y: 1980,
      width: 320,
      height: 240,
      color: '#f8fafc',
      roofColor: '#cbd5e1',
      accentColor: '#ef4444',
      entrance: { x: 2540, y: 1980, width: 80, height: 25 }
    });

    // 6.10 LSPD Mission Row Central Police Precinct
    this.buildings.push({
      id: 'police_hq',
      type: 'police',
      name: 'LSPD Mission Row Central Precinct',
      x: 4180,
      y: 1980,
      width: 300,
      height: 240,
      color: '#1e3a8a',
      roofColor: '#1d4ed8',
      accentColor: '#60a5fa',
      entrance: { x: 4330, y: 1980, width: 80, height: 25 }
    });

    // 6.11 Vinewood Luxury Mansions
    this.buildings.push({
      id: 'mansion_1',
      type: 'mansion',
      name: 'Villa de Sol - Vinewood Hills',
      x: 2280,
      y: 720,
      width: 290,
      height: 200,
      color: '#f1f5f9',
      roofColor: '#cbd5e1',
      accentColor: '#8b5cf6',
      entrance: { x: 2390, y: 920, width: 70, height: 25 }
    });
    this.buildings.push({
      id: 'mansion_2',
      type: 'mansion',
      name: 'Vinewood Heights Luxury Villa',
      x: 3180,
      y: 720,
      width: 310,
      height: 220,
      color: '#f8fafc',
      roofColor: '#e2e8f0',
      accentColor: '#ec4899'
    });
    this.buildings.push({
      id: 'mansion_3',
      type: 'mansion',
      name: 'Vinewood Producer Estate',
      x: 4080,
      y: 720,
      width: 290,
      height: 200,
      color: '#f1f5f9',
      roofColor: '#cbd5e1',
      accentColor: '#06b6d4'
    });

    // 6.12 Sandy Shores Airfield Hangar & Tower
    this.buildings.push({
      id: 'sandy_hangar',
      type: 'hangar',
      name: 'McKenzie Field Airplane Hangar',
      x: 5350,
      y: 1040,
      width: 360,
      height: 230,
      color: '#334155',
      roofColor: '#1e293b',
      accentColor: '#f59e0b',
      entrance: { x: 5530, y: 1270, width: 140, height: 25 }
    });
    this.buildings.push({
      id: 'sandy_motel',
      type: 'residential',
      name: 'Sandy Shores Desert Motel',
      x: 5080,
      y: 1680,
      width: 270,
      height: 190,
      color: '#78716c',
      roofColor: '#57534e',
      accentColor: '#f59e0b'
    });

    // 6.13 Port of Los Werkos Freight Warehouses & Cargo Terminal
    this.buildings.push({
      id: 'harbor_wh_1',
      type: 'warehouse',
      name: 'Port Cargo Terminal Alpha',
      x: 2380,
      y: 4780,
      width: 340,
      height: 240,
      color: '#334155',
      roofColor: '#1e293b',
      accentColor: '#10b981'
    });
    this.buildings.push({
      id: 'harbor_wh_2',
      type: 'warehouse',
      name: 'Port Shipping Depot Bravo',
      x: 3280,
      y: 4780,
      width: 340,
      height: 240,
      color: '#1e293b',
      roofColor: '#0f172a',
      accentColor: '#38bdf8'
    });
    this.buildings.push({
      id: 'harbor_wh_3',
      type: 'warehouse',
      name: 'Port Logistics Hub Charlie',
      x: 4180,
      y: 4780,
      width: 340,
      height: 240,
      color: '#334155',
      roofColor: '#1e293b',
      accentColor: '#f97316'
    });

    // 6.14 City Blocks & High-Rise Towers (Spanning Midtown, Downtown & Industrial)
    const blockGrid = [
      // Downtown office towers & residential lofts
      { x: 2380, y: 3300, w: 280, h: 260, type: 'office' as const, name: 'Vinewood Financial Tower' },
      { x: 3700, y: 3300, w: 260, h: 260, type: 'office' as const, name: 'Union Depository Annex' },
      { x: 2750, y: 3780, w: 260, h: 220, type: 'residential' as const, name: 'Alta Street Condos' },
      { x: 3650, y: 3780, w: 260, h: 220, type: 'residential' as const, name: 'Pillbox Hill Lofts' },
      // North residential & commercial
      { x: 2750, y: 1980, w: 260, h: 240, type: 'office' as const, name: 'Los Werkos Medical Tower' },
      { x: 3650, y: 1980, w: 260, h: 240, type: 'office' as const, name: 'Municipal Court Building' },
      // East industrial plants
      { x: 5080, y: 3780, w: 320, h: 240, type: 'warehouse' as const, name: 'East Side Scrap & Freight' },
      { x: 5080, y: 4780, w: 320, h: 240, type: 'warehouse' as const, name: 'Los Werkos Rail Depot' },
      { x: 5080, y: 2400, w: 300, h: 220, type: 'warehouse' as const, name: 'Desert Machinery & Storage' }
    ];

    blockGrid.forEach((b, idx) => {
      this.buildings.push({
        id: `city_block_${idx}`,
        type: b.type,
        name: b.name,
        x: b.x,
        y: b.y,
        width: b.w,
        height: b.h,
        color: b.type === 'office' ? '#334155' : b.type === 'residential' ? '#475569' : '#1e293b',
        roofColor: b.type === 'office' ? '#1e293b' : b.type === 'residential' ? '#334155' : '#0f172a',
        accentColor: b.type === 'office' ? '#38bdf8' : '#f59e0b'
      });
    });
  }

  // --- PROPS, STREETLAMPS, TRAFFIC LIGHTS, STUNT RAMPS ---
  private initPropsAndLights() {
    const vertBoulevards = [2300, 3200, 4100, 5000, 5700];
    const horizAvenues = [1000, 1900, 2800, 3700, 4600, 5500];

    // Traffic lights at each major intersection
    vertBoulevards.forEach(ix => {
      horizAvenues.forEach(iy => {
        // Horizontal traffic light
        this.trafficLights.push({
          id: `tl_h_${ix}_${iy}`,
          x: ix - 80,
          y: iy - 75,
          direction: 'horizontal',
          state: 'green',
          timer: 7 + Math.random() * 5
        });
        // Vertical traffic light
        this.trafficLights.push({
          id: `tl_v_${ix}_${iy}`,
          x: ix + 75,
          y: iy - 80,
          direction: 'vertical',
          state: 'red',
          timer: 7 + Math.random() * 5
        });
      });
    });

    // Streetlamps along horizontal avenues
    horizAvenues.forEach(roadY => {
      for (let x = 1450; x < 6100; x += 380) {
        this.props.push({
          id: `lamp_top_${x}_${roadY}`,
          type: 'lamp',
          x,
          y: roadY - 76,
          angle: 0,
          width: 8,
          height: 8,
          health: 80,
          isDestroyed: false
        });
        this.props.push({
          id: `lamp_bot_${x}_${roadY}`,
          type: 'lamp',
          x,
          y: roadY + 76,
          angle: 0,
          width: 8,
          height: 8,
          health: 80,
          isDestroyed: false
        });
      }
    });

    // Palm Trees along Vespucci Beach & Boulevard
    for (let py = 1400; py < 4600; py += 160) {
      this.props.push({
        id: `palm_beach_${py}`,
        type: 'palm',
        x: 1330 + (Math.random() - 0.5) * 40,
        y: py,
        angle: Math.random() * Math.PI * 2,
        width: 32,
        height: 32,
        health: 200,
        isDestroyed: false
      });
      if (py % 320 === 0) {
        this.props.push({
          id: `palm_sand_${py}`,
          type: 'palm',
          x: 950 + (Math.random() - 0.5) * 80,
          y: py,
          angle: Math.random() * Math.PI * 2,
          width: 36,
          height: 36,
          health: 200,
          isDestroyed: false
        });
      }
    }

    // Oak Trees and Park Benches in Mirror Park
    for (let tx = 3260; tx < 3880; tx += 90) {
      for (let ty = 2180; ty < 2620; ty += 90) {
        // Skip area of the pond
        if (tx > 3380 && tx < 3760 && ty > 2280 && ty < 2540) continue;
        this.props.push({
          id: `tree_park_${tx}_${ty}`,
          type: 'tree',
          x: tx + (Math.random() - 0.5) * 30,
          y: ty + (Math.random() - 0.5) * 30,
          angle: Math.random() * Math.PI * 2,
          width: 38,
          height: 38,
          health: 300,
          isDestroyed: false
        });
      }
    }

    // Shipping Containers in Port of Los Werkos
    const containerColors = ['#dc2626', '#2563eb', '#ea580c', '#16a34a', '#eab308'];
    const containerLocs = [
      { x: 2600, y: 5100 }, { x: 2750, y: 5100 }, { x: 2900, y: 5100 },
      { x: 3500, y: 5100 }, { x: 3650, y: 5100 }, { x: 3800, y: 5100 },
      { x: 2600, y: 5350 }, { x: 2750, y: 5350 }, { x: 3500, y: 5350 },
      { x: 4400, y: 5100 }, { x: 4550, y: 5100 }, { x: 4700, y: 5100 }
    ];
    containerLocs.forEach((c, idx) => {
      this.props.push({
        id: `container_${idx}`,
        type: 'container',
        x: c.x,
        y: c.y,
        angle: 0,
        width: 120,
        height: 52,
        health: 99999,
        isDestroyed: false,
        color: containerColors[idx % containerColors.length]
      });
    });

    // Desert Cactus in Sandy Shores
    const cactusLocs = [
      { x: 4950, y: 650 }, { x: 5300, y: 720 }, { x: 5700, y: 620 },
      { x: 6050, y: 850 }, { x: 4950, y: 1750 }, { x: 5550, y: 1850 },
      { x: 5900, y: 1750 }, { x: 6150, y: 2200 }, { x: 5300, y: 2400 }
    ];
    cactusLocs.forEach((c, idx) => {
      this.props.push({
        id: `cactus_${idx}`,
        type: 'cactus',
        x: c.x,
        y: c.y,
        angle: 0,
        width: 24,
        height: 24,
        health: 70,
        isDestroyed: false
      });
    });

    // Fire Hydrants near corners
    const hydrantCoords = [
      { x: 2220, y: 920 },
      { x: 3120, y: 920 },
      { x: 2220, y: 1820 },
      { x: 3120, y: 1820 },
      { x: 4020, y: 1820 },
      { x: 2220, y: 2720 },
      { x: 3120, y: 2720 }, // near Maze Bank
      { x: 4020, y: 2720 }, // near Ammu
      { x: 2220, y: 3620 }, // near Pay 'n' Spray
      { x: 3120, y: 3620 }, // near Werkdonalds
      { x: 4020, y: 3620 }
    ];
    hydrantCoords.forEach((c, idx) => {
      this.props.push({
        id: `hydrant_${idx}`,
        type: 'hydrant',
        x: c.x,
        y: c.y,
        angle: 0,
        width: 14,
        height: 14,
        health: 50,
        isDestroyed: false
      });
    });

    // Trash Cans & Dumpsters outside Werkdonalds, Bank & shops
    const trashCoords = [
      { x: 3290, y: 3980 },
      { x: 3350, y: 3980 },
      { x: 2390, y: 3110 },
      { x: 4190, y: 3080 },
      { x: 2390, y: 3770 },
      { x: 620, y: 3200 }
    ];
    trashCoords.forEach((tc, idx) => {
      this.props.push({
        id: `trash_${idx}`,
        type: 'trash',
        x: tc.x,
        y: tc.y,
        angle: 0,
        width: 16,
        height: 16,
        health: 40,
        isDestroyed: false
      });
    });

    // ATM Machines outside Bank, Werkdonalds & Pier
    const atmCoords = [
      { x: 2420, y: 3120 }, // Bank ATM
      { x: 3260, y: 3820 }, // Werkdonalds ATM
      { x: 4160, y: 2900 }, // Ammu-Nation ATM
      { x: 550, y: 3180 }   // Pier ATM
    ];
    atmCoords.forEach((ac, idx) => {
      this.props.push({
        id: `atm_${idx}`,
        type: 'atm',
        x: ac.x,
        y: ac.y,
        angle: 0,
        width: 18,
        height: 14,
        health: 90,
        isDestroyed: false
      });
    });

    // Epic Stunt Ramps!
    const rampCoords = [
      // Downtown boulevard ramp
      { x: 2950, y: 2795, angle: 0 },
      { x: 3450, y: 2805, angle: Math.PI },
      // Pier Boardwalk Stunt Ramp launching toward the ocean
      { x: 360, y: 3140, angle: Math.PI },
      // Sandy Shores Airstrip mega launch ramp
      { x: 5900, y: 1280, angle: 0 },
      // Port Harbor container jump ramp
      { x: 3100, y: 4695, angle: Math.PI / 2 }
    ];
    rampCoords.forEach((rc, idx) => {
      this.props.push({
        id: `ramp_${idx}`,
        type: 'ramp',
        x: rc.x,
        y: rc.y,
        angle: rc.angle,
        width: 38,
        height: 44,
        health: 99999,
        isDestroyed: false
      });
    });
  }

  // --- MISSIONS INITIALIZATION (EXPANDED WORLD MISSIONS) ---
  private initMissions() {
    this.missions = [
      {
        id: 'mission_burger_rush',
        title: 'Werkdonalds Express Rush',
        subtitle: 'Snelle Bezorging',
        client: 'Werkdonalds Manager Dylan',
        description: 'Breng de warme Big Werk menu\'s binnen 65 seconden van Downtown naar de villa in Vinewood Hills!',
        rewardCash: 500,
        type: 'delivery',
        targetX: 3180,
        targetY: 740,
        targetRadius: 100,
        timeLimit: 65,
        status: 'available',
        stage: 1
      },
      {
        id: 'mission_van_heist',
        title: 'De WerkPay Geldwagen Heist',
        subtitle: 'Overval & Ontsnapping',
        client: 'Lester Crest',
        description: 'Onderschep de blauwe WerkPay geldwagen bij Port of Los Werkos, steel de buit ($3.000) en schud de LSPD af!',
        rewardCash: 3000,
        type: 'heist',
        targetX: 3280,
        targetY: 4780,
        targetRadius: 120,
        targetVehicleType: 'armored_van',
        status: 'available',
        stage: 1
      },
      {
        id: 'mission_sandy_smuggle',
        title: 'Sandy Shores Smokkelvlucht',
        subtitle: 'Woestijn Transport',
        client: 'Trevor Enterprises',
        description: 'Rijd op topsnelheid naar het vliegveld van McKenzie Field in Sandy Shores voor de levering!',
        rewardCash: 1800,
        type: 'delivery',
        targetX: 5350,
        targetY: 1280,
        targetRadius: 120,
        timeLimit: 90,
        status: 'available',
        stage: 1
      },
      {
        id: 'mission_pier_stunt',
        title: 'Del Perro Pier Speedrun',
        subtitle: 'Kust Stunt Challenge',
        client: 'Los Werkos Customs',
        description: 'Race over de boulevard naar Del Perro Pier en bereik de verste houten pier binnen de tijd!',
        rewardCash: 1400,
        type: 'delivery',
        targetX: 420,
        targetY: 3140,
        targetRadius: 100,
        timeLimit: 60,
        status: 'available',
        stage: 1
      },
      {
        id: 'mission_getaway_vip',
        title: 'VIP Vluchtchauffeur',
        subtitle: 'High Speed Getaway',
        client: 'Vinewood Producer',
        description: 'Vervoer de VIP veilig vanuit Vinewood Hills naar het Sandy Shores Desert Motel en ontloop alle politie!',
        rewardCash: 2200,
        type: 'getaway',
        targetX: 5080,
        targetY: 1680,
        targetRadius: 110,
        timeLimit: 85,
        status: 'available',
        stage: 1
      }
    ];
  }

  // --- SEED WORLD (SCALED FOR 6400x6400) ---
  private seedWorld() {
    // 1. Player starter vehicle nearby (Sportscar Pfister Comet)
    this.spawnVehicle('sports', 3150, 3250, 0, null, '#ef4444');
    // Muscle car
    this.spawnVehicle('muscle', 3070, 3250, Math.PI, null, '#dc2626');
    // Armored Cash Van parked at WerkPay Bank
    this.spawnVehicle('armored_van', 2450, 3120, 0, null);
    // Police Cruiser parked at LSPD Precinct
    this.spawnVehicle('police', 4260, 2040, 0, null);
    // Sports car at Del Perro Pier
    this.spawnVehicle('sports', 680, 3140, 0, null, '#06b6d4');
    // Fast SUV at Sandy Shores Airfield
    this.spawnVehicle('suv', 5300, 1340, 0, null, '#f59e0b');

    // 2. Initial Ambient Traffic (32 diverse vehicles patrolling highways and avenues)
    const types: VehicleType[] = ['sedan', 'sports', 'suv', 'cab', 'muscle'];
    const horizAvenues = [1000, 1900, 2800, 3700, 4600, 5500];
    const vertBoulevards = [2300, 3200, 4100, 5000, 5700];

    for (let i = 0; i < 32; i++) {
      const isHoriz = Math.random() > 0.5;
      if (isHoriz) {
        const roadY = horizAvenues[Math.floor(Math.random() * horizAvenues.length)];
        const x = 1500 + Math.random() * 4500;
        const angle = Math.random() > 0.5 ? 0 : Math.PI;
        const vType = types[Math.floor(Math.random() * types.length)];
        this.spawnVehicle(vType, x, roadY, angle, 'ai');
      } else {
        const roadX = vertBoulevards[Math.floor(Math.random() * vertBoulevards.length)];
        const y = 500 + Math.random() * 5200;
        const angle = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
        const vType = types[Math.floor(Math.random() * types.length)];
        this.spawnVehicle(vType, roadX, y, angle, 'ai');
      }
    }

    // 3. Initial Pedestrians (50 across sidewalks, parks and plazas)
    for (let i = 0; i < 50; i++) {
      this.spawnPedestrian(
        1500 + Math.random() * 4500,
        1200 + Math.random() * 4500
      );
    }
  }

  public spawnVehicle(
    type: VehicleType,
    x: number,
    y: number,
    angle: number = 0,
    driver: 'player' | 'ai' | null = null,
    customColor?: string
  ): Vehicle {
    const preset = VEHICLE_PRESETS[type];
    const isPolice = type === 'police' || type === 'swat';
    const color = customColor || preset.colors[Math.floor(Math.random() * preset.colors.length)];

    const vehicle: Vehicle = {
      id: `veh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      name: preset.name,
      x,
      y,
      vx: 0,
      vy: 0,
      angle,
      speed: driver === 'ai' ? 2.5 + Math.random() * 2.5 : 0,
      maxSpeed: preset.maxSpeed,
      accel: preset.accel,
      turnSpeed: preset.turnSpeed,
      width: preset.width,
      length: preset.length,
      color,
      health: preset.maxHealth,
      maxHealth: preset.maxHealth,
      isPolice,
      policeTier: type === 'swat' ? 2 : 1,
      driver,
      sirenOn: false,
      lightsOn: false,
      brakeLights: false,
      drift: 0,
      damageLevel: 0,
      engineSmoking: false,
      engineOnFire: false,
      tiresPunctured: [false, false, false, false],
      inAir: false,
      airHeight: 0
    };

    this.vehicles.push(vehicle);
    return vehicle;
  }

  public spawnPedestrian(
    x: number,
    y: number,
    isPolice: boolean = false,
    policeTier: number = 1
  ): Pedestrian {
    const skinColors = ['#fcd34d', '#fbcfe8', '#fed7aa', '#f59e0b', '#d97706', '#92400e'];
    const shirtColors = isPolice 
      ? (policeTier === 2 ? ['#18181b', '#27272a'] : ['#1e3a8a', '#172554']) 
      : ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#0f172a'];
    const pantsColors = isPolice ? ['#0f172a'] : ['#1e293b', '#334155', '#475569', '#1d4ed8'];

    const ped: Pedestrian = {
      id: `ped_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: Math.random() * Math.PI * 2,
      speed: isPolice ? 3.0 : 1.3 + Math.random() * 0.9,
      health: isPolice ? (policeTier === 2 ? 150 : 80) : 40,
      maxHealth: isPolice ? (policeTier === 2 ? 150 : 80) : 40,
      state: 'walking',
      stateTimer: 100 + Math.random() * 200,
      isPolice,
      policeTier,
      targetX: x + (Math.random() - 0.5) * 400,
      targetY: y + (Math.random() - 0.5) * 400,
      hasWeapon: isPolice ? (policeTier === 2 ? 'smg' : 'pistol') : (Math.random() < 0.15 ? 'pistol' : 'fist'),
      shootCooldown: 0,
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
      shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      pantsColor: pantsColors[Math.floor(Math.random() * pantsColors.length)],
      cashDrop: isPolice ? 160 : 30 + Math.floor(Math.random() * 120)
    };

    this.pedestrians.push(ped);
    return ped;
  }

  // --- SHOW NOTIFICATION ---
  public showNotification(msg: string, duration: number = 3.5) {
    this.notification = msg;
    this.notificationTimer = duration;
  }

  // --- SPEECH BUBBLE ---
  public addSpeech(text: string, x: number, y: number, color: string = '#ffffff') {
    this.speechBubbles.push({
      id: `speech_${Math.random()}`,
      text,
      x,
      y,
      timer: 3.0,
      color
    });
  }

  // --- WEAPON MANAGEMENT & RELOAD ---
  public setWeapon(type: WeaponType) {
    this.player.currentWeapon = type;
  }

  public cycleWeapon(direction: number = 1) {
    const list: WeaponType[] = ['fist', 'pistol', 'smg', 'shotgun', 'sniper', 'grenade', 'rpg'];
    const idx = list.indexOf(this.player.currentWeapon);
    const nextIdx = (idx + direction + list.length) % list.length;
    this.player.currentWeapon = list[nextIdx];
    this.showNotification(`Wapen: ${WEAPONS[this.player.currentWeapon].name}`, 1.5);
  }

  public reloadCurrentWeapon() {
    const w = this.player.currentWeapon;
    if (w === 'fist' || w === 'grenade') return;
    const def = WEAPONS[w];
    if (this.player.ammo[w] <= 0) {
      this.showNotification(`Geen reserve munitie voor ${def.name}!`, 1.8);
      return;
    }
    if (this.player.clipRemaining[w] === def.clipSize) return;

    this.player.isReloading = true;
    this.player.reloadTimer = def.reloadTime / 1000;
    gtaAudio.weaponReload();
    this.showNotification(`Herladen... (${def.name})`, 1.5);
  }

  // --- TOGGLE TIME / WEATHER ---
  public cycleTimeOfDay() {
    this.timeOfDay = (this.timeOfDay + 6) % 24;
    const timeStr = `${Math.floor(this.timeOfDay).toString().padStart(2, '0')}:00`;
    this.showNotification(`⏰ Tijd aangepast naar ${timeStr}`, 2.0);
  }

  public toggleWeather() {
    const weathers: WeatherType[] = ['sunny', 'sunset', 'rain', 'night'];
    const next = weathers[(weathers.indexOf(this.weather) + 1) % weathers.length];
    this.weather = next;
    this.showNotification(`🌦️ Weer: ${next.toUpperCase()}`, 2.0);
  }

  // --- MAIN LOOP UPDATE ---
  public update(timestamp: number) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    // Advance dynamic time of day naturally (24h in ~16 real minutes)
    this.timeOfDay = (this.timeOfDay + dt * 0.025) % 24;

    // Occasional weather shift
    this.weatherTimer += dt;
    if (this.weatherTimer > 180) {
      this.weatherTimer = 0;
      if (Math.random() < 0.3) {
        this.weather = this.weather === 'rain' ? 'sunny' : 'rain';
      }
    }

    if (this.notificationTimer > 0) {
      this.notificationTimer -= dt;
      if (this.notificationTimer <= 0) this.notification = '';
    }

    if (this.radioToastTimer > 0) {
      this.radioToastTimer -= dt;
      if (this.radioToastTimer <= 0) this.radioToast = '';
    }

    // Handle Death / Busted states
    if (this.isWasted || this.isBusted) {
      this.wastedTimer += dt;
      if (this.wastedTimer > 3.5) {
        this.respawnPlayer();
      }
      return;
    }

    // Inside Building Interior Mode
    if (this.currentInterior) {
      this.updateInterior(dt);
      this.syncMultiplayer();
      return;
    }

    // Update Player & World Systems
    this.updatePlayer(dt);
    this.updateVehicles(dt);
    this.updatePedestrians(dt);
    this.updateBullets(dt);
    this.updateGrenades(dt);
    this.updateParticles(dt);
    this.updateProps(dt);
    this.updateTrafficLights(dt);
    this.updateSpeechBubbles(dt);
    this.updatePoliceWanted(dt);
    this.updateMissions(dt);
    this.checkInteractions();
    this.syncMultiplayer();

    // Clean up expired skid marks
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      this.skidMarks[i].alpha -= dt * 0.04;
      if (this.skidMarks[i].alpha <= 0) {
        this.skidMarks.splice(i, 1);
      }
    }
    if (this.skidMarks.length > 250) {
      this.skidMarks.splice(0, this.skidMarks.length - 250);
    }

    // Rain particles when raining
    if (this.weather === 'rain') {
      for (let r = 0; r < 5; r++) {
        this.addParticle({
          id: `rain_${Math.random()}`,
          x: this.camera.x + (Math.random() - 0.5) * 1200,
          y: this.camera.y - 450 + Math.random() * 50,
          vx: -3 + (Math.random() - 0.5) * 2,
          vy: 16 + Math.random() * 6,
          color: 'rgba(186, 230, 253, 0.45)',
          life: 0.6,
          maxLife: 0.6,
          size: 2,
          type: 'rain'
        });
      }
    }

    // Camera follow player with slight lead in movement direction
    const targetCamX = this.player.inVehicleId 
      ? (this.getVehicle(this.player.inVehicleId)?.x || this.player.x) + Math.cos(this.player.angle) * 40
      : this.player.x;
    const targetCamY = this.player.inVehicleId 
      ? (this.getVehicle(this.player.inVehicleId)?.y || this.player.y) + Math.sin(this.player.angle) * 40
      : this.player.y;

    this.camera.x += (targetCamX - this.camera.x) * 0.14;
    this.camera.y += (targetCamY - this.camera.y) * 0.14;
  }

  // --- PLAYER UPDATE ---
  private updatePlayer(dt: number) {
    // Reload weapon timer
    if (this.player.isReloading) {
      this.player.reloadTimer -= dt;
      if (this.player.reloadTimer <= 0) {
        this.player.isReloading = false;
        const w = this.player.currentWeapon;
        const def = WEAPONS[w];
        const needed = def.clipSize - this.player.clipRemaining[w];
        const available = Math.min(needed, this.player.ammo[w]);
        this.player.clipRemaining[w] += available;
        this.player.ammo[w] -= available;
      }
    }

    // IN VEHICLE MODE
    if (this.player.inVehicleId) {
      const car = this.getVehicle(this.player.inVehicleId);
      if (car) {
        this.player.x = car.x;
        this.player.y = car.y;
        this.player.angle = car.angle;

        // Vehicle controls
        const isUp = this.keys['KeyW'] || this.keys['ArrowUp'];
        const isDown = this.keys['KeyS'] || this.keys['ArrowDown'];
        const isLeft = this.keys['KeyA'] || this.keys['ArrowLeft'];
        const isRight = this.keys['KeyD'] || this.keys['ArrowRight'];
        const isHandbrake = this.keys['Space'];

        // Car Horn (KeyH)
        if (this.keys['KeyH']) {
          this.blowHorn();
          this.keys['KeyH'] = false;
        }

        // Unstuck emergency hotkey (KeyK)
        if (this.keys['KeyK']) {
          this.unstuckPlayerOrVehicle();
          this.keys['KeyK'] = false;
        }

        car.brakeLights = isDown;

        // Water drag penalty if submerged in water
        const inWater = this.isPointInWater(car.x, car.y);
        if (inWater) {
          car.speed *= 0.88;
          if (Math.abs(car.speed) > 1.0 && Math.random() < 0.25) {
            gtaAudio.splash();
            this.addSmoke(car.x, car.y, 'rgba(186, 230, 253, 0.6)');
          }
          if (Math.abs(car.speed) < 0.8) {
            this.showNotification('🌊 Voertuig te water geraakt! Druk F om uit te stappen!', 2.0);
          }
        }

        // Punctured tire drag penalty
        const puncturedCount = car.tiresPunctured.filter(Boolean).length;
        const speedPenalty = (1 - puncturedCount * 0.18) * (inWater ? 0.5 : 1.0);

        if (isUp) {
          car.speed = Math.min(car.maxSpeed * speedPenalty, car.speed + car.accel);
        } else if (isDown) {
          car.speed = Math.max(-car.maxSpeed * 0.45 * speedPenalty, car.speed - car.accel * 1.3);
        } else {
          car.speed *= 0.96; // Natural friction
        }

        // Wet roads reduce grip
        if (this.weather === 'rain') {
          car.speed *= 0.985;
        }

        if (isHandbrake) {
          car.speed *= 0.93;
          car.drift = Math.min(1, car.drift + 0.22);
          if (Math.abs(car.speed) > 2.8) {
            gtaAudio.tireScreech();
            this.addSkidMark(car);
            this.addSmoke(car.x, car.y, '#94a3b8');
          }
        } else {
          car.drift *= 0.85;
        }

        if (Math.abs(car.speed) > 0.2) {
          const steerDir = car.speed > 0 ? 1 : -1;
          const turnMod = isHandbrake ? 1.7 : 1.0;
          let steerPull = 0;
          if (car.tiresPunctured[0]) steerPull -= 0.015;
          if (car.tiresPunctured[1]) steerPull += 0.015;

          if (isLeft) car.angle -= (car.turnSpeed * turnMod + steerPull) * steerDir;
          if (isRight) car.angle += (car.turnSpeed * turnMod - steerPull) * steerDir;
        }

        // Engine sound modulation
        gtaAudio.updateEngineSound(true, car.speed, car.maxSpeed, isUp);

        // Drive-By shooting from inside car!
        if (this.isMouseDown && this.player.currentWeapon !== 'fist' && this.player.currentWeapon !== 'rpg') {
          this.shoot(true);
        }

        // Check Exit Vehicle with F or Enter
        if (this.keys['KeyF'] || this.keys['Enter']) {
          this.exitVehicle(car);
          this.keys['KeyF'] = false;
          this.keys['Enter'] = false;
        }
        return;
      }
    }

    // ON FOOT CONTROLS
    gtaAudio.updateEngineSound(false, 0, 0, false);

    // Unstuck emergency hotkey (KeyK)
    if (this.keys['KeyK']) {
      this.unstuckPlayerOrVehicle();
      this.keys['KeyK'] = false;
    }

    // Aim towards mouse pos in world coordinates
    const worldMouseX = this.camera.x + (this.mousePos.x - window.innerWidth / 2) / this.camera.zoom;
    const worldMouseY = this.camera.y + (this.mousePos.y - window.innerHeight / 2) / this.camera.zoom;
    this.player.angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);

    // Manual reload with R
    if (this.keys['KeyR'] && !this.player.isReloading) {
      this.reloadCurrentWeapon();
      this.keys['KeyR'] = false;
    }

    // Movement WASD
    let moveX = 0;
    let moveY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    const isMoving = moveX !== 0 || moveY !== 0;
    const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && isMoving && this.player.stamina > 5;
    this.player.isSprinting = isSprinting;

    if (isSprinting) {
      this.player.stamina = Math.max(0, this.player.stamina - dt * 26);
    } else {
      this.player.stamina = Math.min(100, this.player.stamina + dt * 16);
    }

    // Water swimming penalty
    const inWater = this.isPointInWater(this.player.x, this.player.y);
    let speedMult = inWater ? 0.55 : 1.0;
    if (inWater && isMoving && Math.random() < 0.25) {
      gtaAudio.splash();
      this.addParticle({
        id: `splash_${Math.random()}`,
        x: this.player.x + (Math.random() - 0.5) * 16,
        y: this.player.y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: 'rgba(186, 230, 253, 0.8)',
        life: 0.35,
        maxLife: 0.35,
        size: 5,
        type: 'smoke'
      });
    }

    const currentMaxSpeed = (isSprinting ? this.player.maxSpeed * 1.65 : this.player.maxSpeed) * speedMult;

    if (isMoving) {
      const mag = Math.hypot(moveX, moveY);
      const nx = moveX / mag;
      const ny = moveY / mag;

      const targetVx = nx * currentMaxSpeed;
      const targetVy = ny * currentMaxSpeed;

      this.player.vx += (targetVx - this.player.vx) * 0.25;
      this.player.vy += (targetVy - this.player.vy) * 0.25;
    } else {
      this.player.vx *= 0.7;
      this.player.vy *= 0.7;
    }

    // Anti-Stuck Axis Movement with Wall Slide
    const desiredX = this.player.x + this.player.vx;
    const desiredY = this.player.y + this.player.vy;

    // Test X movement independently
    const testX = this.resolveBuildingCollision(desiredX, this.player.y, 16);
    if (!testX.collided) {
      this.player.x = desiredX;
    } else {
      this.player.vx = 0;
    }

    // Test Y movement independently
    const testY = this.resolveBuildingCollision(this.player.x, desiredY, 16);
    if (!testY.collided) {
      this.player.y = desiredY;
    } else {
      this.player.vy = 0;
    }

    // Safety: ensure player never gets pinned inside a building even if bumped
    const finalResolved = this.resolveBuildingCollision(this.player.x, this.player.y, 16);
    if (finalResolved.collided) {
      this.player.x = finalResolved.x;
      this.player.y = finalResolved.y;
    }

    // Enter nearby vehicle with F / Enter
    if (this.keys['KeyF'] || this.keys['Enter']) {
      this.enterNearbyVehicle();
      this.keys['KeyF'] = false;
      this.keys['Enter'] = false;
    }

    // Shooting / Melee action
    if (this.isMouseDown) {
      this.shoot(false);
    }
  }

  // --- VEHICLES UPDATE ---
  private updateVehicles(dt: number) {
    // Spawn traffic if needed
    this.spawnTrafficTimer += dt;
    if (this.spawnTrafficTimer > 3 && this.vehicles.length < 24) {
      this.spawnTrafficTimer = 0;
      const types: VehicleType[] = ['sedan', 'sports', 'suv', 'cab', 'muscle'];
      const roads = [400, 1000, 1600, 2200, 2800];
      const isHoriz = Math.random() > 0.5;
      const roadCoord = roads[Math.floor(Math.random() * roads.length)];
      const cam = this.camera;
      const offset = 950;
      const x = isHoriz ? cam.x + (Math.random() > 0.5 ? offset : -offset) : roadCoord;
      const y = isHoriz ? roadCoord : cam.y + (Math.random() > 0.5 ? offset : -offset);
      const angle = isHoriz ? (Math.random() > 0.5 ? 0 : Math.PI) : (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
      this.spawnVehicle(types[Math.floor(Math.random() * types.length)], x, y, angle, 'ai');
    }

    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];

      // Auto-turn headlights on at dusk/night
      v.lightsOn = this.timeOfDay < 7 || this.timeOfDay > 18.5 || v.isPolice;

      // Smoking or flaming engine when low health
      if (v.health < v.maxHealth * 0.35 && v.health > 0) {
        v.engineSmoking = true;
        if (Math.random() < 0.35) {
          this.addSmoke(v.x, v.y, '#334155');
        }
      }
      if (v.health < v.maxHealth * 0.15 && v.health > 0) {
        v.engineOnFire = true;
        if (Math.random() < 0.25) {
          this.addFire(v.x, v.y);
        }
      }

      // Explode timer if dead
      if (v.health <= 0 && !v.isDead) {
        v.explodeTimer = (v.explodeTimer || 0) + dt;
        if (v.explodeTimer > 1.2) {
          v.isDead = true;
          this.explodeCar(v);
        }
      }

      // Air stunt physics
      if (v.inAir) {
        v.airHeight = Math.max(0, (v.airHeight || 0) - dt * 2.5);
        if (v.airHeight <= 0) {
          v.inAir = false;
          // Stunt landing reward!
          if (v.driver === 'player') {
            this.player.stuntScore += 500;
            this.player.cash += 250;
            gtaAudio.cashPickup();
            this.showNotification('🔥 GEWELDIGE STUNT SPRONG! +$250 Stunt Bonus', 3.0);
          }
        }
      }

      // AI movement logic
      if (v.driver === 'ai' && !v.isDead) {
        this.updateAIVehicle(v, dt);
      }

      v.vx = Math.cos(v.angle) * v.speed;
      v.vy = Math.sin(v.angle) * v.speed;

      const nextX = v.x + v.vx;
      const nextY = v.y + v.vy;

      // Building collisions with push-out resolution so vehicles never get stuck
      const resolved = this.resolveBuildingCollision(nextX, nextY, v.width * 0.45);
      if (resolved.collided) {
        v.x = resolved.x;
        v.y = resolved.y;
        v.speed = -v.speed * 0.35;
        v.health -= Math.max(0, Math.abs(v.speed) * 12);
        v.damageLevel = Math.min(1, v.damageLevel + 0.15);
        gtaAudio.crash(1.0);
        gtaAudio.glassShatter();
        this.addSparks(v.x, v.y);
      } else {
        v.x = Math.max(50, Math.min(this.width - 50, nextX));
        v.y = Math.max(50, Math.min(this.height - 50, nextY));
      }

      // Prop collisions (Hydrants, trash, lamps, stunt ramps, ATMs)
      this.checkVehiclePropCollisions(v);

      // Hit pedestrians
      if (Math.abs(v.speed) > 2.5) {
        for (const ped of this.pedestrians) {
          if (ped.state === 'dead') continue;
          const dist = Math.hypot(ped.x - v.x, ped.y - v.y);
          if (dist < v.length / 2 + 15) {
            ped.health -= Math.abs(v.speed) * 26;
            gtaAudio.crash(0.8);
            this.addBlood(ped.x, ped.y);
            ped.vx = Math.cos(v.angle) * v.speed * 1.3;
            ped.vy = Math.sin(v.angle) * v.speed * 1.3;
            if (ped.health <= 0) {
              this.killPedestrian(ped);
            }
          }
        }
      }

      // Despawn far away AI vehicles
      const distToPlayer = Math.hypot(v.x - this.player.x, v.y - this.player.y);
      if (v.driver === 'ai' && distToPlayer > 1850) {
        this.vehicles.splice(i, 1);
      }
    }
  }

  // --- PROP COLLISIONS ---
  private checkVehiclePropCollisions(v: Vehicle) {
    if (Math.abs(v.speed) < 1.0) return;

    for (const prop of this.props) {
      if (prop.isDestroyed) continue;
      const dist = Math.hypot(prop.x - v.x, prop.y - v.y);
      if (dist < (v.length / 2 + prop.width / 2)) {
        if (prop.type === 'ramp') {
          // Launch into air!
          if (!v.inAir && Math.abs(v.speed) > 4) {
            v.inAir = true;
            v.airHeight = 1.5;
            gtaAudio.crash(0.5);
            this.addSmoke(v.x, v.y, '#f8fafc');
          }
          continue;
        }

        // Damage prop
        prop.health -= Math.abs(v.speed) * 25;
        if (prop.health <= 0) {
          prop.isDestroyed = true;

          if (prop.type === 'hydrant') {
            prop.sprayedWaterTimer = 25; // 25 seconds of water geyser
            gtaAudio.waterHydrantSpray();
            this.addSparks(prop.x, prop.y);
          } else if (prop.type === 'trash') {
            gtaAudio.crash(0.7);
            // Scatter litter
            for (let t = 0; t < 8; t++) {
              this.addParticle({
                id: `trash_${Math.random()}`,
                x: prop.x,
                y: prop.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#e2e8f0',
                life: 1.2,
                maxLife: 1.2,
                size: 6,
                type: 'smoke'
              });
            }
          } else if (prop.type === 'atm') {
            gtaAudio.glassShatter();
            gtaAudio.cashPickup();
            // Drop cash bundles from destroyed ATM!
            for (let c = 0; c < 3; c++) {
              this.addParticle({
                id: `atm_cash_${Math.random()}`,
                x: prop.x + (Math.random() - 0.5) * 20,
                y: prop.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                color: '#22c55e',
                life: 30,
                maxLife: 30,
                size: 16,
                type: 'cash'
              });
            }
            this.addWanted(1);
          } else if (prop.type === 'lamp') {
            gtaAudio.glassShatter();
            this.addSparks(prop.x, prop.y);
          }
        }
      }
    }
  }

  // --- AI VEHICLE BEHAVIOR ---
  private updateAIVehicle(v: Vehicle, dt: number) {
    if (v.isPolice) {
      // Chase player if wanted
      if (this.player.wantedLevel > 0) {
        const targetX = this.player.x;
        const targetY = this.player.y;
        const targetAngle = Math.atan2(targetY - v.y, targetX - v.x);

        let angleDiff = targetAngle - v.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        v.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), v.turnSpeed * 1.25);
        v.speed = Math.min(v.maxSpeed * 0.95, v.speed + v.accel);
        v.sirenOn = true;

        // PIT maneuver / Ram player car
        const dist = Math.hypot(targetX - v.x, targetY - v.y);
        if (dist < 72 && this.player.inVehicleId) {
          const playerCar = this.getVehicle(this.player.inVehicleId);
          if (playerCar) {
            playerCar.health -= 15;
            playerCar.damageLevel = Math.min(1, playerCar.damageLevel + 0.15);
            gtaAudio.crash(1.0);
          }
        }
      } else {
        v.sirenOn = false;
        v.speed *= 0.96;
      }
      return;
    }

    // Normal traffic vehicle
    // Check traffic lights
    let stopForLight = false;
    for (const tl of this.trafficLights) {
      if (tl.state === 'red') {
        const distToLight = Math.hypot(tl.x - v.x, tl.y - v.y);
        if (distToLight < 80) {
          stopForLight = true;
          break;
        }
      }
    }

    // Check obstacle ahead
    const lookAheadDist = 65;
    const frontX = v.x + Math.cos(v.angle) * lookAheadDist;
    const frontY = v.y + Math.sin(v.angle) * lookAheadDist;

    let blocked = stopForLight;
    if (!blocked) {
      for (const other of this.vehicles) {
        if (other.id === v.id) continue;
        if (Math.hypot(other.x - frontX, other.y - frontY) < 48) {
          blocked = true;
          break;
        }
      }
    }

    if (blocked) {
      v.speed = Math.max(0, v.speed - v.accel * 2.2);
    } else {
      v.speed = Math.min(v.maxSpeed * 0.65, v.speed + v.accel * 0.55);
    }

    // Keep on roads
    if (v.x < 100 || v.x > this.width - 100 || v.y < 100 || v.y > this.height - 100) {
      v.angle += Math.PI;
    }
  }

  // --- PEDESTRIANS UPDATE ---
  private updatePedestrians(dt: number) {
    this.spawnPedTimer += dt;
    if (this.spawnPedTimer > 2.5 && this.pedestrians.length < 35) {
      this.spawnPedTimer = 0;
      const cam = this.camera;
      const offset = 850;
      const x = cam.x + (Math.random() - 0.5) * offset * 2;
      const y = cam.y + (Math.random() - 0.5) * offset * 2;
      this.spawnPedestrian(x, y);
    }

    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const ped = this.pedestrians[i];

      if (ped.state === 'dead') {
        ped.deathTime = (ped.deathTime || 0) + dt;
        if (ped.deathTime > 16) {
          this.pedestrians.splice(i, 1);
        }
        continue;
      }

      // Police officer behavior
      if (ped.isPolice) {
        if (this.player.wantedLevel > 0) {
          const distToPlayer = Math.hypot(this.player.x - ped.x, this.player.y - ped.y);
          ped.angle = Math.atan2(this.player.y - ped.y, this.player.x - ped.x);

          if (distToPlayer > 180) {
            ped.vx = Math.cos(ped.angle) * ped.speed;
            ped.vy = Math.sin(ped.angle) * ped.speed;
          } else {
            ped.vx = 0;
            ped.vy = 0;
            // Shoot at player
            ped.shootCooldown = (ped.shootCooldown || 0) - dt;
            if (ped.shootCooldown <= 0) {
              ped.shootCooldown = ped.policeTier === 2 ? 0.35 : 0.8;
              this.firePoliceBullet(ped);
            }
          }
        }
      } else {
        // Civilian behavior
        if (this.player.wantedLevel > 0 || this.player.isShooting) {
          const distToPlayer = Math.hypot(this.player.x - ped.x, this.player.y - ped.y);
          if (distToPlayer < 350) {
            ped.state = 'panicking';
            ped.angle = Math.atan2(ped.y - this.player.y, ped.x - this.player.x);
            ped.speed = 3.2;

            // Occasional speech shout
            if (Math.random() < 0.008) {
              const shouts = ['Help! Hij schiet!', 'Bel 112!', 'Kijk uit!', 'Niet schieten!'];
              this.addSpeech(shouts[Math.floor(Math.random() * shouts.length)], ped.x, ped.y - 20, '#ef4444');
            }
          }
        }

        if (ped.state === 'walking') {
          ped.stateTimer -= dt;
          if (ped.stateTimer <= 0) {
            ped.stateTimer = 100 + Math.random() * 200;
            ped.targetX = ped.x + (Math.random() - 0.5) * 400;
            ped.targetY = ped.y + (Math.random() - 0.5) * 400;
          }
          const dX = ped.targetX - ped.x;
          const dY = ped.targetY - ped.y;
          if (Math.hypot(dX, dY) > 20) {
            ped.angle = Math.atan2(dY, dX);
            ped.vx = Math.cos(ped.angle) * ped.speed;
            ped.vy = Math.sin(ped.angle) * ped.speed;
          } else {
            ped.vx = 0;
            ped.vy = 0;
          }
        } else if (ped.state === 'panicking') {
          ped.vx = Math.cos(ped.angle) * ped.speed;
          ped.vy = Math.sin(ped.angle) * ped.speed;
        }
      }

      ped.x = Math.max(30, Math.min(this.width - 30, ped.x + ped.vx));
      ped.y = Math.max(30, Math.min(this.height - 30, ped.y + ped.vy));
    }
  }

  // --- TRAFFIC LIGHTS UPDATE ---
  private updateTrafficLights(dt: number) {
    for (const tl of this.trafficLights) {
      tl.timer -= dt;
      if (tl.timer <= 0) {
        if (tl.state === 'green') {
          tl.state = 'yellow';
          tl.timer = 2.5;
        } else if (tl.state === 'yellow') {
          tl.state = 'red';
          tl.timer = 9.0;
        } else {
          tl.state = 'green';
          tl.timer = 9.0;
        }
      }
    }
  }

  // --- PROPS UPDATE ---
  private updateProps(dt: number) {
    for (const prop of this.props) {
      if (prop.type === 'hydrant' && prop.sprayedWaterTimer && prop.sprayedWaterTimer > 0) {
        prop.sprayedWaterTimer -= dt;
        // Spurt water particles high into air
        for (let w = 0; w < 3; w++) {
          this.addParticle({
            id: `water_${Math.random()}`,
            x: prop.x + (Math.random() - 0.5) * 6,
            y: prop.y - 10,
            vx: (Math.random() - 0.5) * 3,
            vy: -8 - Math.random() * 5,
            color: 'rgba(56, 189, 248, 0.75)',
            life: 0.55,
            maxLife: 0.55,
            size: 6,
            type: 'water'
          });
        }
      }
    }
  }

  // --- SPEECH BUBBLES UPDATE ---
  private updateSpeechBubbles(dt: number) {
    for (let i = this.speechBubbles.length - 1; i >= 0; i--) {
      this.speechBubbles[i].timer -= dt;
      if (this.speechBubbles[i].timer <= 0) {
        this.speechBubbles.splice(i, 1);
      }
    }
  }

  // --- GRENADES UPDATE ---
  private updateGrenades(dt: number) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.x += g.vx;
      g.y += g.vy;
      g.vx *= 0.94;
      g.vy *= 0.94;

      g.fuse -= dt;

      // Bounce off buildings
      if (this.checkBuildingCollision(g.x, g.y, 6)) {
        g.vx = -g.vx * 0.7;
        g.vy = -g.vy * 0.7;
        gtaAudio.grenadeBounce();
      }

      if (g.fuse <= 0) {
        this.createExplosion(g.x, g.y, g.radius, g.damage);
        this.grenades.splice(i, 1);
      }
    }
  }

  // --- WANTED & POLICE UPDATE ---
  private updatePoliceWanted(dt: number) {
    const stars = this.player.wantedLevel;

    if (stars > 0) {
      // Audio siren loop
      gtaAudio.setPoliceSiren(true);

      // Ambient police dispatch chatter
      this.ambientDispatchTimer += dt;
      if (this.ambientDispatchTimer > 14) {
        this.ambientDispatchTimer = 0;
        gtaAudio.policeDispatchRadio();
      }

      // Check if player is seen by any cop or cruiser
      let seenByCop = false;
      for (const ped of this.pedestrians) {
        if (ped.isPolice && ped.state !== 'dead') {
          if (Math.hypot(ped.x - this.player.x, ped.y - this.player.y) < 520) {
            seenByCop = true;
            break;
          }
        }
      }
      for (const v of this.vehicles) {
        if (v.isPolice) {
          if (Math.hypot(v.x - this.player.x, v.y - this.player.y) < 580) {
            seenByCop = true;
            break;
          }
        }
      }

      if (!seenByCop) {
        this.player.wantedTimer += dt;
        if (this.player.wantedTimer > 12) {
          this.player.wantedLevel = Math.max(0, this.player.wantedLevel - 1);
          this.player.wantedTimer = 0;
          this.showNotification(
            this.player.wantedLevel === 0 ? '⭐⭐ Politie Afgeschud! ⭐⭐' : `Wanted Level gedaald: ${this.player.wantedLevel} sterren`,
            3.0
          );
        }
      } else {
        this.player.wantedTimer = 0;
      }

      // Police Spawns based on Wanted Level
      this.policeSpawnTimer += dt;
      const spawnInterval = stars >= 4 ? 4.5 : stars >= 2 ? 7.5 : 12;

      if (this.policeSpawnTimer > spawnInterval) {
        this.policeSpawnTimer = 0;
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = 720 + Math.random() * 200;
        const spawnX = this.player.x + Math.cos(angle) * spawnDist;
        const spawnY = this.player.y + Math.sin(angle) * spawnDist;

        if (stars >= 4) {
          // SWAT Enforcer + 2 SWAT officers
          this.spawnVehicle('swat', spawnX, spawnY, angle, 'ai');
          this.spawnPedestrian(spawnX + 25, spawnY + 25, true, 2);
          this.spawnPedestrian(spawnX - 25, spawnY - 25, true, 2);
        } else if (stars >= 2) {
          // Police Cruiser + 2 cops
          this.spawnVehicle('police', spawnX, spawnY, angle, 'ai');
          this.spawnPedestrian(spawnX + 20, spawnY + 20, true, 1);
        } else {
          this.spawnPedestrian(spawnX, spawnY, true, 1);
        }
      }

      // 5-Star Helicopter searchlight
      if (stars >= 5) {
        this.heli.active = true;
        this.heli.x += (this.player.x - this.heli.x) * 0.05;
        this.heli.y += (this.player.y - this.heli.y) * 0.05;
        this.heli.angle += 0.22;
      } else {
        this.heli.active = false;
      }
    } else {
      gtaAudio.setPoliceSiren(false);
      this.heli.active = false;
    }
  }

  // --- SHOOTING & WEAPONS ---
  public shoot(isDriveBy: boolean = false) {
    const now = Date.now();
    const weaponDef = WEAPONS[this.player.currentWeapon];

    if (this.player.isReloading) return;
    if (now - this.player.lastShotTime < weaponDef.fireRate) return;
    this.player.lastShotTime = now;

    // Check clip ammo
    if (this.player.currentWeapon !== 'fist') {
      if (this.player.clipRemaining[this.player.currentWeapon] <= 0) {
        this.reloadCurrentWeapon();
        return;
      }
      this.player.clipRemaining[this.player.currentWeapon]--;
    }

    // Grenade throwing
    if (this.player.currentWeapon === 'grenade') {
      gtaAudio.grenadeBounce();
      const throwSpeed = 12;
      this.grenades.push({
        id: `grenade_${Math.random()}`,
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(this.player.angle) * throwSpeed,
        vy: Math.sin(this.player.angle) * throwSpeed,
        fuse: 2.2,
        damage: weaponDef.damage,
        radius: 170
      });
      return;
    }

    // Sniper special sound
    if (this.player.currentWeapon === 'sniper') {
      gtaAudio.sniperShot();
    } else {
      gtaAudio.gunshot(this.player.currentWeapon);
    }

    // Increase wanted level if shooting in public
    if (this.player.wantedLevel === 0 && this.player.currentWeapon !== 'fist') {
      this.addWanted(1);
    }

    const shooterX = this.player.x;
    const shooterY = this.player.y;
    const baseAngle = this.player.angle;

    // Shotgun fires multiple spread pellets
    const pelletCount = this.player.currentWeapon === 'shotgun' ? 6 : 1;

    for (let p = 0; p < pelletCount; p++) {
      const spreadAngle = baseAngle + (Math.random() - 0.5) * weaponDef.spread;
      const bullet: Bullet = {
        id: `bullet_${Math.random()}`,
        x: shooterX + Math.cos(baseAngle) * 22,
        y: shooterY + Math.sin(baseAngle) * 22,
        vx: Math.cos(spreadAngle) * (weaponDef.bulletSpeed || 16),
        vy: Math.sin(spreadAngle) * (weaponDef.bulletSpeed || 16),
        damage: weaponDef.damage,
        rangeRemaining: weaponDef.range,
        shooter: 'player',
        weapon: this.player.currentWeapon
      };
      this.bullets.push(bullet);
    }

    // Muzzle flash particle
    this.addParticle({
      id: `flash_${Math.random()}`,
      x: shooterX + Math.cos(baseAngle) * 25,
      y: shooterY + Math.sin(baseAngle) * 25,
      vx: 0,
      vy: 0,
      color: '#fbbf24',
      life: 0.08,
      maxLife: 0.08,
      size: 11,
      type: 'fire'
    });
  }

  private firePoliceBullet(cop: Pedestrian) {
    gtaAudio.gunshot(cop.hasWeapon);
    const bullet: Bullet = {
      id: `cop_bullet_${Math.random()}`,
      x: cop.x,
      y: cop.y,
      vx: Math.cos(cop.angle) * 16,
      vy: Math.sin(cop.angle) * 16,
      damage: 15,
      rangeRemaining: 400,
      shooter: 'police',
      weapon: cop.hasWeapon
    };
    this.bullets.push(bullet);
  }

  // --- BULLETS UPDATE & HITS ---
  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.rangeRemaining -= Math.hypot(b.vx, b.vy);

      // Hit wall
      if (this.checkBuildingCollision(b.x, b.y, 4)) {
        this.addSparks(b.x, b.y);
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.rangeRemaining <= 0) {
        if (b.weapon === 'rpg') {
          this.createExplosion(b.x, b.y, 160, b.damage);
        }
        this.bullets.splice(i, 1);
        continue;
      }

      // Hit player (if fired by cop)
      if (b.shooter === 'police') {
        const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < 18) {
          this.damagePlayer(b.damage);
          this.addBlood(this.player.x, this.player.y);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Hit pedestrians
      if (b.shooter === 'player') {
        let hitPed = false;
        for (const ped of this.pedestrians) {
          if (ped.state === 'dead') continue;
          const dist = Math.hypot(ped.x - b.x, ped.y - b.y);
          if (dist < 18) {
            ped.health -= b.damage;
            this.addBlood(ped.x, ped.y);
            hitPed = true;

            if (b.weapon === 'rpg') {
              this.createExplosion(b.x, b.y, 160, b.damage);
            }

            if (ped.health <= 0) {
              this.killPedestrian(ped);
            }
            break;
          }
        }
        if (hitPed) {
          this.bullets.splice(i, 1);
          continue;
        }

        // Hit vehicles
        let hitCar = false;
        for (const car of this.vehicles) {
          const dist = Math.hypot(car.x - b.x, car.y - b.y);
          if (dist < car.length / 2) {
            car.health -= b.damage;
            car.damageLevel = Math.min(1, car.damageLevel + 0.1);
            this.addSparks(b.x, b.y);
            hitCar = true;

            if (b.weapon === 'rpg') {
              this.createExplosion(b.x, b.y, 170, b.damage);
            }

            if (car.health <= 0 && !car.isDead) {
              this.explodeCar(car);
            }
            break;
          }
        }
        if (hitCar) {
          this.bullets.splice(i, 1);
          continue;
        }
      }
    }
  }

  // --- EXPLOSIONS & PARTICLES ---
  public createExplosion(x: number, y: number, radius: number, damage: number) {
    gtaAudio.explosion(1.0);

    // Damage all vehicles in blast
    for (const v of this.vehicles) {
      const dist = Math.hypot(v.x - x, v.y - y);
      if (dist < radius) {
        v.health -= damage * (1 - dist / radius);
        v.damageLevel = 1.0;
        if (v.health <= 0 && !v.isDead) {
          this.explodeCar(v);
        }
      }
    }

    // Damage all pedestrians in blast
    for (const ped of this.pedestrians) {
      if (ped.state === 'dead') continue;
      const dist = Math.hypot(ped.x - x, ped.y - y);
      if (dist < radius) {
        ped.health -= damage * (1 - dist / radius);
        if (ped.health <= 0) {
          this.killPedestrian(ped);
        }
      }
    }

    // Damage player if close
    const pDist = Math.hypot(this.player.x - x, this.player.y - y);
    if (pDist < radius) {
      this.damagePlayer(damage * (1 - pDist / radius));
    }

    // Fire & smoke particles
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.addParticle({
        id: `exp_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#f97316', '#ef4444', '#facc15', '#475569'][Math.floor(Math.random() * 4)],
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        size: 16 + Math.random() * 22,
        type: 'fire'
      });
    }

    this.addWanted(2);
  }

  private explodeCar(car: Vehicle) {
    this.createExplosion(car.x, car.y, 165, 260);
    car.color = '#18181b'; // Scorched wreck
  }

  // --- DAMAGE & REWARDS ---
  public damagePlayer(amount: number) {
    if (this.player.armor > 0) {
      const armorAbsorb = Math.min(this.player.armor, amount * 0.7);
      this.player.armor -= armorAbsorb;
      amount -= armorAbsorb;
    }
    this.player.health = Math.max(0, this.player.health - amount);

    if (this.player.health <= 0) {
      this.killPlayer('Uitgeschakeld door kogels');
    }
  }

  public killPlayer(reason: string) {
    if (this.isWasted) return;
    this.isWasted = true;
    this.wastedTimer = 0;
    gtaAudio.wastedSound();
    this.showNotification(`💀 WASTED: ${reason}`, 4.0);
  }

  public respawnPlayer() {
    this.isWasted = false;
    this.isBusted = false;
    this.wastedTimer = 0;
    this.player.inVehicleId = null;
    this.player.health = 100;
    this.player.armor = 25;
    this.player.wantedLevel = 0;
    this.player.wantedTimer = 0;

    // Deduct hospital fee
    const fee = Math.min(this.player.cash, 250);
    this.player.cash -= fee;

    // Respawn at Hospital
    this.player.x = 1200;
    this.player.y = 2470;
    this.showNotification(`🏥 Ontslagen uit Pillbox Hospital (Kosten: $${fee})`, 3.5);
  }

  public killPedestrian(ped: Pedestrian) {
    ped.state = 'dead';
    this.player.kills++;
    if (ped.isPolice) {
      this.player.copsKilled++;
      this.addWanted(1);
    } else {
      if (this.player.wantedLevel < 2) this.addWanted(1);
    }

    // Drop cash bundle
    this.addParticle({
      id: `cash_${Math.random()}`,
      x: ped.x,
      y: ped.y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: '#22c55e',
      life: 25,
      maxLife: 25,
      size: 16,
      type: 'cash'
    });
  }

  public addWanted(stars: number) {
    const prev = this.player.wantedLevel;
    this.player.wantedLevel = Math.min(5, this.player.wantedLevel + stars);
    this.player.wantedTimer = 0;

    if (this.player.wantedLevel > prev) {
      gtaAudio.policeDispatchRadio();
      this.showNotification(`🚨 WANTED LEVEL VERHOOGD: ${'⭐'.repeat(this.player.wantedLevel)}`, 3.0);
    }
  }

  // --- VEHICLE ENTRY / EXIT ---
  public enterNearbyVehicle() {
    let nearest: Vehicle | null = null;
    let minDist = 80;

    for (const v of this.vehicles) {
      if (v.health <= 0) continue;
      const d = Math.hypot(v.x - this.player.x, v.y - this.player.y);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }

    if (nearest) {
      this.player.inVehicleId = nearest.id;
      nearest.driver = 'player';
      this.player.carsStolen++;
      gtaAudio.carDoor();
      this.showNotification(`Ingestapt: ${nearest.name} (Gebruik R voor Radio)`, 2.5);

      if (nearest.isPolice && this.player.wantedLevel === 0) {
        this.addWanted(1);
      }
    }
  }

  public exitVehicle(car: Vehicle) {
    this.player.inVehicleId = null;
    car.driver = null;
    this.player.x = car.x + Math.cos(car.angle + Math.PI / 2) * 35;
    this.player.y = car.y + Math.sin(car.angle + Math.PI / 2) * 35;
    gtaAudio.carDoor();
    gtaAudio.stopRadio();
  }

  // --- INTERACTION PROMPTS (EXPANDED MAP LOCATIONS) ---
  private checkInteractions() {
    this.interactionPrompt = null;
    const px = this.player.x;
    const py = this.player.y;

    // Check enterable building doors on foot
    if (!this.player.inVehicleId) {
      for (const b of this.buildings) {
        if (!b.entrance) continue;
        const interior = BUILDING_INTERIORS[b.id];
        if (!interior) continue;

        const doorCenterX = b.entrance.x + b.entrance.width / 2;
        const doorCenterY = b.entrance.y + b.entrance.height / 2;
        const distToDoor = Math.hypot(px - doorCenterX, py - doorCenterY);

        if (distToDoor < 95) {
          this.interactionPrompt = `🚪 [E] Druk op E om ${interior.name} binnen te gaan`;
          if (this.keys['KeyE']) {
            this.enterBuilding(b.id);
            this.keys['KeyE'] = false;
            return;
          }
        }
      }
    }

    // 1. Werkdonalds Flagship Restaurant Downtown (x: 3415, y: 4000)
    // or Werkdonalds Beach Diner at Del Perro Pier (x: 615, y: 3210)
    const distW1 = Math.hypot(3415 - px, 4000 - py);
    const distW2 = Math.hypot(615 - px, 3210 - py);
    if (distW1 < 100 || distW2 < 100) {
      this.interactionPrompt = '🍔 [E] Werkdonalds Menu ($25) - Herstel Leven & Bepantsering (100%)';
      if (this.keys['KeyE']) {
        if (this.player.cash >= 25) {
          this.player.cash -= 25;
          this.player.health = 100;
          this.player.armor = 100;
          gtaAudio.cashPickup();
          this.showNotification('🍔 Heerlijk Big Werk Menu gegeten! HP & Armor 100%', 3.0);
        } else {
          this.showNotification('Niet genoeg cash voor een burgermenu!', 2.0);
        }
        this.keys['KeyE'] = false;
      }
    }

    // 2. Pay 'n' Spray Garage Downtown (x: 2515, y: 3780) or Harbor Docks (x: 4315, y: 5580)
    if (this.player.inVehicleId) {
      const car = this.getVehicle(this.player.inVehicleId);
      if (car) {
        const pDist1 = Math.hypot(2515 - car.x, 3780 - car.y);
        const pDist2 = Math.hypot(4315 - car.x, 5580 - car.y);
        if (pDist1 < 110 || pDist2 < 110) {
          this.interactionPrompt = '🔧 [E] Pay \'n\' Spray ($100) - Repareer & Schud Politie Af';
          if (this.keys['KeyE']) {
            if (this.player.cash >= 100) {
              this.player.cash -= 100;
              car.health = car.maxHealth;
              car.damageLevel = 0;
              car.engineSmoking = false;
              car.engineOnFire = false;
              car.tiresPunctured = [false, false, false, false];
              const newColors = ['#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#3b82f6'];
              car.color = newColors[Math.floor(Math.random() * newColors.length)];
              this.player.wantedLevel = 0;
              this.player.wantedTimer = 0;
              gtaAudio.cashPickup();
              this.showNotification('✨ Auto overgespoten & gerepareerd! Politie kwijt!', 3.5);
            } else {
              this.showNotification('Niet genoeg cash voor een respray!', 2.0);
            }
            this.keys['KeyE'] = false;
          }
        }
      }
    }

    // 3. Ammu-Nation Downtown (x: 4305, y: 3090) or Sandy Shores (x: 5185, y: 1260)
    const aDist1 = Math.hypot(4305 - px, 3090 - py);
    const aDist2 = Math.hypot(5185 - px, 1260 - py);
    if (aDist1 < 100 || aDist2 < 100) {
      this.interactionPrompt = '🔫 [E] Ammu-Nation: Sniper + SMG Munitie + Vest ($1.500)';
      if (this.keys['KeyE']) {
        if (this.player.cash >= 1500) {
          this.player.cash -= 1500;
          this.player.currentWeapon = 'sniper';
          this.player.ammo.sniper += 30;
          this.player.ammo.smg += 150;
          this.player.ammo.grenade += 5;
          this.player.armor = 100;
          gtaAudio.cashPickup();
          this.showNotification('🔫 Heavy Sniper, Granaten & Kogelvrij vest gekocht!', 3.0);
        } else {
          this.showNotification('Niet genoeg cash voor Ammu-Nation wapens!', 2.0);
        }
        this.keys['KeyE'] = false;
      }
    }

    // 4. Pillbox Hill Medical Center (x: 2540, y: 1980)
    const hDist = Math.hypot(2540 - px, 1980 - py);
    if (hDist < 100 && this.player.health < 100) {
      this.interactionPrompt = '🏥 [E] Ziekenhuis: Medische Behandeling ($50)';
      if (this.keys['KeyE']) {
        if (this.player.cash >= 50) {
          this.player.cash -= 50;
          this.player.health = 100;
          gtaAudio.cashPickup();
          this.showNotification('🏥 Volledig hersteld door het ziekenhuis!', 3.0);
        } else {
          this.showNotification('Niet genoeg cash voor medische behandeling!', 2.0);
        }
        this.keys['KeyE'] = false;
      }
    }
  }

  // --- MISSIONS PROGRESSION ---
  private updateMissions(dt: number) {
    if (!this.activeMission) return;
    const m = this.activeMission;

    if (m.timeLimit) {
      m.timeRemaining = (m.timeRemaining || m.timeLimit) - dt;
      if (m.timeRemaining <= 0) {
        m.status = 'failed';
        this.activeMission = null;
        this.showNotification(`❌ MISSIE GEFAALD: Tijd verstreken!`, 4.0);
        return;
      }
    }

    const dist = Math.hypot(m.targetX - this.player.x, m.targetY - this.player.y);

    if (m.type === 'delivery') {
      if (dist < m.targetRadius) {
        this.completeMission(m);
      }
    } else if (m.type === 'getaway') {
      if (this.player.wantedLevel === 0 && dist < m.targetRadius) {
        this.completeMission(m);
      }
    } else if (m.type === 'heist') {
      if (dist < m.targetRadius && this.player.wantedLevel === 0) {
        this.completeMission(m);
      }
    }
  }

  public startMission(missionId: string) {
    const m = this.missions.find(x => x.id === missionId);
    if (!m) return;

    this.activeMission = m;
    m.status = 'active';
    m.timeRemaining = m.timeLimit;
    this.showNotification(`⭐ MISSIE GESTART: ${m.title} - ${m.description}`, 5.0);

    if (m.type === 'heist') {
      this.addWanted(3);
    }
  }

  public completeMission(m: Mission) {
    m.status = 'completed';
    this.player.cash += m.rewardCash;
    this.player.missionsCompleted++;
    this.activeMission = null;
    gtaAudio.cashPickup();
    this.showNotification(`🏆 MISSIE VOLTOOID: ${m.title}! Beloning: +$${m.rewardCash}`, 5.0);
  }

  // --- HELPERS & ANTI-STUCK SYSTEM ---
  public getVehicle(id: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  public isPointInWater(x: number, y: number): boolean {
    for (const wz of this.waterZones) {
      if (x >= wz.x && x <= wz.x + wz.width && y >= wz.y && y <= wz.y + wz.height) {
        return true;
      }
    }
    return false;
  }

  public getCurrentDistrict(): string {
    const px = this.player.x;
    const py = this.player.y;
    for (const d of this.districts) {
      if (px >= d.x && px <= d.x + d.width && py >= d.y && py <= d.y + d.height) {
        return d.name;
      }
    }
    return 'Los Werkos';
  }

  /**
   * Push-out separation solver. Detects overlap with buildings and gently pushes
   * the entity outside to prevent ever getting stuck inside collision boundaries.
   */
  public resolveBuildingCollision(x: number, y: number, radius: number): { x: number; y: number; collided: boolean } {
    let resolvedX = x;
    let resolvedY = y;
    let collided = false;

    // Constrain to world bounds
    if (resolvedX - radius < 40) { resolvedX = 40 + radius; collided = true; }
    if (resolvedX + radius > this.width - 40) { resolvedX = this.width - 40 - radius; collided = true; }
    if (resolvedY - radius < 40) { resolvedY = 40 + radius; collided = true; }
    if (resolvedY + radius > this.height - 40) { resolvedY = this.height - 40 - radius; collided = true; }

    for (const b of this.buildings) {
      // Find closest point on building rectangle to circle center
      const closestX = Math.max(b.x, Math.min(resolvedX, b.x + b.width));
      const closestY = Math.max(b.y, Math.min(resolvedY, b.y + b.height));

      const distX = resolvedX - closestX;
      const distY = resolvedY - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq < radius * radius) {
        collided = true;
        const dist = Math.sqrt(distSq);
        if (dist > 0.001) {
          // Push out along contact normal
          const overlap = radius - dist + 0.5;
          resolvedX += (distX / dist) * overlap;
          resolvedY += (distY / dist) * overlap;
        } else {
          // Deep penetration: push to closest exterior face
          const dLeft = resolvedX - b.x;
          const dRight = (b.x + b.width) - resolvedX;
          const dTop = resolvedY - b.y;
          const dBottom = (b.y + b.height) - resolvedY;
          const minEdge = Math.min(dLeft, dRight, dTop, dBottom);

          if (minEdge === dLeft) resolvedX = b.x - radius - 2;
          else if (minEdge === dRight) resolvedX = b.x + b.width + radius + 2;
          else if (minEdge === dTop) resolvedY = b.y - radius - 2;
          else resolvedY = b.y + b.height + radius + 2;
        }
      }
    }
    return { x: resolvedX, y: resolvedY, collided };
  }

  /**
   * Emergency unstuck: safely teleports player and vehicle to nearest boulevard
   */
  public unstuckPlayerOrVehicle() {
    const vertBoulevards = [2300, 3200, 4100, 5000, 5700];
    const horizAvenues = [1000, 1900, 2800, 3700, 4600, 5500];

    const curX = this.player.x;
    const curY = this.player.y;

    let bestX = 3200;
    let bestY = 2800;
    let minDist = Infinity;

    for (const vx of vertBoulevards) {
      const d = Math.abs(vx - curX);
      if (d < minDist) {
        minDist = d;
        bestX = vx;
        bestY = curY;
      }
    }
    for (const hy of horizAvenues) {
      const d = Math.abs(hy - curY);
      if (d < minDist) {
        minDist = d;
        bestX = curX;
        bestY = hy;
      }
    }

    const safe = this.resolveBuildingCollision(bestX, bestY, 45);
    bestX = safe.x;
    bestY = safe.y;

    if (this.player.inVehicleId) {
      const car = this.getVehicle(this.player.inVehicleId);
      if (car) {
        car.x = bestX;
        car.y = bestY;
        car.speed = 0;
        car.vx = 0;
        car.vy = 0;
        car.drift = 0;
        this.player.x = bestX;
        this.player.y = bestY;
      }
    } else {
      this.player.x = bestX;
      this.player.y = bestY;
      this.player.vx = 0;
      this.player.vy = 0;
    }

    gtaAudio.unstuckSound();
    this.showNotification('🚗 ONTKOPPELD: Veilig verplaatst naar de open boulevard!', 3.5);
  }

  /**
   * Car Horn (Claxon) action
   */
  public blowHorn() {
    if (!this.player.inVehicleId) return;
    gtaAudio.carHorn();
    // Alert nearby pedestrians
    for (const ped of this.pedestrians) {
      if (ped.state === 'dead') continue;
      const d = Math.hypot(ped.x - this.player.x, ped.y - this.player.y);
      if (d < 180) {
        ped.state = 'panicking';
        ped.speed = 3.6;
        ped.angle = Math.atan2(ped.y - this.player.y, ped.x - this.player.x);
        if (Math.random() < 0.4) {
          const honkShouts = ['Hé, kijk uit!', 'Toeter niet zo!', 'Idioot!', 'Pas op!', 'Kijk waar je rijdt!'];
          this.addSpeech(honkShouts[Math.floor(Math.random() * honkShouts.length)], ped.x, ped.y - 20, '#f59e0b');
        }
      }
    }
  }

  public checkBuildingCollision(x: number, y: number, radius: number): boolean {
    for (const b of this.buildings) {
      if (
        x + radius > b.x &&
        x - radius < b.x + b.width &&
        y + radius > b.y &&
        y - radius < b.y + b.height
      ) {
        return true;
      }
    }
    return false;
  }

  private addSkidMark(car: Vehicle) {
    const prevX = car.x - Math.cos(car.angle) * 15;
    const prevY = car.y - Math.sin(car.angle) * 15;
    this.skidMarks.push({
      x1: prevX,
      y1: prevY,
      x2: car.x,
      y2: car.y,
      alpha: 0.65
    });
  }

  public addSmoke(x: number, y: number, color: string = '#cbd5e1') {
    this.addParticle({
      id: `smoke_${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color,
      life: 0.8,
      maxLife: 0.8,
      size: 10 + Math.random() * 12,
      type: 'smoke'
    });
  }

  public addFire(x: number, y: number) {
    this.addParticle({
      id: `fire_${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -1.5 - Math.random() * 1.5,
      color: ['#f97316', '#ef4444', '#facc15'][Math.floor(Math.random() * 3)],
      life: 0.4,
      maxLife: 0.4,
      size: 12 + Math.random() * 8,
      type: 'fire'
    });
  }

  public addSparks(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.addParticle({
        id: `spark_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * (3 + Math.random() * 4),
        vy: Math.sin(angle) * (3 + Math.random() * 4),
        color: '#facc15',
        life: 0.25,
        maxLife: 0.25,
        size: 3,
        type: 'spark'
      });
    }
  }

  public addBlood(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.addParticle({
        id: `blood_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * (1 + Math.random() * 2),
        vy: Math.sin(angle) * (1 + Math.random() * 2),
        color: '#b91c1c',
        life: 0.35,
        maxLife: 0.35,
        size: 5,
        type: 'blood'
      });
    }
  }

  public addParticle(p: Particle) {
    this.particles.push(p);
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- BUILDING INTERIORS & MULTIPLAYER METHODS ---
  public setMultiplayer(manager: MultiplayerManager) {
    this.multiplayer = manager;
  }

  public syncMultiplayer() {
    if (!this.multiplayer || !this.multiplayer.isConnected()) return;
    const now = performance.now();
    if (now - this.lastMultiplayerSyncTime < 45) return;
    this.lastMultiplayerSyncTime = now;

    const currentVeh = this.player.inVehicleId ? this.getVehicle(this.player.inVehicleId) : null;

    this.multiplayer.sendUpdate({
      x: this.player.x,
      y: this.player.y,
      angle: this.player.angle,
      speed: currentVeh ? currentVeh.speed : this.player.speed,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      armor: this.player.armor,
      currentWeapon: this.player.currentWeapon,
      isFiring: this.player.isShooting,
      inVehicle: !!this.player.inVehicleId,
      vehicleModel: currentVeh?.model,
      vehicleColor: currentVeh?.color,
      vehicleAngle: currentVeh?.angle,
      vehicleSpeed: currentVeh?.speed,
      horn: this.keys['KeyH'],
      interiorId: this.currentInterior ? this.currentInterior.id : null
    });
  }

  public enterBuilding(buildingId: string) {
    const interior = BUILDING_INTERIORS[buildingId];
    if (!interior) return;

    if (this.player.inVehicleId) {
      const v = this.getVehicle(this.player.inVehicleId);
      if (v) this.exitVehicle(v);
    }

    this.currentInterior = interior;
    this.player.x = interior.spawnPoint.x;
    this.player.y = interior.spawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.angle = interior.spawnPoint.angle;

    // Reset camera to center of interior
    this.camera.x = interior.width / 2;
    this.camera.y = interior.height / 2;

    gtaAudio.carDoor();
    this.showNotification(`🚪 Binnengegaan: ${interior.name}!`, 3.5);

    if (this.multiplayer) {
      this.multiplayer.sendAction({ type: 'enter_building', interiorId: interior.id });
    }
  }

  public exitInterior() {
    if (!this.currentInterior) return;
    const ret = this.currentInterior.exitReturnPoint;
    const name = this.currentInterior.name;
    this.currentInterior = null;

    this.player.x = ret.x;
    this.player.y = ret.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.angle = ret.angle;
    this.camera.x = ret.x;
    this.camera.y = ret.y;

    gtaAudio.carDoor();
    this.showNotification(`🚪 Je bent naar buiten gegaan.`, 3.0);

    if (this.multiplayer) {
      this.multiplayer.sendAction({ type: 'exit_building' });
    }
  }

  public handleInteriorAction(zone: InteriorInteractionZone) {
    if (!this.currentInterior) return;

    if (zone.action === 'order_food') {
      if (this.currentInterior.type === 'police') {
        // Police bail
        if (this.player.cash >= 200) {
          this.player.cash -= 200;
          this.player.wantedLevel = 0;
          this.player.wantedTimer = 0;
          gtaAudio.cashPickup();
          this.showNotification('⚖️ Borgtocht betaald ($200)! Wanted level volledig gewist.', 3.5);
        } else {
          this.showNotification('Niet genoeg cash om borg te betalen!', 2.5);
        }
      } else {
        // Food menu
        if (this.player.cash >= 25) {
          this.player.cash -= 25;
          this.player.health = 100;
          this.player.armor = Math.min(100, this.player.armor + 30);
          gtaAudio.cashPickup();
          this.addSpeech('Alsjeblieft! Eet smakelijk!', zone.x, zone.y - 25, '#f59e0b');
          this.showNotification('🍔 WerkBurger Menu gegeten! Gezondheid & Bepantsering hersteld!', 3.5);
        } else {
          this.showNotification('Niet genoeg cash voor een burgermenu ($25)!', 2.0);
        }
      }
    } else if (zone.action === 'bank_teller') {
      // Deposit money
      if (this.player.cash > 0) {
        const amt = this.player.cash;
        this.player.cash = 0;
        gtaAudio.cashPickup();
        this.addSpeech(`Bedankt! $${amt} veilig gestort op uw rekening.`, zone.x, zone.y - 25, '#38bdf8');
        this.showNotification(`💳 WerkPay Loket: $${amt} op rekening gestort!`, 3.5);
      } else {
        // Give starter stipend if broke
        this.player.cash += 250;
        gtaAudio.cashPickup();
        this.showNotification('💳 WerkPay Rekening: $250 dagvergoeding opgenomen!', 3.0);
      }
    } else if (zone.action === 'bank_vault') {
      // Heist vault
      this.player.cash += 2500;
      this.addWanted(3);
      gtaAudio.policeDispatchRadio();
      this.addSpeech('ALARM! BANKOVERVAL IN HET HOOFDTRESOOR!', zone.x, zone.y - 30, '#ef4444');
      this.showNotification('🚨 BANKKLUIS GEKRAAKT! +$2.500 Buit! Ontsnap aan de politie!', 5.0);
    } else if (zone.action === 'buy_weapons') {
      if (this.player.cash >= 1500) {
        this.player.cash -= 1500;
        this.player.currentWeapon = 'sniper';
        this.player.ammo.sniper += 40;
        this.player.ammo.smg += 200;
        this.player.ammo.shotgun += 50;
        this.player.ammo.grenade += 5;
        this.player.armor = 100;
        gtaAudio.cashPickup();
        this.addSpeech('Een uitstekende keuze voor zelfverdediging!', zone.x, zone.y - 25, '#ef4444');
        this.showNotification('🔫 Ammu-Nation arsenaal gekocht! Volledige munitie & kogelvrij vest.', 3.5);
      } else {
        this.showNotification('Je hebt $1.500 nodig voor het volledige arsenaal!', 2.5);
      }
    } else if (zone.action === 'shooting_range') {
      this.player.ammo.pistol += 50;
      this.player.ammo.smg += 60;
      gtaAudio.gunshot('pistol');
      this.showNotification('🎯 Schietbaan voltooid! Schietvaardigheid verbeterd (+Munitie)', 3.0);
    } else if (zone.action === 'heal_doctor') {
      if (this.player.cash >= 50) {
        this.player.cash -= 50;
        this.player.health = 100;
        gtaAudio.cashPickup();
        this.addSpeech('Uw verwondingen zijn verzorgd. Neem rust!', zone.x, zone.y - 25, '#06b6d4');
        this.showNotification('🏥 Volledig genezen door arts ($50)', 3.0);
      } else {
        this.showNotification('Niet genoeg cash voor doktersbehandeling ($50)!', 2.0);
      }
    } else if (zone.action === 'sleep_heal') {
      this.player.health = 100;
      this.player.armor = 100;
      this.timeOfDay = (this.timeOfDay + 6) % 24;
      gtaAudio.cashPickup();
      this.showNotification('🛏️ Uitgerust in de Penthouse Suite! Leven & Armor 100%', 3.5);
    } else if (zone.action === 'change_skin') {
      const skins = ['franklin', 'trevor', 'michael'];
      const curIdx = skins.indexOf(this.player.skin);
      const nextIdx = (curIdx + 1) % skins.length;
      this.player.skin = skins[nextIdx] as 'franklin' | 'trevor' | 'michael';
      this.showNotification(`👔 Outfit gewisseld: ${this.player.skin.toUpperCase()}`, 2.5);
    }
  }

  private updateInterior(dt: number) {
    const interior = this.currentInterior;
    if (!interior) return;

    // Center camera on interior smoothly
    const targetCamX = interior.width / 2;
    const targetCamY = interior.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.15;
    this.camera.y += (targetCamY - this.camera.y) * 0.15;

    // Aim towards mouse position in world/interior coordinates
    const worldMouseX = this.camera.x + (this.mousePos.x - window.innerWidth / 2) / this.camera.zoom;
    const worldMouseY = this.camera.y + (this.mousePos.y - window.innerHeight / 2) / this.camera.zoom;
    this.player.angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);

    // Movement WASD
    let moveX = 0;
    let moveY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    const isMoving = moveX !== 0 || moveY !== 0;
    const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && isMoving;
    this.player.isSprinting = isSprinting;

    const speed = isSprinting ? 5.2 : 3.4;
    if (isMoving) {
      const len = Math.hypot(moveX, moveY);
      const targetVx = (moveX / len) * speed;
      const targetVy = (moveY / len) * speed;
      this.player.vx += (targetVx - this.player.vx) * 0.3;
      this.player.vy += (targetVy - this.player.vy) * 0.3;
    } else {
      this.player.vx *= 0.6;
      this.player.vy *= 0.6;
    }

    // Interior boundary containment
    const wallPad = 30;
    let nextX = Math.max(wallPad, Math.min(interior.width - wallPad, this.player.x + this.player.vx));
    let nextY = Math.max(wallPad, Math.min(interior.height - wallPad, this.player.y + this.player.vy));

    // Collision with solid furniture
    for (const f of interior.furniture) {
      if (!f.solid) continue;
      const closestX = Math.max(f.x, Math.min(nextX, f.x + f.width));
      const closestY = Math.max(f.y, Math.min(nextY, f.y + f.height));
      const dx = nextX - closestX;
      const dy = nextY - closestY;
      const dist = Math.hypot(dx, dy);
      const rad = 20;
      if (dist < rad && dist > 0.001) {
        const overlap = rad - dist;
        nextX += (dx / dist) * overlap;
        nextY += (dy / dist) * overlap;
      }
    }

    this.player.x = nextX;
    this.player.y = nextY;

    // Check exit doorway
    this.interactionPrompt = null;
    const exit = interior.exitPoint;
    const exitCenterX = exit.x + exit.width / 2;
    const exitCenterY = exit.y + exit.height / 2;
    const distToExit = Math.hypot(this.player.x - exitCenterX, this.player.y - exitCenterY);

    if (distToExit < 80) {
      this.interactionPrompt = '🚪 [E] Druk op E om naar buiten te gaan';
      if (this.keys['KeyE']) {
        this.exitInterior();
        this.keys['KeyE'] = false;
        return;
      }
    }

    // Check interaction zones inside
    for (const zone of interior.interactionZones) {
      const dist = Math.hypot(this.player.x - zone.x, this.player.y - zone.y);
      if (dist < zone.radius) {
        this.interactionPrompt = zone.prompt;
        if (this.keys['KeyE']) {
          this.handleInteriorAction(zone);
          this.keys['KeyE'] = false;
          break;
        }
      }
    }

    // Shooting inside
    if (this.isMouseDown) {
      this.shoot(false);
    }

    // Update bullets & particles inside
    this.updateBullets(dt);
    this.updateParticles(dt);
    this.updateSpeechBubbles(dt);
  }
}

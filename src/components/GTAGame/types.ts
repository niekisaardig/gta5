export type WeaponType = 'fist' | 'pistol' | 'smg' | 'shotgun' | 'sniper' | 'rpg' | 'grenade';

export interface WeaponDef {
  id: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  range: number;
  spread: number;
  clipSize: number;
  reloadTime: number; // ms
  bulletSpeed: number;
  price: number;
  ammoPrice: number;
  icon: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // radians
  speed: number;
  maxSpeed: number;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  cash: number;
  skin?: 'michael' | 'franklin' | 'trevor';
  wantedLevel: number; // 0-5
  wantedTimer: number; // time left before stars disappear if unseen
  inVehicleId: string | null;
  currentWeapon: WeaponType;
  ammo: Record<WeaponType, number>;
  clipRemaining: Record<WeaponType, number>;
  isReloading: boolean;
  reloadTimer: number;
  isSprinting: boolean;
  isShooting: boolean;
  lastShotTime: number;
  kills: number;
  copsKilled: number;
  carsStolen: number;
  missionsCompleted: number;
  stamina: number;
  stuntScore: number;
  isInAir: boolean;
  airTimer: number;
}

export type VehicleType = 'sedan' | 'sports' | 'suv' | 'police' | 'swat' | 'armored_van' | 'cab' | 'muscle';

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  model?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  turnSpeed: number;
  width: number;
  length: number;
  color: string;
  secondaryColor?: string;
  health: number;
  maxHealth: number;
  isPolice: boolean;
  policeTier?: number;
  driver: 'player' | 'ai' | null;
  sirenOn: boolean;
  sirenTimer?: number;
  lightsOn: boolean;
  brakeLights: boolean;
  drift: number;
  isDead?: boolean;
  damageLevel: number; // 0 to 1
  engineSmoking: boolean;
  engineOnFire: boolean;
  tiresPunctured: boolean[]; // 4 tires
  inAir: boolean;
  airHeight: number;
  explodeTimer?: number;
}

export type PedestrianState = 'idle' | 'walking' | 'panicking' | 'attacking' | 'dead';

export interface Pedestrian {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  health: number;
  maxHealth: number;
  state: PedestrianState;
  stateTimer: number;
  isPolice: boolean;
  policeTier: number; // 1 = regular cop, 2 = SWAT, 3 = FBI
  targetX: number;
  targetY: number;
  hasWeapon: WeaponType;
  shootCooldown: number;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  cashDrop: number;
  deathTime?: number;
  speechText?: string;
  speechTimer?: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  rangeRemaining: number;
  shooter: 'player' | 'police' | 'pedestrian';
  weapon: WeaponType;
}

export interface Grenade {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuse: number; // seconds
  damage: number;
  radius: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  type: 'smoke' | 'fire' | 'spark' | 'blood' | 'skid' | 'water' | 'cash' | 'glass' | 'rain';
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export type BuildingType = 
  | 'residential' 
  | 'office' 
  | 'werkdonalds' 
  | 'bank' 
  | 'ammu' 
  | 'paynspray' 
  | 'hospital' 
  | 'police'
  | 'mansion'
  | 'warehouse'
  | 'hangar'
  | 'motel'
  | 'pier_shop'
  | 'gas_station';

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  roofColor: string;
  accentColor?: string;
  entrance?: { x: number; y: number; width: number; height: number };
  roofHeliPad?: boolean;
}

export interface Road {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'horizontal' | 'vertical' | 'intersection';
  lanes: number;
  isHighway?: boolean;
  name?: string;
}

export type PropType = 
  | 'hydrant' 
  | 'lamp' 
  | 'trash' 
  | 'atm' 
  | 'ramp' 
  | 'spikes' 
  | 'palm' 
  | 'tree' 
  | 'bench' 
  | 'container' 
  | 'barrier' 
  | 'crate' 
  | 'cactus' 
  | 'fountain';

export interface WorldProp {
  id: string;
  type: PropType;
  x: number;
  y: number;
  angle: number;
  width: number;
  height: number;
  health: number;
  isDestroyed: boolean;
  sprayedWaterTimer?: number;
  color?: string;
}

export type DistrictType = 
  | 'downtown' 
  | 'vinewood' 
  | 'harbor' 
  | 'sandyshores' 
  | 'vespucci' 
  | 'industrial'
  | 'beach'
  | 'suburbs'
  | 'desert'
  | 'paleto'
  | 'chiliad'
  | 'zancudo'
  | 'mirror_park';

export interface District {
  id: string;
  name: string;
  type: DistrictType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  tagline: string;
}

export interface WaterZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ocean' | 'river' | 'pool';
}

export interface GreenZone {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'park' | 'grass' | 'sand' | 'pier' | 'runway' | 'beach' | 'golf';
}

export interface Crosswalk {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'horizontal' | 'vertical';
}

export interface TrafficLight {
  id: string;
  x: number;
  y: number;
  direction: 'horizontal' | 'vertical';
  state: 'red' | 'yellow' | 'green';
  timer: number;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  client: string;
  description: string;
  rewardCash: number;
  type: 'delivery' | 'heist' | 'hit' | 'getaway' | 'taxi' | 'stunt';
  targetX: number;
  targetY: number;
  targetRadius: number;
  targetVehicleType?: VehicleType;
  timeLimit?: number; // seconds
  timeRemaining?: number;
  status: 'available' | 'active' | 'completed' | 'failed';
  stage: number;
}

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  color: string;
  freq: string;
}

export type WeatherType = 'sunny' | 'sunset' | 'rain' | 'night';

export interface SpeechBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  timer: number;
  color: string;
}

// --- BUILDING INTERIORS ---
export type InteriorType = 'werkdonalds' | 'bank' | 'ammu' | 'safehouse' | 'police' | 'hospital';

export interface InteriorProp {
  id: string;
  type: 'counter' | 'booth' | 'table' | 'chair' | 'atm' | 'safe' | 'gun_rack' | 'target' | 'tv' | 'sofa' | 'bed' | 'plant' | 'counter_register' | 'kitchen_grill' | 'fryer' | 'bars' | 'stretcher' | 'desk' | 'vault_door';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  solid: boolean;
  label?: string;
}

export interface InteriorNPC {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  angle: number;
  color: string;
  speech?: string;
}

export interface InteriorInteractionZone {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  action: 'order_food' | 'bank_teller' | 'bank_vault' | 'buy_weapons' | 'shooting_range' | 'heal_doctor' | 'change_skin' | 'sleep_heal';
  prompt: string;
}

export interface BuildingInterior {
  id: string; // matches building id, e.g. 'werkdonalds_hq', 'bank_hq', 'ammu_hq', 'safehouse_vinewood', 'police_hq', 'hospital_hq'
  buildingId: string;
  name: string;
  type: InteriorType;
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  spawnPoint: { x: number; y: number; angle: number };
  exitPoint: { x: number; y: number; width: number; height: number };
  exitReturnPoint: { x: number; y: number; angle: number }; // where player ends up outside
  furniture: InteriorProp[];
  npcs: InteriorNPC[];
  interactionZones: InteriorInteractionZone[];
}

// --- MULTIPLAYER ---
export interface MultiplayerPlayer {
  id: string;
  name: string;
  color: string;
  skinIndex: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  health: number;
  maxHealth: number;
  armor: number;
  currentWeapon: string;
  isFiring: boolean;
  inVehicle: boolean;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleAngle?: number;
  vehicleSpeed?: number;
  horn?: boolean;
  interiorId: string | null;
  lastSeen: number;
}

export interface MultiplayerChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}


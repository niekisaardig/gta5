import { BuildingInterior } from './types';

const werkdonaldsHqInterior: BuildingInterior = {
  id: 'werkdonalds_hq',
  buildingId: 'werkdonalds_hq',
  name: 'Werkdonalds Flagship Restaurant',
  type: 'werkdonalds',
  width: 900,
  height: 700,
  wallColor: '#1e293b',
  floorColor: '#b45309', // warm terracotta tile
  spawnPoint: { x: 450, y: 620, angle: -Math.PI / 2 },
  exitPoint: { x: 400, y: 650, width: 100, height: 45 },
  exitReturnPoint: { x: 3415, y: 4040, angle: Math.PI / 2 },
  furniture: [
    // Main Order Counter
    { id: 'w_counter', type: 'counter', x: 200, y: 250, width: 500, height: 40, color: '#f59e0b', solid: true, label: 'Bestelbalie' },
    { id: 'w_reg1', type: 'counter_register', x: 260, y: 245, width: 35, height: 35, color: '#0f172a', solid: true, label: 'Kassa 1' },
    { id: 'w_reg2', type: 'counter_register', x: 430, y: 245, width: 35, height: 35, color: '#0f172a', solid: true, label: 'Kassa 2' },
    { id: 'w_reg3', type: 'counter_register', x: 600, y: 245, width: 35, height: 35, color: '#0f172a', solid: true, label: 'Kassa 3' },
    // Kitchen in the back
    { id: 'w_grill', type: 'kitchen_grill', x: 240, y: 120, width: 140, height: 60, color: '#475569', solid: true, label: 'Burger Grill' },
    { id: 'w_fryer', type: 'fryer', x: 420, y: 120, width: 100, height: 60, color: '#64748b', solid: true, label: 'Friet Frituur' },
    { id: 'w_drink', type: 'counter', x: 560, y: 120, width: 120, height: 60, color: '#0284c7', solid: true, label: 'Cola Automaat' },
    // Dining Booths (Left side)
    { id: 'w_booth1', type: 'booth', x: 60, y: 360, width: 100, height: 70, color: '#ef4444', solid: true },
    { id: 'w_table1', type: 'table', x: 75, y: 440, width: 70, height: 45, color: '#f8fafc', solid: true, label: 'Tafel' },
    { id: 'w_booth2', type: 'booth', x: 60, y: 495, width: 100, height: 70, color: '#ef4444', solid: true },
    { id: 'w_booth3', type: 'booth', x: 60, y: 100, width: 100, height: 70, color: '#ef4444', solid: true },
    { id: 'w_table2', type: 'table', x: 75, y: 180, width: 70, height: 45, color: '#f8fafc', solid: true, label: 'Tafel' },
    { id: 'w_booth4', type: 'booth', x: 60, y: 235, width: 100, height: 70, color: '#ef4444', solid: true },
    // Dining Tables (Right side)
    { id: 'w_table3', type: 'table', x: 750, y: 360, width: 80, height: 50, color: '#f8fafc', solid: true, label: 'Tafel' },
    { id: 'w_table4', type: 'table', x: 750, y: 480, width: 80, height: 50, color: '#f8fafc', solid: true, label: 'Tafel' },
    // ATM machine in corner
    { id: 'w_atm', type: 'atm', x: 830, y: 620, width: 45, height: 45, color: '#10b981', solid: true, label: 'WerkPay ATM' }
  ],
  npcs: [
    { id: 'npc_cashier', name: 'Robin (Kassier)', role: 'Cashier', x: 440, y: 215, angle: Math.PI / 2, color: '#ef4444', speech: 'Welkom bij Werkdonalds! Bestel hier je verse WerkBurger.' },
    { id: 'npc_cook', name: 'Sam (Kok)', role: 'Chef', x: 310, y: 90, angle: Math.PI / 2, color: '#f59e0b', speech: 'Twee verse WerkBurgers en krokante friet komen eraan!' }
  ],
  interactionZones: [
    {
      id: 'order_burger',
      name: 'WerkBurger Bestelmenu',
      x: 440,
      y: 280,
      radius: 65,
      action: 'order_food',
      prompt: 'Druk op [E] om een WerkBurger Menu te eten (€25 - Volledige Gezondheid!)'
    },
    {
      id: 'w_atm_zone',
      name: 'WerkPay Geldautomaat',
      x: 830,
      y: 590,
      radius: 50,
      action: 'bank_teller',
      prompt: 'Druk op [E] om WerkPay geld te storten of op te nemen'
    }
  ]
};

const werkdonaldsBeachInterior: BuildingInterior = {
  ...werkdonaldsHqInterior,
  id: 'werkdonalds_beach',
  buildingId: 'werkdonalds_beach',
  name: 'Werkdonalds Del Perro Beach Pier',
  exitReturnPoint: { x: 615, y: 3245, angle: Math.PI / 2 }
};

const bankHqInterior: BuildingInterior = {
  id: 'werkpay_bank',
  buildingId: 'werkpay_bank',
  name: 'WerkPay Bank & Hoofdtresoor',
  type: 'bank',
  width: 1000,
  height: 750,
  wallColor: '#0f172a',
  floorColor: '#e2e8f0', // Luxury white marble
  spawnPoint: { x: 500, y: 670, angle: -Math.PI / 2 },
  exitPoint: { x: 450, y: 700, width: 100, height: 45 },
  exitReturnPoint: { x: 2540, y: 3160, angle: Math.PI / 2 },
  furniture: [
    // Teller Counter with glass partition
    { id: 'b_counter', type: 'counter', x: 180, y: 280, width: 640, height: 45, color: '#334155', solid: true, label: 'Lokettenbalie' },
    { id: 'b_teller1', type: 'counter_register', x: 280, y: 275, width: 40, height: 40, color: '#059669', solid: true, label: 'Loket 1' },
    { id: 'b_teller2', type: 'counter_register', x: 500, y: 275, width: 40, height: 40, color: '#059669', solid: true, label: 'Loket 2' },
    { id: 'b_teller3', type: 'counter_register', x: 720, y: 275, width: 40, height: 40, color: '#059669', solid: true, label: 'VIP Loket' },
    // Vault in back wall
    { id: 'b_vault', type: 'vault_door', x: 440, y: 70, width: 120, height: 80, color: '#fbbf24', solid: true, label: 'Hoofdtresoor Kluis' },
    // Lounge sofas
    { id: 'b_sofa1', type: 'sofa', x: 120, y: 480, width: 140, height: 60, color: '#1e293b', solid: true, label: 'Wachtbank' },
    { id: 'b_sofa2', type: 'sofa', x: 740, y: 480, width: 140, height: 60, color: '#1e293b', solid: true, label: 'Wachtbank' },
    // Center marble pillars
    { id: 'b_pillar1', type: 'desk', x: 340, y: 480, width: 45, height: 45, color: '#64748b', solid: true },
    { id: 'b_pillar2', type: 'desk', x: 615, y: 480, width: 45, height: 45, color: '#64748b', solid: true },
    // ATMs inside
    { id: 'b_atm1', type: 'atm', x: 80, y: 660, width: 45, height: 45, color: '#059669', solid: true, label: 'Snel-ATM' },
    { id: 'b_atm2', type: 'atm', x: 900, y: 660, width: 45, height: 45, color: '#059669', solid: true, label: 'Snel-ATM' }
  ],
  npcs: [
    { id: 'npc_banker', name: 'Dhr. Van Dijk (Bankier)', role: 'Banker', x: 500, y: 235, angle: Math.PI / 2, color: '#0284c7', speech: 'Welkom bij WerkPay. Al uw transacties worden live gesynchroniseerd.' },
    { id: 'npc_guard', name: 'Beveiliger Joost', role: 'Security', x: 370, y: 640, angle: 0, color: '#1e3a8a', speech: 'Blijf kalm, het gebouw wordt 24/7 bewaakt.' }
  ],
  interactionZones: [
    {
      id: 'bank_teller_zone',
      name: 'Hoofdloket WerkPay',
      x: 500,
      y: 320,
      radius: 65,
      action: 'bank_teller',
      prompt: 'Druk op [E] om geld te storten op je WerkPay bankrekening'
    },
    {
      id: 'bank_vault_zone',
      name: 'Bankkluis Deur',
      x: 500,
      y: 130,
      radius: 60,
      action: 'bank_vault',
      prompt: 'Druk op [E] om de kluis te forceren (€2.500 Heist Buit!)'
    }
  ]
};

const ammuHqInterior: BuildingInterior = {
  id: 'ammu_nation',
  buildingId: 'ammu_nation',
  name: 'Ammu-Nation Wapenhandel & Schietbaan',
  type: 'ammu',
  width: 950,
  height: 700,
  wallColor: '#1c1917',
  floorColor: '#44403c', // industrial dark wood/concrete
  spawnPoint: { x: 475, y: 630, angle: -Math.PI / 2 },
  exitPoint: { x: 425, y: 650, width: 100, height: 45 },
  exitReturnPoint: { x: 4305, y: 3130, angle: Math.PI / 2 },
  furniture: [
    // Store counter
    { id: 'a_counter', type: 'counter', x: 150, y: 280, width: 350, height: 40, color: '#78350f', solid: true, label: 'Wapentoonbank' },
    { id: 'a_rack1', type: 'gun_rack', x: 120, y: 120, width: 220, height: 50, color: '#b45309', solid: true, label: 'AK-47 & Shotguns' },
    { id: 'a_rack2', type: 'gun_rack', x: 380, y: 120, width: 140, height: 50, color: '#b45309', solid: true, label: 'Sniper & RPG' },
    // Indoor Shooting Range (Right half)
    { id: 'a_partition', type: 'desk', x: 560, y: 80, width: 20, height: 480, color: '#292524', solid: true, label: 'Kogelvrije Wand' },
    { id: 'a_target1', type: 'target', x: 700, y: 120, width: 35, height: 35, color: '#ef4444', solid: false, label: 'Doel 1' },
    { id: 'a_target2', type: 'target', x: 820, y: 120, width: 35, height: 35, color: '#ef4444', solid: false, label: 'Doel 2' },
    { id: 'a_lane_barrier', type: 'desk', x: 620, y: 360, width: 280, height: 30, color: '#78716c', solid: true, label: 'Schietlijn' }
  ],
  npcs: [
    { id: 'npc_gunsmith', name: 'Buck (Wapenhandelaar)', role: 'Merchant', x: 320, y: 235, angle: Math.PI / 2, color: '#b91c1c', speech: 'Welkom bij Ammu-Nation! Wapens, granaten en kogelvrije vesten op voorraad.' }
  ],
  interactionZones: [
    {
      id: 'buy_weapons_zone',
      name: 'Wapenarsenaal Kopen',
      x: 320,
      y: 330,
      radius: 65,
      action: 'buy_weapons',
      prompt: 'Druk op [E] om Sniper, SMG munitie & Kogelvrij vest te kopen ($1.500)'
    },
    {
      id: 'range_zone',
      name: 'Schietbaan Training',
      x: 750,
      y: 410,
      radius: 70,
      action: 'shooting_range',
      prompt: 'Druk op [E] voor schietvaardigheidstraining (+Munitie)'
    }
  ]
};

const ammuSandyInterior: BuildingInterior = {
  ...ammuHqInterior,
  id: 'ammu_sandy',
  buildingId: 'ammu_sandy',
  name: 'Ammu-Nation Sandy Shores Depot',
  exitReturnPoint: { x: 5185, y: 1290, angle: Math.PI / 2 }
};

const safehouseInterior: BuildingInterior = {
  id: 'mansion_1',
  buildingId: 'mansion_1',
  name: 'Vinewood Hills Villa Penthouse',
  type: 'safehouse',
  width: 900,
  height: 650,
  wallColor: '#0f172a',
  floorColor: '#1e293b', // Sleek dark hardwood
  spawnPoint: { x: 450, y: 580, angle: -Math.PI / 2 },
  exitPoint: { x: 400, y: 600, width: 100, height: 45 },
  exitReturnPoint: { x: 2425, y: 950, angle: Math.PI / 2 },
  furniture: [
    // Master Bed
    { id: 's_bed', type: 'bed', x: 120, y: 120, width: 140, height: 110, color: '#3b82f6', solid: true, label: 'Kingsize Bed' },
    // Wardrobe to change clothes/skin
    { id: 's_wardrobe', type: 'counter', x: 300, y: 110, width: 100, height: 50, color: '#854d0e', solid: true, label: 'Kledingkast' },
    // Living room TV & Sofa
    { id: 's_tv', type: 'tv', x: 620, y: 100, width: 180, height: 30, color: '#09090b', solid: true, label: '85" OLED TV' },
    { id: 's_sofa', type: 'sofa', x: 620, y: 220, width: 180, height: 60, color: '#f59e0b', solid: true, label: 'Luxe Bank' },
    // Kitchen bar
    { id: 's_bar', type: 'counter', x: 580, y: 440, width: 240, height: 45, color: '#475569', solid: true, label: 'Cocktailbar' },
    // Plants
    { id: 's_plant1', type: 'plant', x: 80, y: 570, width: 40, height: 40, color: '#16a34a', solid: true },
    { id: 's_plant2', type: 'plant', x: 820, y: 570, width: 40, height: 40, color: '#16a34a', solid: true }
  ],
  npcs: [],
  interactionZones: [
    {
      id: 'sleep_zone',
      name: 'Rusten & Opslaan',
      x: 190,
      y: 175,
      radius: 65,
      action: 'sleep_heal',
      prompt: 'Druk op [E] om te slapen (100% Leven & Vest hersteld)'
    },
    {
      id: 'skin_zone',
      name: 'Kleding & Outfit Wisselen',
      x: 350,
      y: 160,
      radius: 55,
      action: 'change_skin',
      prompt: 'Druk op [E] om van outfit te wisselen'
    }
  ]
};

const policeInterior: BuildingInterior = {
  id: 'police_hq',
  buildingId: 'police_hq',
  name: 'LSPD Mission Row Hoofdbureau',
  type: 'police',
  width: 900,
  height: 700,
  wallColor: '#1e293b',
  floorColor: '#cbd5e1',
  spawnPoint: { x: 450, y: 630, angle: -Math.PI / 2 },
  exitPoint: { x: 400, y: 650, width: 100, height: 45 },
  exitReturnPoint: { x: 4330, y: 2020, angle: Math.PI / 2 },
  furniture: [
    // Reception desk
    { id: 'p_counter', type: 'counter', x: 250, y: 350, width: 400, height: 45, color: '#1e3a8a', solid: true, label: 'Aangiftebalie' },
    // Jail cells on the left
    { id: 'p_cell1', type: 'bars', x: 80, y: 100, width: 120, height: 160, color: '#475569', solid: true, label: 'Cel 1' },
    { id: 'p_cell2', type: 'bars', x: 220, y: 100, width: 120, height: 160, color: '#475569', solid: true, label: 'Cel 2' },
    // Offices on right
    { id: 'p_desk1', type: 'desk', x: 620, y: 140, width: 100, height: 60, color: '#334155', solid: true, label: 'Recherche Desk' },
    { id: 'p_desk2', type: 'desk', x: 740, y: 140, width: 100, height: 60, color: '#334155', solid: true, label: 'Commissaris Desk' }
  ],
  npcs: [
    { id: 'npc_cop', name: 'Agent Visser', role: 'Police Officer', x: 450, y: 300, angle: Math.PI / 2, color: '#2563eb', speech: 'Blijf rustig. Wat is uw melding?' }
  ],
  interactionZones: [
    {
      id: 'clear_wanted_zone',
      name: 'Borgtocht Loket',
      x: 450,
      y: 400,
      radius: 65,
      action: 'order_food', // treated as bail in handler
      prompt: 'Druk op [E] om borg te betalen en Wanted Level te wissen ($200)'
    }
  ]
};

const hospitalInterior: BuildingInterior = {
  id: 'hospital',
  buildingId: 'hospital',
  name: 'Pillbox Hill Medisch Centrum',
  type: 'hospital',
  width: 900,
  height: 700,
  wallColor: '#0f172a',
  floorColor: '#f1f5f9', // Clean sterile white tile
  spawnPoint: { x: 450, y: 630, angle: -Math.PI / 2 },
  exitPoint: { x: 400, y: 650, width: 100, height: 45 },
  exitReturnPoint: { x: 2540, y: 2020, angle: Math.PI / 2 },
  furniture: [
    // Reception
    { id: 'h_counter', type: 'counter', x: 280, y: 350, width: 340, height: 45, color: '#0284c7', solid: true, label: 'Spoedeisende Hulp' },
    // Stretchers & beds
    { id: 'h_bed1', type: 'stretcher', x: 100, y: 140, width: 80, height: 130, color: '#38bdf8', solid: true, label: 'IC Bed 1' },
    { id: 'h_bed2', type: 'stretcher', x: 220, y: 140, width: 80, height: 130, color: '#38bdf8', solid: true, label: 'IC Bed 2' },
    // Medical monitors
    { id: 'h_tv', type: 'tv', x: 160, y: 90, width: 60, height: 25, color: '#10b981', solid: false, label: 'ECG Monitor' },
    // Pharmacy storage
    { id: 'h_storage', type: 'counter', x: 700, y: 120, width: 140, height: 50, color: '#047857', solid: true, label: 'Medicijnkluis' }
  ],
  npcs: [
    { id: 'npc_doctor', name: 'Dr. De Jong', role: 'Doctor', x: 450, y: 300, angle: Math.PI / 2, color: '#06b6d4', speech: 'Ga maar liggen, ik behandel uw verwondingen.' }
  ],
  interactionZones: [
    {
      id: 'heal_doctor_zone',
      name: 'Spoedeisende Zorg',
      x: 450,
      y: 400,
      radius: 65,
      action: 'heal_doctor',
      prompt: 'Druk op [E] voor Medische Behandeling ($50 - Volledig Herstel)'
    }
  ]
};

export const BUILDING_INTERIORS: Record<string, BuildingInterior> = {
  werkdonalds_hq: werkdonaldsHqInterior,
  werkdonalds_beach: werkdonaldsBeachInterior,
  werkpay_bank: bankHqInterior,
  bank_hq: bankHqInterior,
  ammu_nation: ammuHqInterior,
  ammu_hq: ammuHqInterior,
  ammu_sandy: ammuSandyInterior,
  mansion_1: safehouseInterior,
  safehouse_vinewood: safehouseInterior,
  police_hq: policeInterior,
  hospital: hospitalInterior,
  hospital_hq: hospitalInterior
};

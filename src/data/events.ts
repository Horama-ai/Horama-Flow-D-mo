// Types
export type AccountId = 'stade-france' | 'tdf';

export interface Account {
  id: AccountId;
  name: string;
  shortName: string;
  color: string;
}

export type EventStatus = 'live' | 'completed' | 'upcoming';
export type ZoneStatus = 'fluide' | 'modéré' | 'dense' | 'saturé';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface TimeSeriesPoint {
  time: string;
  value: number;
}

export interface Zone {
  id: string;
  name: string;
  shortName: string;
  status: ZoneStatus;
  density: number;
  waitTime: number;
  passageTime: number;
  flow: number;
  currentCount: number;
  capacity: number;
  saturation: number;
  cameras: number;
  history: TimeSeriesPoint[];
}

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  zoneId: string;
  zoneName: string;
  timestamp: Date;
  acknowledged: boolean;
  type: 'density' | 'waitTime' | 'saturation' | 'flow';
  value: number;
  threshold: number;
}

export interface Event {
  id: string;
  accountId: AccountId;
  name: string;
  subtitle: string;
  date: Date;
  endDate?: Date;
  status: EventStatus;
  duration: string;
  currentAttendance: number;
  totalCapacity: number;
  peakAttendance: number;
  globalFluidityScore: number;
  avgWaitTime: number;
  avgPassageTime: number;
  avgDensity: number;
  avgSaturation: number;
  zones: Zone[];
  alerts: Alert[];
  flowHistory: TimeSeriesPoint[];
  waitTimeHistory: TimeSeriesPoint[];
  densityHistory: TimeSeriesPoint[];
  saturationHistory: TimeSeriesPoint[];
}

// Accounts
export const accounts: Account[] = [
  {
    id: 'stade-france',
    name: 'Stade de France',
    shortName: 'SDF',
    color: '#1e3a8a'
  },
  {
    id: 'tdf',
    name: 'Tour de France',
    shortName: 'TDF',
    color: '#1d4ed8'
  }
];

// Helper to generate time series data
function generateTimeSeries(hours: number, baseValue: number, variance: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  for (let i = 0; i < hours * 4; i++) {
    const hour = Math.floor(i / 4) + 8;
    const minute = (i % 4) * 15;
    points.push({
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      value: Math.round(baseValue + (Math.random() - 0.5) * variance)
    });
  }
  return points;
}

// Helper to generate zone history
function generateZoneHistory(): TimeSeriesPoint[] {
  return generateTimeSeries(10, 50, 40);
}

// Stade de France Zones (more zones for stadium events)
const createStadiumZones = (multiplier: number = 1): Zone[] => [
  {
    id: 'sf-entree-a',
    name: 'Entrée Principale A - Porte de Paris',
    shortName: 'Entrée A',
    status: multiplier > 1.1 ? 'saturé' : multiplier > 0.9 ? 'dense' : 'modéré',
    density: Math.round(78 * multiplier),
    waitTime: Math.round(12 * multiplier),
    passageTime: Math.round(3 * multiplier),
    flow: Math.round(245 / multiplier),
    currentCount: Math.round(3420 * multiplier),
    capacity: 4500,
    saturation: Math.round(76 * multiplier),
    cameras: 4,
    history: generateZoneHistory()
  },
  {
    id: 'sf-entree-b',
    name: 'Entrée B - Porte de la Chapelle',
    shortName: 'Entrée B',
    status: multiplier > 1 ? 'dense' : 'modéré',
    density: Math.round(52 * multiplier),
    waitTime: Math.round(6 * multiplier),
    passageTime: Math.round(2 * multiplier),
    flow: Math.round(180 / multiplier),
    currentCount: Math.round(2340 * multiplier),
    capacity: 4500,
    saturation: Math.round(52 * multiplier),
    cameras: 3,
    history: generateZoneHistory()
  },
  {
    id: 'sf-entree-c',
    name: 'Entrée C - Porte Nord',
    shortName: 'Entrée C',
    status: 'fluide',
    density: Math.round(35 * multiplier),
    waitTime: Math.round(3 * multiplier),
    passageTime: Math.round(1 * multiplier),
    flow: Math.round(120 / multiplier),
    currentCount: Math.round(1575 * multiplier),
    capacity: 4500,
    saturation: Math.round(35 * multiplier),
    cameras: 3,
    history: generateZoneHistory()
  },
  {
    id: 'sf-entree-d',
    name: 'Entrée D - Porte Sud',
    shortName: 'Entrée D',
    status: multiplier > 0.9 ? 'saturé' : 'dense',
    density: Math.min(98, Math.round(92 * multiplier)),
    waitTime: Math.round(18 * multiplier),
    passageTime: Math.round(5 * multiplier),
    flow: Math.round(89 / multiplier),
    currentCount: Math.round(4140 * multiplier),
    capacity: 4500,
    saturation: Math.min(98, Math.round(92 * multiplier)),
    cameras: 4,
    history: generateZoneHistory()
  },
  {
    id: 'sf-tribune-nord',
    name: 'Tribune Nord - Secteurs 201-210',
    shortName: 'Tribune Nord',
    status: multiplier > 1 ? 'dense' : 'modéré',
    density: Math.round(58 * multiplier),
    waitTime: Math.round(4 * multiplier),
    passageTime: Math.round(2 * multiplier),
    flow: Math.round(156 / multiplier),
    currentCount: Math.round(8700 * multiplier),
    capacity: 15000,
    saturation: Math.round(58 * multiplier),
    cameras: 6,
    history: generateZoneHistory()
  },
  {
    id: 'sf-tribune-sud',
    name: 'Tribune Sud - Secteurs 401-410',
    shortName: 'Tribune Sud',
    status: 'dense',
    density: Math.round(71 * multiplier),
    waitTime: Math.round(8 * multiplier),
    passageTime: Math.round(3 * multiplier),
    flow: Math.round(134 / multiplier),
    currentCount: Math.round(10650 * multiplier),
    capacity: 15000,
    saturation: Math.round(71 * multiplier),
    cameras: 6,
    history: generateZoneHistory()
  },
  {
    id: 'sf-pelouse',
    name: 'Zone Pelouse - Fosse',
    shortName: 'Pelouse',
    status: 'saturé',
    density: Math.min(98, Math.round(88 * multiplier)),
    waitTime: 0,
    passageTime: 0,
    flow: Math.round(45 / multiplier),
    currentCount: Math.round(8800 * multiplier),
    capacity: 10000,
    saturation: Math.min(98, Math.round(88 * multiplier)),
    cameras: 8,
    history: generateZoneHistory()
  },
  {
    id: 'sf-buvettes',
    name: 'Espaces Restauration - Niveau 0',
    shortName: 'Buvettes',
    status: 'dense',
    density: Math.round(75 * multiplier),
    waitTime: Math.round(14 * multiplier),
    passageTime: Math.round(8 * multiplier),
    flow: Math.round(67 / multiplier),
    currentCount: Math.round(2250 * multiplier),
    capacity: 3000,
    saturation: Math.round(75 * multiplier),
    cameras: 4,
    history: generateZoneHistory()
  },
  {
    id: 'sf-vip',
    name: 'Espace VIP - Loges',
    shortName: 'VIP',
    status: 'fluide',
    density: Math.round(28 * multiplier),
    waitTime: Math.round(1 * multiplier),
    passageTime: Math.round(1 * multiplier),
    flow: Math.round(34 / multiplier),
    currentCount: Math.round(420 * multiplier),
    capacity: 1500,
    saturation: Math.round(28 * multiplier),
    cameras: 2,
    history: generateZoneHistory()
  },
  {
    id: 'sf-parking-a',
    name: 'Parking A - Accès Nord',
    shortName: 'Parking A',
    status: 'modéré',
    density: Math.round(45 * multiplier),
    waitTime: Math.round(5 * multiplier),
    passageTime: Math.round(2 * multiplier),
    flow: Math.round(89 / multiplier),
    currentCount: Math.round(1800 * multiplier),
    capacity: 4000,
    saturation: Math.round(45 * multiplier),
    cameras: 2,
    history: generateZoneHistory()
  }
];

// Tour de France Village Zones
const createTDFZones = (multiplier: number = 1): Zone[] => [
  {
    id: 'tdf-entree-principale',
    name: 'Entrée Principale du Village',
    shortName: 'Entrée',
    status: multiplier > 1 ? 'dense' : 'modéré',
    density: Math.round(55 * multiplier),
    waitTime: Math.round(7 * multiplier),
    passageTime: Math.round(2 * multiplier),
    flow: Math.round(134 / multiplier),
    currentCount: Math.round(1650 * multiplier),
    capacity: 3000,
    saturation: Math.round(55 * multiplier),
    cameras: 2,
    history: generateZoneHistory()
  },
  {
    id: 'tdf-boutique',
    name: 'Boutique Officielle',
    shortName: 'Boutique',
    status: 'dense',
    density: Math.round(72 * multiplier),
    waitTime: Math.round(15 * multiplier),
    passageTime: Math.round(12 * multiplier),
    flow: Math.round(45 / multiplier),
    currentCount: Math.round(360 * multiplier),
    capacity: 500,
    saturation: Math.round(72 * multiplier),
    cameras: 2,
    history: generateZoneHistory()
  },
  {
    id: 'tdf-expo',
    name: 'Espace Exposition Partenaires',
    shortName: 'Expo',
    status: 'fluide',
    density: Math.round(38 * multiplier),
    waitTime: Math.round(2 * multiplier),
    passageTime: Math.round(5 * multiplier),
    flow: Math.round(78 / multiplier),
    currentCount: Math.round(570 * multiplier),
    capacity: 1500,
    saturation: Math.round(38 * multiplier),
    cameras: 3,
    history: generateZoneHistory()
  },
  {
    id: 'tdf-restauration',
    name: 'Zone Restauration',
    shortName: 'Restauration',
    status: multiplier > 0.9 ? 'saturé' : 'dense',
    density: Math.min(98, Math.round(85 * multiplier)),
    waitTime: Math.round(22 * multiplier),
    passageTime: Math.round(18 * multiplier),
    flow: Math.round(23 / multiplier),
    currentCount: Math.round(850 * multiplier),
    capacity: 1000,
    saturation: Math.min(98, Math.round(85 * multiplier)),
    cameras: 2,
    history: generateZoneHistory()
  },
  {
    id: 'tdf-podium',
    name: 'Zone Podium Signatures',
    shortName: 'Podium',
    status: 'dense',
    density: Math.round(68 * multiplier),
    waitTime: Math.round(25 * multiplier),
    passageTime: Math.round(3 * multiplier),
    flow: Math.round(56 / multiplier),
    currentCount: Math.round(680 * multiplier),
    capacity: 1000,
    saturation: Math.round(68 * multiplier),
    cameras: 3,
    history: generateZoneHistory()
  },
  {
    id: 'tdf-animation',
    name: 'Espace Animations Enfants',
    shortName: 'Animations',
    status: 'modéré',
    density: Math.round(48 * multiplier),
    waitTime: Math.round(8 * multiplier),
    passageTime: Math.round(15 * multiplier),
    flow: Math.round(34 / multiplier),
    currentCount: Math.round(240 * multiplier),
    capacity: 500,
    saturation: Math.round(48 * multiplier),
    cameras: 2,
    history: generateZoneHistory()
  }
];

// Generate alerts for an event
function generateAlerts(zones: Zone[], eventDate: Date): Alert[] {
  const alerts: Alert[] = [];
  zones.forEach(zone => {
    if (zone.status === 'saturé') {
      alerts.push({
        id: `alert-${zone.id}-sat-${Date.now()}`,
        message: `Saturation critique détectée`,
        severity: 'critical',
        zoneId: zone.id,
        zoneName: zone.shortName,
        timestamp: new Date(eventDate.getTime() + Math.random() * 3600000),
        acknowledged: false,
        type: 'saturation',
        value: zone.saturation,
        threshold: 80
      });
    }
    if (zone.waitTime > 15) {
      alerts.push({
        id: `alert-${zone.id}-wait-${Date.now()}`,
        message: `Temps d'attente élevé`,
        severity: 'warning',
        zoneId: zone.id,
        zoneName: zone.shortName,
        timestamp: new Date(eventDate.getTime() + Math.random() * 3600000),
        acknowledged: false,
        type: 'waitTime',
        value: zone.waitTime,
        threshold: 15
      });
    }
    if (zone.density > 75) {
      alerts.push({
        id: `alert-${zone.id}-density-${Date.now()}`,
        message: `Densité élevée`,
        severity: zone.density > 85 ? 'critical' : 'warning',
        zoneId: zone.id,
        zoneName: zone.shortName,
        timestamp: new Date(eventDate.getTime() + Math.random() * 3600000),
        acknowledged: Math.random() > 0.5,
        type: 'density',
        value: zone.density,
        threshold: 75
      });
    }
  });
  return alerts;
}

// Generate events database with multiple months of data
export const eventsDatabase: Event[] = [
  // === STADE DE FRANCE EVENTS ===
  // Live event
  {
    id: 'sf-concert-live',
    accountId: 'stade-france',
    name: 'Concert Coldplay',
    subtitle: 'World Tour 2026',
    date: new Date(2026, 3, 20, 20, 0),
    status: 'live',
    duration: '4h',
    currentAttendance: 72450,
    totalCapacity: 80000,
    peakAttendance: 74200,
    globalFluidityScore: 73,
    avgWaitTime: 9,
    avgPassageTime: 3,
    avgDensity: 62,
    avgSaturation: 68,
    zones: createStadiumZones(1),
    alerts: generateAlerts(createStadiumZones(1), new Date()),
    flowHistory: generateTimeSeries(8, 450, 200),
    waitTimeHistory: generateTimeSeries(8, 8, 6),
    densityHistory: generateTimeSeries(8, 60, 25),
    saturationHistory: generateTimeSeries(8, 65, 20)
  },
  // Upcoming events
  {
    id: 'sf-rugby-apr26',
    accountId: 'stade-france',
    name: 'France vs Angleterre',
    subtitle: 'Six Nations 2026',
    date: new Date(2026, 3, 26, 21, 0),
    status: 'upcoming',
    duration: '3h',
    currentAttendance: 0,
    totalCapacity: 80000,
    peakAttendance: 0,
    globalFluidityScore: 0,
    avgWaitTime: 0,
    avgPassageTime: 0,
    avgDensity: 0,
    avgSaturation: 0,
    zones: createStadiumZones(0).map(z => ({ ...z, density: 0, waitTime: 0, currentCount: 0, saturation: 0, status: 'fluide' as ZoneStatus })),
    alerts: [],
    flowHistory: [],
    waitTimeHistory: [],
    densityHistory: [],
    saturationHistory: []
  },
  {
    id: 'sf-concert-may15',
    accountId: 'stade-france',
    name: 'Concert Ed Sheeran',
    subtitle: 'Mathematics Tour',
    date: new Date(2026, 4, 15, 20, 0),
    status: 'upcoming',
    duration: '4h',
    currentAttendance: 0,
    totalCapacity: 80000,
    peakAttendance: 0,
    globalFluidityScore: 0,
    avgWaitTime: 0,
    avgPassageTime: 0,
    avgDensity: 0,
    avgSaturation: 0,
    zones: createStadiumZones(0).map(z => ({ ...z, density: 0, waitTime: 0, currentCount: 0, saturation: 0, status: 'fluide' as ZoneStatus })),
    alerts: [],
    flowHistory: [],
    waitTimeHistory: [],
    densityHistory: [],
    saturationHistory: []
  },
  {
    id: 'sf-foot-may28',
    accountId: 'stade-france',
    name: 'Finale Coupe de France',
    subtitle: 'PSG vs Marseille',
    date: new Date(2026, 4, 28, 21, 0),
    status: 'upcoming',
    duration: '3h',
    currentAttendance: 0,
    totalCapacity: 80000,
    peakAttendance: 0,
    globalFluidityScore: 0,
    avgWaitTime: 0,
    avgPassageTime: 0,
    avgDensity: 0,
    avgSaturation: 0,
    zones: createStadiumZones(0).map(z => ({ ...z, density: 0, waitTime: 0, currentCount: 0, saturation: 0, status: 'fluide' as ZoneStatus })),
    alerts: [],
    flowHistory: [],
    waitTimeHistory: [],
    densityHistory: [],
    saturationHistory: []
  },
  // Past events - April 2026
  {
    id: 'sf-foot-apr12',
    accountId: 'stade-france',
    name: 'France vs Espagne',
    subtitle: 'Match Amical',
    date: new Date(2026, 3, 12, 21, 0),
    status: 'completed',
    duration: '3h',
    currentAttendance: 76800,
    totalCapacity: 80000,
    peakAttendance: 77500,
    globalFluidityScore: 78,
    avgWaitTime: 7,
    avgPassageTime: 2,
    avgDensity: 54,
    avgSaturation: 58,
    zones: createStadiumZones(0.9),
    alerts: generateAlerts(createStadiumZones(0.9), new Date(2026, 3, 12)),
    flowHistory: generateTimeSeries(6, 480, 180),
    waitTimeHistory: generateTimeSeries(6, 7, 5),
    densityHistory: generateTimeSeries(6, 52, 20),
    saturationHistory: generateTimeSeries(6, 56, 18)
  },
  {
    id: 'sf-concert-apr5',
    accountId: 'stade-france',
    name: 'Concert The Weeknd',
    subtitle: 'After Hours Tour',
    date: new Date(2026, 3, 5, 20, 0),
    status: 'completed',
    duration: '4h',
    currentAttendance: 74500,
    totalCapacity: 80000,
    peakAttendance: 75200,
    globalFluidityScore: 75,
    avgWaitTime: 8,
    avgPassageTime: 3,
    avgDensity: 58,
    avgSaturation: 62,
    zones: createStadiumZones(0.95),
    alerts: generateAlerts(createStadiumZones(0.95), new Date(2026, 3, 5)),
    flowHistory: generateTimeSeries(7, 460, 170),
    waitTimeHistory: generateTimeSeries(7, 8, 5),
    densityHistory: generateTimeSeries(7, 56, 22),
    saturationHistory: generateTimeSeries(7, 60, 18)
  },
  // March 2026
  {
    id: 'sf-foot-mar15',
    accountId: 'stade-france',
    name: 'PSG vs Lyon',
    subtitle: 'Coupe de France - Demi-finale',
    date: new Date(2026, 2, 15, 21, 0),
    status: 'completed',
    duration: '3h',
    currentAttendance: 78500,
    totalCapacity: 80000,
    peakAttendance: 79200,
    globalFluidityScore: 81,
    avgWaitTime: 7,
    avgPassageTime: 2,
    avgDensity: 58,
    avgSaturation: 62,
    zones: createStadiumZones(0.9),
    alerts: generateAlerts(createStadiumZones(0.9), new Date(2026, 2, 15)),
    flowHistory: generateTimeSeries(6, 520, 180),
    waitTimeHistory: generateTimeSeries(6, 7, 5),
    densityHistory: generateTimeSeries(6, 55, 20),
    saturationHistory: generateTimeSeries(6, 60, 18)
  },
  {
    id: 'sf-rugby-mar8',
    accountId: 'stade-france',
    name: 'France vs Irlande',
    subtitle: 'Six Nations 2026',
    date: new Date(2026, 2, 8, 17, 0),
    status: 'completed',
    duration: '3h30',
    currentAttendance: 80000,
    totalCapacity: 80000,
    peakAttendance: 80000,
    globalFluidityScore: 68,
    avgWaitTime: 14,
    avgPassageTime: 4,
    avgDensity: 72,
    avgSaturation: 78,
    zones: createStadiumZones(1.15),
    alerts: generateAlerts(createStadiumZones(1.15), new Date(2026, 2, 8)),
    flowHistory: generateTimeSeries(6, 580, 150),
    waitTimeHistory: generateTimeSeries(6, 12, 8),
    densityHistory: generateTimeSeries(6, 70, 18),
    saturationHistory: generateTimeSeries(6, 75, 15)
  },
  {
    id: 'sf-concert-mar1',
    accountId: 'stade-france',
    name: 'Concert Beyoncé',
    subtitle: 'Renaissance World Tour',
    date: new Date(2026, 2, 1, 20, 0),
    status: 'completed',
    duration: '4h',
    currentAttendance: 79800,
    totalCapacity: 80000,
    peakAttendance: 80000,
    globalFluidityScore: 70,
    avgWaitTime: 12,
    avgPassageTime: 4,
    avgDensity: 68,
    avgSaturation: 74,
    zones: createStadiumZones(1.1),
    alerts: generateAlerts(createStadiumZones(1.1), new Date(2026, 2, 1)),
    flowHistory: generateTimeSeries(7, 550, 160),
    waitTimeHistory: generateTimeSeries(7, 11, 7),
    densityHistory: generateTimeSeries(7, 66, 20),
    saturationHistory: generateTimeSeries(7, 72, 16)
  },
  // February 2026
  {
    id: 'sf-concert-feb22',
    accountId: 'stade-france',
    name: 'Concert Indochine',
    subtitle: 'Central Tour',
    date: new Date(2026, 1, 22, 20, 0),
    status: 'completed',
    duration: '4h',
    currentAttendance: 75000,
    totalCapacity: 80000,
    peakAttendance: 76500,
    globalFluidityScore: 79,
    avgWaitTime: 8,
    avgPassageTime: 3,
    avgDensity: 54,
    avgSaturation: 58,
    zones: createStadiumZones(0.85),
    alerts: generateAlerts(createStadiumZones(0.85), new Date(2026, 1, 22)),
    flowHistory: generateTimeSeries(7, 480, 160),
    waitTimeHistory: generateTimeSeries(7, 8, 5),
    densityHistory: generateTimeSeries(7, 52, 22),
    saturationHistory: generateTimeSeries(7, 56, 18)
  },
  {
    id: 'sf-rugby-feb15',
    accountId: 'stade-france',
    name: 'France vs Italie',
    subtitle: 'Six Nations 2026',
    date: new Date(2026, 1, 15, 15, 0),
    status: 'completed',
    duration: '3h',
    currentAttendance: 79800,
    totalCapacity: 80000,
    peakAttendance: 80000,
    globalFluidityScore: 71,
    avgWaitTime: 11,
    avgPassageTime: 3,
    avgDensity: 68,
    avgSaturation: 72,
    zones: createStadiumZones(1.05),
    alerts: generateAlerts(createStadiumZones(1.05), new Date(2026, 1, 15)),
    flowHistory: generateTimeSeries(5, 550, 170),
    waitTimeHistory: generateTimeSeries(5, 10, 6),
    densityHistory: generateTimeSeries(5, 65, 20),
    saturationHistory: generateTimeSeries(5, 70, 16)
  },
  {
    id: 'sf-foot-feb8',
    accountId: 'stade-france',
    name: 'France vs Belgique',
    subtitle: 'Qualifications Euro',
    date: new Date(2026, 1, 8, 21, 0),
    status: 'completed',
    duration: '3h',
    currentAttendance: 78200,
    totalCapacity: 80000,
    peakAttendance: 78800,
    globalFluidityScore: 76,
    avgWaitTime: 9,
    avgPassageTime: 3,
    avgDensity: 60,
    avgSaturation: 64,
    zones: createStadiumZones(0.95),
    alerts: generateAlerts(createStadiumZones(0.95), new Date(2026, 1, 8)),
    flowHistory: generateTimeSeries(5, 510, 165),
    waitTimeHistory: generateTimeSeries(5, 9, 5),
    densityHistory: generateTimeSeries(5, 58, 18),
    saturationHistory: generateTimeSeries(5, 62, 15)
  },
  // January 2026
  {
    id: 'sf-foot-jan25',
    accountId: 'stade-france',
    name: 'France vs Allemagne',
    subtitle: 'Match Amical',
    date: new Date(2026, 0, 25, 21, 0),
    status: 'completed',
    duration: '3h',
    currentAttendance: 72000,
    totalCapacity: 80000,
    peakAttendance: 73500,
    globalFluidityScore: 84,
    avgWaitTime: 6,
    avgPassageTime: 2,
    avgDensity: 48,
    avgSaturation: 52,
    zones: createStadiumZones(0.75),
    alerts: [],
    flowHistory: generateTimeSeries(5, 420, 140),
    waitTimeHistory: generateTimeSeries(5, 6, 4),
    densityHistory: generateTimeSeries(5, 46, 18),
    saturationHistory: generateTimeSeries(5, 50, 15)
  },
  {
    id: 'sf-rugby-jan18',
    accountId: 'stade-france',
    name: 'Racing 92 vs Stade Français',
    subtitle: 'Top 14 - Derby Parisien',
    date: new Date(2026, 0, 18, 17, 0),
    status: 'completed',
    duration: '3h',
    currentAttendance: 68500,
    totalCapacity: 80000,
    peakAttendance: 69200,
    globalFluidityScore: 86,
    avgWaitTime: 5,
    avgPassageTime: 2,
    avgDensity: 44,
    avgSaturation: 48,
    zones: createStadiumZones(0.7),
    alerts: [],
    flowHistory: generateTimeSeries(5, 400, 130),
    waitTimeHistory: generateTimeSeries(5, 5, 4),
    densityHistory: generateTimeSeries(5, 42, 16),
    saturationHistory: generateTimeSeries(5, 46, 14)
  },
  // December 2025
  {
    id: 'sf-concert-dec20',
    accountId: 'stade-france',
    name: 'Concert Nouvel An',
    subtitle: 'Gala de Fin d\'Année',
    date: new Date(2025, 11, 20, 20, 0),
    status: 'completed',
    duration: '5h',
    currentAttendance: 65000,
    totalCapacity: 80000,
    peakAttendance: 66500,
    globalFluidityScore: 88,
    avgWaitTime: 4,
    avgPassageTime: 2,
    avgDensity: 42,
    avgSaturation: 46,
    zones: createStadiumZones(0.65),
    alerts: [],
    flowHistory: generateTimeSeries(8, 380, 120),
    waitTimeHistory: generateTimeSeries(8, 4, 3),
    densityHistory: generateTimeSeries(8, 40, 15),
    saturationHistory: generateTimeSeries(8, 44, 12)
  },

  // === TOUR DE FRANCE EVENTS ===
  // Live event
  {
    id: 'tdf-etape-live',
    accountId: 'tdf',
    name: 'Village Étape Briançon',
    subtitle: 'Étape 18 - Embrun → Briançon',
    date: new Date(2026, 3, 20, 10, 0),
    status: 'live',
    duration: '8h',
    currentAttendance: 4350,
    totalCapacity: 7500,
    peakAttendance: 5200,
    globalFluidityScore: 76,
    avgWaitTime: 11,
    avgPassageTime: 8,
    avgDensity: 58,
    avgSaturation: 62,
    zones: createTDFZones(1),
    alerts: generateAlerts(createTDFZones(1), new Date()),
    flowHistory: generateTimeSeries(10, 180, 80),
    waitTimeHistory: generateTimeSeries(10, 10, 8),
    densityHistory: generateTimeSeries(10, 55, 25),
    saturationHistory: generateTimeSeries(10, 60, 22)
  },
  // Upcoming
  {
    id: 'tdf-etape-apr21',
    accountId: 'tdf',
    name: 'Village Étape Gap',
    subtitle: 'Étape 19 - Briançon → Gap',
    date: new Date(2026, 3, 21, 10, 0),
    status: 'upcoming',
    duration: '8h',
    currentAttendance: 0,
    totalCapacity: 6000,
    peakAttendance: 0,
    globalFluidityScore: 0,
    avgWaitTime: 0,
    avgPassageTime: 0,
    avgDensity: 0,
    avgSaturation: 0,
    zones: createTDFZones(0).map(z => ({ ...z, density: 0, waitTime: 0, currentCount: 0, saturation: 0, status: 'fluide' as ZoneStatus })),
    alerts: [],
    flowHistory: [],
    waitTimeHistory: [],
    densityHistory: [],
    saturationHistory: []
  },
  {
    id: 'tdf-etape-apr22',
    accountId: 'tdf',
    name: 'Village Étape Nice',
    subtitle: 'Étape 20 - Gap → Nice',
    date: new Date(2026, 3, 22, 10, 0),
    status: 'upcoming',
    duration: '8h',
    currentAttendance: 0,
    totalCapacity: 8000,
    peakAttendance: 0,
    globalFluidityScore: 0,
    avgWaitTime: 0,
    avgPassageTime: 0,
    avgDensity: 0,
    avgSaturation: 0,
    zones: createTDFZones(0).map(z => ({ ...z, density: 0, waitTime: 0, currentCount: 0, saturation: 0, status: 'fluide' as ZoneStatus })),
    alerts: [],
    flowHistory: [],
    waitTimeHistory: [],
    densityHistory: [],
    saturationHistory: []
  },
  {
    id: 'tdf-etape-apr23',
    accountId: 'tdf',
    name: 'Village Arrivée Paris',
    subtitle: 'Étape 21 - Champs-Élysées',
    date: new Date(2026, 3, 23, 10, 0),
    status: 'upcoming',
    duration: '10h',
    currentAttendance: 0,
    totalCapacity: 12000,
    peakAttendance: 0,
    globalFluidityScore: 0,
    avgWaitTime: 0,
    avgPassageTime: 0,
    avgDensity: 0,
    avgSaturation: 0,
    zones: createTDFZones(0).map(z => ({ ...z, density: 0, waitTime: 0, currentCount: 0, saturation: 0, status: 'fluide' as ZoneStatus })),
    alerts: [],
    flowHistory: [],
    waitTimeHistory: [],
    densityHistory: [],
    saturationHistory: []
  },
  // Past events April 2026
  {
    id: 'tdf-etape-apr19',
    accountId: 'tdf',
    name: 'Village Étape Embrun',
    subtitle: 'Étape 17 - Digne → Embrun',
    date: new Date(2026, 3, 19, 10, 0),
    status: 'completed',
    duration: '8h',
    currentAttendance: 5800,
    totalCapacity: 6500,
    peakAttendance: 6100,
    globalFluidityScore: 74,
    avgWaitTime: 12,
    avgPassageTime: 9,
    avgDensity: 62,
    avgSaturation: 66,
    zones: createTDFZones(1.05),
    alerts: generateAlerts(createTDFZones(1.05), new Date(2026, 3, 19)),
    flowHistory: generateTimeSeries(10, 190, 85),
    waitTimeHistory: generateTimeSeries(10, 11, 7),
    densityHistory: generateTimeSeries(10, 60, 22),
    saturationHistory: generateTimeSeries(10, 64, 20)
  },
  {
    id: 'tdf-etape-apr18',
    accountId: 'tdf',
    name: 'Village Étape Digne-les-Bains',
    subtitle: 'Étape 16 - Sisteron → Digne',
    date: new Date(2026, 3, 18, 10, 0),
    status: 'completed',
    duration: '7h',
    currentAttendance: 4200,
    totalCapacity: 5000,
    peakAttendance: 4600,
    globalFluidityScore: 82,
    avgWaitTime: 7,
    avgPassageTime: 5,
    avgDensity: 48,
    avgSaturation: 52,
    zones: createTDFZones(0.85),
    alerts: [],
    flowHistory: generateTimeSeries(9, 160, 70),
    waitTimeHistory: generateTimeSeries(9, 7, 5),
    densityHistory: generateTimeSeries(9, 46, 18),
    saturationHistory: generateTimeSeries(9, 50, 16)
  },
  {
    id: 'tdf-etape-apr15',
    accountId: 'tdf',
    name: 'Village Étape Montpellier',
    subtitle: 'Étape 13 - Repos',
    date: new Date(2026, 3, 15, 10, 0),
    status: 'completed',
    duration: '10h',
    currentAttendance: 8500,
    totalCapacity: 9000,
    peakAttendance: 8800,
    globalFluidityScore: 72,
    avgWaitTime: 14,
    avgPassageTime: 10,
    avgDensity: 68,
    avgSaturation: 72,
    zones: createTDFZones(1.15),
    alerts: generateAlerts(createTDFZones(1.15), new Date(2026, 3, 15)),
    flowHistory: generateTimeSeries(12, 240, 100),
    waitTimeHistory: generateTimeSeries(12, 13, 9),
    densityHistory: generateTimeSeries(12, 66, 24),
    saturationHistory: generateTimeSeries(12, 70, 20)
  },
  {
    id: 'tdf-etape-apr10',
    accountId: 'tdf',
    name: 'Village Étape Toulouse',
    subtitle: 'Étape 10 - Bordeaux → Toulouse',
    date: new Date(2026, 3, 10, 10, 0),
    status: 'completed',
    duration: '9h',
    currentAttendance: 7200,
    totalCapacity: 8000,
    peakAttendance: 7600,
    globalFluidityScore: 77,
    avgWaitTime: 10,
    avgPassageTime: 7,
    avgDensity: 56,
    avgSaturation: 60,
    zones: createTDFZones(0.95),
    alerts: generateAlerts(createTDFZones(0.95), new Date(2026, 3, 10)),
    flowHistory: generateTimeSeries(11, 210, 90),
    waitTimeHistory: generateTimeSeries(11, 9, 6),
    densityHistory: generateTimeSeries(11, 54, 20),
    saturationHistory: generateTimeSeries(11, 58, 18)
  },
  {
    id: 'tdf-etape-apr5',
    accountId: 'tdf',
    name: 'Village Grand Départ Lille',
    subtitle: 'Étape 1 - Grand Départ',
    date: new Date(2026, 3, 5, 8, 0),
    status: 'completed',
    duration: '12h',
    currentAttendance: 11500,
    totalCapacity: 12000,
    peakAttendance: 11800,
    globalFluidityScore: 68,
    avgWaitTime: 16,
    avgPassageTime: 11,
    avgDensity: 74,
    avgSaturation: 78,
    zones: createTDFZones(1.25),
    alerts: generateAlerts(createTDFZones(1.25), new Date(2026, 3, 5)),
    flowHistory: generateTimeSeries(14, 280, 120),
    waitTimeHistory: generateTimeSeries(14, 15, 10),
    densityHistory: generateTimeSeries(14, 72, 25),
    saturationHistory: generateTimeSeries(14, 76, 22)
  },
  // Previous Tour - July 2025
  {
    id: 'tdf-2025-paris',
    accountId: 'tdf',
    name: 'Village Arrivée Paris 2025',
    subtitle: 'Étape 21 - Champs-Élysées',
    date: new Date(2025, 6, 27, 10, 0),
    status: 'completed',
    duration: '10h',
    currentAttendance: 12000,
    totalCapacity: 12000,
    peakAttendance: 12000,
    globalFluidityScore: 65,
    avgWaitTime: 18,
    avgPassageTime: 12,
    avgDensity: 78,
    avgSaturation: 82,
    zones: createTDFZones(1.3),
    alerts: generateAlerts(createTDFZones(1.3), new Date(2025, 6, 27)),
    flowHistory: generateTimeSeries(12, 280, 120),
    waitTimeHistory: generateTimeSeries(12, 16, 10),
    densityHistory: generateTimeSeries(12, 75, 20),
    saturationHistory: generateTimeSeries(12, 80, 18)
  },
  {
    id: 'tdf-2025-alpe',
    accountId: 'tdf',
    name: 'Village Alpe d\'Huez 2025',
    subtitle: 'Étape 17 - Montée Mythique',
    date: new Date(2025, 6, 23, 8, 0),
    status: 'completed',
    duration: '12h',
    currentAttendance: 8500,
    totalCapacity: 9000,
    peakAttendance: 8800,
    globalFluidityScore: 72,
    avgWaitTime: 14,
    avgPassageTime: 10,
    avgDensity: 65,
    avgSaturation: 70,
    zones: createTDFZones(1.1),
    alerts: generateAlerts(createTDFZones(1.1), new Date(2025, 6, 23)),
    flowHistory: generateTimeSeries(14, 220, 100),
    waitTimeHistory: generateTimeSeries(14, 13, 8),
    densityHistory: generateTimeSeries(14, 62, 22),
    saturationHistory: generateTimeSeries(14, 68, 20)
  },
  {
    id: 'tdf-2025-ventoux',
    accountId: 'tdf',
    name: 'Village Mont Ventoux 2025',
    subtitle: 'Étape 14 - Le Géant de Provence',
    date: new Date(2025, 6, 19, 8, 0),
    status: 'completed',
    duration: '11h',
    currentAttendance: 7200,
    totalCapacity: 8000,
    peakAttendance: 7600,
    globalFluidityScore: 74,
    avgWaitTime: 12,
    avgPassageTime: 9,
    avgDensity: 60,
    avgSaturation: 65,
    zones: createTDFZones(1),
    alerts: generateAlerts(createTDFZones(1), new Date(2025, 6, 19)),
    flowHistory: generateTimeSeries(13, 200, 90),
    waitTimeHistory: generateTimeSeries(13, 11, 7),
    densityHistory: generateTimeSeries(13, 58, 20),
    saturationHistory: generateTimeSeries(13, 63, 18)
  },
  {
    id: 'tdf-2025-bilbao',
    accountId: 'tdf',
    name: 'Village Grand Départ Bilbao 2025',
    subtitle: 'Étape 1 - Grand Départ',
    date: new Date(2025, 6, 1, 8, 0),
    status: 'completed',
    duration: '12h',
    currentAttendance: 11000,
    totalCapacity: 11000,
    peakAttendance: 11000,
    globalFluidityScore: 68,
    avgWaitTime: 16,
    avgPassageTime: 11,
    avgDensity: 72,
    avgSaturation: 78,
    zones: createTDFZones(1.2),
    alerts: generateAlerts(createTDFZones(1.2), new Date(2025, 6, 1)),
    flowHistory: generateTimeSeries(14, 260, 110),
    waitTimeHistory: generateTimeSeries(14, 15, 9),
    densityHistory: generateTimeSeries(14, 70, 22),
    saturationHistory: generateTimeSeries(14, 76, 20)
  }
];

// Get events by account
export function getEventsByAccount(accountId: AccountId): Event[] {
  return eventsDatabase.filter(e => e.accountId === accountId);
}

// Get account by ID
export function getAccount(accountId: AccountId): Account | undefined {
  return accounts.find(a => a.id === accountId);
}

import { Category, StampItem, SyncState } from '../types';

const STORAGE_KEY_STAMPS = 'kitteki_stamps_v1';
const STORAGE_KEY_CATEGORIES = 'kitteki_categories_v1';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Viajes', kanjiName: '旅', color: '#3b82f6', orderIndex: 0 },
  { id: 'cat-2', name: 'Gastronomía', kanjiName: '食', color: '#e11d48', orderIndex: 1 },
  { id: 'cat-3', name: 'Naturaleza', kanjiName: '自然', color: '#10b981', orderIndex: 2 },
  { id: 'cat-4', name: 'Momentos', kanjiName: '瞬間', color: '#f59e0b', orderIndex: 3 },
  { id: 'cat-5', name: 'Nostalgia', kanjiName: '懐かしさ', color: '#8b5cf6', orderIndex: 4 },
];

// Generates procedural SVG Data URLs for default sample vintage photos
function createSampleImage(title: string, bgColor: string, accentColor: string, symbol: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <rect width="600" height="750" fill="${bgColor}"/>
    <circle cx="300" cy="320" r="180" fill="${accentColor}" opacity="0.3"/>
    <circle cx="300" cy="320" r="120" fill="none" stroke="${accentColor}" stroke-width="4" stroke-dasharray="10 10"/>
    <text x="300" y="360" font-family="'serif', 'Hiragino Mincho Pro', 'Noto Serif JP'" font-size="110" fill="${accentColor}" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
    <text x="300" y="580" font-family="sans-serif" font-weight="600" font-size="32" fill="#2b2825" text-anchor="middle" letter-spacing="4">${title.toUpperCase()}</text>
    <line x1="180" y1="620" x2="420" y2="620" stroke="#2b2825" stroke-width="2" opacity="0.5"/>
    <text x="300" y="660" font-family="sans-serif" font-size="20" fill="#666" text-anchor="middle" letter-spacing="2">DIGITAL STAMP JOURNAL</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const INITIAL_SAMPLE_STAMPS: StampItem[] = [
  {
    id: 'stamp-1',
    title: 'Jardín de Bambú',
    kanjiTitle: '竹林',
    date: '2026-07-05',
    category: 'Naturaleza',
    imageUrl: createSampleImage('JARDIN DE BAMBU', '#EFECE6', '#556B2F', '竹'),
    filterStyle: 'sepia',
    denomination: '¥80',
    postmarkCity: 'KYOTO',
    postmarkStyle: 'classic',
    frameColor: '#F4EFE6',
    notes: 'Paseo matutino entre los bambúes de Arashiyama con una brisa fresca.',
    orderIndex: 0,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'stamp-2',
    title: 'Té Matcha en Uji',
    kanjiTitle: '抹茶',
    date: '2026-07-12',
    category: 'Gastronomía',
    imageUrl: createSampleImage('MATCHA EN UJI', '#F2EFE9', '#C8372D', '茶'),
    filterStyle: 'risograph',
    denomination: '¥120',
    postmarkCity: 'UJI',
    postmarkStyle: 'doubleRing',
    frameColor: '#EAE5D9',
    notes: 'Disfrutando de un tazón tradicional con wagashi al borde del río.',
    orderIndex: 1,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'stamp-3',
    title: 'Faroles de Takayama',
    kanjiTitle: '燈籠',
    date: '2026-07-18',
    category: 'Momentos',
    imageUrl: createSampleImage('FAROLES NOCTURNOS', '#EAE6DF', '#1E293B', '燈'),
    filterStyle: 'ukiyoe',
    denomination: '¥200',
    postmarkCity: 'TAKAYAMA',
    postmarkStyle: 'seal',
    frameColor: '#F7F3EB',
    notes: 'Luces cálidas iluminando las casas antiguas de madera al atardecer.',
    orderIndex: 2,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'stamp-4',
    title: 'Gato Callejero',
    kanjiTitle: '猫',
    date: '2026-07-24',
    category: 'Momentos',
    imageUrl: createSampleImage('GATO DE SHINJUKU', '#F0EDE6', '#78350F', '猫'),
    filterStyle: 'halftone',
    denomination: '¥80',
    postmarkCity: 'TOKYO',
    postmarkStyle: 'minimal',
    frameColor: '#F5F1E8',
    notes: 'Nos observó atentamente desde un callejón rodeado de linternas rojas.',
    orderIndex: 3,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'stamp-5',
    title: 'Atardecer en Santiago',
    kanjiTitle: '夕日',
    date: '2026-07-28',
    category: 'Viajes',
    imageUrl: createSampleImage('SANTIAGO ATARDECER', '#EBE7DE', '#D97706', '空'),
    filterStyle: 'retroGrain',
    denomination: '2026',
    postmarkCity: 'SANTIAGO',
    postmarkStyle: 'classic',
    frameColor: '#F2EFE8',
    notes: 'Sombras doradas sobre los cerros al caer el día. Coleccionado para @sappy.error.',
    orderIndex: 4,
    createdAt: Date.now() - 86400000 * 1,
  },
];

/**
 * Loads stamps from LocalStorage (or initial defaults if empty)
 */
export function loadStamps(): StampItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAMPS);
    if (!raw) {
      saveStamps(INITIAL_SAMPLE_STAMPS);
      return INITIAL_SAMPLE_STAMPS;
    }
    const parsed: StampItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => a.orderIndex - b.orderIndex);
  } catch (err) {
    console.error('Error loading stamps:', err);
    return INITIAL_SAMPLE_STAMPS;
  }
}

/**
 * Saves stamps to LocalStorage and triggers background server cloud sync
 */
export function saveStamps(stamps: StampItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STAMPS, JSON.stringify(stamps));
    triggerCloudSync(stamps, loadCategories());
  } catch (err) {
    console.error('Error saving stamps:', err);
  }
}

/**
 * Loads categories from LocalStorage
 */
export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading categories:', err);
    return DEFAULT_CATEGORIES;
  }
}

/**
 * Saves categories to LocalStorage
 */
export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    triggerCloudSync(loadStamps(), categories);
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

// Global listener for sync status state
type SyncCallback = (state: SyncState) => void;
const syncListeners: Set<SyncCallback> = new Set();

export function subscribeSyncState(cb: SyncCallback) {
  syncListeners.add(cb);
  return () => syncListeners.delete(cb);
}

function notifySync(state: SyncState) {
  syncListeners.forEach((cb) => cb(state));
}

let syncTimeout: any = null;

/**
 * Auto-syncs stamps and categories with the cloud server
 */
export function triggerCloudSync(stamps: StampItem[], categories: Category[]) {
  notifySync({ status: 'syncing' });

  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stamps, categories }),
      });
      if (res.ok) {
        notifySync({
          status: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        notifySync({ status: 'offline', lastSyncedAt: 'Guardado local' });
      }
    } catch {
      notifySync({ status: 'synced', lastSyncedAt: 'Guardado local en navegador' });
    }
  }, 400);
}

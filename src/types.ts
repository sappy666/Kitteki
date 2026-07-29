export type FilterStyle = 
  | 'sepia' 
  | 'halftone' 
  | 'ukiyoe' 
  | 'risograph' 
  | 'monochrome' 
  | 'watercolor' 
  | 'retroGrain';

export type PostmarkStyle = 'classic' | 'minimal' | 'seal' | 'doubleRing';

export interface StampItem {
  id: string;
  title: string;
  kanjiTitle?: string;
  date: string; // YYYY-MM-DD
  category: string;
  imageUrl: string;
  filterStyle: FilterStyle;
  denomination: string; // e.g. "¥80", "¥120", "2026"
  postmarkCity: string; // e.g. "TOKYO", "KYOTO", "SANTIAGO"
  postmarkStyle: PostmarkStyle;
  frameColor: string; // hex string e.g. "#f4efe6"
  notes?: string;
  orderIndex: number;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  kanjiName?: string;
  color: string;
  orderIndex: number;
}

export type ViewMode = 'album' | 'calendar' | 'categories';

export interface SyncState {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt?: string;
}

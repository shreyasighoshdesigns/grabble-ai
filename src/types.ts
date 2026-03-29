export interface Screenshot {
  id: string;
  url: string;
  title: string;
  tags: string[];
  customTags?: string[];
  screenType: string;
  category?: 'Web' | 'Mobile';
  components: string[];
  colorPalette: string[];
  dateAdded: string;
}

export interface Board {
  id: string;
  name: string;
  coverUrl?: string;
  screenshotIds: string[];
  dateCreated: string;
}

export type MoodboardItemType = 'image' | 'text' | 'checklist' | 'palette' | 'persona' | 'link';

export interface MoodboardItem {
  id: string;
  type: MoodboardItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  content: any;
}

export interface Moodboard {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  screenshotIds: string[];
  items?: MoodboardItem[];
  order?: number;
  bgType?: 'color' | 'image' | 'dots';
  bgValue?: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface SmartFolder {
  name: string;
  type: 'screenType' | 'component';
  value: string;
  count: number;
}

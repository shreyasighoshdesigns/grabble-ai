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

export function normalizeScreenType(type: string | undefined): string {
  if (!type) return 'Unknown';
  const lower = type.toLowerCase();
  
  // E-commerce & Shopping
  if (lower.includes('pdp') || lower.includes('product detail') || lower.includes('product page')) return 'PDP';
  if (lower.includes('checkout') || lower.includes('cart') || lower.includes('payment') || lower.includes('billing')) return 'Checkout';
  if (lower.includes('plp') || lower.includes('product list') || lower.includes('catalog')) return 'Catalog';

  // Core App Flow
  if (lower.includes('home') || lower.includes('landing')) return 'Homepage';
  if (lower.includes('dash') || lower.includes('admin') || lower.includes('panel')) return 'Dashboard';
  if (lower.includes('login') || lower.includes('sign') || lower.includes('auth') || lower.includes('register')) return 'Login';
  if (lower.includes('onboard') || lower.includes('walkthrough') || lower.includes('tutorial')) return 'Onboarding';
  
  // Settings & User
  if (lower.includes('setting') || lower.includes('preference')) return 'Settings';
  if (lower.includes('profile') || lower.includes('account') || lower.includes('user')) return 'Profile';
  
  // Other common patterns
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('plan')) return 'Pricing';
  if (lower.includes('chat') || lower.includes('message') || lower.includes('inbox')) return 'Chat';
  if (lower.includes('search') || lower.includes('explore')) return 'Search';
  if (lower.includes('list') || lower.includes('feed') || lower.includes('grid')) return 'Feed';
  if (lower.includes('form') || lower.includes('input')) return 'Form';
  if (lower.includes('modal') || lower.includes('dialog') || lower.includes('popup')) return 'Modal';
  if (lower.includes('success') || lower.includes('done') || lower.includes('confirm')) return 'Success';
  if (lower.includes('error') || lower.includes('empty') || lower.includes('404')) return 'Empty State';
  if (lower.includes('article') || lower.includes('blog') || lower.includes('post') || lower.includes('news')) return 'Article';

  // Capitalize fallback without word breaks
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const SMART_FOLDER_GROUPS = [
  {
    title: 'Categories',
    items: ['Education', 'Food & Drink', 'AI', 'Lifestyle', 'Business']
  },
  {
    title: 'Screens',
    items: ['Home', 'Welcome & Get Started', 'Subscription & Paywall', 'Login', 'Dashboard']
  },
  {
    title: 'UI Elements',
    items: ['Stacked List', 'Button', 'Tab Bar', 'Bottom Sheet', 'Dropdown Menu']
  },
  {
    title: 'Flows',
    items: ['Creating Account', 'Browsing Tutorial', 'Subscribing & Upgrading', 'Onboarding', 'Logging In']
  }
];

export const SMART_FOLDERS_LIST = SMART_FOLDER_GROUPS.flatMap(g => g.items);

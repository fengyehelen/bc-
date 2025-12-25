import { User, Platform, Activity, Admin, SystemConfig } from '../types';
import { MOCK_PLATFORMS, MOCK_ACTIVITIES } from '../constants';

// Keys for LocalStorage
const KEYS = {
  USERS: 'betbounty_users',
  PLATFORMS: 'betbounty_platforms',
  ACTIVITIES: 'betbounty_activities',
  ADMINS: 'betbounty_admins',
  CONFIG: 'betbounty_config'
};

// Default Admin
const DEFAULT_ADMIN: Admin = {
  id: 'admin_01',
  username: 'admin',
  password: '123',
  role: 'super_admin'
};

// Default Config
const DEFAULT_CONFIG: SystemConfig = {
  initialBalance: { en: 0, zh: 0, id: 0, th: 0, vi: 0, ms: 0, tl: 0 },
  minWithdrawAmount: { en: 10, zh: 100, id: 50000, th: 100, vi: 100000, ms: 50, tl: 200 },
  telegramLinks: {
    en: 'https://t.me/betbounty_global',
    zh: 'https://t.me/betbounty_cn',
    id: 'https://t.me/betbounty_id',
    th: 'https://t.me/betbounty_th',
    vi: 'https://t.me/betbounty_vn',
    ms: 'https://t.me/betbounty_my',
    tl: 'https://t.me/betbounty_ph'
  }
};

export const MockDb = {
  // --- Users ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // --- Platforms (Tasks) ---
  getPlatforms: (): Platform[] => {
    const data = localStorage.getItem(KEYS.PLATFORMS);
    return data ? JSON.parse(data) : MOCK_PLATFORMS;
  },
  savePlatforms: (platforms: Platform[]) => {
    localStorage.setItem(KEYS.PLATFORMS, JSON.stringify(platforms));
  },

  // --- Activities ---
  getActivities: (): Activity[] => {
    const data = localStorage.getItem(KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : MOCK_ACTIVITIES;
  },
  saveActivities: (activities: Activity[]) => {
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  // --- Admins ---
  getAdmins: (): Admin[] => {
    const data = localStorage.getItem(KEYS.ADMINS);
    if (!data) {
      localStorage.setItem(KEYS.ADMINS, JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
    return JSON.parse(data);
  },
  saveAdmins: (admins: Admin[]) => {
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
  },

  // --- System Config ---
  getConfig: (): SystemConfig => {
    const data = localStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  },
  saveConfig: (config: SystemConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }
};
import { User, Platform, Activity, Admin } from '../types';
import { MOCK_PLATFORMS, MOCK_ACTIVITIES } from '../constants';

// Keys for LocalStorage
const KEYS = {
  USERS: 'betbounty_users',
  PLATFORMS: 'betbounty_platforms',
  ACTIVITIES: 'betbounty_activities',
  ADMINS: 'betbounty_admins'
};

// Default Admin
const DEFAULT_ADMIN: Admin = {
  id: 'admin_01',
  username: 'admin',
  password: '123',
  role: 'super_admin'
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
      // Initialize with default admin if empty
      localStorage.setItem(KEYS.ADMINS, JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
    return JSON.parse(data);
  },
  saveAdmins: (admins: Admin[]) => {
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
  }
};
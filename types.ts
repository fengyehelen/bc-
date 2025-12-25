export type Language = 'en' | 'id' | 'th' | 'vi' | 'ms' | 'tl' | 'zh';

export interface Platform {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  downloadLink: string;
  firstDepositAmount: number;
  rewardAmount: number;
  launchDate: string;
  isHot?: boolean;
  remainingQty: number;
  totalQty: number;
  steps: string[];
  rules: string;
  status: 'online' | 'offline';
  type: 'deposit' | 'register' | 'share';
  targetCountries: Language[] | 'all'; // New field for regional filtering
}

export interface UserTask {
  id: string;
  platformId: string;
  platformName: string;
  logoUrl: string;
  rewardAmount: number;
  status: 'ongoing' | 'reviewing' | 'completed' | 'rejected';
  startTime: string;
  submissionTime?: string;
  proofImageUrl?: string;
  rejectReason?: string;
}

export interface User {
  id: string;
  phone: string;
  balance: number;
  totalEarnings: number; // Cumulative
  referralCode: string;
  invitedCount: number;
  myTasks: UserTask[];
  registrationDate: string;
  bankInfo?: string;
  role: 'user' | 'admin';
  notifications: number; // Unread count
}

export interface Admin {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  role: 'super_admin' | 'editor';
}

export interface Activity {
  id: string;
  title: string;
  imageUrl: string;
  content: string; // New: Details for the activity page
  link: string;
  active: boolean;
  targetCountries: Language[] | 'all';
}

export enum SortOption {
  NEWEST = 'NEWEST',
  HIGHEST_REWARD = 'HIGHEST_REWARD',
  LOWEST_DEPOSIT = 'LOWEST_DEPOSIT'
}
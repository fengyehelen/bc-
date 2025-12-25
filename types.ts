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
  targetCountries: Language[];
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

export interface Transaction {
  id: string;
  type: 'task_reward' | 'referral_bonus' | 'withdraw' | 'system_bonus';
  amount: number;
  date: string;
  description: string;
  status: 'success' | 'pending' | 'failed';
}

export interface Message {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  type: 'bank' | 'ewallet';
}

export interface User {
  id: string;
  phone: string;
  password?: string;
  balance: number;
  totalEarnings: number;
  referralCode: string;
  referrerId?: string; 
  invitedCount: number;
  myTasks: UserTask[];
  registrationDate: string;
  bankAccounts: BankAccount[]; // Changed from single bankInfo to array
  role: 'user' | 'admin';
  messages: Message[];
  transactions: Transaction[];
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  role: 'super_admin' | 'editor';
}

export interface Activity {
  id: string;
  title: string;
  imageUrl: string;
  content: string;
  link: string;
  active: boolean;
  targetCountries: Language[];
}

export interface SystemConfig {
  initialBalance: number;
  minWithdrawAmount: number;
  telegramLinks: Record<string, string>;
}

export enum SortOption {
  NEWEST = 'NEWEST',
  HIGHEST_REWARD = 'HIGHEST_REWARD',
  LOWEST_DEPOSIT = 'LOWEST_DEPOSIT'
}
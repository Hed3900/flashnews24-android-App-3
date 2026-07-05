export type NewsCategory = 'All' | 'Tech' | 'AI' | 'Business' | 'World' | 'Science' | 'Sports' | string;

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  sourceName: string;
  publishedAt: string;
  imageUrl: string;
  category: NewsCategory;
  tags?: string[];
  url: string;
  readTimeMinutes: number;
  isBookmarked?: boolean;
  isBreaking?: boolean;
  sentiment?: 'Positive' | 'Neutral' | 'Urgent' | 'Analytical';
  aiSummary?: string[];
  isLiveBlogger?: boolean;
}

export interface NewsUiState {
  status: 'loading' | 'success' | 'error';
  articles: Article[];
  bookmarkedIds: string[];
  selectedCategory: NewsCategory;
  searchQuery: string;
  isRefreshing: boolean;
  isOfflineMode: boolean;
  lastUpdated: string;
}

export interface RetrofitLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST';
  url: string;
  status: number;
  durationMs: number;
  responseSize: string;
}

export interface RoomQueryLog {
  id: string;
  timestamp: string;
  query: string;
  rowsAffected: number;
  executionTimeMs: number;
}

export interface FcmNotification {
  id: string;
  title: string;
  body: string;
  articleId?: string;
  priority: 'HIGH' | 'NORMAL';
  timestamp: string;
  imageUrl?: string;
  read?: boolean;
}

export interface AndroidProjectFile {
  path: string;
  content: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'properties' | 'json';
  layer: 'data' | 'domain' | 'ui' | 'service' | 'config';
  description: string;
}

export type SimulatorScreen = 'home' | 'detail' | 'bookmarks' | 'search' | 'notifications';

export type InspectorTab = 'room' | 'retrofit' | 'mvvm' | 'fcm' | 'code_export';

/**
 * Utility Functions for EdgeVision AI Studio
 */

export * from './cn';

// ============================================
// Format Functions
// ============================================

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format date to relative string
 */
export function formatDateRelative(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * Format milliseconds to readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================
// ID Generation
// ============================================

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================
// String Utilities
// ============================================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to Title Case
 */
export function toTitleCase(str: string): string {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, firstChar => firstChar.toUpperCase());
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// Color Utilities
// ============================================

/**
 * Get color for model type
 */
export function getModelTypeColor(type: string): string {
  const colors: Record<string, string> = {
    object_detection: 'from-blue-500 to-cyan-500',
    image_classification: 'from-green-500 to-emerald-500',
    segmentation: 'from-purple-500 to-pink-500',
    pose_detection: 'from-orange-500 to-red-500',
    face_detection: 'from-rose-500 to-pink-500',
    ocr: 'from-cyan-500 to-blue-500',
    depth_estimation: 'from-indigo-500 to-purple-500',
    super_resolution: 'from-yellow-500 to-orange-500',
    audio_classification: 'from-teal-500 to-green-500',
    speech_recognition: 'from-sky-500 to-blue-500',
    text_generation: 'from-emerald-500 to-green-500',
    embedding: 'from-lime-500 to-green-500',
    custom: 'from-gray-500 to-slate-500',
  };
  return colors[type] || 'from-gray-500 to-slate-500';
}

/**
 * Get accent color for backend
 */
export function getBackendColor(backend: string): string {
  const colors: Record<string, string> = {
    webgpu: 'text-green-500',
    webnn: 'text-purple-500',
    wasm: 'text-blue-500',
    cpu: 'text-orange-500',
  };
  return colors[backend] || 'text-gray-500';
}

// ============================================
// Math Utilities
// ============================================

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// ============================================
// Array Utilities
// ============================================

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ============================================
// Object Utilities
// ============================================

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] as any, source[key] as any);
    } else {
      output[key] = source[key] as any;
    }
  }
  return output;
}

// ============================================
// Browser Utilities
// ============================================

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if mobile device
 */
export function isMobile(): boolean {
  if (!isBrowser()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if touch device
 */
export function isTouchDevice(): boolean {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get current language
 */
export function getLanguage(): string {
  if (!isBrowser()) return 'en';
  return navigator.language || 'en';
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  if (!isBrowser()) return true;
  return navigator.onLine;
}

// ============================================
// Storage Utilities
// ============================================

/**
 * Get value from localStorage
 */
export function getStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set value to localStorage
 */
export function setStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Remove value from localStorage
 */
export function removeStorage(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

// ============================================
// Error Handling
// ============================================

/**
 * Create error with context
 */
export function createError(message: string, context: Record<string, any> = {}): Error {
  const error = new Error(message);
  (error as any).context = context;
  return error;
}

/**
 * Sleep for specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Export all utilities
// ============================================

export {
  formatBytes,
  formatNumber,
  formatDate,
  formatDateRelative,
  formatTime,
  formatPercentage,
  generateId,
  generateUUID,
  truncate,
  capitalize,
  toTitleCase,
  camelToTitle,
  slugify,
  getModelTypeColor,
  getBackendColor,
  clamp,
  lerp,
  mapRange,
  chunk,
  groupBy,
  unique,
  deepClone,
  deepMerge,
  isBrowser,
  isMobile,
  isTouchDevice,
  getLanguage,
  isOnline,
  getStorage,
  setStorage,
  removeStorage,
  createError,
  sleep,
};
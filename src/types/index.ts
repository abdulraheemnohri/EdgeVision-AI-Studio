/**
 * TypeScript Types for EdgeVision AI Studio
 * 
 * This file contains all the type definitions used throughout the application
 */

// ============================================
// AI Runtime Types
// ============================================

export type AcceleratorType = 'webgpu' | 'webnn' | 'wasm' | 'cpu';

export interface ModelLoadOptions {
  accelerator?: AcceleratorType;
  jspi?: boolean;
}

export interface TensorShape {
  dimensions: number[];
  size: number;
}

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  modelType: ModelType;
  inputShape: TensorShape;
  outputShape: TensorShape;
  inputTensorCount: number;
  outputTensorCount: number;
  parameters: number;
  quantization: QuantizationType;
  size: number;
  filePath: string;
  dateImported: Date;
  isFavorite: boolean;
  folder: string | null;
  supportedBackends: AcceleratorType[];
  labels?: string[];
}

export type ModelType = 
  | 'object_detection'
  | 'image_classification'
  | 'segmentation'
  | 'pose_detection'
  | 'face_detection'
  | 'ocr'
  | 'depth_estimation'
  | 'super_resolution'
  | 'audio_classification'
  | 'speech_recognition'
  | 'text_generation'
  | 'embedding'
  | 'custom';

export type QuantizationType = 'float32' | 'float16' | 'int8' | 'uint8' | 'dynamic';

export interface InferenceInput {
  type: 'image' | 'video' | 'camera' | 'audio' | 'microphone' | 'text' | 'file';
  data: any;
}

export interface InferenceOutput {
  type: ModelType;
  data: any;
  processingTime: number;
  timestamp: Date;
}

export interface InferenceResult {
  output: any[];
  processingTime: number;
  acceleratorUsed: AcceleratorType;
}

// ============================================
// Device Information Types
// ============================================

export interface DeviceInfo {
  browser: {
    name: string;
    version: string;
    userAgent: string;
  };
  os: {
    platform: string;
    version: string;
  };
  cpu: {
    cores: number;
    vendor: string;
    architecture: string;
  };
  gpu: {
    vendor: string;
    renderer: string;
    webgpuSupport: boolean;
    webglVersion: string;
  };
  memory: {
    total: number;
    used: number;
    available: number;
  };
  features: {
    webgpu: boolean;
    webnn: boolean;
    wasm: boolean;
    serviceWorker: boolean;
    pwa: boolean;
    camera: boolean;
    microphone: boolean;
    offline: boolean;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
  };
}

export interface BackendStatus {
  available: boolean;
  initialized: boolean;
  supported: boolean;
  error?: string;
}

export interface BackendInfo {
  cpu: BackendStatus;
  webgpu: BackendStatus;
  webnn: BackendStatus;
  wasm: BackendStatus;
}

// ============================================
// Model Store Types
// ============================================

export interface ModelFilter {
  searchQuery: string;
  filterType: ModelType | 'all';
  showFavorites: boolean;
  currentFolder: string | null;
}

export interface ModelStoreState {
  models: ModelMetadata[];
  folders: string[];
  filter: ModelFilter;
  selectedModels: string[];
  isLoading: boolean;
  error: string | null;
}

export interface ModelStats {
  totalModels: number;
  totalStorage: number;
  byType: Record<ModelType, number>;
  byQuantization: Record<QuantizationType, number>;
  favoriteCount: number;
}

// ============================================
// AI Store Types
// ============================================

export interface AIStoreState {
  isInitialized: boolean;
  isLoading: boolean;
  deviceInfo: DeviceInfo | null;
  backends: BackendInfo;
  currentBackend: AcceleratorType;
  error: string | null;
}

export interface AIConfig {
  defaultBackend: AcceleratorType;
  threadCount: number;
  precision: 'float32' | 'float16' | 'int8';
  enableGPU: boolean;
  enableNPU: boolean;
  enableCPUOptimization: boolean;
  enableWarmUp: boolean;
  cacheEnabled: boolean;
}

// ============================================
// UI Component Types
// ============================================

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ThemeConfig {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  animations: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  batchProcessing: boolean;
  benchmarkComplete: boolean;
  modelLoaded: boolean;
}

// ============================================
// Input/Output Types
// ============================================

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  keypoints?: { x: number; y: number }[];
}

export interface ClassificationResult {
  class: string;
  confidence: number;
  index: number;
}

export interface SegmentationResult {
  mask: Uint8Array | Float32Array;
  classes: string[];
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  words: {
    text: string;
    bbox: [number, number, number, number];
    confidence: number;
  }[];
  lines?: {
    text: string;
    bbox: [number, number, number, number];
    confidence: number;
  }[];
}

export interface FaceResult {
  bbox: [number, number, number, number];
  landmarks: { x: number; y: number }[];
  age?: number;
  gender?: string;
  emotion?: string;
  smileProbability?: number;
  blinkProbability?: number;
}

export interface PoseResult {
  keypoints: {
    x: number;
    y: number;
    score: number;
    name: string;
  }[];
  score: number;
}

// ============================================
// Benchmark Types
// ============================================

export interface BenchmarkResult {
  modelId: string;
  backend: AcceleratorType;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
  fps: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface BenchmarkConfig {
  iterations: number;
  warmUpIterations: number;
  testModels: string[];
  testBackends: AcceleratorType[];
}

// ============================================
// Storage Types
// ============================================

export interface StorageInfo {
  total: number;
  used: number;
  available: number;
  models: number;
  cache: number;
  logs: number;
  temp: number;
}

export interface CacheConfig {
  maxModelCache: number; // in MB
  maxHistory: number;
  autoCleanup: boolean;
  cleanupInterval: number; // in days
}

// ============================================
// Dataset Types
// ============================================

export interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  format: DatasetFormat;
  classCount: number;
  imageCount: number;
  annotations: number;
  dateCreated: Date;
  dateModified: Date;
}

export type DatasetFormat = 
  | 'coco'
  | 'voc'
  | 'yolo'
  | 'csv'
  | 'json'
  | 'image_folder'
  | 'video_folder';

// ============================================
// Pipeline Types
// ============================================

export interface PipelineNode {
  id: string;
  type: PipelineNodeType;
  label: string;
  config: Record<string, any>;
  inputs: string[];
  outputs: string[];
  position: { x: number; y: number };
}

export type PipelineNodeType = 
  | 'load_image'
  | 'resize'
  | 'crop'
  | 'normalize'
  | 'inference'
  | 'post_process'
  | 'threshold'
  | 'nms'
  | 'export'
  | 'save'
  | 'display';

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  nodes: PipelineNode[];
  connections: { from: string; to: string; port: string }[];
  dateCreated: Date;
  dateModified: Date;
}

// ============================================
// Plugin Types
// ============================================

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  entry: string;
  icon: string;
  permissions: string[];
}

export type PluginType = 
  | 'model'
  | 'preprocessor'
  | 'postprocessor'
  | 'theme'
  | 'language'
  | 'visualization'
  | 'utility';

// ============================================
// Chat Types
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  modelId: string;
  messages: ChatMessage[];
  dateCreated: Date;
  dateModified: Date;
}

// ============================================
// Export all types
// ============================================

export type {
  DeviceInfo,
  BackendStatus,
  BackendInfo,
  ModelStoreState,
  ModelStats,
  AIStoreState,
  AIConfig,
  ToastMessage,
  ThemeConfig,
  NotificationSettings,
  DetectionResult,
  ClassificationResult,
  SegmentationResult,
  OCRResult,
  FaceResult,
  PoseResult,
  BenchmarkResult,
  BenchmarkConfig,
  StorageInfo,
  CacheConfig,
  DatasetInfo,
  PipelineNode,
  Pipeline,
  PluginManifest,
  ChatMessage,
  ChatSession
};
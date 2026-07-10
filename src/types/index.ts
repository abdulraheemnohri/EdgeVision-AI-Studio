// Core Types

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface BoundingBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
}

// AI Model Types

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
export type BackendType = 'cpu' | 'webgpu' | 'wasm' | 'webnn';

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
  labels?: string[];
  dateImported: Date;
  lastUsed?: Date;
  isFavorite: boolean;
  folder?: string;
  supportedBackends: BackendType[];
  custom?: Record<string, unknown>;
}

// Inference Types

export interface InferenceInput {
  type: 'image' | 'video' | 'audio' | 'text' | 'tensor' | 'file';
  data: unknown;
  options?: Record<string, unknown>;
}

export interface InferenceOutput {
  type: string;
  data: unknown;
  confidence?: number;
  processingTime: number;
  timestamp: Date;
}

// Device Info

export interface DeviceInfo {
  cpu: {
    cores: number;
    architecture: string;
    vendor: string;
    maxFrequency: number;
    simd: boolean;
  };
  gpu: {
    vendor: string;
    renderer: string;
    version: string;
    memory: number;
    webgpuSupport: boolean;
    webglVersion: string;
  };
  memory: {
    total: number;
    used: number;
    available: number;
  };
  os: {
    platform: string;
    version: string;
    architecture: string;
  };
  browser: {
    name: string;
    version: string;
    userAgent: string;
  };
  features: {
    webgpu: boolean;
    webnn: boolean;
    wasm: boolean;
    sharedArrayBuffer: boolean;
    offscreenCanvas: boolean;
    fileSystemAccess: boolean;
    webWorkers: boolean;
  };
  battery?: {
    level: number;
    charging: boolean;
    chargingTime?: number;
    dischargingTime?: number;
  };
}
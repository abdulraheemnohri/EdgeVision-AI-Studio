/**
 * LiteRT.js Runtime Wrapper for EdgeVision AI Studio
 * 
 * This module provides a wrapper around the @litertjs/core package for loading
 * and running TensorFlow Lite (.tflite) models in the browser with WebGPU,
 * WebNN, and CPU (XNNPACK) acceleration support.
 * 
 * @package EdgeVision AI Studio
 * @author Abdulraheem Nohari
 * @license MIT
 */

import { loadLiteRt, loadAndCompile, Tensor } from '@litertjs/core';

/**
 * Supported accelerator types
 */
export type AcceleratorType = 'webgpu' | 'webnn' | 'wasm' | 'cpu';

/**
 * Model loading options
 */
export interface ModelLoadOptions {
  /** The accelerator to use for inference */
  accelerator?: AcceleratorType;
  /** Enable JSPi for WebNN (required for some browsers) */
  jspi?: boolean;
}

/**
 * Tensor shape information
 */
export interface TensorShape {
  dimensions: number[];
  size: number;
}

/**
 * Model metadata
 */
export interface ModelMetadata {
  name: string;
  path: string;
  inputShape: TensorShape;
  outputShape: TensorShape;
  supportedAccelerators: AcceleratorType[];
}

/**
 * Inference result
 */
export interface InferenceResult {
  output: Tensor[];
  processingTime: number;
  acceleratorUsed: AcceleratorType;
}

/**
 * LiteRT Runtime Manager
 * 
 * Manages the initialization, model loading, and inference execution
 * for the LiteRT.js runtime.
 */
export class LiteRTRuntime {
  private isInitialized: boolean = false;
  private wasmPath: string = '/wasm/';
  private currentAccelerator: AcceleratorType = 'webgpu';
  private loadedModels: Map<string, any> = new Map();

  /**
   * Initialize the LiteRT.js runtime
   * 
   * This must be called before any model loading or inference operations.
   * It loads the required WASM components for the runtime.
   * 
   * @param wasmPath - Path to the WASM directory (default: '/wasm/')
   * @param jspi - Enable JSPi for WebNN support (default: true)
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(wasmPath: string = '/wasm/', jspi: boolean = true): Promise<void> {
    if (this.isInitialized) {
      console.log('LiteRT.js runtime is already initialized');
      return;
    }

    try {
      console.log('Initializing LiteRT.js runtime...');
      console.log(`WASM path: ${wasmPath}`);
      console.log(`JSPi enabled: ${jspi}`);

      // Load LiteRT.js WASM components
      await loadLiteRt(wasmPath, { jspi });
      
      this.wasmPath = wasmPath;
      this.isInitialized = true;
      
      console.log('✅ LiteRT.js runtime initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize LiteRT.js runtime:', error);
      throw new Error(`LiteRT.js initialization failed: ${error}`);
    }
  }

  /**
   * Check if the runtime is initialized
   */
  getInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Set the default accelerator for model inference
   * 
   * @param accelerator - The accelerator to use
   */
  setAccelerator(accelerator: AcceleratorType): void {
    this.currentAccelerator = accelerator;
    console.log(`🔧 Set default accelerator to: ${accelerator}`);
  }

  /**
   * Get the current default accelerator
   */
  getAccelerator(): AcceleratorType {
    return this.currentAccelerator;
  }

  /**
   * Check if a specific accelerator is available on the current device
   * 
   * @param accelerator - The accelerator to check
   * @returns Promise that resolves to true if available
   */
  async isAcceleratorAvailable(accelerator: AcceleratorType): Promise<boolean> {
    try {
      // This is a simplified check - in a real implementation,
      // you would need to test actual model loading with each accelerator
      switch (accelerator) {
        case 'webgpu':
          return typeof navigator.gpu !== 'undefined';
        case 'webnn':
          return typeof navigator.ml !== 'undefined';
        case 'wasm':
          return true; // WASM is always available
        case 'cpu':
          return true; // CPU fallback is always available
        default:
          return false;
      }
    } catch (error) {
      console.warn(`Failed to check ${accelerator} availability:`, error);
      return false;
    }
  }

  /**
   * Get available accelerators on the current device
   */
  async getAvailableAccelerators(): Promise<AcceleratorType[]> {
    const accelerators: AcceleratorType[] = ['wasm', 'cpu'];
    
    if (await this.isAcceleratorAvailable('webgpu')) {
      accelerators.unshift('webgpu');
    }
    
    if (await this.isAcceleratorAvailable('webnn')) {
      accelerators.unshift('webnn');
    }
    
    return accelerators;
  }

  /**
   * Load and compile a TensorFlow Lite model
   * 
   * @param modelPath - Path to the .tflite model file
   * @param options - Loading options including accelerator
   * @returns Promise that resolves to the loaded model
   */
  async loadModel(modelPath: string, options: ModelLoadOptions = {}): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('LiteRT.js runtime must be initialized before loading models');
    }

    const accelerator = options.accelerator || this.currentAccelerator;
    const jspi = options.jspi !== undefined ? options.jspi : true;

    try {
      console.log(`🔄 Loading model: ${modelPath}`);
      console.log(`🎯 Using accelerator: ${accelerator}`);

      // Load and compile the model
      const model = await loadAndCompile(modelPath, {
        accelerator,
        jspi
      });

      console.log(`✅ Model loaded successfully: ${modelPath}`);
      
      // Store the model for later use
      this.loadedModels.set(modelPath, model);
      
      return model;
    } catch (error) {
      console.error(`❌ Failed to load model ${modelPath}:`, error);
      
      // Try fallback to WASM if the preferred accelerator fails
      if (accelerator !== 'wasm') {
        console.log(`🔄 Trying fallback to WASM accelerator...`);
        try {
          const model = await loadAndCompile(modelPath, {
            accelerator: 'wasm',
            jspi
          });
          
          console.log(`✅ Model loaded with WASM fallback: ${modelPath}`);
          this.loadedModels.set(modelPath, model);
          return model;
        } catch (fallbackError) {
          console.error(`❌ WASM fallback also failed:`, fallbackError);
        }
      }
      
      throw new Error(`Failed to load model ${modelPath}: ${error}`);
    }
  }

  /**
   * Unload a model to free up memory
   * 
   * @param modelPath - Path to the model to unload
   */
  unloadModel(modelPath: string): void {
    if (this.loadedModels.has(modelPath)) {
      const model = this.loadedModels.get(modelPath);
      // Clean up model resources
      if (model && typeof model.delete === 'function') {
        model.delete();
      }
      this.loadedModels.delete(modelPath);
      console.log(`🗑️ Unloaded model: ${modelPath}`);
    }
  }

  /**
   * Run inference on a loaded model
   * 
   * @param modelPath - Path to the loaded model
   * @param inputTensor - Input tensor for inference
   * @param accelerator - Optional accelerator override
   * @returns Promise that resolves to inference results
   */
  async runInference(
    modelPath: string,
    inputTensor: Tensor,
    accelerator?: AcceleratorType
  ): Promise<InferenceResult> {
    if (!this.isInitialized) {
      throw new Error('LiteRT.js runtime must be initialized before running inference');
    }

    const model = this.loadedModels.get(modelPath);
    if (!model) {
      throw new Error(`Model ${modelPath} is not loaded`);
    }

    try {
      console.log(`🚀 Running inference on: ${modelPath}`);
      
      const startTime = performance.now();
      
      // Run the model
      const results = await model.run(inputTensor);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      const usedAccelerator = accelerator || this.currentAccelerator;
      
      console.log(`✅ Inference completed in ${processingTime.toFixed(2)}ms`);
      console.log(`🎯 Used accelerator: ${usedAccelerator}`);
      
      return {
        output: results,
        processingTime,
        acceleratorUsed: usedAccelerator
      };
    } catch (error) {
      console.error(`❌ Inference failed:`, error);
      throw new Error(`Inference failed: ${error}`);
    }
  }

  /**
   * Create a tensor from typed array
   * 
   * @param data - Typed array containing tensor data
   * @param shape - Shape of the tensor
   * @returns Tensor object
   */
  createTensor(data: TypedArray, shape: number[]): Tensor {
    return new Tensor(data, shape);
  }

  /**
   * Create a Float32 tensor
   * 
   * @param shape - Shape of the tensor
   * @param initializer - Function to initialize tensor values
   * @returns Tensor object
   */
  createFloat32Tensor(shape: number[], initializer: (index: number) => number = () => 0): Tensor {
    const size = shape.reduce((acc, val) => acc * val, 1);
    const data = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
      data[i] = initializer(i);
    }
    
    return new Tensor(data, shape);
  }

  /**
   * Get model input information
   * 
   * @param modelPath - Path to the loaded model
   * @returns Promise that resolves to input shape information
   */
  async getModelInputInfo(modelPath: string): Promise<TensorShape> {
    const model = this.loadedModels.get(modelPath);
    if (!model) {
      throw new Error(`Model ${modelPath} is not loaded`);
    }

    try {
      // Get input tensor information
      const inputTensors = model.getInputTensors();
      if (inputTensors && inputTensors.length > 0) {
        const inputTensor = inputTensors[0];
        return {
          dimensions: inputTensor.shape,
          size: inputTensor.size
        };
      }
      
      // Default fallback for models without explicit input info
      return {
        dimensions: [1, 3, 224, 224], // Common input shape for vision models
        size: 3 * 224 * 224
      };
    } catch (error) {
      console.warn(`Could not get input info for model ${modelPath}:`, error);
      return {
        dimensions: [1, 3, 224, 224],
        size: 3 * 224 * 224
      };
    }
  }

  /**
   * Get model output information
   * 
   * @param modelPath - Path to the loaded model
   * @returns Promise that resolves to output shape information
   */
  async getModelOutputInfo(modelPath: string): Promise<TensorShape> {
    const model = this.loadedModels.get(modelPath);
    if (!model) {
      throw new Error(`Model ${modelPath} is not loaded`);
    }

    try {
      // Get output tensor information
      const outputTensors = model.getOutputTensors();
      if (outputTensors && outputTensors.length > 0) {
        const outputTensor = outputTensors[0];
        return {
          dimensions: outputTensor.shape,
          size: outputTensor.size
        };
      }
      
      // Default fallback for models without explicit output info
      return {
        dimensions: [1, 1000], // Common output shape for classification
        size: 1000
      };
    } catch (error) {
      console.warn(`Could not get output info for model ${modelPath}:`, error);
      return {
        dimensions: [1, 1000],
        size: 1000
      };
    }
  }

  /**
   * Clean up all loaded models and runtime resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up LiteRT.js runtime...');
    
    // Unload all models
    for (const [modelPath, model] of this.loadedModels) {
      if (model && typeof model.delete === 'function') {
        model.delete();
      }
    }
    this.loadedModels.clear();
    
    this.isInitialized = false;
    console.log('✅ LiteRT.js runtime cleaned up');
  }
}

/**
 * Singleton instance of the LiteRT runtime
 */
let runtimeInstance: LiteRTRuntime | null = null;

/**
 * Get the global LiteRT runtime instance
 */
export function getAIRuntime(): LiteRTRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new LiteRTRuntime();
  }
  return runtimeInstance;
}

/**
 * Initialize the global LiteRT runtime
 */
export async function initAIRuntime(wasmPath: string = '/wasm/', jspi: boolean = true): Promise<LiteRTRuntime> {
  const runtime = getAIRuntime();
  await runtime.initialize(wasmPath, jspi);
  return runtime;
}

/**
 * Utility function to preprocess image data for model input
 */
export function preprocessImage(
  imageData: ImageData | HTMLImageElement | HTMLCanvasElement,
  targetWidth: number = 224,
  targetHeight: number = 224,
  normalize: boolean = true
): Float32Array {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  
  // Create canvas if not provided
  if (imageData instanceof HTMLCanvasElement) {
    canvas = imageData;
    ctx = canvas.getContext('2d')!;
  } else {
    canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx = canvas.getContext('2d')!;
    
    // Draw the image
    if (imageData instanceof HTMLImageElement) {
      ctx.drawImage(imageData, 0, 0, targetWidth, targetHeight);
    } else if (imageData instanceof ImageData) {
      ctx.putImageData(imageData, 0, 0);
    }
  }
  
  // Get image data
  const imageDataResult = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageDataResult.data;
  
  // Convert to Float32Array and normalize if needed
  const floatData = new Float32Array(targetWidth * targetHeight * 3);
  
  for (let i = 0; i < data.length; i += 4) {
    const idx = Math.floor(i / 4) * 3;
    
    // RGB to BGR conversion (common for some models)
    floatData[idx] = data[i + 2] / (normalize ? 255.0 : 1.0); // R -> B
    floatData[idx + 1] = data[i + 1] / (normalize ? 255.0 : 1.0); // G -> G
    floatData[idx + 2] = data[i] / (normalize ? 255.0 : 1.0); // B -> R
    
    // If you need RGB order instead, swap the above lines
  }
  
  return floatData;
}

/**
 * Utility function to convert inference results to array
 */
export function tensorToArray(tensor: Tensor): Float32Array {
  return tensor.toTypedArray() as Float32Array;
}

export default LiteRTRuntime;
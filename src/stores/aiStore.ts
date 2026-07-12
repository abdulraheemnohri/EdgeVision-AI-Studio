import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BackendInfo, DeviceInfo, AIConfig } from '../types';
import { getAIRuntime } from '../ai';

interface AIState {
  isInitialized: boolean;
  isLoading: boolean;
  deviceInfo: DeviceInfo | null;
  backends: BackendInfo;
  currentBackend: 'webgpu' | 'webnn' | 'wasm' | 'cpu';
  config: AIConfig;
  error: string | null;
}

interface AIActions {
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setBackends: (backends: BackendInfo) => void;
  setCurrentBackend: (backend: 'webgpu' | 'webnn' | 'wasm' | 'cpu') => void;
  setConfig: (config: Partial<AIConfig>) => void;
  setError: (error: string | null) => void;
  getDeviceInfo: () => Promise<DeviceInfo>;
  checkBackends: () => Promise<BackendInfo>;
  reset: () => void;
}

type AIStore = AIState & AIActions;

const defaultConfig: AIConfig = {
  defaultBackend: 'webgpu',
  threadCount: navigator.hardwareConcurrency || 4,
  precision: 'float32',
  enableGPU: true,
  enableNPU: true,
  enableCPUOptimization: true,
  enableWarmUp: true,
  cacheEnabled: true,
};

const defaultBackends: BackendInfo = {
  cpu: { available: true, initialized: false, supported: true },
  webgpu: { available: false, initialized: false, supported: false },
  webnn: { available: false, initialized: false, supported: false },
  wasm: { available: true, initialized: false, supported: true },
};

const initialState: AIState = {
  isInitialized: false,
  isLoading: false,
  deviceInfo: null,
  backends: defaultBackends,
  currentBackend: 'webgpu',
  config: defaultConfig,
  error: null,
};

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setInitialized: (initialized) => {
        set({ isInitialized: initialized });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setDeviceInfo: (info) => {
        set({ deviceInfo: info });
      },

      setBackends: (backends) => {
        set({ backends });
      },

      setCurrentBackend: (backend) => {
        set({ currentBackend: backend });
        // Also update in runtime
        try {
          getAIRuntime().setAccelerator(backend);
        } catch (error) {
          console.warn('Failed to update runtime backend:', error);
        }
      },

      setConfig: (config) => {
        set({ config: { ...get().config, ...config } });
      },

      setError: (error) => {
        set({ error });
      },

      getDeviceInfo: async () => {
        const runtime = getAIRuntime();
        
        // Check if already have device info
        if (get().deviceInfo) {
          return get().deviceInfo!;
        }

        set({ isLoading: true, error: null });

        try {
          const info: DeviceInfo = {
            browser: {
              name: 'Unknown',
              version: 'Unknown',
              userAgent: navigator.userAgent,
            },
            os: {
              platform: navigator.platform,
              version: 'Unknown',
            },
            cpu: {
              cores: navigator.hardwareConcurrency || 4,
              vendor: 'Unknown',
              architecture: navigator.platform.includes('Win') ? 'x86' : 
                             navigator.platform.includes('Mac') ? 'arm' : 'unknown',
            },
            gpu: {
              vendor: 'Unknown',
              renderer: 'Unknown',
              webgpuSupport: typeof navigator.gpu !== 'undefined',
              webglVersion: 'Unknown',
            },
            memory: {
              total: navigator.deviceMemory ? navigator.deviceMemory * 1024 * 1024 * 1024 : 8 * 1024 * 1024 * 1024,
              used: 0,
              available: 0,
            },
            features: {
              webgpu: typeof navigator.gpu !== 'undefined',
              webnn: typeof navigator.ml !== 'undefined',
              wasm: true,
              serviceWorker: 'serviceWorker' in navigator,
              pwa: 'standalone' in navigator,
              camera: false,
              microphone: false,
              offline: navigator.onLine,
            },
            screen: {
              width: window.screen.width,
              height: window.screen.height,
              pixelRatio: window.devicePixelRatio,
              colorDepth: window.screen.colorDepth,
            },
          };

          // Check for camera and microphone permissions
          try {
            const mediaDevices = navigator.mediaDevices;
            if (mediaDevices) {
              const devices = await mediaDevices.enumerateDevices();
              info.features.camera = devices.some(d => d.kind === 'videoinput');
              info.features.microphone = devices.some(d => d.kind === 'audioinput');
            }
          } catch (error) {
            console.warn('Could not check media devices:', error);
          }

          // Check WebGL version
          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
              const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
              if (debugInfo) {
                info.gpu.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                info.gpu.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
              }
              info.gpu.webglVersion = 'WebGL 1.0';
            }
          } catch (error) {
            console.warn('Could not check WebGL:', error);
          }

          // Check memory info
          if (navigator.deviceMemory) {
            info.memory.total = navigator.deviceMemory * 1024 * 1024 * 1024;
          }

          set({ deviceInfo: info, error: null });
          return info;
        } catch (error) {
          const errorMessage = `Failed to get device info: ${error}`;
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      checkBackends: async () => {
        const runtime = getAIRuntime();
        const backends: BackendInfo = {
          cpu: { available: true, initialized: false, supported: true },
          webgpu: { available: false, initialized: false, supported: false },
          webnn: { available: false, initialized: false, supported: false },
          wasm: { available: true, initialized: false, supported: true },
        };

        set({ isLoading: true, error: null });

        try {
          // Check WebGPU
          backends.webgpu.available = typeof navigator.gpu !== 'undefined';
          backends.webgpu.supported = backends.webgpu.available;

          // Check WebNN
          backends.webnn.available = typeof navigator.ml !== 'undefined';
          backends.webnn.supported = backends.webnn.available;

          // Check WASM (always available)
          backends.wasm.available = true;
          backends.wasm.supported = true;

          // Check CPU (always available)
          backends.cpu.available = true;
          backends.cpu.supported = true;

          // Check if runtime is initialized
          if (runtime.getInitialized()) {
            const availableAccelerators = await runtime.getAvailableAccelerators();
            availableAccelerators.forEach(accel => {
              if (accel in backends) {
                backends[accel as keyof BackendInfo].initialized = true;
              }
            });
          }

          set({ backends, error: null });
          return backends;
        } catch (error) {
          const errorMessage = `Failed to check backends: ${error}`;
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'ai-store',
      partialize: (state) => ({
        config: state.config,
        currentBackend: state.currentBackend,
      }),
    }
  )
);
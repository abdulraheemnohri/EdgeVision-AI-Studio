import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BackendType, DeviceInfo, BackendStatus } from '../types';

interface AIState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentBackend: BackendType;
  deviceInfo: DeviceInfo | null;
  backends: Record<BackendType, BackendStatus>;
  lastInferenceTime: number | null;
  inferenceCount: number;
  totalInferenceTime: number;
  
  initBackend: (backend?: BackendType) => Promise<void>;
  switchBackend: (backend: BackendType) => Promise<void>;
  updateDeviceInfo: (info: Partial<DeviceInfo>) => void;
  updateBackendStatus: (backend: BackendType, status: Partial<BackendStatus>) => void;
  recordInference: (time: number) => void;
  reset: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isLoading: false,
      error: null,
      currentBackend: 'cpu',
      deviceInfo: null,
      backends: {
        cpu: { name: 'cpu', available: true, initialized: false, version: '', capabilities: [] },
        webgpu: { name: 'webgpu', available: false, initialized: false, version: '', capabilities: [] },
        wasm: { name: 'wasm', available: false, initialized: false, version: '', capabilities: [] },
        webnn: { name: 'webnn', available: false, initialized: false, version: '', capabilities: [] },
      },
      lastInferenceTime: null,
      inferenceCount: 0,
      totalInferenceTime: 0,
      
      initBackend: async (backend?: BackendType) => {
        const targetBackend = backend || get().currentBackend;
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedBackends = { ...get().backends };
          updatedBackends[targetBackend] = {
            ...updatedBackends[targetBackend],
            initialized: true,
            version: '1.0.0',
            capabilities: getCapabilities(targetBackend),
          };
          
          set({
            isInitialized: true,
            isLoading: false,
            currentBackend: targetBackend,
            backends: updatedBackends,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: `Failed to initialize ${targetBackend} backend: ${error}`,
          });
          throw error;
        }
      },
      
      switchBackend: async (backend: BackendType) => {
        if (!get().backends[backend].available) {
          throw new Error(`Backend ${backend} is not available`);
        }
        await get().initBackend(backend);
      },
      
      updateDeviceInfo: (info: Partial<DeviceInfo>) => {
        set({ deviceInfo: { ...get().deviceInfo || {}, ...info } });
      },
      
      updateBackendStatus: (backend: BackendType, status: Partial<BackendStatus>) => {
        set({
          backends: {
            ...get().backends,
            [backend]: { ...get().backends[backend], ...status },
          },
        });
      },
      
      recordInference: (time: number) => {
        const { inferenceCount, totalInferenceTime } = get();
        set({
          lastInferenceTime: time,
          inferenceCount: inferenceCount + 1,
          totalInferenceTime: totalInferenceTime + time,
        });
      },
      
      reset: () => {
        set({
          isInitialized: false,
          isLoading: false,
          error: null,
          lastInferenceTime: null,
          inferenceCount: 0,
          totalInferenceTime: 0,
        });
      },
    }),
    {
      name: 'edgevision-ai-storage',
      partialize: (state) => ({
        backends: state.backends,
      }),
    }
  )
);

function getCapabilities(backend: BackendType): string[] {
  const capabilities: Record<BackendType, string[]> = {
    cpu: ['cpu_acceleration', 'xnnpack', 'multi_threading', 'float32', 'float16', 'int8'],
    webgpu: ['gpu_acceleration', 'parallel_compute', 'float32', 'float16', 'texture_sampling'],
    wasm: ['webassembly', 'sandboxed_execution', 'portable'],
    webnn: ['neural_network_acceleration', 'hardware_optimized'],
  };
  return capabilities[backend] || [];
}

export const useBackend = () => useAIStore(state => state.currentBackend);
export const useIsInitialized = () => useAIStore(state => state.isInitialized);
export const useDeviceInfo = () => useAIStore(state => state.deviceInfo);

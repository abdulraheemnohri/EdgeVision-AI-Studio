import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelMetadata, ModelFilter, ModelStats } from '../types';

interface ModelState {
  models: ModelMetadata[];
  folders: string[];
  filter: ModelFilter;
  selectedModels: string[];
  isLoading: boolean;
  error: string | null;
}

interface ModelActions {
  // Model CRUD operations
  addModel: (model: ModelMetadata) => Promise<void>;
  removeModel: (modelId: string) => Promise<void>;
  updateModel: (modelId: string, updates: Partial<ModelMetadata>) => Promise<void>;
  duplicateModel: (modelId: string) => Promise<void>;
  
  // Folder operations
  createFolder: (folderName: string) => void;
  deleteFolder: (folderName: string) => void;
  renameFolder: (oldName: string, newName: string) => void;
  
  // Filter operations
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string) => void;
  setShowFavorites: (show: boolean) => void;
  setCurrentFolder: (folder: string | null) => void;
  
  // Selection operations
  toggleModelSelection: (modelId: string) => void;
  selectAllModels: () => void;
  clearSelection: () => void;
  
  // Utility functions
  getFilteredModels: () => ModelMetadata[];
  getTotalStorage: () => number;
  getStats: () => ModelStats;
  getModelById: (modelId: string) => ModelMetadata | undefined;
  
  // Reset
  reset: () => void;
}

type ModelStore = ModelState & ModelActions;

const initialState: ModelState = {
  models: [],
  folders: [],
  filter: {
    searchQuery: '',
    filterType: 'all',
    showFavorites: false,
    currentFolder: null,
  },
  selectedModels: [],
  isLoading: false,
  error: null,
};

// Sample models for development
const sampleModels: ModelMetadata[] = [
  {
    id: 'mobilenet-v2',
    name: 'MobileNet V2',
    description: 'Lightweight image classification model optimized for mobile devices',
    author: 'TensorFlow',
    version: '1.0',
    modelType: 'image_classification',
    inputShape: { dimensions: [1, 224, 224, 3], size: 224 * 224 * 3 },
    outputShape: { dimensions: [1, 1000], size: 1000 },
    inputTensorCount: 1,
    outputTensorCount: 1,
    parameters: 3504872,
    quantization: 'float32',
    size: 14 * 1024 * 1024, // 14MB
    filePath: '/models/mobilenet_v2_1.0_224.tflite',
    dateImported: new Date(),
    isFavorite: true,
    folder: null,
    supportedBackends: ['cpu', 'webgpu', 'wasm'],
    labels: ['classification', 'vision', 'mobile'],
  },
  {
    id: 'yolo-v8',
    name: 'YOLO v8',
    description: 'Real-time object detection model with high accuracy',
    author: 'Ultralytics',
    version: '8.0',
    modelType: 'object_detection',
    inputShape: { dimensions: [1, 640, 640, 3], size: 640 * 640 * 3 },
    outputShape: { dimensions: [1, 84, 8400], size: 84 * 8400 },
    inputTensorCount: 1,
    outputTensorCount: 1,
    parameters: 6820961,
    quantization: 'int8',
    size: 25 * 1024 * 1024, // 25MB
    filePath: '/models/yolov8n_int8.tflite',
    dateImported: new Date(Date.now() - 86400000), // Yesterday
    isFavorite: true,
    folder: null,
    supportedBackends: ['cpu', 'webgpu', 'webnn'],
    labels: ['detection', 'vision', 'real-time'],
  },
  {
    id: 'ocr-model',
    name: 'OCR Model',
    description: 'Optical Character Recognition model for text detection and recognition',
    author: 'Google',
    version: '1.0',
    modelType: 'ocr',
    inputShape: { dimensions: [1, 320, 320, 3], size: 320 * 320 * 3 },
    outputShape: { dimensions: [1, 100, 4], size: 100 * 4 },
    inputTensorCount: 1,
    outputTensorCount: 1,
    parameters: 2475961,
    quantization: 'int8',
    size: 8 * 1024 * 1024, // 8MB
    filePath: '/models/ocr_int8.tflite',
    dateImported: new Date(Date.now() - 172800000), // 2 days ago
    isFavorite: false,
    folder: 'Text',
    supportedBackends: ['cpu', 'webgpu'],
    labels: ['ocr', 'text', 'recognition'],
  },
];

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      models: sampleModels,

      addModel: async (model: ModelMetadata) => {
        set({ isLoading: true, error: null });
        try {
          // Check if folder exists
          if (model.folder && !get().folders.includes(model.folder)) {
            set({ folders: [...get().folders, model.folder] });
          }
          
          set({ 
            models: [...get().models, model],
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: `Failed to add model: ${error}`, 
            isLoading: false 
          });
        }
      },

      removeModel: async (modelId: string) => {
        set({ isLoading: true, error: null });
        try {
          const models = get().models.filter(m => m.id !== modelId);
          set({ models, isLoading: false });
        } catch (error) {
          set({ 
            error: `Failed to remove model: ${error}`, 
            isLoading: false 
          });
        }
      },

      updateModel: async (modelId: string, updates: Partial<ModelMetadata>) => {
        set({ isLoading: true, error: null });
        try {
          const models = get().models.map(model =>
            model.id === modelId ? { ...model, ...updates } : model
          );
          set({ models, isLoading: false });
        } catch (error) {
          set({ 
            error: `Failed to update model: ${error}`, 
            isLoading: false 
          });
        }
      },

      duplicateModel: async (modelId: string) => {
        const model = get().models.find(m => m.id === modelId);
        if (!model) return;
        
        set({ isLoading: true, error: null });
        try {
          const duplicatedModel: ModelMetadata = {
            ...model,
            id: `${model.id}-copy-${Date.now()}`,
            name: `${model.name} (Copy)`,
            dateImported: new Date(),
            isFavorite: false,
          };
          
          await get().addModel(duplicatedModel);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: `Failed to duplicate model: ${error}`, 
            isLoading: false 
          });
        }
      },

      createFolder: (folderName: string) => {
        if (!get().folders.includes(folderName)) {
          set({ folders: [...get().folders, folderName] });
        }
      },

      deleteFolder: (folderName: string) => {
        // Move models out of folder first
        const models = get().models.map(model =>
          model.folder === folderName ? { ...model, folder: null } : model
        );
        
        const folders = get().folders.filter(f => f !== folderName);
        set({ models, folders });
      },

      renameFolder: (oldName: string, newName: string) => {
        if (oldName === newName) return;
        
        const models = get().models.map(model =>
          model.folder === oldName ? { ...model, folder: newName } : model
        );
        
        const folders = get().folders.map(folder =>
          folder === oldName ? newName : folder
        );
        
        set({ models, folders });
      },

      setSearchQuery: (query: string) => {
        set({ 
          filter: { 
            ...get().filter, 
            searchQuery: query 
          } 
        });
      },

      setFilterType: (type: string) => {
        set({ 
          filter: { 
            ...get().filter, 
            filterType: type 
          } 
        });
      },

      setShowFavorites: (show: boolean) => {
        set({ 
          filter: { 
            ...get().filter, 
            showFavorites: show 
          } 
        });
      },

      setCurrentFolder: (folder: string | null) => {
        set({ 
          filter: { 
            ...get().filter, 
            currentFolder: folder 
          } 
        });
      },

      toggleModelSelection: (modelId: string) => {
        const selectedModels = get().selectedModels;
        const newSelection = selectedModels.includes(modelId)
          ? selectedModels.filter(id => id !== modelId)
          : [...selectedModels, modelId];
        set({ selectedModels: newSelection });
      },

      selectAllModels: () => {
        const filteredModels = get().getFilteredModels();
        const modelIds = filteredModels.map(model => model.id);
        set({ selectedModels: modelIds });
      },

      clearSelection: () => {
        set({ selectedModels: [] });
      },

      getFilteredModels: () => {
        const { models, filter } = get();
        const { searchQuery, filterType, showFavorites, currentFolder } = filter;
        
        return models.filter(model => {
          // Folder filter
          if (currentFolder && model.folder !== currentFolder) return false;
          
          // Favorites filter
          if (showFavorites && !model.isFavorite) return false;
          
          // Type filter
          if (filterType !== 'all' && model.modelType !== filterType) return false;
          
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = model.name.toLowerCase().includes(query);
            const matchesDescription = model.description.toLowerCase().includes(query);
            const matchesAuthor = model.author.toLowerCase().includes(query);
            const matchesLabels = model.labels?.some(l => l.toLowerCase().includes(query));
            
            if (!matchesName && !matchesDescription && !matchesAuthor && !matchesLabels) {
              return false;
            }
          }
          
          return true;
        });
      },

      getTotalStorage: () => {
        const { models } = get();
        return models.reduce((total, model) => total + model.size, 0);
      },

      getStats: () => {
        const { models } = get();
        const stats: ModelStats = {
          totalModels: models.length,
          totalStorage: get().getTotalStorage(),
          byType: {} as Record<string, number>,
          byQuantization: {} as Record<string, number>,
          favoriteCount: 0,
        };
        
        models.forEach(model => {
          // Count by type
          stats.byType[model.modelType] = (stats.byType[model.modelType] || 0) + 1;
          
          // Count by quantization
          stats.byQuantization[model.quantization] = (stats.byQuantization[model.quantization] || 0) + 1;
          
          // Count favorites
          if (model.isFavorite) {
            stats.favoriteCount++;
          }
        });
        
        return stats;
      },

      getModelById: (modelId: string) => {
        return get().models.find(model => model.id === modelId);
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'model-store',
      partialize: (state) => ({
        models: state.models,
        folders: state.folders,
      }),
    }
  )
);
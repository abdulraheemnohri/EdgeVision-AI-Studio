import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelMetadata, ModelType } from '../types';

interface ModelState {
  models: ModelMetadata[];
  isLoading: boolean;
  error: string | null;
  folders: string[];
  currentFolder: string | null;
  searchQuery: string;
  filterType: ModelType | 'all';
  showFavorites: boolean;
  selectedModels: string[];
  
  loadModels: () => Promise<void>;
  addModel: (model: ModelMetadata) => Promise<void>;
  removeModel: (modelId: string) => Promise<void>;
  updateModel: (modelId: string, updates: Partial<ModelMetadata>) => Promise<void>;
  duplicateModel: (modelId: string) => Promise<void>;
  createFolder: (name: string) => void;
  setCurrentFolder: (folder: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: ModelType | 'all') => void;
  setShowFavorites: (show: boolean) => void;
  setSelectedModels: (ids: string[]) => void;
  toggleModelSelection: (id: string) => void;
  getModelById: (id: string) => ModelMetadata | undefined;
  getModelsByFolder: (folder: string) => ModelMetadata[];
  getFavoriteModels: () => ModelMetadata[];
  getModelsByType: (type: ModelType) => ModelMetadata[];
  getTotalStorage: () => number;
  reset: () => void;
}

const sampleModels: ModelMetadata[] = [
  {
    id: 'yolo-v8-nano',
    name: 'YOLOv8 Nano',
    description: 'Ultra-lightweight object detection model for edge devices',
    author: 'Ultralytics',
    version: '8.0',
    modelType: 'object_detection',
    inputShape: { dimensions: [1, 3, 640, 640], size: 3 * 640 * 640 },
    outputShape: { dimensions: [1, 84, 8400], size: 84 * 8400 },
    inputTensorCount: 1,
    outputTensorCount: 1,
    parameters: 3200000,
    quantization: 'int8',
    size: 2800000,
    filePath: '/models/yolo-v8-nano.tflite',
    labels: ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat'],
    dateImported: new Date(),
    isFavorite: true,
    folder: 'Object Detection',
    supportedBackends: ['cpu', 'webgpu', 'wasm'],
  },
];

export const useModelStore = create<ModelState>()(
  persist(
    (set, get) => ({
      models: sampleModels,
      isLoading: false,
      error: null,
      folders: ['Object Detection', 'Image Classification', 'Face Analysis', 'Image Processing'],
      currentFolder: null,
      searchQuery: '',
      filterType: 'all',
      showFavorites: false,
      selectedModels: [],
      
      loadModels: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 300));
        set({ isLoading: false });
      },
      
      addModel: async (model: ModelMetadata) => {
        set({ isLoading: true });
        try {
          const models = [...get().models, model];
          if (model.folder && !get().folders.includes(model.folder)) {
            get().createFolder(model.folder);
          }
          set({ models, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: `Failed to add model: ${error}` });
        }
      },
      
      removeModel: async (modelId: string) => {
        set({ isLoading: true });
        try {
          const models = get().models.filter(m => m.id !== modelId);
          set({
            models,
            isLoading: false,
            selectedModels: get().selectedModels.filter(id => id !== modelId),
          });
        } catch (error) {
          set({ isLoading: false, error: `Failed to remove model: ${error}` });
        }
      },
      
      updateModel: async (modelId: string, updates: Partial<ModelMetadata>) => {
        set({ isLoading: true });
        try {
          const models = get().models.map(m =>
            m.id === modelId ? { ...m, ...updates } : m
          );
          set({ models, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: `Failed to update model: ${error}` });
        }
      },
      
      duplicateModel: async (modelId: string) => {
        const model = get().getModelById(modelId);
        if (!model) return;
        set({ isLoading: true });
        try {
          const duplicatedModel: ModelMetadata = {
            ...model,
            id: `${model.id}-copy-${Date.now()}`,
            name: `${model.name} (Copy), 
            filePath: model.filePath.replace('.tflite', `-copy-${Date.now()}.tflite`),
            dateImported: new Date(),
            isFavorite: false,
          };
          const models = [...get().models, duplicatedModel];
          set({ models, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: `Failed to duplicate model: ${error}` });
        }
      },
      
      createFolder: (name: string) => {
        if (!get().folders.includes(name)) {
          set({ folders: [...get().folders, name] });
        }
      },
      
      setCurrentFolder: (folder: string | null) => {
        set({ currentFolder: folder });
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },
      
      setFilterType: (type: ModelType | 'all') => {
        set({ filterType: type });
      },
      
      setShowFavorites: (show: boolean) => {
        set({ showFavorites: show });
      },
      
      setSelectedModels: (ids: string[]) => {
        set({ selectedModels: ids });
      },
      
      toggleModelSelection: (id: string) => {
        const selectedModels = get().selectedModels;
        const newSelection = selectedModels.includes(id)
          ? selectedModels.filter(mid => mid !== id)
          : [...selectedModels, id];
        set({ selectedModels: newSelection });
      },
      
      getModelById: (id: string) => {
        return get().models.find(m => m.id === id);
      },
      
      getModelsByFolder: (folder: string) => {
        return get().models.filter(m => m.folder === folder);
      },
      
      getFavoriteModels: () => {
        return get().models.filter(m => m.isFavorite);
      },
      
      getModelsByType: (type: ModelType) => {
        return get().models.filter(m => m.modelType === type);
      },
      
      getTotalStorage: () => {
        return get().models.reduce((total, model) => total + model.size, 0);
      },
      
      reset: () => {
        set({
          models: [],
          isLoading: false,
          error: null,
          folders: [],
          currentFolder: null,
          searchQuery: '',
          filterType: 'all',
          showFavorites: false,
          selectedModels: [],
        });
      },
    }),
    {
      name: 'edgevision-model-storage',
      partialize: (state) => ({
        models: state.models,
        folders: state.folders,
      }),
    }
  )
);

export const useModels = () => useModelStore(state => state.models);
export const useFilteredModels = () => {
  const { models, searchQuery, filterType, showFavorites, currentFolder } = useModelStore();
  return models.filter(model => {
    if (currentFolder && model.folder !== currentFolder) return false;
    if (showFavorites && !model.isFavorite) return false;
    if (filterType !== 'all' && model.modelType !== filterType) return false;
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
};

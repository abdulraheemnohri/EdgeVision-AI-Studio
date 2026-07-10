import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModelStore } from '../stores/modelStore';
import { useAIStore } from '../stores/aiStore';
import { ModelMetadata, ModelType } from '../types';
import { formatBytes, formatDate, generateId } from '../utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/Sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/DropdownMenu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../components/ui/Tooltip';
import { Plus, Search, MoreVertical, Folder, Grid3X3, List, Star, Trash2, Edit2, Copy, Download, Upload, Eye, Filter, SortAsc, SortDesc, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ModelManager() {
  const navigate = useNavigate();
  const { 
    models, 
    folders, 
    currentFolder, 
    searchQuery, 
    filterType, 
    showFavorites,
    selectedModels,
    setSearchQuery,
    setFilterType,
    setShowFavorites,
    setCurrentFolder,
    toggleModelSelection,
    removeModel,
    duplicateModel,
    addModel,
    createFolder,
    isLoading
  } = useModelStore();
  
  const { currentBackend } = useAIStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newModelDialogOpen, setNewModelDialogOpen] = useState(false);
  const [importModelDialogOpen, setImportModelDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Sort models
  const sortedModels = [...models].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = b.dateImported.getTime() - a.dateImported.getTime();
        break;
      case 'size':
        comparison = b.size - a.size;
        break;
      case 'type':
        comparison = a.modelType.localeCompare(b.modelType);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter models based on current filters
  const filteredModels = sortedModels.filter(model => {
    // Folder filter
    if (currentFolder && model.folder !== currentFolder) return false;
    
    // Favorites filter
    if (showFavorites && !model.isFavorite) return false;
    
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

  // Model type options
  const modelTypeOptions: { value: ModelType | 'all'; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Types', icon: <Grid3X3 size={14} /> },
    { value: 'object_detection', label: 'Object Detection', icon: <Eye size={14} /> },
    { value: 'image_classification', label: 'Image Classification', icon: <ImageIcon size={14} /> },
    { value: 'segmentation', label: 'Segmentation', icon: <Grid3X3 size={14} /> },
    { value: 'pose_detection', label: 'Pose Detection', icon: <Eye size={14} /> },
    { value: 'face_detection', label: 'Face Detection', icon: <Eye size={14} /> },
    { value: 'ocr', label: 'OCR', icon: <FileText size={14} /> },
    { value: 'depth_estimation', label: 'Depth Estimation', icon: <Eye size={14} /> },
    { value: 'super_resolution', label: 'Super Resolution', icon: <Grid3X3 size={14} /> },
    { value: 'audio_classification', label: 'Audio Classification', icon: <Mic2 size={14} /> },
    { value: 'speech_recognition', label: 'Speech Recognition', icon: <Mic2 size={14} /> },
    { value: 'text_generation', label: 'Text Generation', icon: <FileText size={14} /> },
    { value: 'embedding', label: 'Embedding', icon: <Grid3X3 size={14} /> },
    { value: 'custom', label: 'Custom', icon: <Grid3X3 size={14} /> },
  ];

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date Imported' },
    { value: 'size', label: 'Size' },
    { value: 'type', label: 'Type' },
  ];

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  // Handle model import
  const handleImportModel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;
      
      const newModel: ModelMetadata = {
        id: generateId(),
        name: file.name.replace('.tflite', ''),
        description: `Imported on ${new Date().toLocaleDateString()}`,
        author: 'User',
        version: '1.0',
        modelType: 'custom',
        inputShape: { dimensions: [1, 3, 224, 224], size: 3 * 224 * 224 },
        outputShape: { dimensions: [1, 1000], size: 1000 },
        inputTensorCount: 1,
        outputTensorCount: 1,
        parameters: 0,
        quantization: 'float32',
        size: file.size,
        filePath: `/models/${file.name}`,
        dateImported: new Date(),
        isFavorite: false,
        folder: currentFolder || null,
        supportedBackends: ['cpu', 'webgpu', 'wasm'],
      };
      
      await addModel(newModel);
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      files.forEach(file => {
        if (file.name.endsWith('.tflite')) {
          handleImportModel(file);
        }
      });
    }
  };

  // Toggle favorite
  const toggleFavorite = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      useModelStore.getState().updateModel(modelId, { isFavorite: !model.isFavorite });
    }
  };

  // Delete selected models
  const deleteSelectedModels = () => {
    if (selectedModels.length === 0) return;
    
    selectedModels.forEach(modelId => {
      removeModel(modelId);
    });
  };

  // Clear selection
  const clearSelection = () => {
    selectedModels.forEach(modelId => {
      toggleModelSelection(modelId);
    });
  };

  // Get model type color
  const getModelTypeColor = (type: ModelType) => {
    const colors: Record<ModelType, string> = {
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
  };

  // Get model type icon
  const getModelTypeIcon = (type: ModelType) => {
    const icons: Record<ModelType, React.ReactNode> = {
      object_detection: <Eye size={16} />,
      image_classification: <Grid3X3 size={16} />,
      segmentation: <Grid3X3 size={16} />,
      pose_detection: <Eye size={16} />,
      face_detection: <Eye size={16} />,
      ocr: <FileText size={16} />,
      depth_estimation: <Eye size={16} />,
      super_resolution: <Grid3X3 size={16} />,
      audio_classification: <Mic2 size={16} />,
      speech_recognition: <Mic2 size={16} />,
      text_generation: <FileText size={16} />,
      embedding: <Grid3X3 size={16} />,
      custom: <Grid3X3 size={16} />,
    };
    return icons[type] || <Grid3X3 size={16} />;
  };

  // Format date
  const formatDateRelative = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  // Total storage
  const totalStorage = models.reduce((total, model) => total + model.size, 0);

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Model Manager</h1>
              <p className="text-muted-foreground mt-1">
                Manage your AI models for on-device inference
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportModelDialogOpen(true)}
                className="gap-2"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">New Model</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              {/* First Row - Search and View Toggle */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <X size={16} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        className="w-8 h-8"
                      >
                        <Grid3X3 size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Grid View</span>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        className="w-8 h-8"
                      >
                        <List size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>List View</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Second Row - Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Folder Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Folder size={14} />
                      <span className="hidden sm:inline">{currentFolder || 'All Folders'}</span>
                      <ChevronDown size={14} className="hidden sm:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setCurrentFolder(null)}>
                      <Folder size={14} className="mr-2" />
                      All Folders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder}
                        onClick={() => setCurrentFolder(folder)}
                        className={currentFolder === folder ? 'bg-muted' : ''}
                      >
                        <Folder size={14} className="mr-2" />
                        {folder}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setNewFolderDialogOpen(true)} className="text-green-600">
                      <Plus size={14} className="mr-2" />
                      New Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Type Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter size={14} />
                      <span className="hidden sm:inline">{modelTypeOptions.find(o => o.value === filterType)?.label || 'All Types'}</span>
                      <ChevronDown size={14} className="hidden sm:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {modelTypeOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        className={filterType === option.value ? 'bg-muted' : ''}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SortAsc size={14} />
                      <span className="hidden sm:inline">Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                      <ChevronDown size={14} className="hidden sm:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value as any)}
                        className={sortBy === option.value ? 'bg-muted' : ''}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <span className="ml-auto">
                            {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      Order: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Favorites Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showFavorites ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setShowFavorites(!showFavorites)}
                      className="gap-2"
                    >
                      <Star size={14} className={showFavorites ? 'fill-yellow-500 text-yellow-500' : ''} />
                      <span className="hidden sm:inline">Favorites</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Show only favorites</span>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Selected Actions */}
              <AnimatePresence>
                {selectedModels.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 mt-4 pt-4 border-t border-border"
                  >
                    <span className="text-sm text-muted-foreground">
                      {selectedModels.length} selected
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="gap-2"
                      >
                        <X size={14} />
                        Clear
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {}}
                        className="gap-2"
                      >
                        <Download size={14} />
                        Export
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteSelectedModels}
                        className="gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Storage Usage</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(totalStorage)} used by {models.length} models
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 size={14} />
                    Clean Up
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download size={14} />
                    Backup
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex gap-2 text-sm text-muted-foreground mb-2">
                  <span>0%</span>
                  <span className="flex-1 text-center">50%</span>
                  <span>100%</span>
                </div>
                <Progress
                  value={Math.min((totalStorage / (500 * 1024 * 1024)) * 100, 100)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Models Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            'relative min-h-96',
            isDragging && 'bg-muted/50 rounded-lg'
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
            )}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="h-48">
                  <CardContent className="h-full">
                    <div className="h-full animate-pulse bg-muted/50 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredModels.length > 0 ? (
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
            )}>
              {filteredModels.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  {viewMode === 'grid' ? (
                    <ModelCard
                      model={model}
                      isSelected={selectedModels.includes(model.id)}
                      onSelect={toggleModelSelection}
                      onFavorite={toggleFavorite}
                      onClick={() => navigate(`/models/${model.id}`)}
                    />
                  ) : (
                    <ModelRow
                      model={model}
                      isSelected={selectedModels.includes(model.id)}
                      onSelect={toggleModelSelection}
                      onFavorite={toggleFavorite}
                      onClick={() => navigate(`/models/${model.id}`)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Folder size={64} className="mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No models found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterType !== 'all' || showFavorites || currentFolder
                    ? 'Try adjusting your filters'
                    : 'Import your first model to get started'}
                </p>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => setImportModelDialogOpen(true)}
                    className="gap-2"
                  >
                    <Upload size={16} />
                    Import Model
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewFolderDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    New Folder
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Drag and Drop Overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg border-2 border-dashed border-border"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium">Drop .tflite files here</p>
                  <p className="text-sm text-muted-foreground">
                    to import models
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* New Folder Dialog */}
        <Sheet open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
          <SheetContent side="right" className="w-96">
            <SheetHeader>
              <SheetTitle>Create New Folder</SheetTitle>
              <SheetDescription>
                Organize your models by creating folders
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create Folder
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Import Model Dialog */}
        <Sheet open={importModelDialogOpen} onOpenChange={setImportModelDialogOpen}>
          <SheetContent side="right" className="w-96">
            <SheetHeader>
              <SheetTitle>Import Model</SheetTitle>
              <SheetDescription>
                Upload a .tflite model file
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Drag and drop .tflite file here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <input
                  type="file"
                  accept=".tflite"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImportModel(e.target.files[0]);
                      setImportModelDialogOpen(false);
                    }
                  }}
                  className="hidden"
                  id="model-upload"
                />
                <label htmlFor="model-upload">
                  <Button size="sm" className="gap-2">
                    <Upload size={16} />
                    Browse Files
                  </Button>
                </label>
              </div>
              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Supported formats:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>.tflite (TensorFlow Lite)</li>
                  <li>Quantized models (int8, float16)</li>
                  <li>Full precision models (float32)</li>
                </ul>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

// Model Card Component (Grid View)
function ModelCard({ 
  model, 
  isSelected, 
  onSelect, 
  onFavorite,
  onClick
}: { 
  model: ModelMetadata; 
  isSelected: boolean; 
  onSelect: (id: string) => void; 
  onFavorite: (id: string) => void;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className={cn(
        'h-full cursor-pointer transition-all card-hover',
        isSelected && 'ring-2 ring-primary',
        hovered && 'shadow-md'
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getModelTypeColor(model.modelType)} flex items-center justify-center flex-shrink-0`}>
              {getModelTypeIcon(model.modelType)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{model.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{model.author}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(model.id);
              }}
            >
              <Star 
                size={14} 
                className={cn(model.isFavorite && 'fill-yellow-500 text-yellow-500')}
              />
            </Button>
            <ModelActions model={model} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {model.modelType.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {model.quantization}
            </Badge>
            {model.folder && (
              <Badge variant="secondary" className="text-xs">
                {model.folder}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <HardDrive size={12} />
              <span>{formatBytes(model.size)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={12} />
              <span>{formatDateRelative(model.dateImported)}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {model.supportedBackends.slice(0, 3).map((backend) => (
              <Tooltip key={backend}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    backend === 'cpu' ? 'bg-blue-500' :
                    backend === 'webgpu' ? 'bg-green-500' :
                    backend === 'wasm' ? 'bg-purple-500' : 'bg-orange-500'
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <span>{backend.toUpperCase()}</span>
                </TooltipContent>
              </Tooltip>
            ))}
            {model.supportedBackends.length > 3 && (
              <span className="text-xs text-muted-foreground">+{model.supportedBackends.length - 3}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Model Row Component (List View)
function ModelRow({ 
  model, 
  isSelected, 
  onSelect, 
  onFavorite,
  onClick
}: { 
  model: ModelMetadata; 
  isSelected: boolean; 
  onSelect: (id: string) => void; 
  onFavorite: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted ring-1 ring-primary'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(model.id);
          }}
        >
          <Star 
            size={14} 
            className={cn(model.isFavorite && 'fill-yellow-500 text-yellow-500')}
          />
        </Button>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getModelTypeColor(model.modelType)} flex items-center justify-center flex-shrink-0`}>
          {getModelTypeIcon(model.modelType)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{model.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{model.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {model.modelType.replace('_', ' ')}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {model.quantization}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{formatBytes(model.size)}</span>
        <span className="text-sm text-muted-foreground hidden md:inline">{formatDateRelative(model.dateImported)}</span>
        <ModelActions model={model} />
      </div>
    </div>
  );
}

// Model Actions Component
function ModelActions({ model }: { model: ModelMetadata }) {
  const { removeModel, duplicateModel } = useModelStore();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="gap-2">
          <Eye size={14} />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async (e) => {
          e.stopPropagation();
          await duplicateModel(model.id);
        }} className="gap-2">
          <Copy size={14} />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="gap-2">
          <Edit2 size={14} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="gap-2">
          <Download size={14} />
          Export
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async (e) => {
          e.stopPropagation();
          await removeModel(model.id);
        }} className="gap-2 text-destructive">
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Import icons
import { HardDrive, Clock, Mic2, FileText, ImageIcon } from 'lucide-react';

// Utility function
import { cn } from '../utils/cn';

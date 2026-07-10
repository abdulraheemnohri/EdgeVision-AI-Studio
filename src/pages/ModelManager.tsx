import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModelStore } from '../stores/modelStore';
import { formatBytes, generateId } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../components/ui/Sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/DropdownMenu';
import { Folder, Grid3X3, List, Search, Plus, Upload, Star, MoreVertical, Trash2 } from 'lucide-react';

export function ModelManager() {
  const { models, folders, currentFolder, searchQuery, filterType, showFavorites, selectedModels, setSearchQuery, setCurrentFolder, toggleModelSelection, removeModel, addModel } = useModelStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [importModelDialogOpen, setImportModelDialogOpen] = useState(false);

  const filteredModels = models.filter(model => {
    if (currentFolder && model.folder !== currentFolder) return false;
    if (showFavorites && !model.isFavorite) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!model.name.toLowerCase().includes(query) && !model.description.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      useModelStore.getState().createFolder(newFolderName.trim());
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  const handleImportModel = async (file: File) => {
    const newModel = {
      id: generateId(),
      name: file.name.replace('.tflite', ''),
      description: 'Imported model',
      author: 'User',
      version: '1.0',
      modelType: 'custom' as const,
      inputShape: { dimensions: [1, 3, 224, 224], size: 3 * 224 * 224 },
      outputShape: { dimensions: [1, 1000], size: 1000 },
      inputTensorCount: 1,
      outputTensorCount: 1,
      parameters: 0,
      quantization: 'float32' as const,
      size: file.size,
      filePath: `/models/${file.name}`,
      dateImported: new Date(),
      isFavorite: false,
      folder: currentFolder || null,
      supportedBackends: ['cpu', 'webgpu', 'wasm'],
    };
    await addModel(newModel);
  };

  const toggleFavorite = (modelId: string) => {
    const model = useModelStore.getState().getModelById(modelId);
    if (model) {
      useModelStore.getState().updateModel(modelId, { isFavorite: !model.isFavorite });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Model Manager</h1>
          <p className="text-muted-foreground">Manage your AI models for on-device inference</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModelDialogOpen(true)}><Upload size={14} className="mr-2" />Import</Button>
          <Button size="sm"><Plus size={14} className="mr-2" />New Model</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="text" placeholder="Search models..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-32 justify-between"><Folder size={14} /><span className="ml-2">{currentFolder || 'All Folders'}</span></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setCurrentFolder(null)}>All Folders</DropdownMenuItem>
                <DropdownMenuSeparator />
                {folders.map((folder) => <DropdownMenuItem key={folder} onClick={() => setCurrentFolder(folder)}>{folder}</DropdownMenuItem>)}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setNewFolderDialogOpen(true)} className="text-green-600"><Plus size={14} className="mr-2" />New Folder</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant={showFavorites ? 'secondary' : 'outline'} size="sm" onClick={() => useModelStore.getState().setShowFavorites(!showFavorites)}>
              <Star size={14} className={showFavorites ? 'fill-yellow-500 text-yellow-500' : ''} /><span className="ml-2">Favorites</span>
            </Button>
            <div className="flex gap-1 ml-auto">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><Grid3X3 size={16} /></Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List size={16} /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Storage Usage</h3>
              <p className="text-sm text-muted-foreground">{formatBytes(models.reduce((total, model) => total + model.size, 0))} used by {models.length} models</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <motion.div key={model.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {viewMode === 'grid' ? (
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
                        <div>
                          <h3 className="font-medium truncate">{model.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{model.author}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleFavorite(model.id)}>
                        <Star size={14} className={model.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">{model.modelType.replace('_', ' ')}</Badge>
                        <Badge variant="secondary" className="text-xs">{model.quantization}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">{formatBytes(model.size)}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted">
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleFavorite(model.id)}>
                    <Star size={14} className={model.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''} />
                  </Button>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{model.modelType.replace('_', ' ')}</Badge>
                  <span className="text-sm text-muted-foreground">{formatBytes(model.size)}</span>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
            <Folder size={64} className="mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">No models found</h3>
            <p className="text-muted-foreground mt-1">{searchQuery || currentFolder ? 'Try adjusting your filters' : 'Import your first model to get started'}</p>
            <Button size="sm" className="mt-4" onClick={() => setImportModelDialogOpen(true)}><Upload size={14} className="mr-2" />Import Model</Button>
          </div>
        )}
      </div>

      <Sheet open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Create New Folder</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Input placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create Folder</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={importModelDialogOpen} onOpenChange={setImportModelDialogOpen}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Import Model</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Drag and drop .tflite file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <input type="file" accept=".tflite" onChange={(e) => { if (e.target.files?.[0]) { handleImportModel(e.target.files[0]); setImportModelDialogOpen(false); } }} className="hidden" id="model-upload" />
              <label htmlFor="model-upload"><Button size="sm"><Upload size={14} className="mr-2" />Browse Files</Button></label>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { Bot } from 'lucide-react';
import { cn } from '../utils/cn';

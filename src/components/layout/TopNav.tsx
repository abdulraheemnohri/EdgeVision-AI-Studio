import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/ThemeProvider';
import { useAIStore } from '../../stores/aiStore';
import { useModelStore } from '../../stores/modelStore';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet';
import { Menu, Search, Bell, Settings, Plus, User, ChevronDown, LayoutDashboard, Bot, Image, Eye, Mic, FileText, BarChart3, Pipeline, Code, Database } from 'lucide-react';

const TOP_NAV_HEIGHT = 60;

export function TopNav() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { currentBackend, backends, settings } = useAIStore();
  const { models, folders, currentFolder, searchQuery, setSearchQuery, setCurrentFolder } = useModelStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { setSearchValue(searchQuery); }, [searchQuery]);

  const handleSearch = (value: string) => { setSearchValue(value); setSearchQuery(value); };
  const clearSearch = () => { setSearchValue(''); setSearchQuery(''); };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'Dashboard', '/playground': 'AI Playground', '/models': 'Model Manager',
      '/object-detection': 'Object Detection', '/image-classification': 'Image Classification',
      '/ocr': 'OCR', '/face-analysis': 'Face Analysis', '/pose-detection': 'Pose Detection',
      '/image-segmentation': 'Image Segmentation', '/depth-estimation': 'Depth Estimation',
      '/super-resolution': 'Super Resolution', '/audio-ai': 'Audio AI',
      '/semantic-search': 'Semantic Search', '/ai-chat': 'AI Chat',
      '/benchmark': 'Benchmark Center', '/datasets': 'Dataset Explorer',
      '/pipeline-builder': 'Pipeline Builder', '/developer': 'Developer Studio',
      '/batch-processing': 'Batch Processing', '/storage': 'Storage Manager',
      '/settings': 'Settings',
    };
    return titles[path] || path.substring(1).split('/').pop() || 'EdgeVision AI Studio';
  };

  const getBackendStatusColor = (backend: string) => {
    if (!backends[backend as keyof typeof backends]?.initialized) return 'bg-muted-foreground';
    return 'bg-green-500';
  };

  const folderItems = [{ label: 'All Models', value: null }, ...folders.map(folder => ({ label: folder, value: folder }))];

  return (
    <header className={cn('fixed top-0 right-0 z-40 h-16 bg-background/80 backdrop-blur-lg border-b border-border', 'md:left-[var(--side-nav-width)] md:w-[calc(100%-var(--side-nav-width))]', isMobile ? 'left-0 w-full' : 'left-[var(--side-nav-collapsed-width)] w-[calc(100%-var(--side-nav-collapsed-width))]')} style={{ height: TOP_NAV_HEIGHT }}>
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu size={20} /></Button></SheetTrigger>
              <SheetContent side="left" className="w-64 p-0"><div className="p-4"><h2 className="font-semibold">EdgeVision AI</h2></div></SheetContent>
            </Sheet>
          )}
          <AnimatePresence>
            {isSearchOpen ? (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" placeholder="Search models..." value={searchValue} onChange={(e) => handleSearch(e.target.value)} className="pl-10 pr-10 h-9 bg-muted/50 border-none focus:ring-0" autoFocus />
                  {searchValue && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">×</button>}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
                <div className="flex items-center gap-2"><h1 className="font-semibold text-lg truncate">{getPageTitle()}</h1></div>
                {!isMobile && location.pathname === '/models' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8">{currentFolder || 'All Models'}<ChevronDown className="ml-1 w-3 h-3" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {folderItems.map((item) => <DropdownMenuItem key={item.value || 'all'} onClick={() => setCurrentFolder(item.value)} className={cn(currentFolder === item.value && 'bg-muted')}>{item.label}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className={cn('hidden md:flex', isSearchOpen && 'hidden')}><Search size={18} /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <div className={cn('w-2 h-2 rounded-full', getBackendStatusColor(currentBackend))} />
                <span className="text-sm font-medium">{currentBackend.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {(['cpu', 'webgpu', 'wasm', 'webnn'] as const).map((backend) => {
                const status = backends[backend];
                const isAvailable = status?.available;
                const isInitialized = status?.initialized;
                return (
                  <DropdownMenuItem key={backend} onClick={async () => { if (isAvailable) await useAIStore.getState().switchBackend(backend); }} disabled={!isAvailable} className={cn('flex items-center gap-2', currentBackend === backend && 'bg-muted')}>
                    <div className={cn('w-2 h-2 rounded-full', isInitialized ? 'bg-green-500' : isAvailable ? 'bg-yellow-500' : 'bg-red-500')} />
                    <span className="text-sm">{backend.toUpperCase()}</span>
                    {!isAvailable && <span className="text-xs text-muted-foreground">(Not available)</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">3</span>
          </Button>
          {location.pathname === '/models' && <Button size="sm" className="gap-1"><Plus size={16} /><span className="hidden md:inline">New Model</span></Button>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><User size={18} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2"><User size={14} /><span>Profile</span></DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2"><Settings size={14} /><span>Settings</span></DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2"><Bot size={14} /><span>AI Assistant</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

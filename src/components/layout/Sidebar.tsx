import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/ThemeProvider';
import { useModelStore } from '../../stores/modelStore';
import { useAIStore } from '../../stores/aiStore';
import { NavItem } from '../../types';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { ChevronLeft, ChevronRight, LayoutDashboard, Bot, Image, Eye, Type, Mic, Search, Settings, Folder, FileText, BarChart3, Pipeline, Code, Database, Batch, HardDrive, Plus, Star, History, Trash2 } from 'lucide-react';

const SIDEBAR_WIDTH = 250;
const COLLAPSED_WIDTH = 64;

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { folders, currentFolder, setCurrentFolder } = useModelStore();
  const { settings } = useAIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { id: 'playground', label: 'AI Playground', icon: <Bot size={18} />, path: '/playground' },
    { id: 'models', label: 'Model Manager', icon: <Folder size={18} />, path: '/models', badge: useModelStore.getState().models.length },
  ];

  const visionNavItems: NavItem[] = [
    { id: 'object-detection', label: 'Object Detection', icon: <Eye size={18} />, path: '/object-detection' },
    { id: 'image-classification', label: 'Image Classification', icon: <Image size={18} />, path: '/image-classification' },
    { id: 'ocr', label: 'OCR', icon: <FileText size={18} />, path: '/ocr' },
    { id: 'face-analysis', label: 'Face Analysis', icon: <Bot size={18} />, path: '/face-analysis' },
    { id: 'pose-detection', label: 'Pose Detection', icon: <Bot size={18} />, path: '/pose-detection' },
    { id: 'image-segmentation', label: 'Image Segmentation', icon: <Image size={18} />, path: '/image-segmentation' },
    { id: 'depth-estimation', label: 'Depth Estimation', icon: <Eye size={18} />, path: '/depth-estimation' },
    { id: 'super-resolution', label: 'Super Resolution', icon: <Image size={18} />, path: '/super-resolution' },
  ];

  const audioNavItems: NavItem[] = [
    { id: 'audio-ai', label: 'Audio AI', icon: <Mic size={18} />, path: '/audio-ai' },
  ];

  const nlpNavItems: NavItem[] = [
    { id: 'semantic-search', label: 'Semantic Search', icon: <Search size={18} />, path: '/semantic-search' },
    { id: 'ai-chat', label: 'AI Chat', icon: <Bot size={18} />, path: '/ai-chat' },
  ];

  const toolsNavItems: NavItem[] = [
    { id: 'benchmark', label: 'Benchmark Center', icon: <BarChart3 size={18} />, path: '/benchmark' },
    { id: 'datasets', label: 'Dataset Explorer', icon: <Database size={18} />, path: '/datasets' },
    { id: 'pipeline-builder', label: 'Pipeline Builder', icon: <Pipeline size={18} />, path: '/pipeline-builder' },
    { id: 'developer', label: 'Developer Studio', icon: <Code size={18} />, path: '/developer' },
    { id: 'batch-processing', label: 'Batch Processing', icon: <Batch size={18} />, path: '/batch-processing' },
    { id: 'storage', label: 'Storage Manager', icon: <HardDrive size={18} />, path: '/storage' },
  ];

  const bottomNavItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const handleNavigate = (path: string) => navigate(path);
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const sidebarWidth = isCollapsed && !isHovered ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const sidebarVariants = {
    expanded: { width: SIDEBAR_WIDTH },
    collapsed: { width: COLLAPSED_WIDTH },
    hovered: { width: SIDEBAR_WIDTH },
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsCollapsed(true);
      else if (window.innerWidth >= 768 && window.innerWidth < 1024) setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && isCollapsed === false) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsCollapsed(true);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed]);

  const sunIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>);
  const moonIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>);
  const monitorIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>);

  return (
    <motion.aside
      id="sidebar"
      className={cn('fixed left-0 top-0 z-50 h-screen bg-background border-r border-border flex flex-col', 'md:relative md:z-auto')}
      initial={{ width: SIDEBAR_WIDTH }}
      animate={isCollapsed && !isHovered ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ width: sidebarWidth }}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div key="logo-expanded" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
              <div className="flex flex-col"><span className="font-semibold text-sm">EdgeVision</span><span className="text-xs text-muted-foreground">AI Studio</span></div>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div key="logo-collapsed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(isHovered || !isCollapsed) && (
            <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} onClick={toggleCollapse} className={cn('p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground')} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          <NavSection title="Main" items={mainNavItems} isCollapsed={isCollapsed} isHovered={isHovered} />
          <NavSection title="Vision" items={visionNavItems} isCollapsed={isCollapsed} isHovered={isHovered} />
          <NavSection title="Audio" items={audioNavItems} isCollapsed={isCollapsed} isHovered={isHovered} />
          <NavSection title="NLP" items={nlpNavItems} isCollapsed={isCollapsed} isHovered={isHovered} />
          <NavSection title="Tools" items={toolsNavItems} isCollapsed={isCollapsed} isHovered={isHovered} />
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-border space-y-1">
        <NavSection items={bottomNavItems} isCollapsed={isCollapsed} isHovered={isHovered} />
      </div>
      {!isCollapsed && (
        <div className="p-2 border-t border-border">
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Theme</span>
            <div className="flex gap-1">
              <Button variant={settings.ui.theme === 'light' ? 'secondary' : 'ghost'} size="icon" className="w-6 h-6" onClick={() => useAIStore.getState().setSettings({ ui: { ...settings.ui, theme: 'light' } })} title="Light">{sunIcon()}</Button>
              <Button variant={settings.ui.theme === 'dark' ? 'secondary' : 'ghost'} size="icon" className="w-6 h-6" onClick={() => useAIStore.getState().setSettings({ ui: { ...settings.ui, theme: 'dark' } })} title="Dark">{moonIcon()}</Button>
              <Button variant={settings.ui.theme === 'system' ? 'secondary' : 'ghost'} size="icon" className="w-6 h-6" onClick={() => useAIStore.getState().setSettings({ ui: { ...settings.ui, theme: 'system' } })} title="System">{monitorIcon()}</Button>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

interface NavSectionProps { title?: string; items: NavItem[]; isCollapsed: boolean; isHovered: boolean; }
function NavSection({ title, items, isCollapsed, isHovered }: NavSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="space-y-1">
      {!isCollapsed && title && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</motion.p>}
      {items.map((item) => (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.1 }} onClick={() => navigate(item.path)} className={cn('w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors hover:bg-muted hover:text-foreground', isActive(item.path) ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground', isCollapsed && !isHovered ? 'justify-center' : 'justify-start')}>
              <span className={cn('flex-shrink-0', isActive(item.path) ? 'text-primary' : 'text-muted-foreground')}>{item.icon}</span>
              <AnimatePresence>
                {(isHovered || !isCollapsed) && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }} className="flex-1 text-left truncate">{item.label}</motion.span>
                )}
              </AnimatePresence>
              {item.badge && (isHovered || !isCollapsed) && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className={cn('px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground font-medium', typeof item.badge === 'number' && item.badge > 99 && 'px-1')}>{typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}</motion.span>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="bg-background text-foreground border-border"><span className="font-medium">{item.label}</span></TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../components/ui/ThemeProvider';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { Dashboard } from '../pages/Dashboard';
import { ModelManager } from '../pages/ModelManager';
import { AIPlayground } from '../pages/AIPlayground';
import { NotFound } from '../pages/NotFound';
import { TooltipProvider } from '../components/ui/Tooltip';

// Initialize AI runtime
import { initAIRuntime } from '../ai/runtime/litertRuntime';

// Placeholder pages for future development
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">This page is under development.</p>
    </div>
  );
}

function App() {
  const location = useLocation();
  const { theme } = useTheme();
  const { initBackend } = useAIStore();
  const { loadModels } = useModelStore();

  // Initialize AI runtime on app mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initAIRuntime();
        await initBackend();
        await loadModels();
        console.log('✅ EdgeVision AI Studio initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize EdgeVision AI Studio:', error);
      }
    };
    
    initialize();
  }, [initBackend, loadModels]);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  // Page transition animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Navigation */}
          <TopNav />
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-full"
              >
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* AI Modules */}
                  <Route path="/playground" element={<AIPlayground />} />
                  <Route path="/object-detection" element={<PlaceholderPage title="Object Detection" />} />
                  <Route path="/image-classification" element={<PlaceholderPage title="Image Classification" />} />
                  <Route path="/ocr" element={<PlaceholderPage title="OCR" />} />
                  <Route path="/face-analysis" element={<PlaceholderPage title="Face Analysis" />} />
                  <Route path="/pose-detection" element={<PlaceholderPage title="Pose Detection" />} />
                  <Route path="/image-segmentation" element={<PlaceholderPage title="Image Segmentation" />} />
                  <Route path="/depth-estimation" element={<PlaceholderPage title="Depth Estimation" />} />
                  <Route path="/super-resolution" element={<PlaceholderPage title="Super Resolution" />} />
                  <Route path="/audio-ai" element={<PlaceholderPage title="Audio AI" />} />
                  <Route path="/semantic-search" element={<PlaceholderPage title="Semantic Search" />} />
                  <Route path="/ai-chat" element={<PlaceholderPage title="AI Chat" />} />
                  
                  {/* Management */}
                  <Route path="/models" element={<ModelManager />} />
                  <Route path="/models/:modelId" element={<PlaceholderPage title="Model Details" />} />
                  <Route path="/benchmark" element={<PlaceholderPage title="Benchmark Center" />} />
                  <Route path="/datasets" element={<PlaceholderPage title="Dataset Explorer" />} />
                  <Route path="/pipeline-builder" element={<PlaceholderPage title="Pipeline Builder" />} />
                  <Route path="/developer" element={<PlaceholderPage title="Developer Studio" />} />
                  <Route path="/batch-processing" element={<PlaceholderPage title="Batch Processing" />} />
                  <Route path="/storage" element={<PlaceholderPage title="Storage Manager" />} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                  
                  {/* 404 */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;

// Import stores for initialization
import { useAIStore } from '../stores/aiStore';
import { useModelStore } from '../stores/modelStore';

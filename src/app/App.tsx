import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../components/ui/ThemeProvider';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { getAIRuntime } from '../ai';

// Import all pages
import {
  Dashboard,
  ModelManager,
  AIPlayground,
  ObjectDetection,
  ImageClassification,
  OCR,
  FaceAnalysis,
  PoseDetection,
  ImageSegmentation,
  DepthEstimation,
  SuperResolution,
  AudioAI,
  SemanticSearch,
  AIChat,
  BenchmarkCenter,
  DatasetExplorer,
  PipelineBuilder,
  DeveloperStudio,
  BatchProcessing,
  StorageManager,
  Settings,
  ModelDetail,
  NotFound
} from '../pages';

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    } 
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { 
      duration: 0.2, 
      ease: 'easeIn' 
    } 
  }
};

// Page wrapper component for animations
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

export function App() {
  const location = useLocation();
  const { theme } = useTheme();
  const [runtimeStatus, setRuntimeStatus] = useState({
    isInitialized: false,
    availableAccelerators: [] as string[],
    error: null as string | null
  });

  // Check runtime status on app load
  useEffect(() => {
    const checkRuntimeStatus = async () => {
      try {
        const runtime = getAIRuntime();
        const isInitialized = runtime.getInitialized();
        
        if (isInitialized) {
          const accelerators = await runtime.getAvailableAccelerators();
          setRuntimeStatus({
            isInitialized: true,
            availableAccelerators: accelerators,
            error: null
          });
        } else {
          // Runtime is still initializing
          setRuntimeStatus({
            isInitialized: false,
            availableAccelerators: [],
            error: null
          });
        }
      } catch (error) {
        setRuntimeStatus({
          isInitialized: false,
          availableAccelerators: [],
          error: `Runtime error: ${error}`
        });
      }
    };

    checkRuntimeStatus();
    
    // Set up interval to check status periodically
    const interval = setInterval(checkRuntimeStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Show runtime error notification if there's an error
  useEffect(() => {
    if (runtimeStatus.error) {
      console.error('AI Runtime Error:', runtimeStatus.error);
    }
  }, [runtimeStatus.error]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:w-[280px] xl:w-[300px] flex-shrink-0">
          <Sidebar runtimeStatus={runtimeStatus} />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top navigation */}
          <TopNav runtimeStatus={runtimeStatus} />
          
          {/* Page content with animations */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <Routes key={location.pathname}>
                {/* Dashboard */}
                <Route path="/" element={
                  <PageWrapper>
                    <Dashboard />
                  </PageWrapper>
                } />
                
                {/* Model Management */}
                <Route path="/models" element={
                  <PageWrapper>
                    <ModelManager />
                  </PageWrapper>
                } />
                <Route path="/models/:id" element={
                  <PageWrapper>
                    <ModelDetail />
                  </PageWrapper>
                } />
                
                {/* AI Playground */}
                <Route path="/playground" element={
                  <PageWrapper>
                    <AIPlayground />
                  </PageWrapper>
                } />
                
                {/* Vision Modules */}
                <Route path="/object-detection" element={
                  <PageWrapper>
                    <ObjectDetection />
                  </PageWrapper>
                } />
                <Route path="/image-classification" element={
                  <PageWrapper>
                    <ImageClassification />
                  </PageWrapper>
                } />
                <Route path="/ocr" element={
                  <PageWrapper>
                    <OCR />
                  </PageWrapper>
                } />
                <Route path="/face-analysis" element={
                  <PageWrapper>
                    <FaceAnalysis />
                  </PageWrapper>
                } />
                <Route path="/pose-detection" element={
                  <PageWrapper>
                    <PoseDetection />
                  </PageWrapper>
                } />
                <Route path="/image-segmentation" element={
                  <PageWrapper>
                    <ImageSegmentation />
                  </PageWrapper>
                } />
                <Route path="/depth-estimation" element={
                  <PageWrapper>
                    <DepthEstimation />
                  </PageWrapper>
                } />
                <Route path="/super-resolution" element={
                  <PageWrapper>
                    <SuperResolution />
                  </PageWrapper>
                } />
                
                {/* Audio Modules */}
                <Route path="/audio-ai" element={
                  <PageWrapper>
                    <AudioAI />
                  </PageWrapper>
                } />
                
                {/* NLP Modules */}
                <Route path="/semantic-search" element={
                  <PageWrapper>
                    <SemanticSearch />
                  </PageWrapper>
                } />
                <Route path="/ai-chat" element={
                  <PageWrapper>
                    <AIChat />
                  </PageWrapper>
                } />
                
                {/* Tools */}
                <Route path="/benchmark" element={
                  <PageWrapper>
                    <BenchmarkCenter />
                  </PageWrapper>
                } />
                <Route path="/dataset-explorer" element={
                  <PageWrapper>
                    <DatasetExplorer />
                  </PageWrapper>
                } />
                <Route path="/pipeline-builder" element={
                  <PageWrapper>
                    <PipelineBuilder />
                  </PageWrapper>
                } />
                <Route path="/developer-studio" element={
                  <PageWrapper>
                    <DeveloperStudio />
                  </PageWrapper>
                } />
                <Route path="/batch-processing" element={
                  <PageWrapper>
                    <BatchProcessing />
                  </PageWrapper>
                } />
                <Route path="/storage-manager" element={
                  <PageWrapper>
                    <StorageManager />
                  </PageWrapper>
                } />
                
                {/* Settings */}
                <Route path="/settings" element={
                  <PageWrapper>
                    <Settings />
                  </PageWrapper>
                } />
                
                {/* 404 - Not Found */}
                <Route path="*" element={
                  <PageWrapper>
                    <NotFound />
                  </PageWrapper>
                } />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
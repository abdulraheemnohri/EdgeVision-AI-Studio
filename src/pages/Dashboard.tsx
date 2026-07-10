import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAIStore } from '../stores/aiStore';
import { useModelStore } from '../stores/modelStore';
import { formatBytes, formatNumber } from '../utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Bot, Cpu, Gpu, MemoryStick, HardDrive, Clock, BarChart3, Image, Eye, Type, Mic, Folder, TrendingUp, TrendingDown, Activity, Zap, Thermometer, Battery, ArrowRight, Plus, LayoutDashboard, BotMessageSquare, ImageIcon, Mic2, FileText, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { deviceInfo, backends, currentBackend, getDeviceInfo } = useAIStore();
  const { models, getTotalStorage } = useModelStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModels: 0,
    totalStorage: 0,
    recentModels: [] as typeof models,
    backendStatus: {} as typeof backends,
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get device info
        const info = await getDeviceInfo();
        
        // Get storage info
        const storage = getTotalStorage();
        
        // Get recent models (last 5)
        const recentModels = [...models]
          .sort((a, b) => b.dateImported.getTime() - a.dateImported.getTime())
          .slice(0, 5);
        
        setStats({
          totalModels: models.length,
          totalStorage: storage,
          recentModels,
          backendStatus: backends,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [getDeviceInfo, backends, models, getTotalStorage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.2 
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: 'easeOut' 
      } 
    },
  };

  // Get backend status
  const getBackendStatus = (backend: string) => {
    const status = backends[backend as keyof typeof backends];
    if (!status?.available) return { color: 'bg-red-500', label: 'Not Available' };
    if (!status?.initialized) return { color: 'bg-yellow-500', label: 'Available' };
    if (backend === currentBackend) return { color: 'bg-green-500', label: 'Active' };
    return { color: 'bg-muted-foreground', label: 'Available' };
  };

  // Format CPU info
  const formatCPUInfo = () => {
    if (!deviceInfo?.cpu) return { label: 'Unknown', value: 'N/A' };
    return {
      label: `${deviceInfo.cpu.cores} Cores`,
      value: deviceInfo.cpu.vendor || 'Unknown'
    };
  };

  // Format GPU info
  const formatGPUInfo = () => {
    if (!deviceInfo?.gpu) return { label: 'Not Available', value: 'N/A' };
    if (!deviceInfo.gpu.webgpuSupport) return { label: 'WebGPU Not Supported', value: 'N/A' };
    return {
      label: 'WebGPU Supported',
      value: `${deviceInfo.gpu.vendor} ${deviceInfo.gpu.renderer}`
    };
  };

  // Format memory info
  const formatMemoryInfo = () => {
    if (!deviceInfo?.memory) return { label: 'Unknown', value: 'N/A' };
    return {
      label: formatBytes(deviceInfo.memory.total),
      value: `${Math.round((deviceInfo.memory.used / deviceInfo.memory.total) * 100)}% used`
    };
  };

  // Quick action cards
  const quickActions = [
    {
      icon: <BotMessageSquare size={24} />,
      title: 'AI Playground',
      description: 'Test models interactively',
      path: '/playground',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Folder size={24} />,
      title: 'Model Manager',
      description: 'Manage AI models',
      path: '/models',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <ImageIcon size={24} />,
      title: 'Object Detection',
      description: 'Detect objects in images',
      path: '/object-detection',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Mic2 size={24} />,
      title: 'Audio AI',
      description: 'Process audio files',
      path: '/audio-ai',
      color: 'from-orange-500 to-red-500'
    },
  ];

  // Feature cards
  const featureCards = [
    {
      icon: <Cpu size={24} />,
      title: 'CPU Acceleration',
      description: 'XNNPACK optimized for fast inference',
      value: deviceInfo?.cpu.cores || 'N/A',
      unit: 'Cores'
    },
    {
      icon: <Gpu size={24} />,
      title: 'GPU Support',
      description: 'WebGPU for hardware acceleration',
      value: deviceInfo?.gpu.webgpuSupport ? 'Yes' : 'No',
      unit: ''
    },
    {
      icon: <MemoryStick size={24} />,
      title: 'Memory',
      description: 'Available system memory',
      value: formatBytes(deviceInfo?.memory.total || 0),
      unit: ''
    },
    {
      icon: <HardDrive size={24} />,
      title: 'Storage',
      description: 'Models storage usage',
      value: formatBytes(stats.totalStorage),
      unit: ''
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8 lg:p-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    EdgeVision AI Studio
                  </span>
                </h1>
                <p className="mt-2 text-lg md:text-xl text-muted-foreground max-w-2xl">
                  Next-generation AI workstation for on-device inference
                </p>
              </div>
              <div className="hidden md:flex gap-3">
                <Button size="sm" variant="outline" className="gap-2">
                  <Settings2 size={16} />
                  Settings
                </Button>
                <Button size="sm" className="gap-2">
                  <Plus size={16} />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {/* Total Models */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Models
                </CardTitle>
                <CardDescription className="text-xs">
                  Imported AI models
                </CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Folder size={16} className="text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{stats.totalModels}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {models.filter(m => m.isFavorite).length} Favorites
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Usage */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Storage Usage
                </CardTitle>
                <CardDescription className="text-xs">
                  Models storage
                </CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <HardDrive size={16} className="text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{formatBytes(stats.totalStorage)}</div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={30} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">30%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Backend */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Backend
                </CardTitle>
                <CardDescription className="text-xs">
                  Current AI runtime
                </CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Zap size={16} className="text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold capitalize">{currentBackend}</div>
              <div className="flex gap-1 mt-2">
                {(['cpu', 'webgpu', 'wasm', 'webnn'] as const).map((backend) => {
                  const { color } = getBackendStatus(backend);
                  return (
                    <div
                      key={backend}
                      className={`w-2 h-2 rounded-full ${color}`}
                      title={backend}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Modules */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI Modules
                </CardTitle>
                <CardDescription className="text-xs">
                  Available features
                </CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BarChart3 size={16} className="text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">20+</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  Vision, Audio, NLP
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              onClick={() => navigate(action.path)}
              className="cursor-pointer"
            >
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <ArrowRight size={16} className="mt-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Device Information Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
              <CardDescription>
                System specifications and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CPU Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Cpu size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">CPU</h3>
                    <p className="text-sm text-muted-foreground">{formatCPUInfo().label}</p>
                    <p className="text-xs text-muted-foreground/70">{formatCPUInfo().value}</p>
                  </div>
                </div>

                {/* GPU Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Gpu size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">GPU</h3>
                    <p className="text-sm text-muted-foreground">{formatGPUInfo().label}</p>
                    <p className="text-xs text-muted-foreground/70">{formatGPUInfo().value}</p>
                  </div>
                </div>

                {/* Memory Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <MemoryStick size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Memory</h3>
                    <p className="text-sm text-muted-foreground">{formatMemoryInfo().label}</p>
                    <p className="text-xs text-muted-foreground/70">{formatMemoryInfo().value}</p>
                  </div>
                </div>

                {/* Browser Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Browser</h3>
                    <p className="text-sm text-muted-foreground">
                      {deviceInfo?.browser.name} {deviceInfo?.browser.version}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{deviceInfo?.os.platform}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Stats Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>System Capabilities</CardTitle>
              <CardDescription>
                Hardware and feature support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{feature.value}</div>
                      <div className="text-xs text-muted-foreground">{feature.unit}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Models Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Models</CardTitle>
                <CardDescription>
                  Recently imported AI models
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/models')}
                className="gap-1"
              >
                View All
                <ArrowRight size={14} />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 w-full animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : stats.recentModels.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentModels.map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => navigate(`/models/${model.id}`)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{model.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{model.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {model.modelType.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                          {formatBytes(model.size)}
                        </span>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-muted-foreground group-hover:text-foreground transition-colors"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Folder size={48} className="mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No models imported yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start by importing your first AI model
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate('/models')}
                    className="gap-2"
                  >
                    <Folder size={16} />
                    Import Model
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>AI Modules Overview</CardTitle>
              <CardDescription>
                Explore all available AI capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    name: 'Vision', 
                    count: 8, 
                    color: 'bg-blue-500/10 text-blue-600',
                    icon: <Eye size={16} />,
                    path: '/object-detection'
                  },
                  { 
                    name: 'Audio', 
                    count: 1, 
                    color: 'bg-purple-500/10 text-purple-600',
                    icon: <Mic2 size={16} />,
                    path: '/audio-ai'
                  },
                  { 
                    name: 'NLP', 
                    count: 2, 
                    color: 'bg-green-500/10 text-green-600',
                    icon: <FileText size={16} />,
                    path: '/ai-chat'
                  },
                  { 
                    name: 'Tools', 
                    count: 6, 
                    color: 'bg-orange-500/10 text-orange-600',
                    icon: <Settings2 size={16} />,
                    path: '/benchmark'
                  },
                ].map((module, index) => (
                  <motion.div
                    key={module.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    onClick={() => navigate(module.path)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${module.color} flex items-center justify-center`}>
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{module.name}</h3>
                      <p className="text-xs text-muted-foreground">{module.count} module{module.count !== 1 ? 's' : ''}</p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status Card */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Check the health of your system and AI backends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { 
                    label: 'CPU', 
                    value: 'Active', 
                    icon: <Cpu size={14} />,
                    status: 'good'
                  },
                  { 
                    label: 'GPU', 
                    value: deviceInfo?.gpu.webgpuSupport ? 'Available' : 'Not available', 
                    icon: <Gpu size={14} />,
                    status: deviceInfo?.gpu.webgpuSupport ? 'good' : 'warning'
                  },
                  { 
                    label: 'WASM', 
                    value: 'Supported', 
                    icon: <Zap size={14} />,
                    status: 'good'
                  },
                  { 
                    label: 'WebNN', 
                    value: deviceInfo?.features.webnn ? 'Available' : 'Not available', 
                    icon: <Zap size={14} />,
                    status: deviceInfo?.features.webnn ? 'good' : 'warning'
                  },
                  { 
                    label: 'Memory', 
                    value: 'OK', 
                    icon: <MemoryStick size={14} />,
                    status: 'good'
                  },
                  { 
                    label: 'Storage', 
                    value: 'OK', 
                    icon: <HardDrive size={14} />,
                    status: 'good'
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="text-muted-foreground">{item.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.value}</p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'good' ? 'bg-green-500' :
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Export Card components for reuse
export { Card, CardHeader, CardTitle, CardDescription, CardContent };

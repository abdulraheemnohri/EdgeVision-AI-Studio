import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAIStore } from '../stores/aiStore';
import { useModelStore } from '../stores/modelStore';
import { formatBytes } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bot, Cpu, Gpu, MemoryStick, HardDrive, Folder, BarChart3, Pipeline, Code, Database } from 'lucide-react';

export function Dashboard() {
  const { deviceInfo, backends, currentBackend, getDeviceInfo } = useAIStore();
  const { models, getTotalStorage } = useModelStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModels: 0,
    totalStorage: 0,
    recentModels: [] as typeof models,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await getDeviceInfo();
        const storage = getTotalStorage();
        const recentModels = [...models]
          .sort((a, b) => b.dateImported.getTime() - a.dateImported.getTime())
          .slice(0, 5);
        setStats({ totalModels: models.length, totalStorage: storage, recentModels });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [getDeviceInfo, backends, models, getTotalStorage]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const getBackendColor = (backend: string) => {
    if (!backends[backend as keyof typeof backends]?.initialized) return 'bg-muted-foreground';
    return 'bg-green-500';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome to EdgeVision AI Studio</h1>
            <p className="text-muted-foreground mt-1">Your offline AI workstation powered by LiteRT.js</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Folder className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalModels}</div>
              <p className="text-xs text-muted-foreground">{models.filter(m => m.isFavorite).length} favorites</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
              <HardDrive className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.totalStorage)}</div>
              <p className="text-xs text-muted-foreground mt-1">Used by {stats.totalModels} models</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Backend</CardTitle>
              <Bot className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{currentBackend}</div>
              <div className="flex gap-1 mt-2">
                {(['cpu', 'webgpu', 'wasm', 'webnn'] as const).map((backend) => (
                  <div key={backend} className={cn('w-2 h-2 rounded-full', getBackendColor(backend))} title={backend} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Modules</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20+</div>
              <p className="text-xs text-muted-foreground">Available modules</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Cpu size={20} /></div>
                <div>
                  <h3 className="font-medium">CPU</h3>
                  <p className="text-sm text-muted-foreground">{deviceInfo?.cpu.cores || 'Unknown'} cores</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Gpu size={20} /></div>
                <div>
                  <h3 className="font-medium">GPU</h3>
                  <p className="text-sm text-muted-foreground">{deviceInfo?.gpu.webgpuSupport ? 'Available' : 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><MemoryStick size={20} /></div>
                <div>
                  <h3 className="font-medium">Memory</h3>
                  <p className="text-sm text-muted-foreground">{formatBytes(deviceInfo?.memory.total || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Bot size={20} /></div>
                <div>
                  <h3 className="font-medium">Browser</h3>
                  <p className="text-sm text-muted-foreground">{deviceInfo?.browser.name} {deviceInfo?.browser.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3" size="sm"><Bot size={16} /><span>New AI Task</span></Button>
              <Button variant="outline" className="w-full justify-start gap-3" size="sm"><Folder size={16} /><span>Import Model</span></Button>
              <Button variant="outline" className="w-full justify-start gap-3" size="sm"><BarChart3 size={16} /><span>Run Benchmark</span></Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Models</CardTitle>
              <Button variant="ghost" size="sm" className="h-8">View All</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 w-full animate-pulse rounded-md bg-muted" />)}
                </div>
              ) : stats.recentModels.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentModels.map((model) => (
                    <motion.div key={model.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">{model.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{model.modelType.replace('_', ' ')}</Badge>
                        <span className="text-sm text-muted-foreground">{formatBytes(model.size)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No models imported yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>AI Modules</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { name: 'Vision', icon: Eye, count: 8 },
                { name: 'Audio', icon: Mic, count: 1 },
                { name: 'NLP', icon: Type, count: 2 },
                { name: 'Tools', icon: BarChart3, count: 6 },
              ].map((module) => (
                <div key={module.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><module.icon size={16} className="text-white" /></div>
                  <div>
                    <h3 className="font-medium text-sm">{module.name}</h3>
                    <p className="text-xs text-muted-foreground">{module.count} modules</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}
export function Badge({ className, variant = 'default', ...props }: { variant?: 'default' | 'secondary'; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors', variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground', className)} {...props} />;
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}
export function Progress({ value, className, ...props }: { value: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative h-4 w-full overflow-hidden rounded-full bg-muted', className)} {...props}><div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} /></div>;
}

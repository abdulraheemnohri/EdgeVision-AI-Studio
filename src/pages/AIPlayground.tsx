import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useModelStore } from '../stores/modelStore';
import { useAIStore } from '../stores/aiStore';
import { ModelMetadata } from '../types';
import { formatBytes } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Bot, Image, Video, Mic, FileText, Upload, Play, Stop, Trash2, Eye } from 'lucide-react';

export function AIPlayground() {
  const { models } = useModelStore();
  const { currentBackend, backends } = useAIStore();
  const [selectedModel, setSelectedModel] = useState<ModelMetadata | null>(models[0] || null);
  const [inputType, setInputType] = useState<'image' | 'video' | 'camera' | 'audio' | 'microphone' | 'text'>('image');
  const [inputData, setInputData] = useState<{ type: string; data: unknown } | null>(null);
  const [outputData, setOutputData] = useState<unknown[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [inferenceCount, setInferenceCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModelSelect = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) setSelectedModel(model);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputData({ type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file', data: event.target?.result });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setInputData({ type: 'camera', data: stream });
    } catch (err) {
      setError('Could not access camera');
    }
  };

  const stopMedia = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setInputData(null);
  };

  const runInference = async () => {
    if (!selectedModel || !inputData) {
      setError('Please select a model and provide input');
      return;
    }
    setIsRunning(true);
    setIsLoading(true);
    setError(null);
    try {
      const startTime = performance.now();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
      setInferenceCount(prev => prev + 1);
      setOutputData([{ type: selectedModel.modelType, data: { predictions: [{ class: 'person', confidence: 0.95 }] }, processingTime: endTime - startTime, timestamp: new Date() }]);
    } catch (err) {
      setError(`Inference failed: ${err}`);
    } finally {
      setIsRunning(false);
      setIsLoading(false);
    }
  };

  const clearOutput = () => setOutputData([]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Playground</h1>
          <p className="text-muted-foreground">Test your AI models with various inputs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearOutput} disabled={outputData.length === 0}><Trash2 size={14} className="mr-2" />Clear</Button>
          <Button size="sm" onClick={runInference} disabled={!selectedModel || !inputData || isRunning}><Play size={14} className="mr-2" />Run Inference</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Select Model</CardTitle></CardHeader>
            <CardContent>
              <Select value={selectedModel?.id} onValueChange={handleModelSelect}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a model..." /></SelectTrigger>
                <SelectContent>
                  {models.map((model) => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedModel && (
                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><Badge variant="secondary">{selectedModel.modelType.replace('_', ' ')}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Size:</span><span>{formatBytes(selectedModel.size)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Input:</span><span>{selectedModel.inputShape.dimensions.join('x')}</span></div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Backend</CardTitle></CardHeader>
            <CardContent>
              <Select value={currentBackend} onValueChange={(backend) => useAIStore.getState().switchBackend(backend as any)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['cpu', 'webgpu', 'wasm', 'webnn'] as const).map((backend) => {
                    const status = backends[backend];
                    return <SelectItem key={backend} value={backend} disabled={!status?.available}>{backend.toUpperCase()}{!status?.available && <span className="text-xs text-muted-foreground"> (Not available)</span>}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Input</CardTitle>
              <Tabs value={inputType} onValueChange={(type) => { setInputType(type as any); setInputData(null); }} className="w-auto">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="image" className="flex items-center gap-1"><Image size={12} /></TabsTrigger>
                  <TabsTrigger value="camera" className="flex items-center gap-1"><Video size={12} /></TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-1"><Video size={12} /></TabsTrigger>
                  <TabsTrigger value="microphone" className="flex items-center gap-1"><Mic size={12} /></TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-1"><Mic size={12} /></TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-1"><FileText size={12} /></TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="min-h-64">
              <Tabs value={inputType}>
                <TabsContent value="image" className="mt-0">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {inputData?.type === 'image' ? (
                      <><img src={inputData.data as string} alt="Input" className="max-w-full max-h-64 mx-auto rounded-lg" /><Button variant="outline" size="sm" className="mt-4" onClick={() => setInputData(null)}>Remove</Button></>
                    ) : (
                      <><Upload size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="font-medium">Upload an image</p><input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="image-upload" /><label htmlFor="image-upload"><Button size="sm" className="mt-4"><Upload size={14} className="mr-2" />Browse Files</Button></label></>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="camera" className="mt-0">
                  <div className="space-y-4">
                    {inputData?.type === 'camera' ? (
                      <><video ref={videoRef} className="w-full rounded-lg" playsInline /><Button variant="destructive" size="sm" onClick={stopMedia}>Stop Camera</Button></>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center"><Video size={48} className="mx-auto mb-4 text-muted-foreground" /><Button size="sm" onClick={startCamera}>Start Camera</Button></div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="text" className="mt-0">
                  <textarea placeholder="Enter text here..." className="w-full h-32 resize-none border rounded-lg p-4" value={(inputData?.data as string) || ''} onChange={(e) => setInputData({ type: 'text', data: e.target.value })} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <Button size="lg" className="w-full max-w-md" onClick={isRunning ? stopMedia : runInference} disabled={!selectedModel || !inputData || isLoading}>
              {isRunning ? <><Stop size={18} className="mr-2" />Stop</> : isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Processing...</> : <><Play size={18} className="mr-2" />Run Inference</>}
            </Button>
          </div>
          {inferenceCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div><p className="text-2xl font-bold">{inferenceCount}</p><p className="text-sm text-muted-foreground">Inferences</p></div>
                  <div><p className="text-2xl font-bold">{processingTime.toFixed(0)}ms</p><p className="text-sm text-muted-foreground">Last Run</p></div>
                  <div><p className="text-2xl font-bold">{(processingTime / inferenceCount).toFixed(0)}ms</p><p className="text-sm text-muted-foreground">Avg Time</p></div>
                  <div><p className="text-2xl font-bold">{currentBackend.toUpperCase()}</p><p className="text-sm text-muted-foreground">Backend</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Output</CardTitle>
              <Button variant="outline" size="icon" className="w-6 h-6" onClick={clearOutput} disabled={outputData.length === 0}><Trash2 size={12} /></Button>
            </CardHeader>
            <CardContent className="min-h-64">
              {isLoading ? (
                <div className="space-y-4"><div className="h-4 w-full animate-pulse bg-muted rounded" /><div className="h-4 w-3/4 animate-pulse bg-muted rounded" /></div>
              ) : error ? (
                <div className="text-red-500 text-center py-8"><p>{error}</p></div>
              ) : outputData.length > 0 ? (
                <div className="space-y-4">
                  {outputData.map((output, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{output.type.replace('_', ' ')}</Badge>
                        <span className="text-xs text-muted-foreground">{(output as any).processingTime.toFixed(0)}ms</span>
                      </div>
                      <pre className="p-2 bg-muted rounded text-sm overflow-auto">{JSON.stringify((output as any).data, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground"><Eye size={48} className="mx-auto mb-4 opacity-50" /><p>Run inference to see results</p></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export function Select({ value, onValueChange, className, children, ...props }: { value: string; onValueChange: (value: string) => void; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative', className)} {...props}><select value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">{children}</select></div>;
}
export function SelectTrigger({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none', className)} {...props}>{children}</div>;
}
export function SelectValue({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
export function SelectContent({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute z-50 min-w-32 bg-popover text-popover-foreground rounded-md border border-border shadow-md mt-1 py-1', className)} {...props}>{children}</div>;
}
export function SelectItem({ value, className, children, ...props }: { value: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)} data-value={value} {...props}>{children}</div>;
}
export function Tabs({ value, onValueChange, className, children, ...props }: { value: string; onValueChange?: (value: string) => void; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col', className)} {...props}>{children}</div>;
}
export function TabsList({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)} {...props}>{children}</div>;
}
export function TabsTrigger({ value, className, children, ...props }: { value: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex items-center justify-center rounded-sm px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', className)} data-value={value} {...props}>{children}</button>;
}
export function TabsContent({ value, className, children, ...props }: { value: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} data-value={value} {...props}>{children}</div>;
}

import { cn } from '../utils/cn';

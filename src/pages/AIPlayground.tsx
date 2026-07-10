import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModelStore } from '../stores/modelStore';
import { useAIStore } from '../stores/aiStore';
import { ModelMetadata, InferenceInput, InferenceOutput } from '../types';
import { formatBytes, formatDate, generateId } from '../utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../components/ui/Sheet';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../components/ui/Tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
import { 
  Bot, Image, Video, Mic, FileText, Upload, Play, Stop, Trash2, Settings, History, 
  Eye, Grid3X3, Table2, BarChart3, Download, Copy, Share, ChevronDown, 
  Camera, Mic2, Type, Code2, Sun, Moon, Monitor, X, Check, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AIPlayground() {
  const navigate = useNavigate();
  const { models } = useModelStore();
  const { currentBackend, backends } = useAIStore();
  const [selectedModel, setSelectedModel] = useState<ModelMetadata | null>(models[0] || null);
  const [inputType, setInputType] = useState<'image' | 'video' | 'camera' | 'audio' | 'microphone' | 'text' | 'file'>('image');
  const [inputData, setInputData] = useState<InferenceInput | null>(null);
  const [outputData, setOutputData] = useState<InferenceOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [inferenceCount, setInferenceCount] = useState(0);
  const [history, setHistory] = useState<{ id: string; input: InferenceInput; output: InferenceOutput; timestamp: Date }[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Select first available model on mount
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setError(null);
    }
  };

  // Handle input type change
  const handleInputTypeChange = (type: typeof inputType) => {
    setInputType(type);
    setInputData(null);
    setOutputData([]);
    setError(null);
    stopMedia();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      
      if (file.type.startsWith('image/')) {
        setInputData({
          type: 'image',
          data: result,
        });
      } else if (file.type.startsWith('video/')) {
        setInputData({
          type: 'video',
          data: result,
        });
      } else if (file.type.startsWith('audio/')) {
        setInputData({
          type: 'audio',
          data: result,
        });
      } else {
        setInputData({
          type: 'file',
          data: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setInputData({
        type: 'camera',
        data: stream,
      });
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
    }
  };

  // Handle microphone capture
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setInputData({
        type: 'microphone',
        data: stream,
      });
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
    }
  };

  // Stop media streams
  const stopMedia = () => {
    if (inputData?.type === 'camera' && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (inputData?.type === 'microphone' && typeof inputData.data === 'object' && 'getTracks' in inputData.data) {
      (inputData.data as MediaStream).getTracks().forEach(track => track.stop());
    }
    setInputData(null);
  };

  // Run inference
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
      
      // Simulate inference (replace with actual LiteRT.js call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const endTime = performance.now();
      const time = endTime - startTime;
      
      setProcessingTime(time);
      setInferenceCount(prev => prev + 1);
      
      // Mock output based on model type
      const mockOutput: InferenceOutput = {
        type: selectedModel.modelType,
        data: getMockOutput(selectedModel.modelType),
        processingTime: time,
        timestamp: new Date(),
      };
      
      setOutputData([mockOutput]);
      
      // Add to history
      setHistory(prev => [
        {
          id: generateId(),
          input: inputData,
          output: mockOutput,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // Keep last 10 items
      ]);
    } catch (err) {
      setError(`Inference failed: ${err}`);
    } finally {
      setIsRunning(false);
      setIsLoading(false);
    }
  };

  // Stop inference
  const stopInference = () => {
    setIsRunning(false);
    stopMedia();
  };

  // Capture frame from video/camera
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        
        setInputData({
          type: 'image',
          data: dataUrl,
        });
        
        // Stop camera after capture
        stopMedia();
      }
    }
  };

  // Clear output
  const clearOutput = () => {
    setOutputData([]);
    setError(null);
  };

  // Get mock output based on model type
  const getMockOutput = (modelType: string) => {
    switch (modelType) {
      case 'object_detection':
        return {
          predictions: [
            { class: 'person', confidence: 0.95, bbox: [100, 100, 200, 300] },
            { class: 'car', confidence: 0.87, bbox: [300, 200, 150, 100] },
          ]
        };
      case 'image_classification':
        return {
          predictions: [
            { class: 'golden retriever', confidence: 0.92 },
            { class: 'labrador', confidence: 0.85 },
            { class: 'dog', confidence: 0.78 },
          ]
        };
      case 'segmentation':
        return {
          mask: new Array(224).fill(new Array(224).fill(0)),
          classes: ['background', 'person', 'dog']
        };
      case 'face_detection':
        return {
          faces: [
            {
              bbox: [100, 100, 200, 200],
              landmarks: new Array(468).fill(0).map((_, i) => ({ x: 100 + i, y: 100 + i })),
              age: 25,
              gender: 'male',
              emotion: 'happy'
            }
          ]
        };
      case 'ocr':
        return {
          text: 'Hello, World! This is a test of the OCR functionality.',
          words: [
            { text: 'Hello,', bbox: [10, 10, 50, 20], confidence: 0.99 },
            { text: 'World!', bbox: [60, 10, 50, 20], confidence: 0.98 },
          ]
        };
      default:
        return { predictions: [] };
    }
  };

  // Format output based on type
  const formatOutput = (output: InferenceOutput) => {
    switch (output.type) {
      case 'object_detection':
        const detections = (output.data as { predictions: any[] }).predictions;
        return (
          <div className="space-y-3">
            <h4 className="font-medium">Detections:</h4>
            {detections?.length > 0 ? (
              <div className="space-y-2">
                {detections.map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Eye size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{detection.class}</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(detection.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {(detection.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No detections found</p>
            )}
          </div>
        );
      
      case 'image_classification':
        const predictions = (output.data as { predictions: any[] }).predictions;
        return (
          <div className="space-y-3">
            <h4 className="font-medium">Predictions:</h4>
            {predictions?.length > 0 ? (
              <div className="space-y-2">
                {predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium">{index + 1}.</span>
                      <div>
                        <p className="font-medium">{prediction.class}</p>
                        <p className="text-xs text-muted-foreground">
                          {prediction.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-muted-foreground/20">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(prediction.confidence * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No predictions</p>
            )}
          </div>
        );
      
      case 'ocr':
        const ocrData = (output.data as { text: string; words: any[] });
        return (
          <div className="space-y-3">
            <h4 className="font-medium">Extracted Text:</h4>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm whitespace-pre-wrap">{ocrData.text}</p>
            </div>
            {ocrData.words?.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">Detected Words:</h5>
                <div className="flex flex-wrap gap-2">
                  {ocrData.words.map((word, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {word.text}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'face_detection':
        const faces = (output.data as { faces: any[] }).faces;
        return (
          <div className="space-y-3">
            <h4 className="font-medium">Detected Faces:</h4>
            {faces?.length > 0 ? (
              <div className="space-y-4">
                {faces.map((face, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <h5 className="font-medium mb-2">Face {index + 1}</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Age</p>
                        <p>{face.age || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gender</p>
                        <p>{face.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Emotion</p>
                        <p>{face.emotion || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No faces detected</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            <h4 className="font-medium">Output:</h4>
            <pre className="p-4 rounded-lg bg-muted/50 text-sm overflow-auto">
              {JSON.stringify(output.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Get model type color
  const getModelTypeColor = (type: string) => {
    const colors: Record<string, string> = {
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

  // Input type options
  const inputTypes = [
    { 
      value: 'image', 
      label: 'Image', 
      icon: <Image size={16} />,
      description: 'Upload or select an image'
    },
    { 
      value: 'camera', 
      label: 'Camera', 
      icon: <Camera size={16} />,
      description: 'Use device camera'
    },
    { 
      value: 'video', 
      label: 'Video', 
      icon: <Video size={16} />,
      description: 'Upload a video file'
    },
    { 
      value: 'microphone', 
      label: 'Microphone', 
      icon: <Mic2 size={16} />,
      description: 'Record audio'
    },
    { 
      value: 'audio', 
      label: 'Audio', 
      icon: <Mic size={16} />,
      description: 'Upload audio file'
    },
    { 
      value: 'text', 
      label: 'Text', 
      icon: <Type size={16} />,
      description: 'Enter text input'
    },
  ];

  // Backend options
  const backendOptions = [
    { value: 'cpu', label: 'CPU', icon: <Cpu size={16} /> },
    { value: 'webgpu', label: 'WebGPU', icon: <Gpu size={16} /> },
    { value: 'wasm', label: 'WASM', icon: <Code2 size={16} /> },
    { value: 'webnn', label: 'WebNN', icon: <Zap size={16} /> },
  ];

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
              <h1 className="text-2xl md:text-3xl font-bold">AI Playground</h1>
              <p className="text-muted-foreground mt-1">
                Test your AI models with various inputs
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearOutput}
                disabled={outputData.length === 0}
                className="gap-2"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              <Button
                size="sm"
                onClick={isRunning ? stopInference : runInference}
                disabled={!selectedModel || !inputData || isLoading}
                className="gap-2 min-w-32"
              >
                {isRunning ? (
                  <>
                    <Stop size={16} />
                    <span>Stop</span>
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Run Inference</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Panel - Model Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Model Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle>Select Model</CardTitle>
                <CardDescription>
                  Choose an AI model for inference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={selectedModel?.id} onValueChange={handleModelSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getModelTypeColor(model.modelType)} flex items-center justify-center`}>
                              <Bot size={14} className="text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{model.name}</p>
                              <p className="text-sm text-muted-foreground">{model.modelType.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedModel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border space-y-3"
                  >
                    <div>
                      <h4 className="font-medium mb-2">Model Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="secondary">{selectedModel.modelType.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Author:</span>
                          <span>{selectedModel.author}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span>{selectedModel.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span>{formatBytes(selectedModel.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantization:</span>
                          <span>{selectedModel.quantization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Input Shape:</span>
                          <span>{selectedModel.inputShape.dimensions.join('x')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Output Shape:</span>
                          <span>{selectedModel.outputShape.dimensions.join('x')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Supported Backends</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedModel.supportedBackends.map((backend) => (
                          <Badge key={backend} variant="secondary" className="text-xs">
                            {backend.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Backend Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle>Select Backend</CardTitle>
                <CardDescription>
                  Choose the runtime backend for inference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Select 
                    value={currentBackend} 
                    onValueChange={(backend) => useAIStore.getState().switchBackend(backend as any)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backendOptions.map((backend) => {
                        const status = backends[backend.value as keyof typeof backends];
                        return (
                          <SelectItem 
                            key={backend.value} 
                            value={backend.value} 
                            disabled={!status?.available}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                {backend.icon}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{backend.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {status?.available ? (status?.initialized ? 'Initialized' : 'Available') : 'Not available'}
                                </p>
                              </div>
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                status?.initialized ? 'bg-green-500' : 
                                status?.available ? 'bg-yellow-500' : 'bg-red-500'
                              )} />
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Backend Status</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {backendOptions.map((backend) => {
                      const status = backends[backend.value as keyof typeof backends];
                      return (
                        <div key={backend.value} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="w-3 h-3 rounded-full bg-primary/50" />
                          <span>{backend.label}</span>
                          <span className="ml-auto text-xs">
                            {status?.available ? (status?.initialized ? 'Ready' : 'Available') : 'Unavailable'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Center Panel - Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Input Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Input</CardTitle>
                <CardDescription>
                  Select input type and provide data
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-64">
                {/* Input Type Tabs */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Input Type:</p>
                  <Tabs value={inputType} onValueChange={(type) => handleInputTypeChange(type as any)}>
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
                      {inputTypes.map((input) => (
                        <TabsTrigger key={input.value} value={input.value} className="flex items-center gap-1">
                          {input.icon}
                          <span className="hidden sm:inline">{input.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Input Content */}
                <Tabs value={inputType}>
                  {/* Image Input */}
                  <TabsContent value="image" className="mt-0">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center min-h-48">
                      {inputData?.type === 'image' ? (
                        <div className="space-y-4">
                          <img
                            src={inputData.data as string}
                            alt="Input"
                            className="max-w-full max-h-64 mx-auto rounded-lg"
                          />
                          <Button variant="outline" size="sm" onClick={() => setInputData(null)} className="gap-2">
                            <Trash2 size={14} />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload size={48} className="mx-auto text-muted-foreground" />
                          <p className="font-medium">Upload an image</p>
                          <p className="text-sm text-muted-foreground">
                            or drag and drop
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload">
                            <Button size="sm" className="gap-2">
                              <Upload size={14} />
                              Browse Files
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Camera Input */}
                  <TabsContent value="camera" className="mt-0">
                    <div className="space-y-4">
                      {inputData?.type === 'camera' ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <video
                              ref={videoRef}
                              className="w-full rounded-xl"
                              playsInline
                            />
                            <Button
                              size="icon"
                              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm"
                              onClick={captureFrame}
                            >
                              <Camera size={20} className="text-white" />
                            </Button>
                          </div>
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={captureFrame} className="gap-2 flex-1">
                              <Camera size={14} />
                              Capture Frame
                            </Button>
                            <Button variant="destructive" size="sm" onClick={stopMedia} className="gap-2 flex-1">
                              <Stop size={14} />
                              Stop Camera
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center min-h-48">
                          <Camera size={48} className="mx-auto mb-4 text-muted-foreground" />
                          <p className="font-medium">Camera Input</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Access your device camera
                          </p>
                          <Button size="sm" onClick={startCamera} className="gap-2">
                            <Camera size={14} />
                            Start Camera
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Video Input */}
                  <TabsContent value="video" className="mt-0">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center min-h-48">
                      {inputData?.type === 'video' ? (
                        <div className="space-y-4">
                          <video
                            src={inputData.data as string}
                            controls
                            className="max-w-full rounded-lg"
                          />
                          <Button variant="outline" size="sm" onClick={() => setInputData(null)} className="gap-2">
                            <Trash2 size={14} />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload size={48} className="mx-auto text-muted-foreground" />
                          <p className="font-medium">Upload a video</p>
                          <p className="text-sm text-muted-foreground">
                            or drag and drop
                          </p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="video-upload"
                          />
                          <label htmlFor="video-upload">
                            <Button size="sm" className="gap-2">
                              <Upload size={14} />
                              Browse Files
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Microphone Input */}
                  <TabsContent value="microphone" className="mt-0">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center min-h-48">
                      {inputData?.type === 'microphone' ? (
                        <div className="space-y-4">
                          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                            <Mic2 size={32} className="text-primary" />
                          </div>
                          <p className="font-medium">Microphone Active</p>
                          <Button variant="destructive" size="sm" onClick={stopMedia} className="gap-2">
                            <Stop size={14} />
                            Stop Recording
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Mic2 size={48} className="mx-auto text-muted-foreground" />
                          <p className="font-medium">Microphone Input</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Access your device microphone
                          </p>
                          <Button size="sm" onClick={startMicrophone} className="gap-2">
                            <Mic2 size={14} />
                            Start Recording
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Audio Input */}
                  <TabsContent value="audio" className="mt-0">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center min-h-48">
                      {inputData?.type === 'audio' ? (
                        <div className="space-y-4">
                          <audio
                            src={inputData.data as string}
                            controls
                            className="max-w-full"
                          />
                          <Button variant="outline" size="sm" onClick={() => setInputData(null)} className="gap-2">
                            <Trash2 size={14} />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload size={48} className="mx-auto text-muted-foreground" />
                          <p className="font-medium">Upload an audio file</p>
                          <p className="text-sm text-muted-foreground">
                            or drag and drop
                          </p>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="audio-upload"
                          />
                          <label htmlFor="audio-upload">
                            <Button size="sm" className="gap-2">
                              <Upload size={14} />
                              Browse Files
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Text Input */}
                  <TabsContent value="text" className="mt-0">
                    <div className="space-y-4">
                      <div className="border rounded-xl p-4 min-h-32">
                        <textarea
                          placeholder="Enter text here..."
                          className="w-full h-full resize-none border-none bg-transparent focus:ring-0 outline-none text-sm"
                          value={(inputData?.data as string) || ''}
                          onChange={(e) => setInputData({
                            type: 'text',
                            data: e.target.value,
                          })}
                        />
                        {inputData?.type === 'text' && inputData.data && (
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {(inputData.data as string).length} characters
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInputData({ type: 'text', data: '' })}
                              className="text-xs"
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Run Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="w-full max-w-md h-12 text-lg"
                onClick={isRunning ? stopInference : runInference}
                disabled={!selectedModel || !inputData || isLoading}
              >
                {isRunning ? (
                  <>
                    <Stop size={20} className="mr-2" />
                    Stop Inference
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Run Inference
                  </>
                )}
              </Button>
            </div>

            {/* Stats */}
            {inferenceCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Inference Statistics</CardTitle>
                  <CardDescription>
                    Performance metrics for the current session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">{inferenceCount}</p>
                      <p className="text-sm text-muted-foreground">Inferences</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">{processingTime.toFixed(0)}ms</p>
                      <p className="text-sm text-muted-foreground">Last Run</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">{(processingTime / inferenceCount).toFixed(0)}ms</p>
                      <p className="text-sm text-muted-foreground">Avg Time</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">{currentBackend.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">Backend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            {/* Output Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    Inference results
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)} className="w-auto">
                    <TabsList>
                      <TabsTrigger value="results" className="text-xs px-2 py-0.5">
                        Results
                      </TabsTrigger>
                      <TabsTrigger value="history" className="text-xs px-2 py-0.5">
                        History
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline" size="icon" className="w-6 h-6" onClick={clearOutput} disabled={outputData.length === 0}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="min-h-64 max-h-96 overflow-y-auto">
                <Tabs value={activeTab}>
                  <TabsContent value="results" className="mt-0">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <div className="h-4 w-full animate-pulse bg-muted rounded" />
                          <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
                          <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500 text-center py-8"
                        >
                          <AlertCircle size={48} className="mx-auto mb-4" />
                          <p>{error}</p>
                        </motion.div>
                      ) : outputData.length > 0 ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {outputData.map((output, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="p-4 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {output.type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {output.processingTime.toFixed(0)}ms
                                </span>
                              </div>
                              {formatOutput(output)}
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <Eye size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Run inference to see results</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {history.length > 0 ? (
                        history.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setInputData(item.input);
                              setOutputData([item.output]);
                              setActiveTab('results');
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {item.input.type.charAt(0).toUpperCase() + item.input.type.slice(1)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {item.output.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <History size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No history yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Model Info Card */}
            {selectedModel && (
              <Card>
                <CardHeader>
                  <CardTitle>Model Info</CardTitle>
                  <CardDescription>
                    Details about the selected model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getModelTypeColor(selectedModel.modelType)} flex items-center justify-center`}>
                        <Bot size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedModel.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedModel.author}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p>{selectedModel.modelType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Version</p>
                        <p>{selectedModel.version}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p>{formatBytes(selectedModel.size)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantization</p>
                        <p>{selectedModel.quantization}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Supported Backends</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedModel.supportedBackends.map((backend) => (
                          <Badge key={backend} variant="secondary" className="text-xs">
                            {backend.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}

// Import History icon
import { History } from 'lucide-react';

// Select Component
export function Select({ value, onValueChange, className, children, ...props }: { 
  value: string; 
  onValueChange: (value: string) => void; 
  className?: string; 
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('relative', className)} {...props}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}

Select.displayName = 'Select';

export function SelectTrigger({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown size={16} className="text-muted-foreground" />
    </div>
  );
}

SelectTrigger.displayName = 'SelectTrigger';

export function SelectValue({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

SelectValue.displayName = 'SelectValue';

export function SelectContent({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'absolute z-50 min-w-32 bg-popover text-popover-foreground rounded-md border border-border shadow-md',
        'mt-1 py-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

SelectContent.displayName = 'SelectContent';

export function SelectItem({ value, className, children, ...props }: { value: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}

SelectItem.displayName = 'SelectItem';

// Tabs Components
export function Tabs({ value, onValueChange, className, children, ...props }: { 
  value: string; 
  onValueChange?: (value: string) => void; 
  className?: string; 
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col', className)} {...props} />
  );
}

Tabs.displayName = 'Tabs';

export function TabsList({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

TabsList.displayName = 'TabsList';

export function TabsTrigger({ value, className, children, ...props }: { value: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-3 py-1 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      data-value={value}
      {...props}
    >
      {children}
    </button>
  );
}

TabsTrigger.displayName = 'TabsTrigger';

export function TabsContent({ value, className, children, ...props }: { value: string; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}

TabsContent.displayName = 'TabsContent';

// Utility function
import { cn } from '../utils/cn';

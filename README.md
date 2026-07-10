# EdgeVision AI Studio

> **🇵🇰 Made in Pakistan** - عبدالرحیم نوهاری

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/abdulraheemnohri/EdgeVision-AI-Studio/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-0078D4?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Offline](https://img.shields.io/badge/Offline-First-4CAF50?style=flat-square)](https://web.dev/offline-cookbook/)

---

## 🌐 **Project Overview**

**EdgeVision AI Studio** is a next-generation **AI Workstation Progressive Web App (PWA)** built entirely with modern web technologies and powered by **Google LiteRT.js** for high-performance on-device AI inference.

### ✨ **Key Features**

| Feature | Description |
|---------|-------------|
| 🌐 **100% Offline** | No internet connection required |
| 🔓 **No Login** | No account or sign-up needed |
| ☁️ **No Cloud APIs** | All processing happens locally |
| 🤖 **No Server AI** | AI models run in the browser |
| 🔒 **Privacy-First** | Your data never leaves your device |
| ⚡ **GPU Accelerated** | WebGPU/ML Drift for fast inference |
| 📱 **Mobile Friendly** | Works on smartphones |
| 💻 **Desktop Optimized** | Best performance on computers |
| 📲 **Installable PWA** | Install on desktop and mobile |
| 🎨 **Modern UI** | Material Design 3 + Tailwind CSS |
| 🧩 **Modular** | Easy to customize and extend |
| 🔌 **Plugin System** | Add new features easily |

---

## 📱 **Responsive Design**

EdgeVision AI Studio is fully responsive and works beautifully on:

| Device | Screen Size | Features |
|--------|-------------|----------|
| 📱 **Mobile** | < 768px | Touch-optimized, collapsible sidebar |
| 📟 **Tablet** | 768px - 1024px | Adaptive layout, better spacing |
| 💻 **Desktop** | > 1024px | Full sidebar, multi-column views |

---

## 🚀 **Installation Guide**

### **Prerequisites**

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| [Node.js](https://nodejs.org/) | >= 18.0.0 | `node -v` |
| [npm](https://www.npmjs.com/) | >= 9.0.0 | `npm -v` |
| [Git](https://git-scm.com/) | Latest | `git --version` |

**Recommended:**
- Node.js 20+ (LTS version)
- npm 10+
- Modern browser (Chrome, Edge, Firefox, Safari)

---

### **Method 1: Clone & Install (Recommended)**

```bash
# Clone the repository
git clone https://github.com/abdulraheemnohri/EdgeVision-AI-Studio.git

# Navigate to project directory
cd EdgeVision-AI-Studio

# Install all dependencies
npm install

# Start development server
npm run dev
```

**That's it!** Open your browser and visit `http://localhost:5173`

---

### **Method 2: Direct Download**

1. **Download ZIP:**
   - Click the green "Code" button on GitHub
   - Select "Download ZIP"
   - Extract the file

2. **Open Terminal in the extracted folder:**
   ```bash
   cd EdgeVision-AI-Studio
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the app:**
   ```bash
   npm run dev
   ```

---

### **Method 3: Using npx (Quick Start)**

```bash
npx degit abdulraheemnohri/EdgeVision-AI-Studio edgevision-app
cd edgevision-app
npm install
npm run dev
```

---

## 📦 **Available Scripts**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:ui` | Run tests with UI mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | Type-check the entire project |

---

## 🎨 **Modern UI/UX Features**

### **Design System**

- **Color Scheme:** Dark/Light/System theme support
- **Typography:** Modern, readable fonts
- **Spacing:** Consistent 4px base unit
- **Border Radius:** Smooth rounded corners (0.5rem default)
- **Shadows:** Subtle, elegant shadows
- **Animations:** Smooth transitions and micro-interactions

### **Responsive Breakpoints**

```css
/* Mobile-first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### **Mobile-Specific Features**

- ✅ Touch-optimized buttons (minimum 44x44px)
- ✅ Collapsible sidebar with swipe gesture
- ✅ Bottom navigation option
- ✅ Larger tap targets
- ✅ No hover states (replaced with touch)
- ✅ Virtual keyboard support

### **Tablet Optimizations**

- ✅ Adaptive sidebar (can be toggled)
- ✅ Two-column layouts where appropriate
- ✅ Better spacing for touch and mouse
- ✅ Responsive typography

### **Desktop Enhancements**

- ✅ Full persistent sidebar
- ✅ Multi-column dashboard
- ✅ Keyboard shortcuts
- ✅ Hover effects
- ✅ Advanced animations
- ✅ Drag and drop support

---

## 📁 **Project Structure**

```
EdgeVision-AI-Studio/
├── public/                          # Static files
│   ├── icons/                      # App icons (multiple sizes)
│   ├── models/                     # AI model files (.tflite)
│   ├── wasm/                       # WASM files
│   ├── sw.js                       # Service worker
│   ├── manifest.json               # PWA manifest
│   └── index.html                  # HTML template
│
├── src/                            # Source code
│   ├── app/                        # App logic
│   │   └── App.tsx                 # Main app component
│   │
│   ├── ai/                         # AI runtime
│   │   └── runtime/
│   │       ├── litertRuntime.ts    # LiteRT.js wrapper
│   │       └── index.ts
│   │
│   ├── components/                 # Reusable components
│   │   ├── ui/                     # UI components (shadcn/ui style)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Sheet.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── layout/                 # Layout components
│   │       ├── Sidebar.tsx
│   │       ├── TopNav.tsx
│   │       └── index.ts
│   │
│   ├── pages/                      # Page components
│   │   ├── Dashboard.tsx
│   │   ├── ModelManager.tsx
│   │   ├── AIPlayground.tsx
│   │   ├── ObjectDetection.tsx
│   │   ├── ImageClassification.tsx
│   │   ├── OCR.tsx
│   │   ├── FaceAnalysis.tsx
│   │   ├── PoseDetection.tsx
│   │   ├── ImageSegmentation.tsx
│   │   ├── DepthEstimation.tsx
│   │   ├── SuperResolution.tsx
│   │   ├── AudioAI.tsx
│   │   ├── SemanticSearch.tsx
│   │   ├── AIChat.tsx
│   │   ├── BenchmarkCenter.tsx
│   │   ├── DatasetExplorer.tsx
│   │   ├── PipelineBuilder.tsx
│   │   ├── DeveloperStudio.tsx
│   │   ├── BatchProcessing.tsx
│   │   ├── StorageManager.tsx
│   │   ├── Settings.tsx
│   │   ├── ModelDetail.tsx
│   │   └── NotFound.tsx
│   │
│   ├── stores/                     # State management (Zustand)
│   │   ├── aiStore.ts
│   │   ├── modelStore.ts
│   │   └── index.ts
│   │
│   ├── types/                      # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── cn.ts
│   │   ├── formatters.ts
│   │   └── index.ts
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   ├── services/                   # API services
│   │
│   ├── workers/                    # Web Workers
│   │
│   ├── plugins/                    # Plugin system
│   │
│   ├── locales/                    # Internationalization
│   │   ├── en.json
│   │   └── ur.json
│   │
│   ├── themes/                     # Theme configurations
│   │
│   ├── assets/                     # Static assets
│   │   └── images/
│   │
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
│
├── tests/                          # Tests
│   └── ...
│
├── docs/                           # Documentation
│   └── ...
│
├── scripts/                        # Utility scripts
│   └── ...
│
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎯 **Modules & Features**

### **🏠 Dashboard**
- Device information (CPU, GPU, OS, Browser)
- AI accelerator status (CPU, GPU, WebGPU, WebNN)
- Installed models overview
- Recent projects and AI jobs
- Benchmark summary
- Storage usage visualization
- Battery and temperature status (where available)

### **🤖 AI Model Manager**
- Import .tflite models (drag & drop)
- Import labels and metadata
- Delete, rename, duplicate models
- Organize by folders
- Search and filter models
- Favorite models
- Model preview
- Auto-detect input/output shapes
- Auto-detect quantization
- Show supported accelerators
- Export models
- Backup and restore
- Version history

### **🎮 AI Playground**
- Universal inference interface
- **Input Types:** Image, Video, Camera, Audio, Microphone, Text, CSV, JSON, PDF
- Drag & drop support
- Real-time preview
- Batch processing
- Output viewer
- Tensor viewer
- Execution timeline
- Confidence graph
- Save/export results (JSON, CSV, PNG)

### **👁️ Object Detection**
- **Models:** YOLO, EfficientDet, SSD MobileNet
- Live camera detection
- Image detection
- Video detection
- Batch image processing
- Bounding boxes with labels
- Confidence scores
- Object tracking
- FPS counter
- Detection history
- Object counting
- Screenshot capture
- Export detections

### **🖼️ Image Classification**
- Top predictions with confidence
- Class search
- Heatmap visualization
- Batch image processing
- Folder processing
- Live camera classification

### **📄 OCR (Optical Character Recognition)**
- Offline text recognition
- **Supported:** Receipts, Invoices, Books, ID Cards, Forms
- Copy text to clipboard
- Export as TXT/PDF
- Search within text
- Translation ready

### **👤 Face Analysis**
- Face detection (multiple faces)
- Age estimation
- Gender detection
- Emotion recognition
- Smile detection
- Blink detection
- Head pose estimation
- Face landmarks (468 points)
- Attendance mode

### **🧘 Pose Detection**
- Skeleton visualization
- Workout counter
- Exercise detection
- Yoga assistant
- Motion analysis
- Joint angles
- Real-time statistics

### **🎨 Image Segmentation**
- Person segmentation
- Object segmentation
- Background removal
- Hair segmentation
- Sky segmentation
- Road segmentation

### **📊 Depth Estimation**
- Real-time webcam depth
- 3D point cloud
- Depth map visualization
- Distance estimation
- Color mapping
- Measurement tools

### **✨ Super Resolution**
- **Model:** Real-ESRGAN
- 2x, 4x, 8x upscaling
- Tile processing for large images
- Batch upscaling
- Before/after comparison

### **🎵 Audio AI**
- Speech recognition
- Sound classification
- Music classification
- Noise detection
- Keyword spotting
- Voice commands
- Audio embeddings

### **🔍 Semantic Search**
- **Model:** EmbeddingGemma
- Document search
- Note search
- Folder search
- PDF search
- Markdown search
- Similarity ranking
- Local vector database

### **💬 AI Chat**
- **Runtime:** LiteRT-LM.js
- Offline chat
- Reasoning mode
- Summarization
- Question answering
- Translation
- Document chat
- Code assistant
- Conversation memory
- Multiple chats
- Prompt templates

### **📈 Benchmark Center**
- **Tests:** CPU, GPU, WebNN
- **Metrics:** FPS, Latency, Memory, Throughput
- Inference time measurement
- Power estimation
- Model loading time
- Warm-up time

### **📊 Dataset Explorer**
- **Formats:** COCO, VOC, YOLO, CSV, JSON, Image Folder
- Preview images
- Dataset statistics
- Label management
- Class count
- Image count
- Annotation viewer
- Dataset split

### **🔧 Pipeline Builder**
- Visual drag-and-drop editor
- **Blocks:** Load Image, Resize, Crop, Normalize, Inference, Post Process, Threshold, NMS, Export, Save
- Save pipelines
- Share pipelines

### **👨‍💻 Developer Studio**
- Tensor viewer
- Graph inspector
- Layer viewer
- Operator viewer
- Tensor shapes
- Runtime logs
- Performance logs
- Memory allocation viewer
- Execution graph
- Model metadata

### **⚙️ Batch Processing**
- Process folders
- Process ZIP files
- Process video folders
- Process image folders
- Queue system
- Pause/Resume/Cancel
- Retry failed items
- Progress tracking
- Notifications

### **💾 Storage Manager**
- IndexedDB usage
- Model cache
- Logs
- Temporary files
- Exports
- Cleanup tools
- Backup
- Restore

---

## ⚙️ **Settings**

### **AI Settings**
- Default backend (CPU/GPU/WebNN)
- Thread count
- Precision (float32/float16/int8)
- GPU toggle
- NPU toggle
- CPU optimization
- Warm-up mode
- Cache settings

### **UI Settings**
- Theme (Dark/Light/System)
- Accent color
- Animations
- Reduced motion
- Font size
- Language (English/Urdu)
- Date format
- Time format (12h/24h)

### **Storage Settings**
- Auto cleanup
- Model cache limit
- History limit
- Backup schedule
- Backup path

### **Notification Settings**
- Enable/disable notifications
- Sound
- Desktop notifications
- Batch processing alerts
- Benchmark completion alerts
- Model loaded alerts

---

## 🔌 **Plugin System**

Extend EdgeVision AI Studio with:

- **New Models** - Add custom .tflite models
- **Preprocessors** - Custom data preprocessing
- **Postprocessors** - Custom result processing
- **Themes** - Custom color schemes
- **Language Packs** - Translate to new languages
- **Visualization Modules** - Custom output viewers
- **Utility Extensions** - Additional tools

---

## 🔒 **Security & Privacy**

- ✅ **100% Offline** - No internet required
- ✅ **Local Processing** - All AI runs on your device
- ✅ **No Telemetry** - We don't track anything
- ✅ **No Analytics** - No usage data collected
- ✅ **No Tracking** - No cookies, no fingerprinting
- ✅ **Permission-based** - Camera/microphone access requires permission
- ✅ **Local Encryption** - Optional file encryption
- ✅ **Secure Storage** - IndexedDB with security best practices
- ✅ **Sandboxed** - Model execution in isolated environment
- ✅ **CSP Enabled** - Content Security Policy for protection

---

## ⚡ **Performance Optimizations**

| Optimization | Description |
|--------------|-------------|
| Web Workers | AI inference in background threads |
| OffscreenCanvas | GPU-accelerated rendering |
| SharedArrayBuffer | Fast tensor operations |
| Lazy Loading | Load only what's needed |
| Incremental Loading | Load models progressively |
| Multi-threaded XNNPACK | Parallel CPU execution |
| WebGPU Caching | Reuse compiled shaders |
| Auto Backend Selection | Best available backend |
| Memory Pooling | Reuse tensor memory |
| Background Warm-up | Pre-load models |

---

## ♿ **Accessibility**

- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Adjustable font sizes
- ✅ Reduced motion option
- ✅ Colorblind-friendly palettes
- ✅ Voice command support (optional)
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Skip links

---

## 📱 **PWA Features**

| Feature | Description |
|---------|-------------|
| Installable | Add to home screen on any device |
| Offline-First | Works without internet connection |
| Service Worker | Caches assets for offline use |
| Auto Updates | Get updates with user approval |
| Background Sync | Sync tasks when online |
| App Shortcuts | Quick access to features |
| File Handling | Open supported files directly |
| Share Target | Share files to the app |

---

## 🚀 **Usage Examples**

### **Run Object Detection**

```bash
# Start the app
npm run dev

# Open browser to http://localhost:5173
# Navigate to "Object Detection"
# Upload an image or use camera
# See real-time detections
```

### **Import a Model**

```bash
# Download a .tflite model
# Open Model Manager
# Click "Import"
# Select your .tflite file
# Model is now ready to use
```

### **Run Benchmark**

```bash
# Go to Benchmark Center
# Select a model
# Select backend (CPU/GPU)
# Set iterations
# Click "Run Benchmark"
# View results
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

### **Reporting Issues**

1. Check if the issue already exists in [GitHub Issues](https://github.com/abdulraheemnohri/EdgeVision-AI-Studio/issues)
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Screenshots (if applicable)
   - Browser/OS information

### **Feature Requests**

1. Check if the feature is already requested
2. Create a new issue with:
   - Clear description of the feature
   - Use case
   - Mockups (if applicable)

### **Code Contributions**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with descriptive messages: `git commit -m 'Add some feature'`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### **Development Setup**

```bash
# Clone the repo
git clone https://github.com/abdulraheemnohri/EdgeVision-AI-Studio.git
cd EdgeVision-AI-Studio

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Check types
npm run typecheck

# Lint code
npm run lint
```

---

## 📜 **License**

This project is licensed under the **MIT License** - feel free to use it for personal or commercial purposes.

```
MIT License

Copyright (c) 2026 Abdulraheem Nohari

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 **Acknowledgments**

- **Google LiteRT.js Team** - For the amazing runtime
- **TensorFlow.js Community** - For inspiration and tools
- **WebGPU Developers** - For GPU acceleration
- **Vite Team** - For the fast build tool
- **Tailwind CSS Team** - For the utility-first CSS framework
- **All Contributors** - For making this project better

---

## 📞 **Contact**

- **GitHub:** [@abdulraheemnohri](https://github.com/abdulraheemnohri)
- **Email:** abdulraheemnohari@gmail.com
- **Project:** [EdgeVision AI Studio](https://github.com/abdulraheemnohri/EdgeVision-AI-Studio)

---

## 🇵🇰 **اردو میں**

یہ پراجیکٹ **پاکستان** میں بنایا گیا ہے اور **اردو** زبان کو سپورٹ کرتا ہے۔

### **تجدید شدہ خصوصیات:**

✅ **مکمل انسٹالیشن گائیڈ** - ہر مرحلہ کے لیے تفصیلی ہدایات
✅ **ماڈرن UI/UX** - جدید ڈیزائن پیٹرنز
✅ **ریسپانسیو ڈیزائن** - موبائل، ٹیبلیٹ، اور پی سی کے لیے
✅ **ٹچ آپٹیمائزڈ** - موبائل یوزرز کے لیے بہتر تجربہ
✅ **تیز پرفارمنس** - آپٹیمائزڈ کوڈ
✅ **ایکسسبل** - معذوری کے حامل افراد کے لیے سپورٹ

### **انسٹالیشن (اردو میں):**

1. **ریپوزٹوری کلون کریں:**
   ```bash
   git clone https://github.com/abdulraheemnohri/EdgeVision-AI-Studio.git
   cd EdgeVision-AI-Studio
   ```

2. **ڈپنڈینسیز انسٹال کریں:**
   ```bash
   npm install
   ```

3. **ڈویلپمنٹ سرور شروع کریں:**
   ```bash
   npm run dev
   ```

4. **براؤزر میں اوپن کریں:**
   - `http://localhost:5173`

5. **PWA انسٹال کریں:**
   - ایڈریس بار میں انسٹال آئیکون پر کلک کریں

### **ماڈرن UI خصوصیات:**

- **تاریک/روشن تھیم** - آپ کی پسند کے مطابق
- **ریسپانسیو لی آؤٹ** - ہر سائز کے لیے
- **اینیمیشن** - نرم اور پروفیشنل
- **ٹچ سپورٹ** - موبائل کے لیے بہتر
- **کی بورڈ نیوی گیشن** - کی بورڈ سے کنٹرول

---

<p align="center">
  Made with ❤️ in Pakistan
</p>

<p align="center">
  <a href="https://github.com/abdulraheemnohri/EdgeVision-AI-Studio/stargazers">
    <img src="https://img.shields.io/github/stars/abdulraheemnohri/EdgeVision-AI-Studio?style=social" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/abdulraheemnohri/EdgeVision-AI-Studio/forks">
    <img src="https://img.shields.io/github/forks/abdulraheemnohri/EdgeVision-AI-Studio?style=social" alt="GitHub Forks" />
  </a>
</p>

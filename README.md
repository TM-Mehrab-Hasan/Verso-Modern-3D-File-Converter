# Verso

A modern, fast, and beautiful file converter with a 3D animated interface and smooth UI/UX. Convert between multiple file formats completely locally.

## ✨ Features

- **7 Conversion Types:**
  - Word ↔ PDF
  - Markdown ↔ PDF
  - Markdown ↔ Word
  - PPTX → PDF

- **Beautiful UI/UX:**
  - 3D animated background using Three.js
  - Smooth animations with Framer Motion
  - Glassmorphism design and persistent navbar
  - Drag & drop file upload with auto file type detection
  - Simulated progress tracking and smart warnings

- **Powerful Backend:**
  - Python FastAPI for high performance
  - Pure-python/open-source conversion pipelines (`xhtml2pdf`, `pdf2docx`, `pypandoc`)
  - No external cloud APIs — everything runs on your machine

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **Pandoc** (required for Markdown ↔ Word conversions)
- **LibreOffice** (optional, for PPTX → PDF support)

### 1. Install System Dependencies

**Windows:**

```powershell
winget install --id=JohnMacFarlane.Pandoc -e
```

**macOS:**

```bash
brew install pandoc
```

**Linux:**

```bash
sudo apt-get install pandoc
```

### 2. Run the App

The easiest way to start both the Frontend and Backend simultaneously on Windows is to use the provided PowerShell script:

```powershell
.\start.ps1
```

_(This script will automatically create the Python virtual environment, install dependencies, start both servers in separate windows, and bind them to localhost)._

**Manual Start:**

If you prefer to start them manually (or are on Linux/Mac):

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

_(Runs on http://localhost:8000)_

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

_(Runs on http://localhost:5173)_

## 🛠️ Tech Stack

### Frontend

- React 18 + TypeScript + Vite
- Tailwind CSS (Glassmorphism aesthetics)
- Framer Motion (Micro-animations)
- Three.js + React Three Fiber (3D graphics)

### Backend

- FastAPI + Python
- `pdf2docx` (PDF → Word)
- `pypandoc` (MD ↔ Word/PDF)
- `pdfplumber` (PDF → MD)
- `xhtml2pdf` (MD → PDF)
- `docx2pdf` (Word → PDF)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

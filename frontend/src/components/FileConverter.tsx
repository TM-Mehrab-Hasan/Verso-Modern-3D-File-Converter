import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, Download, Loader2,
  CheckCircle2, XCircle, ArrowLeft, RefreshCw,
  Sparkles, AlertTriangle, AlertCircle,
} from 'lucide-react'
import axios from 'axios'
import { CONVERSIONS, FILE_SIZE_WARN_MB } from '../constants'
import ConversionCard from './ConversionCard'

const API_BASE = 'http://localhost:8000'

interface Props {
  onBack: () => void
  preSelectedConversion: string | null
  onConversionChange: (id: string | null) => void
}

type Status = 'idle' | 'uploading' | 'converting' | 'success' | 'error'

export default function FileConverter({ onBack, preSelectedConversion, onConversionChange }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedConversion, setSelectedConversion] = useState<string | null>(preSelectedConversion)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)
  const [convertedFilename, setConvertedFilename] = useState<string | null>(null)
  const [autoDetectedType, setAutoDetectedType] = useState<string | null>(null)
  const [mismatchWarning, setMismatchWarning] = useState(false)

  // AbortController ref for cancellable requests
  const abortRef = useRef<AbortController | null>(null)
  // Ref for fake-progress interval
  const fakeProgressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync navbar pre-selection
  useEffect(() => {
    if (preSelectedConversion) setSelectedConversion(preSelectedConversion)
  }, [preSelectedConversion])

  // Cleanup on unmount
  useEffect(() => () => {
    fakeProgressRef.current && clearInterval(fakeProgressRef.current)
    abortRef.current?.abort()
  }, [])

  const setConversionAndNotify = (id: string | null) => {
    setSelectedConversion(id)
    onConversionChange(id)
    setMismatchWarning(false)
  }

  const detectFileType = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    return CONVERSIONS.find((c) => c.from.includes(ext))?.id ?? null
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setStatus('idle')
      setError(null)
      setConvertedFileUrl(null)
      setConvertedFilename(null)

      const detected = detectFileType(file)
      setAutoDetectedType(detected)

      if (!selectedConversion) {
        // Nothing pre-selected — auto-pick
        setConversionAndNotify(detected)
      } else if (detected && detected !== selectedConversion) {
        // Pre-selected type conflicts with file extension
        setMismatchWarning(true)
      }
    },
    [selectedConversion]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: status === 'converting' || status === 'uploading',
  })

  // --- Fake progress during backend processing ---
  const startFakeProgress = (startAt: number) => {
    setProgress(startAt)
    fakeProgressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          clearInterval(fakeProgressRef.current!)
          return 92
        }
        // Slow down as it approaches 92%
        return p + Math.max(0.3, (92 - p) * 0.04)
      })
    }, 150)
  }

  const stopFakeProgress = () => {
    fakeProgressRef.current && clearInterval(fakeProgressRef.current)
    setProgress(100)
  }

  // --- Conversion ---
  const handleConvert = async () => {
    if (!selectedFile || !selectedConversion) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setStatus('uploading')
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      setStatus('converting')
      startFakeProgress(10)

      const response = await axios.post(
        `${API_BASE}/convert/${selectedConversion}`,
        formData,
        {
          responseType: 'blob',
          signal: abortRef.current.signal,
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 10))
          },
        }
      )

      stopFakeProgress()

      const conversion = CONVERSIONS.find((c) => c.id === selectedConversion)
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '') + '.' + conversion?.to

      setConvertedFilename(filename)
      setConvertedFileUrl(URL.createObjectURL(response.data))
      setStatus('success')
    } catch (err: any) {
      stopFakeProgress()
      if (axios.isCancel(err) || err?.code === 'ERR_CANCELED') return
      setStatus('error')
      setError(err.response?.data?.detail ?? err.message ?? 'Conversion failed')
    }
  }

  // --- Download + cleanup ---
  const handleDownload = async () => {
    if (!convertedFileUrl || !convertedFilename) return

    const a = document.createElement('a')
    a.href = convertedFileUrl
    a.download = convertedFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Call backend cleanup (fire-and-forget)
    try {
      await axios.delete(`${API_BASE}/cleanup/${convertedFilename}`)
    } catch { /* non-critical */ }
  }

  // --- Reset (cancels in-flight request) ---
  const handleReset = () => {
    abortRef.current?.abort()
    fakeProgressRef.current && clearInterval(fakeProgressRef.current)
    setSelectedFile(null)
    setConversionAndNotify(null)
    setStatus('idle')
    setProgress(0)
    setError(null)
    setAutoDetectedType(null)
    setMismatchWarning(false)
    if (convertedFileUrl) URL.revokeObjectURL(convertedFileUrl)
    setConvertedFileUrl(null)
    setConvertedFilename(null)
  }

  // "Convert another" — keeps conversion type, clears only the file/result
  const handleConvertAnother = () => {
    if (convertedFileUrl) URL.revokeObjectURL(convertedFileUrl)
    setSelectedFile(null)
    setStatus('idle')
    setProgress(0)
    setError(null)
    setAutoDetectedType(null)
    setMismatchWarning(false)
    setConvertedFileUrl(null)
    setConvertedFilename(null)
  }

  const getAvailableConversions = () => {
    if (!selectedFile) return CONVERSIONS
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() ?? ''
    const filtered = CONVERSIONS.filter((c) => c.from.includes(ext))
    return filtered.length > 0 ? filtered : CONVERSIONS
  }

  const canConvert = !!selectedFile && !!selectedConversion
    && status !== 'converting' && status !== 'uploading'
  const fileSizeMB = selectedFile ? selectedFile.size / 1024 / 1024 : 0
  const isLargeFile = fileSizeMB > FILE_SIZE_WARN_MB

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h2 className="text-3xl font-bold gradient-text">Convert Your Files</h2>
        <button
          onClick={handleReset}
          disabled={status === 'converting'}
          className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Upload + Conversion Selector ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">

          {/* Upload Area */}
          <div className="glass p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload File
            </h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-purple-400 bg-purple-400/10' : 'border-slate-700 hover:border-slate-500'}
                ${status === 'converting' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} className="space-y-3">
                <FileText className="w-14 h-14 mx-auto text-purple-400" />
                <div>
                  <p className="text-base font-medium">{isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}</p>
                  <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                </div>
              </motion.div>
            </div>

            {/* Selected file info */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 space-y-2">
                  <div className="glass p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className={`text-xs mt-0.5 ${isLargeFile ? 'text-amber-400' : 'text-slate-400'}`}>
                          {fileSizeMB.toFixed(2)} MB
                          {isLargeFile && ' — large file, may take longer'}
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleReset() }} className="text-slate-400 hover:text-red-400 transition-colors ml-2">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Large file warning */}
                  {isLargeFile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      Files over {FILE_SIZE_WARN_MB}MB may take 30+ seconds to convert
                    </motion.div>
                  )}

                  {/* Mismatch warning */}
                  {mismatchWarning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-xs text-orange-300 bg-orange-400/10 border border-orange-400/20 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        This file type is best suited for{' '}
                        <button
                          className="underline font-semibold hover:text-orange-200"
                          onClick={() => { setConversionAndNotify(autoDetectedType); setMismatchWarning(false) }}
                        >
                          {CONVERSIONS.find((c) => c.id === autoDetectedType)?.label ?? autoDetectedType}
                        </button>
                        . Click to switch, or keep your selection.
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Conversion Selector — always visible */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Select Conversion
              {autoDetectedType && (
                <span className="text-xs text-purple-400 ml-auto bg-purple-400/10 px-2 py-0.5 rounded-full">✦ Auto-detected</span>
              )}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {getAvailableConversions().map((c) => (
                <ConversionCard
                  key={c.id}
                  conversion={c}
                  selected={selectedConversion === c.id}
                  autoDetected={autoDetectedType === c.id}
                  onClick={() => setConversionAndNotify(c.id)}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: Action + Status ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">

          {/* Convert Button */}
          <div className="glass p-8 rounded-2xl">
            <motion.button
              onClick={handleConvert}
              disabled={!canConvert}
              whileHover={canConvert ? { scale: 1.02 } : {}}
              whileTap={canConvert ? { scale: 0.98 } : {}}
              className="w-full relative px-8 py-5 text-lg font-semibold rounded-xl overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {status === 'converting' || status === 'uploading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{status === 'uploading' ? 'Uploading...' : 'Converting...'}</>
                ) : !selectedFile ? (
                  <><Upload className="w-5 h-5" />Upload a file first</>
                ) : !selectedConversion ? (
                  <><Sparkles className="w-5 h-5" />Select a conversion type</>
                ) : (
                  <><Sparkles className="w-5 h-5" />Convert Now</>
                )}
              </span>
            </motion.button>

            {/* Progress bar */}
            <AnimatePresence>
              {(status === 'uploading' || status === 'converting') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{status === 'uploading' ? 'Uploading...' : 'Converting...'}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'linear', duration: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Success */}
          <AnimatePresence>
            {status === 'success' && convertedFileUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="glass p-8 rounded-2xl text-center space-y-5"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }}>
                  <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Conversion Complete!</h3>
                  <p className="text-slate-400 text-sm">Your file has been converted successfully</p>
                </div>

                <button onClick={handleDownload} className="w-full relative px-8 py-4 text-base font-semibold rounded-xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Download className="w-5 h-5" />
                    Download {convertedFilename}
                  </span>
                </button>

                {/* Convert another — keeps conversion type */}
                <button
                  onClick={handleConvertAnother}
                  className="w-full px-8 py-3 text-sm glass rounded-xl hover:bg-white/10 transition-colors text-slate-300"
                >
                  Convert another file
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="glass p-8 rounded-2xl text-center space-y-5"
              >
                <XCircle className="w-16 h-16 mx-auto text-red-400" />
                <div>
                  <h3 className="text-2xl font-bold mb-1">Conversion Failed</h3>
                  <p className="text-slate-400 text-sm break-words">{error}</p>
                </div>
                <button onClick={handleReset} className="w-full px-8 py-3 glass rounded-xl hover:bg-white/10 transition-colors">
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works — only when totally idle */}
          {status === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-8 rounded-2xl space-y-4">
              <h3 className="text-xl font-semibold">How it works</h3>
              <ol className="space-y-3 text-slate-300">
                {['Upload your file by dragging or clicking', 'Select the conversion type (auto-detected)', 'Click Convert and download your file'].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

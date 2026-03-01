import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileConverter from './components/FileConverter.tsx'
import Background3D from './components/Background3D.tsx'
import Navbar from './components/Navbar.tsx'
import { Sparkles } from 'lucide-react'

function App() {
  const [showConverter, setShowConverter] = useState(false)
  // Persist selected conversion across Back navigation
  const [selectedConversion, setSelectedConversion] = useState<string | null>(null)

  const handleNavSelect = (id: string) => {
    setSelectedConversion(id)
    setShowConverter(true)
  }

  const handleBack = () => {
    setShowConverter(false)
    // selectedConversion intentionally NOT cleared — persists for next visit
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0"><Background3D /></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950/90 via-purple-950/80 to-slate-950/90" />

      <Navbar
        selectedConversion={selectedConversion}
        onSelectConversion={handleNavSelect}
        onLogoClick={handleBack}
      />

      <div className="relative z-10 pt-14">
        <AnimatePresence mode="wait">
          {!showConverter ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              /* Reduced padding so CTA is always above the fold */
              className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-center space-y-4 mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block mb-2"
                >
                  <Sparkles className="w-16 h-16 text-purple-400" />
                </motion.div>

                <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-2">
                  Verso
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto"
                >
                  Transform your files instantly — pick a format above or click below
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-3 text-sm text-slate-400"
                >
                  {['Word ↔ PDF', 'PPTX → PDF', 'MD ↔ Word', 'PDF ↔ MD'].map((t) => (
                    <div key={t} className="glass px-4 py-1.5 rounded-full">{t}</div>
                  ))}
                </motion.div>
              </motion.div>

              {/* CTA always visible */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConverter(true)}
                className="group relative px-12 py-4 text-xl font-semibold rounded-2xl overflow-hidden mb-12"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-[length:200%_200%]" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                  Start Converting
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    →
                  </motion.span>
                </span>
              </motion.button>

              {/* Feature cards */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full"
              >
                {[
                  { title: 'Lightning Fast', desc: 'Convert files in seconds' },
                  { title: 'Secure', desc: 'Your files stay private' },
                  { title: 'Free', desc: 'No limits, no sign-up' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="glass p-5 rounded-2xl text-center"
                  >
                    <h3 className="text-base font-semibold mb-1">{f.title}</h3>
                    <p className="text-slate-400 text-sm">{f.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="converter"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="min-h-[calc(100vh-56px)] py-8"
            >
              <FileConverter
                onBack={handleBack}
                preSelectedConversion={selectedConversion}
                onConversionChange={setSelectedConversion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App

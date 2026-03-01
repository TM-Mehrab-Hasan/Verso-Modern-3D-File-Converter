import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { CONVERSIONS, CATEGORY_COLOR } from '../constants'

interface NavbarProps {
  selectedConversion: string | null
  onSelectConversion: (id: string) => void
  onLogoClick: () => void
}

export default function Navbar({ selectedConversion, onSelectConversion, onLogoClick }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ backdropFilter: 'blur(20px)', background: 'rgba(2,4,20,0.78)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-14">
        {/* Logo */}
        <button onClick={onLogoClick} className="flex items-center gap-2 flex-shrink-0 group">
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <img src="/logo.png" alt="Verso Logo" className="w-8 h-8 rounded-lg shadow-lg" />
          </motion.div>
          <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 hidden sm:block">
            Verso
          </span>
        </button>

        <div className="w-px h-6 bg-white/10 flex-shrink-0" />

        {/* Conversion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-1">
          {CONVERSIONS.map((c) => {
            const active = selectedConversion === c.id
            const dot = CATEGORY_COLOR[c.category]
            return (
              <motion.button
                key={c.id}
                onClick={() => onSelectConversion(c.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className={`
                  relative flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 border
                  ${active
                    ? 'border-purple-500/70 text-white'
                    : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill-bg"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  {c.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

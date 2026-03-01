import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

interface ConversionType {
  id: string
  name: string
  from: string[]
  to: string
}

interface Props {
  conversion: ConversionType
  selected: boolean
  autoDetected: boolean
  onClick: () => void
}

export default function ConversionCard({
  conversion,
  selected,
  autoDetected,
  onClick,
}: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-4 rounded-xl text-left transition-all
        ${
          selected
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-purple-400'
            : 'glass border border-transparent hover:border-slate-600'
        }
      `}
    >
      {autoDetected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-1"
        >
          <Zap className="w-3 h-3 text-slate-900" />
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium">
              {conversion.from.join('/')}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-medium">
              {conversion.to}
            </span>
          </div>
        </div>

        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>

      <p className="text-sm text-slate-400 mt-2">{conversion.name}</p>
    </motion.button>
  )
}

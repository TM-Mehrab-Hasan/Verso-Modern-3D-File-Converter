export interface ConversionType {
  id: string
  label: string
  name: string      // alias for ConversionCard compat
  from: string[]
  to: string
  category: 'pdf' | 'word' | 'markdown'
}

export const CONVERSIONS: ConversionType[] = [
  { id: 'word-to-pdf',  label: 'Word → PDF',  name: 'Word to PDF',  from: ['docx', 'doc'],    to: 'pdf',  category: 'pdf'      },
  { id: 'pdf-to-word',  label: 'PDF → Word',  name: 'PDF to Word',  from: ['pdf'],             to: 'docx', category: 'word'     },
  { id: 'pptx-to-pdf',  label: 'PPTX → PDF',  name: 'PPTX to PDF',  from: ['pptx', 'ppt'],    to: 'pdf',  category: 'pdf'      },
  { id: 'md-to-pdf',    label: 'MD → PDF',    name: 'MD to PDF',    from: ['md', 'markdown'],  to: 'pdf',  category: 'pdf'      },
  { id: 'md-to-word',   label: 'MD → Word',   name: 'MD to Word',   from: ['md', 'markdown'],  to: 'docx', category: 'word'     },
  { id: 'pdf-to-md',    label: 'PDF → MD',    name: 'PDF to MD',    from: ['pdf'],             to: 'md',   category: 'markdown' },
  { id: 'word-to-md',   label: 'Word → MD',   name: 'Word to MD',   from: ['docx', 'doc'],     to: 'md',   category: 'markdown' },
]

// Category dot colours for the navbar pills
export const CATEGORY_COLOR: Record<ConversionType['category'], string> = {
  pdf:      'bg-blue-400',
  word:     'bg-purple-400',
  markdown: 'bg-emerald-400',
}

export const FILE_SIZE_WARN_MB = 5

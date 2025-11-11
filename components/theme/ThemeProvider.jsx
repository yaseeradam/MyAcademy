'use client'

import { useEffect } from 'react'
import { applyThemeColors } from '@/lib/theme-colors'

function ThemeProvider({ children, schoolSettings }) {
  useEffect(() => {
    if (schoolSettings) {
      applyThemeColors(schoolSettings)
    }
  }, [schoolSettings])

  return <>{children}</>
}

export { ThemeProvider }
export default ThemeProvider

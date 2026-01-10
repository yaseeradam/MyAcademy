"use client"

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export default function StatusBarInit() {
  useEffect(() => {
    // Only run on native platforms (iOS/Android), not on web
    if (!Capacitor.isNativePlatform()) {
      return
    }

    const applyStatusBar = async () => {
      try {
        // Dynamically import StatusBar only on native platforms
        const { StatusBar, Style } = await import('@capacitor/status-bar')

        const root = document.documentElement
        const isDark = root.classList.contains('dark')
        const styles = getComputedStyle(root)

        const primary = styles.getPropertyValue('--theme-primary').trim() || '#3B82F6'
        const dark700 = styles.getPropertyValue('--theme-dark-700').trim() || '#1D4ED8'

        const bgColor = isDark ? dark700 : primary
        const iconStyle = isDark ? Style.Light : Style.Light

        StatusBar.setOverlaysWebView({ overlay: false })
        StatusBar.show()
        StatusBar.setStyle({ style: iconStyle })
        StatusBar.setBackgroundColor({ color: bgColor })
      } catch (e) {
        // Ignore errors on web/non-capacitor envs
        console.log('StatusBar not available:', e.message)
      }
    }

    // Initial apply
    applyStatusBar()

    // React to theme changes (via next-themes toggling the .dark class)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class' || m.attributeName === 'style') {
          applyStatusBar()
          break
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [])

  return null
}

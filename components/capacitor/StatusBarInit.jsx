"use client"

import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarInit() {
  useEffect(() => {
    const applyStatusBar = () => {
      try {
        const root = document.documentElement
        const isDark = root.classList.contains('dark')
        const styles = getComputedStyle(root)

        const primary = styles.getPropertyValue('--theme-primary').trim() || '#3B82F6'
        const light100 = styles.getPropertyValue('--theme-light-100').trim() || '#DBEAFE'
        const dark700 = styles.getPropertyValue('--theme-dark-700').trim() || '#1D4ED8'

        const bgColor = isDark ? dark700 : primary
        const iconStyle = isDark ? Style.Light : Style.Light // keep white icons on brand/light backgrounds
        // Ensure webview does not overlay the status bar; creates a safe area
        StatusBar.setOverlaysWebView({ overlay: false })
        StatusBar.show()
        StatusBar.setStyle({ style: iconStyle })
        StatusBar.setBackgroundColor({ color: bgColor })
      } catch (e) {
        // Ignore errors on web/non-capacitor envs
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


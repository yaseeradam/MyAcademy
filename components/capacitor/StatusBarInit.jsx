"use client"

import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarInit() {
  useEffect(() => {
    // Show status bar
    StatusBar.show().catch(() => {})

    // Set text/icons style
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

    // Change background color
    StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {})
  }, [])

  return null
}


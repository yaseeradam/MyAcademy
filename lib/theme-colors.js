// Theme color utility - converts gray colors to school's brand color

export function getThemeColor(schoolSettings) {
  const brandColor = schoolSettings?.brandColor || '#3B82F6' // Default blue
  
  return {
    primary: brandColor,
    // Light shades (replacing gray-50, gray-100, gray-200)
    light: {
      50: adjustColorBrightness(brandColor, 95),
      100: adjustColorBrightness(brandColor, 90),
      200: adjustColorBrightness(brandColor, 80),
    },
    // Medium shades (replacing gray-300, gray-400, gray-500)
    medium: {
      300: adjustColorBrightness(brandColor, 70),
      400: adjustColorBrightness(brandColor, 60),
      500: brandColor,
    },
    // Dark shades (replacing gray-600, gray-700, gray-800)
    dark: {
      600: adjustColorBrightness(brandColor, -10),
      700: adjustColorBrightness(brandColor, -20),
      800: adjustColorBrightness(brandColor, -30),
    }
  }
}

function adjustColorBrightness(hex, percent) {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)
  
  // Adjust brightness
  if (percent > 0) {
    // Lighten
    r = Math.round(r + (255 - r) * (percent / 100))
    g = Math.round(g + (255 - g) * (percent / 100))
    b = Math.round(b + (255 - b) * (percent / 100))
  } else {
    // Darken
    const factor = 1 + (percent / 100)
    r = Math.round(r * factor)
    g = Math.round(g * factor)
    b = Math.round(b * factor)
  }
  
  // Ensure values are within 0-255
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function applyThemeColors(schoolSettings) {
  if (typeof document === 'undefined') return
  
  const colors = getThemeColor(schoolSettings)
  const root = document.documentElement
  
  // Set CSS variables
  root.style.setProperty('--theme-primary', colors.primary)
  root.style.setProperty('--theme-light-50', colors.light[50])
  root.style.setProperty('--theme-light-100', colors.light[100])
  root.style.setProperty('--theme-light-200', colors.light[200])
  root.style.setProperty('--theme-medium-300', colors.medium[300])
  root.style.setProperty('--theme-medium-400', colors.medium[400])
  root.style.setProperty('--theme-medium-500', colors.medium[500])
  root.style.setProperty('--theme-dark-600', colors.dark[600])
  root.style.setProperty('--theme-dark-700', colors.dark[700])
  root.style.setProperty('--theme-dark-800', colors.dark[800])
}

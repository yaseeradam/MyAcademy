import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import StatusBarInit from "@/components/capacitor/StatusBarInit";

export const metadata = {
  title: "My Academy",
  description: "Comprehensive school management system for My Academy",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
          <StatusBarInit />
        </ThemeProvider>
      </body>
    </html>
  );
}

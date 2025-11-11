import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import StatusBarInit from "@/components/capacitor/StatusBarInit";

export const metadata = {
  title: "EduManage Nigeria - School Management System",
  description: "Comprehensive school management system for Nigerian private schools",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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

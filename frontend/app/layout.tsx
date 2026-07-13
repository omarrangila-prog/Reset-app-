import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/SaveToast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";
import { QuickRescue } from "@/components/ui/QuickRescue";
import { Atmosphere } from "@/components/ui/Atmosphere";

export const metadata: Metadata = {
  title: "RESET — A calm space to break the cycle",
  description: "RESET helps you interrupt urges, process emotions, and rebuild one day at a time.",
  metadataBase: new URL("https://reset-recovery-helper.vercel.app"),
  openGraph: {
    title: "RESET — A calm space to break the cycle",
    description: "Interrupt urges and rebuild one day at a time.",
    url: "https://reset-recovery-helper.vercel.app",
    siteName: "RESET",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RESET",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RESET — A calm space to break the cycle",
    description: "Interrupt urges and rebuild one day at a time.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon-16.png?v=2", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png?v=2", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png?v=2", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon-32.png?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RESET",
  },
};

export const viewport = {
  themeColor: "#F5F7FC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Pre-paint theme init — sets data-theme before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="theme-color" content="#F5F7FC" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RESET" />
      </head>
      <body className="noise-overlay">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider />
            <Atmosphere />
            <ErrorBoundary>
              <main id="main">{children}</main>
            </ErrorBoundary>
            <QuickRescue />
            <InstallPrompt />
          </ToastProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  // Only reload for a genuine UPDATE (a controller already existed).
                  // On the first-ever install there is no prior controller, so we
                  // must NOT reload — that caused the page (and splash) to restart.
                  var hadController = !!navigator.serviceWorker.controller;
                  var reloaded = false;
                  navigator.serviceWorker.register('/sw.js').then(function (reg) {
                    reg.update();
                    reg.addEventListener('updatefound', function () {
                      var sw = reg.installing;
                      if (!sw) return;
                      sw.addEventListener('statechange', function () {
                        if (sw.state === 'activated' && hadController && !reloaded) {
                          reloaded = true;
                          window.location.reload();
                        }
                      });
                    });
                  }).catch(function () {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

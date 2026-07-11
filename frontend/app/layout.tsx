import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
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
          <AuthProvider />
          <Atmosphere />
          <ErrorBoundary>
            <main id="main">{children}</main>
          </ErrorBoundary>
          <QuickRescue />
          <InstallPrompt />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').then(function (reg) {
                    // Check for a new worker on every load so fresh deploys are
                    // picked up promptly instead of lingering on a stale build.
                    reg.update();
                    reg.addEventListener('updatefound', function () {
                      var sw = reg.installing;
                      if (!sw) return;
                      sw.addEventListener('statechange', function () {
                        // A new worker took control while a page was already open —
                        // reload once to swap in the new assets.
                        if (sw.state === 'activated' && navigator.serviceWorker.controller) {
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

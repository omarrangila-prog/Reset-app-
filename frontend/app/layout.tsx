import type { Metadata } from "next";
import "../styles/globals.css";
import { CrisisBar } from "@/components/CrisisBar";

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
        alt: "RESET - A calm place to break the cycle",
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
  themeColor: "#141413",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
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
  themeColor: "#141413",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#141413" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RESET" />
      </head>
      <body className="noise-overlay">
        {children}
        <CrisisBar position="bottom" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

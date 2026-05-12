import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "RESET — Behavioral Intervention System",
  description:
    "Break compulsive habits with AI behavioral coaching and psychological interruption.",
  themeColor: "#0A0A0B",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="noise-overlay">{children}</body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ ÜKS metadata (õige koht)
export const metadata = {
  metadataBase: new URL("https://johann3000.space"),

  title: "Johann 3000",
  description: "Making pictures",

  openGraph: {
    title: "Johann 3000",
    description: "Making pictures",
    images: ["/og.jpg"],
  },

  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
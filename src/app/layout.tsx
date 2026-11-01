import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Triarch Interiors | Premium Interior Design in Hyderabad",
    template: "%s | Triarch Interiors",
  },
  description:
    "Triarch Interiors — end-to-end residential interior design across Hyderabad, Telangana. Explore completed projects, get an indicative estimate, and book a free consultation.",
  keywords: [
    "interior designers in Hyderabad",
    "Hyderabad interiors",
    "residential interior design Hyderabad",
    "modular kitchen Hyderabad",
    "home interior design",
    "Triarch Interiors",
  ],
  metadataBase: new URL("https://triarchinteriors.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://triarchinteriors.com",
    siteName: "Triarch Interiors",
    title: "Triarch Interiors | Premium Interior Design in Hyderabad",
    description:
      "End-to-end residential interior design across Hyderabad. Book your free consultation today.",
    images: [{ url: "/hero.jpg", width: 1200, height: 630, alt: "Triarch Interiors" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-512.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1a1a1a] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}

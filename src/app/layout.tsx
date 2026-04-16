import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Lora,
  Playfair_Display,
  Inter,
  DM_Sans,
  Cinzel,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Romantic — soft, warm serif
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Elegant — refined serif headings, clean sans body
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Minimal — clean geometric sans
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// Cinematic — dramatic display serif
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Love, Coded — AI-Powered Wedding Website Creator",
  description:
    "Build a cinematic, editorial-style wedding website through a conversational AI experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable} ${geistMono.variable}
        ${cormorant.variable} ${lora.variable}
        ${playfair.variable} ${dmSans.variable}
        ${inter.variable} ${cinzel.variable}
        h-full antialiased
      `}
    >
      <body className="h-full overflow-hidden font-sans">{children}</body>
    </html>
  );
}

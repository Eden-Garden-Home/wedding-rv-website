import type { Metadata } from "next";
import { Bodoni_Moda, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valentina e Riccardo | 22 maggio 2027",
  description:
    "Il sito del matrimonio di Valentina e Riccardo. Cerimonia il 22 maggio 2027 a Segrate, ricevimento al Fondaco dei Mercanti.",
  applicationName: "Valentina e Riccardo",
  keywords: [
    "matrimonio",
    "wedding website",
    "Valentina e Riccardo",
    "22 maggio 2027",
    "Segrate",
    "Fondaco dei Mercanti",
  ],
  openGraph: {
    title: "Valentina e Riccardo | 22 maggio 2027",
    description:
      "Una giornata pensata come un albero che cresce: radici, luce e futuro condiviso.",
    type: "website",
    locale: "it_IT",
    siteName: "Valentina e Riccardo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valentina e Riccardo | 22 maggio 2027",
    description:
      "Cerimonia a Segrate e ricevimento al Fondaco dei Mercanti.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${instrumentSans.variable} ${bodoniModa.variable} h-full bg-background antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-background text-ink">
        {children}
      </body>
    </html>
  );
}

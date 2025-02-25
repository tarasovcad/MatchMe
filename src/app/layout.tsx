import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import {ThemeProvider} from "@/providers/theme-provider";
import FaviconUpdater from "@/components/other/FaviconUpdater";
import GlobaleHotkeys from "@/utils/other/globaleHotkeys";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchMe",
  description: "Find Your Team, Start Your Dream",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="selection:bg-primary selection:text-white ">
      <head>
        <link rel="icon" href="/light-icon.svg" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <FaviconUpdater />
          <GlobaleHotkeys />
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

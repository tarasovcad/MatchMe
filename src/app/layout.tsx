import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import {ThemeProvider} from "@/providers/theme-provider";
import FaviconUpdater from "@/components/other/FaviconUpdater";
import GlobaleHotkeys from "@/utils/other/globaleHotkeys";
import {Analytics} from "@vercel/analytics/react";
import {SpeedInsights} from "@vercel/speed-insights/next";
import {PostHogProvider} from "@/providers/PostHogProvider";
import QueryProvider from "@/providers/QueryProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
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
    <html lang="en" suppressHydrationWarning className="selection:bg-primary selection:text-white">
      <head>
        <link rel="icon" href="/light-icon.svg" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <QueryProvider>
          <PostHogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange>
              <FaviconUpdater />
              <GlobaleHotkeys />
              <Analytics />
              <SpeedInsights />
              {children}
            </ThemeProvider>
            <Toaster
              position="top-right"
              richColors
              toastOptions={{closeButton: true}}
              offset={25}
              mobileOffset={25}
              gap={20}
            />
          </PostHogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

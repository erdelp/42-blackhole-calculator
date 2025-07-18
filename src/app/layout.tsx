import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "42 Blackhole Calculator",
  description: "Calculate your blackhole date for 42 Paris",
  keywords: "42 school, blackhole calculator, 42 programming, 42 milestones, 42 pace, 42 paris",
  authors: [{ name: "edelplan" }],
  openGraph: {
    title: "42 Blackhole Calculator",
    description: "Calculate your blackhole date for 42 Paris",
    type: "website",
    images: ["/logo/42_Logo.svg.png"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>●</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

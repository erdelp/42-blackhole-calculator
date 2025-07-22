import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "42 Blackhole Calculator",
  description: "Calculate your blackhole date for 42 🕳️ ",
  keywords: "42 school, blackhole calculator, 42 programming, 42 milestones, 42 pace, 42 paris",
  authors: [{ name: "erdelp" }],
  openGraph: {
    title: "42 Blackhole Calculator",
    description: "Calculate your blackhole date for 42 🕳️",
    type: "website",
    images: ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='80' font-size='90'%3E🕳️%3C/text%3E%3C/svg%3E"],
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

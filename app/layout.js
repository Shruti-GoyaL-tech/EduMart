import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "./components/AuthProvider";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer"; // 1. Import the Footer component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EduMart",
  description: "A marketplace for students.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* You only need to include this script once */}
        <script src="https://cdn.lordicon.com/lordicon.js"></script>
      </head>
      {/* 2. Apply flexbox classes to the body to create the main layout container */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Toaster position="top-center" />
        <AuthProvider>
          <Navbar />
          {/* 3. Wrap children in a <main> tag that grows to fill all available space */}
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}


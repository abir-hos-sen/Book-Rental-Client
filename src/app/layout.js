import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ToastContainer from "../components/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Property Rental | Premium Property Booking",
  description: "Secure, modern, and direct property rentals and bookings marketplace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "col", flexFlow: "column nowrap" }} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <div style={{ padding: '0.5rem 1rem 0' }}>
              <Navbar />
            </div>
            <main style={{ flex: 1, minHeight: "60vh", paddingTop: "5.5rem" }}>
              {children}
            </main>
            <Footer />
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CatalogProvider } from "@/context/CatalogContext";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panka | Handmade Tamales in Miami",
  description:
    "Handmade tamales crafted from traditional recipes with the finest ingredients. Delivery in Miami.",
  keywords: ["tamales", "handmade", "panka", "mexican food", "miami", "delivery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <CatalogProvider>
                <AnnouncementBar />
                <Navbar />
                <CartDrawer />
                <main className="min-h-screen">{children}</main>
                <Footer />
              </CatalogProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

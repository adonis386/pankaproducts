import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { SettingsProvider } from "@/context/SettingsContext";
import CookieConsent from "@/components/CookieConsent";
import SkipToContent from "@/components/SkipToContent";
import StoreOnly from "@/components/StoreOnly";
import WhatsAppButton from "@/components/WhatsAppButton";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panka | Artisan tamales in Miami",
  description:
    "Family recipes, fresh nixtamalized masa, and honest ingredients — tamales made by hand and delivered in Miami.",
  keywords: [
    "tamales",
    "handmade tamales",
    "Panka",
    "Mexican food Miami",
    "tamale delivery",
    "Oaxacan tamales",
  ],
  // Favicon: `src/app/icon.ico` (App Router). Apple touch: `src/app/apple-icon.png`.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${plusJakarta.variable} ${notoSerif.variable} font-sans antialiased`}>
        <SettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <CatalogProvider>
                  <SkipToContent />
                  <StoreOnly>
                    <AnnouncementBar />
                    <Navbar />
                    <CartDrawer />
                  </StoreOnly>
                  <main id="main-content" className="min-h-screen">
                    {children}
                  </main>
                  <StoreOnly>
                    <Footer />
                    <CookieConsent />
                    <WhatsAppButton />
                  </StoreOnly>
                </CatalogProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

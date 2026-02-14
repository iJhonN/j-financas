import type { Metadata, Viewport } from "next"; // Importe 'Viewport' aqui
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Configuração de Título e Descrição
export const metadata: Metadata = {
  title: "J Finanças",
  description: "Criado por Jhon",
  icons: "/logo.png", // Sua logo que já configuramos antes
};

// 2. Configuração que TRAVA o ZOOM (Essencial para mobile)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Isso impede o movimento de pinça (zoom)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br"> {/* Alterei para pt-br para melhor acessibilidade */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
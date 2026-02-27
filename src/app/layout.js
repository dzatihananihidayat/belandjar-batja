import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora", // Ini tersambung ke --font-serif di globals.css tadi
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Belandjar Batja",
  description: "Perpustakaan Pribadi Zakia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${lora.variable} ${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
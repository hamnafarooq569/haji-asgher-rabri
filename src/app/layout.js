import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/provider";
import AppBootstrap from "@/components/AppBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Haji Asgher Rabri",
  description: "Delicious food ordering experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable}`}
      >
        <StoreProvider>
          <AppBootstrap>{children}</AppBootstrap>
        </StoreProvider>
      </body>
    </html>
  );
}
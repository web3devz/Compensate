import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloProvider, AppStateProvider, PetraWalletProvider, ThemeProvider } from "./provider";
import { Toaster } from "@/components/ui/toaster";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Compensate",
  description: "Compensate your employees or freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-black-100`}
      >
        <ApolloProvider>
          <AppStateProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PetraWalletProvider>
              {children}
              <Toaster />
            </PetraWalletProvider>
          </ThemeProvider>
          </AppStateProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}

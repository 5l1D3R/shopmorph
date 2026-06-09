import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopMorph",
  description: "ShopMorph admin login"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

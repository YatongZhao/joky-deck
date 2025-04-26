import type { Metadata } from "next";
import '@mantine/core/styles.css';
import { ColorSchemeScript } from "@mantine/core";

export const metadata: Metadata = {
  title: "Joky Deck H5",
  description: "Joky Deck H5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body style={{ overscrollBehaviorX: 'none' }}>
        {children}
      </body>
    </html>
  );
}

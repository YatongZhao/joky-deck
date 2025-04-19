import type { Metadata } from "next";
import '@mantine/core/styles.css';
import './icons/style.css';
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { theme } from "./theme";

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
      <body>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}

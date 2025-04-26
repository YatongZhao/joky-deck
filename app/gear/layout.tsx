import { MantineProvider } from "@mantine/core";
import type { Metadata } from "next";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Gear",
  description: "Gear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MantineProvider theme={theme}>
      { children }
    </MantineProvider>
  );
}

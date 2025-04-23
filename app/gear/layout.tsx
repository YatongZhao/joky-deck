import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gear",
  description: "Gear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

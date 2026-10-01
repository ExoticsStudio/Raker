import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAKER ADH NASIONAL 2026 | Registration",
  description: "Event registration and rundown access portal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

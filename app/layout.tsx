import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NiALS | Assessment & Student Portal",
  description: "NiALS Assessment Services — student assessments, counselling and progress.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
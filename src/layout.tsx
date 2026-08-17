import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T&A App",
  description: "Time & Attendance / Award Interpretation — sprint 1.1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

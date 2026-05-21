import type { Metadata } from "next";
import { ToastViewport } from "@/components/shared/ToastViewport";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoom Clone AI Workspace",
  description: "AI-powered meeting workspace frontend",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}

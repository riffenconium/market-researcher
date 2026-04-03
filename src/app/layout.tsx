import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Market Researcher",
  description: "AI-powered agentic market research platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="w-56 bg-[#0f3460] text-white flex flex-col">
            <div className="p-4 border-b border-blue-800">
              <h1 className="text-lg font-bold">AI Researcher</h1>
              <p className="text-xs text-blue-300 mt-1">Market Intelligence</p>
            </div>
            <div className="flex-1 p-3">
              <Link
                href="/"
                className="block px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors mt-1"
              >
                Settings
              </Link>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

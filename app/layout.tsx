import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortwave — autonomous AI drama studio",
  description:
    "An autonomous, bilingual AI-drama studio: write, render, publish and monetize short-form reels.",
};

const nav = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/mission-control", label: "Mission Control" },
  { href: "/experiments", label: "Experiments" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-widest">
              SHORTWAVE
            </Link>
            <nav className="flex gap-5 text-sm text-[var(--muted)]">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-white">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-[var(--muted)]">
          Shortwave · AI-generated content is always disclosed.
        </footer>
      </body>
    </html>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "oklch(0.97 0.012 80)" }}>
      <div className="text-center max-w-md">
        <p className="font-heading font-black text-8xl text-foreground/10 leading-none mb-4">404</p>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 48), oklch(0.50 0.22 22))" }}
        >
          🌸
        </div>
        <h1 className="font-heading font-black text-2xl text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          This page doesn&apos;t exist — maybe the drop already ended or the link is broken.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "oklch(0.68 0.19 44)" }}
          >
            Back to Store
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-bold border hover:bg-white transition-colors"
            style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.40 0.05 260)" }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

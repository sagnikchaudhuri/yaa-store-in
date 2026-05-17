import Link from "next/link";

const footerCols = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/collections" },
      { label: "New Arrivals", href: "/collections?filter=new" },
      { label: "Special Drops", href: "/#drops-signup" },
      { label: "Figures", href: "/collections?category=figures" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "WhatsApp Group", href: "#" },
      { label: "About YAA", href: "/#about" },
      { label: "Announcements", href: "#" },
    ],
  },
  {
    heading: "Info",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "#110F0D" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-10 md:mb-14">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="font-heading font-black text-primary-foreground text-xs leading-none">
                  Y
                </span>
              </div>
              <span className="font-heading font-black text-xl tracking-tight text-white group-hover:text-primary transition-colors">
                YAA<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed max-w-[200px]">
              Premium anime merch for collectors and fans. Curated with love.
            </p>
            <p className="mt-5 text-white/20 text-xs">
              Powered by Anemone AI 🐱
            </p>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white/40 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/45 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © 2025 YAA Store. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Made for anime fans, by anime fans.
          </p>
        </div>
      </div>
    </footer>
  );
}

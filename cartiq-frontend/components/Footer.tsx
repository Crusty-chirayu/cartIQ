import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-cartiq-border bg-white mt-20">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <AppLogo size={32} text="CartIQ" />

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-cartiq-muted font-medium">
            <Link href="/homepage" className="hover:text-cartiq-foreground transition-colors">Home</Link>
            <Link href="/products" className="hover:text-cartiq-foreground transition-colors">Shop</Link>
            <a href="#" className="hover:text-cartiq-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-cartiq-foreground transition-colors">Terms</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-cartiq-subtle font-mono">
            © {currentYear} CartIQ
          </p>
        </div>
      </div>
    </footer>
  );
}
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/players", label: "Players" },
  { to: "/news", label: "News" },
  { to: "/photos", label: "Photos" },
  { to: "/about", label: "About" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-gold" />
            <span className="font-heading text-xl font-bold text-gradient-gold">SRP SUPER KINGS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={isAdmin ? "/admin" : "/admin/login"}
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="container py-4 flex flex-col gap-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === l.to
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to={isAdmin ? "/admin" : "/admin/login"}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p className="font-heading text-primary text-lg mb-1">SRP SUPER KINGS CRICKETS</p>
          <p>© 2026 All rights reserved.</p>
          <p className="mt-3 text-xs text-muted-foreground/70">Created by P Pavan Kalyan Kumar | BTech AI &amp; ML</p>
        </div>
      </footer>
    </div>
  );
}

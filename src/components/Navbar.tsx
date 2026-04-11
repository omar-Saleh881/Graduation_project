import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X, Shield, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsRepo } from "@/lib/data/repository";

/* ─── Landing‑page section anchors (homepage only) ─── */
const landingSections = [
  { id: "hero", label: "الرئيسية" },
  { id: "features", label: "المميزات" },
  { id: "sections", label: "الأقسام" },
  { id: "how-it-works", label: "كيف تعمل" },
  { id: "about", label: "حول المنصة" },
  { id: "contact", label: "تواصل" },
];

/* ─── Internal page links fallback ─── */
const defaultLinks = [
  { to: "/tools", label: "الأدوات" },
  { to: "/paths", label: "المسارات" },
  { to: "/articles", label: "المقالات" },
  { to: "/content", label: "المكتبة" },
];

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [settings, setSettings] = useState(() => settingsRepo.getById("global"));

  useEffect(() => {
    // Basic reactivity for demo: check localStorage on focus or interval
    const handleFocus = () => setSettings(settingsRepo.getById("global"));
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  /* Track which section is in view (homepage only) */
  useEffect(() => {
    if (!isHomePage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    landingSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHomePage, location.pathname]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {settings?.announcement?.active && (
        <div className="bg-primary text-primary-foreground py-2 text-center text-xs font-medium px-4 flex items-center justify-center gap-2 group transition-colors hover:bg-primary/90">
          <span>{settings.announcement.text}</span>
          {settings.announcement.link && (
            <Link to={settings.announcement.link} className="underline underline-offset-4 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              اكتشف الآن <ChevronLeft className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">{settings?.name || "أدوات AI"}</span>
        </Link>

        {/* ─── Desktop navigation ─── */}
        <div className="hidden md:flex items-center gap-1">
          {isHomePage
            ? landingSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeSection === s.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {s.label}
                </button>
              ))
            : defaultLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      location.pathname === link.to
                        ? "text-primary bg-primary/10"
                        : ""
                    }
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link to="/admin" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
              <Shield className="h-4 w-4" />
              لوحة الإدارة
            </Button>
          </Link>
          
          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* ─── Mobile menu ─── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {isHomePage
            ? landingSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-right px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === s.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {s.label}
                </button>
              ))
            : defaultLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
          <div className="pt-2 mt-2 border-t border-border/50">
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Shield className="h-4 w-4" />
                لوحة الإدارة
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;

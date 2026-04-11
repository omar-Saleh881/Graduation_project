import { Link } from "react-router-dom";
import { Sparkles, Mail, MapPin, Twitter, Github, MessageCircle } from "lucide-react";
import { settingsRepo } from "@/lib/data/repository";
import { useState, useEffect } from "react";

const Footer = () => {
  const [settings, setSettings] = useState(() => settingsRepo.getById("global"));

  useEffect(() => {
    const handleFocus = () => setSettings(settingsRepo.getById("global"));
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <footer className="border-t border-border bg-muted/50">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">{settings?.name || "أدوات AI"}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings?.description || "منصتك العربية الأولى لاكتشاف أفضل أدوات الذكاء الاصطناعي وتطوير مهاراتك الرقمية بأسلوب عملي واحترافي."}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/tools", label: "دليل الأدوات" },
                { to: "/paths", label: "المسارات التعليمية" },
                { to: "/articles", label: "المقالات" },
                { to: "/content", label: "مكتبة المحتوى" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-foreground mb-4">من نحن</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              نسعى لبناء أكبر مرجع عربي شامل لأدوات الذكاء الاصطناعي والمهارات الرقمية — محتوى مُراجع ومُنظّم لكل متعلّم عربي.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>{settings?.contactEmail || "info@ai-tools-ar.com"}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>المنطقة العربية</span>
              </li>
            </ul>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-border/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.github && (
                <a href={settings.socialLinks.github} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-border/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Github className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.discord && (
                <a href={settings.socialLinks.discord} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-border/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} أدوات AI — جميع الحقوق محفوظة`}</p>
          <p>دليلك العربي الشامل لاكتشاف أفضل أدوات الذكاء الاصطناعي</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Wrench, FileText, Library, GraduationCap, 
  Settings, Menu, X, Globe, Sparkles, LogOut, Search, ExternalLink, BookOpen, Map, LayoutPanelLeft, Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sectionsRepo } from "@/lib/data/repository";
import { PlatformSection } from "@/types/platform-section";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "نظرة عامة" },
  { to: "/admin/tools", icon: Wrench, label: "إدارة الأدوات" },
  { to: "/admin/articles", icon: FileText, label: "المقالات" },
  { to: "/admin/content", icon: ExternalLink, label: "محتوى خارجي" },
  { to: "/admin/courses", icon: BookOpen, label: "الكورسات (Courses)" },
  { to: "/admin/paths", icon: Map, label: "المسارات التعليمية" },
  { to: "/admin/sections", icon: LayoutPanelLeft, label: "أقسام المنصة" },
  { to: "/admin/settings", icon: Settings, label: "إعدادات المنصة" },
];

// Resolves a route for a standalone module based on its content_type
const getModuleRoute = (section: PlatformSection) => {
  switch (section.content_type) {
    case 'courses': return `/admin/sections/${section.id}/manage-courses`;
    case 'paths': return `/admin/sections/${section.id}/manage-paths`;
    case 'articles': return `/admin/sections/${section.id}/manage-articles`;
    case 'tools': return `/admin/sections/${section.id}/manage-tools`;
    default: return `/admin/sections/${section.id}/manage-content`;
  }
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [dynamicLinks, setDynamicLinks] = useState<{ to: string, icon: any, label: string }[]>([]);

  useEffect(() => {
    // Load module_mode custom sections to render in sidebar
    const loadModules = () => {
      const activeModules = sectionsRepo.getAll()
        .filter(s => s.module_mode === true && s.is_active !== false)
        .sort((a, b) => a.order - b.order);
      
      setDynamicLinks(activeModules.map(s => ({
        to: getModuleRoute(s),
        icon: Box, // Using standard Box icon for dynamic modules, or s.icon if we build a mapping
        label: s.title_ar
      })));
    };
    
    loadModules();
    // In a real app we might subscribe to changes. Assuming a page refresh or remount is fine for now.
  }, []);

  const allLinks = [...sidebarLinks, ...dynamicLinks];

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-l border-border h-full">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Sparkles className="h-6 w-6" />
            <span className="text-xl font-bold text-foreground">لوحة الإدارة</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 ${
                    isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              م
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">مدير النظام</p>
              <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 mt-2">
            <LogOut className="h-4 w-4" />
            تسجيل خروج
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-card border-l border-border transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-primary" onClick={() => setSidebarOpen(false)}>
            <Sparkles className="h-5 w-5" />
            <span className="text-lg font-bold text-foreground">لوحة الإدارة</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 ${
                    isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Breadcrumb would go here dynamically, keeping it simple for now */}
            <h1 className="text-lg font-bold hidden sm:block">
              {sidebarLinks.find(l => l.to === location.pathname)?.label || "لوحة الإدارة"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                className="h-9 w-64 rounded-md border border-input bg-background pr-9 pl-3 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Phase 3: User to Admin navigation */}
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                العرض كزائر
                <Globe className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

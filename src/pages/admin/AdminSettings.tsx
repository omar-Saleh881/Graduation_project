import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { settingsRepo, PlatformSettings } from "@/lib/data/repository";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    const data = settingsRepo.getById("global");
    if (data) {
      setSettings(data);
    }
  }, []);

  const handleSave = () => {
    if (!settings) return;
    settingsRepo.update("global", settings);
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث معلومات المنصة بنجاح.",
    });
  };

  if (!settings) return <div className="p-8 text-center text-muted-foreground">جاري تحميل الإعدادات...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">إعدادات المنصة</h1>
        <p className="text-muted-foreground">تعديل الإعدادات العامة، الروابط الاجتماعية، وشريط التنبيهات.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>معلومات عامة</CardTitle>
            <CardDescription>هذه المعلومات ستظهر في جميع انحاء المنصة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">اسم المنصة</Label>
              <Input 
                id="site-name" 
                value={settings.name} 
                onChange={(e) => setSettings({ ...settings, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-hero">عنوان الصفحة الرئيسية (Hero Title)</Label>
              <Input 
                id="site-hero" 
                value={settings.heroTitle} 
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-subtitle">وصف الصفحة الرئيسية (Hero Subtitle)</Label>
              <Input 
                id="site-subtitle" 
                value={settings.heroSubtitle} 
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>التواصل والروابط الاجتماعية</CardTitle>
            <CardDescription>البريد الرسمي وروابط حسابات المنصة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني للتواصل</Label>
              <Input 
                value={settings.contactEmail} 
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter</Label>
              <Input 
                value={settings.socialLinks?.twitter} 
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Github</Label>
              <Input 
                value={settings.socialLinks?.github} 
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, github: e.target.value } })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Discord</Label>
              <Input 
                value={settings.socialLinks?.discord} 
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, discord: e.target.value } })} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>شريط الإعلانات (Announcement Bar)</CardTitle>
            <CardDescription>شريط يظهر في أعلى الموقع للجماهير.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <Label className="cursor-pointer" htmlFor="ann-active">تفعيل الشريط</Label>
              <Switch 
                id="ann-active"
                checked={settings.announcement?.active} 
                onCheckedChange={(checked) => setSettings({ 
                  ...settings, 
                  announcement: { ...(settings.announcement || {text: "", active: false}), active: checked } 
                })} 
              />
            </div>
            <div className="space-y-2">
              <Label>نص الإعلان</Label>
              <Input 
                value={settings.announcement?.text} 
                onChange={(e) => setSettings({ 
                  ...settings, 
                  announcement: { ...(settings.announcement || {text: "", active: false}), text: e.target.value } 
                })} 
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الإعلان (اختياري)</Label>
              <Input 
                value={settings.announcement?.link} 
                onChange={(e) => setSettings({ 
                  ...settings, 
                  announcement: { ...(settings.announcement || {text: "", active: false}), link: e.target.value } 
                })} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>تذييل الصفحة (Footer)</CardTitle>
            <CardDescription>تعديل نصوص تذييل الصفحة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer-text">نص الحقوق</Label>
              <Input 
                id="footer-text" 
                value={settings.footerText} 
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" className="px-12 shadow-lg shadow-primary/20" onClick={handleSave}>حفظ جميع الإعدادات</Button>
      </div>
    </div>
  );
};

export default AdminSettings;

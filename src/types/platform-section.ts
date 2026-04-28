export type SectionTemplateType =
  | 'tools'
  | 'paths'
  | 'courses'
  | 'articles'
  | 'content';

export type SectionDisplayStyle = 'grid' | 'list' | 'cards' | 'featured';

export interface PlatformSection {
  id: string;

  // ── Display / visual ─────────────────────────────────────────────
  title_ar: string;          // custom section name (e.g. "كورسات الطبخ")
  description_ar: string;
  icon: string;              // emoji or Lucide icon name
  order: number;
  is_active: boolean;
  cta_text?: string;
  cta_link?: string;         // if empty → auto-derived from template_type

  // ── Behavior ─────────────────────────────────────────────────────
  template_type: SectionTemplateType;     // what kind of content lives here
  display_style?: SectionDisplayStyle;    // how items render publicly

  // ── Optional caps / UX ───────────────────────────────────────────
  max_items?: number;          // max items to show publicly (default 6)
  empty_state_text?: string;   // message when 0 items found
  module_mode?: boolean;       // If true, this section acts as a standalone admin module
}

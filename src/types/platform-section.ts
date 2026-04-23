export type SectionContentType =
  | 'tools'
  | 'paths'
  | 'courses'
  | 'articles'
  | 'content'
  | 'mixed'
  | 'recommendations';

export type SectionPopulationMode = 'automatic' | 'manual';
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
  cta_link?: string;         // if empty → auto-derived from content_type

  // ── Behavior ─────────────────────────────────────────────────────
  content_type: SectionContentType;   // what kind of content lives here
  population_mode: SectionPopulationMode; // 'automatic' | 'manual'
  display_style?: SectionDisplayStyle;    // how items render publicly

  // ── Manual population ─────────────────────────────────────────────
  linked_item_ids?: string[];  // IDs to show when population_mode='manual'

  // ── Optional caps / UX ───────────────────────────────────────────
  max_items?: number;          // max items to show publicly (default 6)
  empty_state_text?: string;   // message when 0 items found
  module_mode?: boolean;       // If true, this section acts as a standalone admin module
}

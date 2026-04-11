import type { ContentResource } from "@/types/content";
import { contentRepo } from "@/lib/data/repository";

const PAGE_SIZE = 12;

export function getAllContent(query: { search?: string; type?: string; category?: string; is_free?: boolean; page?: number; pageSize?: number } = {}) {
  let filtered = contentRepo.getAll().filter((c) => c.is_published);

  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.title_ar && c.title_ar.toLowerCase().includes(s)) ||
        (c.description_ar && c.description_ar.toLowerCase().includes(s)) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(s)))
    );
  }
  if (query.type) filtered = filtered.filter((c) => c.type === query.type);
  if (query.category) filtered = filtered.filter((c) => c.category === query.category);
  if (query.is_free !== undefined) filtered = filtered.filter((c) => c.is_free === query.is_free);

  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { items: paginated, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getContentCategories(): string[] {
  return [...new Set(contentRepo.getAll().filter((c) => c.is_published).map((c) => c.category))].sort();
}

export function getContentTypes(): string[] {
  return [...new Set(contentRepo.getAll().filter((c) => c.is_published).map((c) => c.type))].sort();
}

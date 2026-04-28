import type { Article } from "@/types/article";
import { articlesRepo } from "@/lib/data/repository";

const PAGE_SIZE = 9;

export function getAllArticles(query: { search?: string; category?: string; page?: number; pageSize?: number } = {}) {
  let filtered = articlesRepo.getAll().filter((a) => a.is_published);

  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        (a.title_ar && a.title_ar.toLowerCase().includes(s)) ||
        (a.excerpt_ar && a.excerpt_ar.toLowerCase().includes(s)) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(s)))
    );
  }
  if (query.category) {
    filtered = filtered.filter((a) => a.category === query.category);
  }

  filtered.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { articles: paginated, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getArticleBySlug(slug: string): Article | null {
  return articlesRepo.getAll().find((a) => (a.slug === slug || a.id === slug) && a.is_published) ?? null;
}

export function getArticleCategories(): string[] {
  return [...new Set(articlesRepo.getAll().filter((a) => a.is_published).map((a) => a.category))].sort();
}

export function getLatestArticles(count = 3): Article[] {
  return articlesRepo.getAll()
    .filter((a) => a.is_published)
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
    .slice(0, count);
}

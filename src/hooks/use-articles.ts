import { useQuery } from "@tanstack/react-query";
import { getAllArticles, getArticleBySlug, getArticleCategories, getLatestArticles } from "@/data/articles-data";

export function useArticles(query: { search?: string; category?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ["articles", query],
    queryFn: () => getAllArticles(query),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug(slug),
    enabled: !!slug,
  });
}

export function useArticleCategories() {
  return useQuery({
    queryKey: ["articles", "categories"],
    queryFn: () => getArticleCategories(),
  });
}

export function useLatestArticles(count = 3) {
  return useQuery({
    queryKey: ["articles", "latest", count],
    queryFn: () => getLatestArticles(count),
  });
}

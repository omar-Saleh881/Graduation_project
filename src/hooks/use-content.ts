import { useQuery } from "@tanstack/react-query";
import { getAllContent, getContentCategories, getContentTypes } from "@/data/content-data";

export function useContent(query: { search?: string; type?: string; category?: string; is_free?: boolean; page?: number } = {}) {
  return useQuery({
    queryKey: ["content", query],
    queryFn: () => getAllContent(query),
  });
}

export function useContentCategories() {
  return useQuery({
    queryKey: ["content", "categories"],
    queryFn: () => getContentCategories(),
  });
}

export function useContentTypes() {
  return useQuery({
    queryKey: ["content", "types"],
    queryFn: () => getContentTypes(),
  });
}

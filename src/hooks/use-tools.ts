import { useQuery } from "@tanstack/react-query";
import { toolsRepo } from "@/lib/data/repository";
import type { Tool, ToolsQuery } from "@/types/tool";

const PAGE_SIZE = 12;

export function useTools(query: ToolsQuery = {}) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;

  return useQuery({
    queryKey: ["tools", query],
    queryFn: async () => {
      let filtered = toolsRepo.getAll().filter(t => t.is_active && t.status === "published");

      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter(t => 
          (t.name && t.name.toLowerCase().includes(s)) ||
          (t.description_en && t.description_en.toLowerCase().includes(s)) ||
          (t.description_ar && t.description_ar.toLowerCase().includes(s)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(s)))
        );
      }
      if (query.category) filtered = filtered.filter(t => t.category === query.category);
      if (query.pricing_model) filtered = filtered.filter(t => t.pricing_model === query.pricing_model);
      if (query.target_audience) filtered = filtered.filter(t => t.target_audience === query.target_audience);
      if (query.difficulty_level) filtered = filtered.filter(t => t.difficulty_level === query.difficulty_level);

      switch (query.sort) {
        case "newest":
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case "votes":
          filtered.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
          break;
        case "alpha":
          filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          break;
        default:
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      const total = filtered.length;
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      const paginated = filtered.slice(from, to);

      return {
        tools: paginated,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },
  });
}

export function useFeaturedTools() {
  return useQuery({
    queryKey: ["tools", "featured"],
    queryFn: async () => {
      return toolsRepo.getAll()
        .filter(t => t.is_active && t.is_featured)
        .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
        .slice(0, 6);
    },
  });
}

export function useNewestTools() {
  return useQuery({
    queryKey: ["tools", "newest"],
    queryFn: async () => {
      return toolsRepo.getAll()
        .filter(t => t.is_active && t.status === "published")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);
    },
  });
}

export function useToolByHandle(handle: string) {
  return useQuery({
    queryKey: ["tool", handle],
    queryFn: async () => {
      const tool = toolsRepo.getAll().find(t => t.handle === handle);
      if (!tool) throw new Error("Tool not found");
      return tool;
    },
    enabled: !!handle,
  });
}

export function useSimilarTools(category: string, excludeId: string) {
  return useQuery({
    queryKey: ["tools", "similar", category, excludeId],
    queryFn: async () => {
      return toolsRepo.getAll()
        .filter(t => t.is_active && t.category === category && t.id !== excludeId)
        .slice(0, 4);
    },
    enabled: !!category && !!excludeId,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["tools", "filters"],
    queryFn: async () => {
      const all = toolsRepo.getAll().filter(t => t.is_active);
      const categories = [...new Set(all.map(t => t.category).filter(Boolean))].sort();
      const pricingModels = [...new Set(all.map(t => t.pricing_model).filter(Boolean))].sort();
      const audiences = [...new Set(all.map(t => t.target_audience).filter(Boolean))].sort();
      return { categories, pricingModels, audiences };
    },
  });
}

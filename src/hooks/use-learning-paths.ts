import { useQuery } from "@tanstack/react-query";
import { pathsRepo, getPathWithSteps } from "@/lib/data/repository";

export function useLearningPaths() {
  return useQuery({
    queryKey: ["learning-paths"],
    queryFn: () => pathsRepo.getAll().filter(p => p.is_published !== false),
  });
}

export function useLearningPath(slug: string) {
  return useQuery({
    queryKey: ["learning-path", slug],
    queryFn: () => getPathWithSteps(slug),
    enabled: !!slug,
  });
}

export function usePathCategories() {
  return useQuery({
    queryKey: ["learning-paths", "categories"],
    queryFn: () => {
      const paths = pathsRepo.getAll();
      const cats = Array.from(new Set(paths.map(p => p.category)));
      return cats.map(c => ({ id: c, name: c, count: paths.filter(p => p.category === c).length }));
    },
  });
}

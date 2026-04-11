import type { LearningPath } from "@/types/learning-path";
import { pathsRepo } from "@/lib/data/repository";
import { getPathWithBuilderStructure } from "@/lib/data/builder-repo";

export function getAllPaths(): LearningPath[] {
  return pathsRepo.getAll().filter((p) => p.is_published);
}

export function getPathBySlug(slug: string): any | null {
  const path = getPathWithBuilderStructure(slug);
  return path && path.is_published ? path : null;
}

export function getPathCategories(): string[] {
  return [...new Set(pathsRepo.getAll().filter((p) => p.is_published).map((p) => p.category))].sort();
}

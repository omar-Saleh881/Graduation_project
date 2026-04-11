import { Course, CourseModule, Lesson, PathStage, PathStageItem } from "@/types/builder";

// Provide a quick LocalStorage repository wrapper similar to the existing ones
class LocalStorageRepository<T extends { id: string }> {
  private key: string;
  constructor(key: string) { this.key = key; }
  
  getAll(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }
  
  getById(id: string): T | undefined {
    return this.getAll().find((item) => item.id === id);
  }
  
  create(item: Omit<T, "id"> & { id?: string }): T {
    const items = this.getAll();
    const newItem = { ...item, id: item.id || crypto.randomUUID() } as T;
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }
  
  update(id: string, updates: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[index];
  }
  
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (items.length !== filtered.length) {
      localStorage.setItem(this.key, JSON.stringify(filtered));
      return true;
    }
    return false;
  }
}

export const coursesRepo = new LocalStorageRepository<Course>("ai_builder_courses");
export const modulesRepo = new LocalStorageRepository<CourseModule>("ai_builder_modules");
export const lessonsRepo = new LocalStorageRepository<Lesson>("ai_builder_lessons");
export const pathStagesRepo = new LocalStorageRepository<PathStage>("ai_builder_path_stages");
export const pathStageItemsRepo = new LocalStorageRepository<PathStageItem>("ai_builder_path_stage_items");

// Specialized aggregators
export const getCourseWithStructure = (courseId: string) => {
  const course = coursesRepo.getById(courseId);
  if (!course) return null;
  const modules = modulesRepo.getAll()
    .filter(m => m.course_id === courseId)
    .sort((a, b) => a.order - b.order);
    
  const lessons = lessonsRepo.getAll()
    .filter(l => l.course_id === courseId)
    .sort((a, b) => a.order - b.order);

  const structuredModules = modules.map(m => ({
    ...m,
    lessons: lessons.filter(l => l.module_id === m.id)
  }));
  
  const unassignedLessons = lessons.filter(l => !l.module_id);
  return { ...course, modules: structuredModules, unassignedLessons };
};

export const getPathWithBuilderStructure = (slug: string) => {
  // We need to get the base path from pathsRepo first. Since we import pathsRepo from repository.ts,
  // we do that in a higher level or we can dynamically get it.
  const pathsData = localStorage.getItem("ai_platform_paths");
  const paths = pathsData ? JSON.parse(pathsData) : [];
  const path = paths.find((p: any) => p.slug === slug || p.id === slug);
  if (!path) return null;

  const stages = pathStagesRepo.getAll()
    .filter(s => s.path_id === path.id)
    .sort((a, b) => a.order - b.order);

  const items = pathStageItemsRepo.getAll();
  
  const populatedStages = stages.map(s => ({
    ...s,
    items: items.filter(i => i.stage_id === s.id).sort((a,b) => a.order - b.order)
  }));

  return { ...path, stages: populatedStages };
};

export const getPublishedCourses = () => {
  return coursesRepo.getAll().filter(c => c.is_published !== false);
};

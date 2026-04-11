import { useFeaturedTools } from "@/hooks/use-tools";
import ToolCard from "./ToolCard";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedTools = () => {
  const { data, isLoading } = useFeaturedTools();

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">⭐ أدوات مميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">⭐ أدوات مميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTools;

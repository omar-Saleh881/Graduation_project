import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterOptions } from "@/hooks/use-tools";
import type { ToolsQuery } from "@/types/tool";

interface SearchFiltersProps {
  query: ToolsQuery;
  onQueryChange: (q: Partial<ToolsQuery>) => void;
}

const SearchFilters = ({ query, onQueryChange }: SearchFiltersProps) => {
  const { data: filters, isLoading: filtersLoading } = useFilterOptions();

  const hasFilters =
    query.search || query.category || query.pricing_model || query.target_audience || query.difficulty_level;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث بالاسم، الوصف، أو الوسوم..."
          value={query.search ?? ""}
          onChange={(e) => onQueryChange({ search: e.target.value, page: 1 })}
          className="pr-10 h-11"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>تصفية حسب:</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={query.category ?? "all"}
          onValueChange={(v) => onQueryChange({ category: v === "all" ? undefined : v, page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {!filtersLoading && filters?.categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.pricing_model ?? "all"}
          onValueChange={(v) => onQueryChange({ pricing_model: v === "all" ? undefined : v, page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="التسعير" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأسعار</SelectItem>
            {!filtersLoading && filters?.pricingModels.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.target_audience ?? "all"}
          onValueChange={(v) => onQueryChange({ target_audience: v === "all" ? undefined : v, page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="الفئة المستهدفة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الجميع</SelectItem>
            {!filtersLoading && filters?.audiences.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.sort ?? "newest"}
          onValueChange={(v) => onQueryChange({ sort: v as ToolsQuery["sort"], page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث أولاً</SelectItem>
            <SelectItem value="votes">الأكثر تصويتاً</SelectItem>
            <SelectItem value="alpha">أبجدياً (أ–ي)</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() =>
              onQueryChange({
                search: undefined,
                category: undefined,
                pricing_model: undefined,
                target_audience: undefined,
                difficulty_level: undefined,
                sort: "newest",
                page: 1,
              })
            }
          >
            <X className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;

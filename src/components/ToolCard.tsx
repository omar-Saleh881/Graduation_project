import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ToolLogo from "@/components/ToolLogo";
import type { Tool } from "@/types/tool";

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
  const summary =
    tool.summary_ar || tool.description_ar || tool.description_en || "أداة ذكاء اصطناعي";

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
            <ToolLogo name={tool.name} logoUrl={tool.logo_url} websiteUrl={tool.website_url} />
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/tool/${tool.handle}`} className="block">
              <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors truncate">
                {tool.name}
              </h3>
            </Link>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tool.category && (
            <Badge variant="secondary" className="text-xs">{tool.category}</Badge>
          )}
          {tool.pricing_model && (
            <Badge variant="outline" className="text-xs">{tool.pricing_model}</Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Link to={`/tool/${tool.handle}`}>
            <Button variant="ghost" size="sm">التفاصيل</Button>
          </Link>
          {tool.website_url && (
            <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                زيارة الموقع
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;

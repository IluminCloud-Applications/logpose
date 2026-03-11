import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CampaignsLoading() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "size-2 rounded-full bg-primary/60 animate-bounce",
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Carregando dados das campanhas...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

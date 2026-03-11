import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RiFileCopyLine, RiDeleteBinLine } from "@remixicon/react";
import { useState } from "react";
import type { WebhookEndpointAPI } from "@/services/integrations";
import { PlatformLogo } from "@/components/PlatformLogo";

interface PlatformsTableProps {
  endpoints: WebhookEndpointAPI[];
  isLoading: boolean;
  onDelete: (endpoint: WebhookEndpointAPI) => void;
}

function TableSkeleton() {
  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function buildWebhookUrl(endpoint: WebhookEndpointAPI): string {
  return `/api/webhook/${endpoint.platform}/${endpoint.slug}`;
}

export function PlatformsTable({ endpoints, isLoading, onDelete }: PlatformsTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (endpoint: WebhookEndpointAPI) => {
    const url = `${window.location.origin}${buildWebhookUrl(endpoint)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(endpoint.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <TableSkeleton />;

  if (endpoints.length === 0) {
    return (
      <Card className="border-border/40 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum endpoint criado. Clique em "Novo Endpoint" para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const platformBadge = (platform: string) => {
    return (
      <Badge variant="outline" className="text-[10px] font-medium border border-border/50 gap-1 px-2 py-0.5">
        <PlatformLogo platform={platform as "kiwify" | "payt"} size="sm" />
      </Badge>
    );
  };

  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>URL do Webhook</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((ep) => {
                const webhookUrl = buildWebhookUrl(ep);
                return (
                  <TableRow key={ep.id}>
                    <TableCell className="font-medium">{ep.name}</TableCell>
                    <TableCell>{platformBadge(ep.platform)}</TableCell>
                    <TableCell>
                      <code className="font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded text-xs">
                        {window.location.origin}{webhookUrl}
                      </code>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {ep.created_at
                        ? new Date(ep.created_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(ep)}
                        >
                          <RiFileCopyLine className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(ep)}
                        >
                          <RiDeleteBinLine className="size-4" />
                        </Button>
                      </div>
                      {copiedId === ep.id && (
                        <p className="text-[10px] text-[var(--color-success)] text-center mt-0.5">
                          Copiado!
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

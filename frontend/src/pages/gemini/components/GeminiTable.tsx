import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiEyeOffLine, RiDeleteBinLine } from "@remixicon/react";
import type { GeminiAccountAPI } from "@/services/integrations";

interface GeminiTableProps {
  accounts: GeminiAccountAPI[];
  isLoading: boolean;
  onDelete: (account: GeminiAccountAPI) => void;
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

export function GeminiTable({ accounts, isLoading, onDelete }: GeminiTableProps) {
  if (isLoading) return <TableSkeleton />;

  if (accounts.length === 0) {
    return (
      <Card className="border-border/40 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <p className="text-sm text-muted-foreground">
            Nenhuma chave Gemini conectada.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Acesse o Google AI Studio para gerar sua API Key.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Adicionada em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <RiEyeOffLine className="size-3.5" />
                      <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                        ••••••{account.api_key.slice(-6)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {account.model}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {account.created_at
                      ? new Date(account.created_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-[var(--color-success)]/15 text-[var(--color-success)] border-transparent text-[10px] font-medium">
                      Conectada
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(account)}
                    >
                      <RiDeleteBinLine className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

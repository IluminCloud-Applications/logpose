import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiEyeOffLine, RiDeleteBinLine, RiFileCopyLine } from "@remixicon/react";
import type { FacebookAccountAPI } from "@/services/integrations";

interface FacebookTableProps {
  accounts: FacebookAccountAPI[];
  isLoading: boolean;
  onDelete: (account: FacebookAccountAPI) => void;
  onDuplicate: (account: FacebookAccountAPI) => void;
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

export function FacebookTable({ accounts, isLoading, onDelete, onDuplicate }: FacebookTableProps) {
  if (isLoading) return <TableSkeleton />;

  if (accounts.length === 0) {
    return (
      <Card className="border-border/40 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
            Nenhuma conta adicionada. Clique em "Adicionar Conta" para começar.
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
                <TableHead>Account ID</TableHead>
                <TableHead>Access Token</TableHead>
                <TableHead>Adicionada em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.label}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{account.account_id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <RiEyeOffLine className="size-3.5" />
                      <span className="font-mono">••••••{account.access_token.slice(-4)}</span>
                    </div>
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
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => onDuplicate(account)}
                            >
                              <RiFileCopyLine className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Duplicar (mesmo token)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDelete(account)}
                            >
                              <RiDeleteBinLine className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir conta</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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

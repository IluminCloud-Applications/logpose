import { RiQuestionLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { PlatformLogo } from "@/components/PlatformLogo";

const KIWIFY_STEPS = [
  'Acesse o painel da Kiwify e clique em "Apps"',
  'Clique em "Webhooks"',
  'Clique em "Criar Webhook"',
  "Coloque um nome para o webhook",
  "Cole a URL criada aqui no campo de URL",
  'Deixe marcado "Todos que sou produtor" (já vem marcado)',
  'Em evento, clique em "Selecionar todos" para selecionar todos os eventos',
  "Salve o webhook",
];

const PAYT_STEPS = [
  'Acesse o painel da PayT e clique em "Ferramentas"',
  'Clique em "Postbacks"',
  'Clique em "Cadastrar" e coloque um nome',
  'Clique em "Selecionar produto" e marque "Todos os produtos"',
  'Em tipo, selecione "PayT V1"',
  "Cole a URL criada aqui no campo de URL",
  "Em eventos, selecione todos",
  'Clique em "Testar URL"',
  'Clique em "Salvar e Voltar"',
];

function StepsList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1.5 pl-1">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
          <span className="shrink-0 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
            {i + 1}
          </span>
          <span className="text-foreground/80">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function IntegrationGuide() {
  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="size-9">
                <RiQuestionLine className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Como integrar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="end" className="w-[400px] p-0">
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Como configurar Webhooks</h4>
            <p className="text-[11px] text-muted-foreground">
              Siga o tutorial da sua plataforma de pagamento
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="kiwify" className="border-border/50">
              <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline">
                <PlatformLogo platform="kiwify" size="md" />
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-1">
                <StepsList steps={KIWIFY_STEPS} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payt" className="border-border/50">
              <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline">
                <PlatformLogo platform="payt" size="md" />
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-1">
                <StepsList steps={PAYT_STEPS} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Dica:</strong> Após criar o endpoint aqui no Log Pose, copie
              a URL gerada e cole na plataforma de pagamento seguindo o tutorial acima.
              Selecione todos os eventos para capturar vendas, reembolsos e abandonos.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

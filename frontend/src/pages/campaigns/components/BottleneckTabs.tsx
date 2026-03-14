import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BottleneckTable } from "./BottleneckTable";
import { ConversionTable } from "./ConversionTable";
import type { CampaignData, CampaignConversionData } from "@/services/campaigns";
import { fetchCampaignConversion } from "@/services/campaigns";

interface BottleneckTabsProps {
  data: CampaignData[];
  hasVturb: boolean;
  dateStart: string;
  dateEnd: string;
}

export function BottleneckTabs({ data, hasVturb, dateStart, dateEnd }: BottleneckTabsProps) {
  const [conversionData, setConversionData] = useState<CampaignConversionData[]>([]);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [tab, setTab] = useState("operacional");

  useEffect(() => {
    if (tab !== "conversao" || !dateStart || !dateEnd) return;
    setLoadingConversion(true);
    fetchCampaignConversion(dateStart, dateEnd)
      .then(setConversionData)
      .finally(() => setLoadingConversion(false));
  }, [tab, dateStart, dateEnd]);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="operacional">Operacional</TabsTrigger>
        <TabsTrigger value="conversao">Conversão</TabsTrigger>
      </TabsList>

      <TabsContent value="operacional">
        <BottleneckTable data={data} hasVturb={hasVturb} />
      </TabsContent>

      <TabsContent value="conversao">
        {loadingConversion ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Carregando dados de conversão...
          </div>
        ) : (
          <ConversionTable campaigns={data} conversionData={conversionData} />
        )}
      </TabsContent>
    </Tabs>
  );
}

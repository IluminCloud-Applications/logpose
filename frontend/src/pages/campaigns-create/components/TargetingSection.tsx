import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CampaignFormState } from "../hooks/useCampaignForm";
import type { InterestData } from "@/services/campaignCreator";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";

interface TargetingSectionProps {
  form: CampaignFormState;
  onUpdate: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void;
  interestResults: InterestData[];
  onSearchInterest: (query: string) => void;
}

export function TargetingSection({
  form, onUpdate, interestResults, onSearchInterest,
}: TargetingSectionProps) {
  const [interestQuery, setInterestQuery] = useState("");

  const handleInterestSearch = (q: string) => {
    setInterestQuery(q);
    onSearchInterest(q);
  };

  const addInterest = (interest: InterestData) => {
    if (!form.interests.find((i) => i.id === interest.id)) {
      onUpdate("interests", [...form.interests, interest]);
    }
    setInterestQuery("");
  };

  const removeInterest = (id: string) => {
    onUpdate("interests", form.interests.filter((i) => i.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Público-Alvo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Idade + Gênero — mesma row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Idade Mínima</Label>
            <Input type="number" min={18} max={64} value={form.ageMin}
              onChange={(e) => onUpdate("ageMin", parseInt(e.target.value) || 18)} />
          </div>
          <div className="space-y-2">
            <Label>Idade Máxima</Label>
            <Input type="number" min={18} max={65} value={form.ageMax}
              onChange={(e) => onUpdate("ageMax", parseInt(e.target.value) || 65)} />
            <p className="text-xs text-muted-foreground">65 = 65+</p>
          </div>
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select value={form.gender.toString()} onValueChange={(v) => onUpdate("gender", Number(v))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todos</SelectItem>
                <SelectItem value="1">Masculino</SelectItem>
                <SelectItem value="2">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interesses */}
        <div className="space-y-2">
          <Label>Interesses (opcional)</Label>
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar interesses..."
              value={interestQuery}
              onChange={(e) => handleInterestSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          {interestResults.length > 0 && interestQuery && (
            <div className="border rounded-lg max-h-40 overflow-y-auto bg-popover">
              {interestResults.map((i) => (
                <button
                  key={i.id}
                  onClick={() => addInterest(i)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex justify-between"
                >
                  <span>{i.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {i.audience_size > 0 ? `~${(i.audience_size / 1e6).toFixed(1)}M` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
          {form.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.interests.map((i) => (
                <Badge key={i.id} variant="secondary" className="gap-1 pr-1">
                  {i.name}
                  <button onClick={() => removeInterest(i.id)} className="hover:text-destructive">
                    <RiCloseLine className="size-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

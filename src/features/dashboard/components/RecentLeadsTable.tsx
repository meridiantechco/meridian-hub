import { Link } from "@tanstack/react-router";
import { Building2, ArrowRight, AlertCircle, Globe, Instagram, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import { BadgeStatus } from "@/components/prospecta/BadgeStatus";
import type { LeadItem } from "@/lib/leads-mock";

interface RecentLeadsTableProps {
  leads: LeadItem[];
  onAbordar: (lead: LeadItem) => void;
}

export function RecentLeadsTable({ leads, onAbordar }: RecentLeadsTableProps) {
  return (
    <Card className="bg-card border-border shadow-elev">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Últimos Estabelecimentos Cadastrados
          </CardTitle>
          <CardDescription className="text-xs">
            Registro das últimas empresas importadas para a base de inteligência
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
          <Link to="/leads">
            Ver base completa
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                <th className="p-3 pl-4">Estabelecimento</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Localização</th>
                <th className="p-3">Presença Web</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3 pl-4 font-semibold text-foreground">
                    <Link
                      to="/leads/$id"
                      params={{ id: item.id }}
                      className="hover:text-primary transition-colors"
                    >
                      {item.nome}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{item.categoria}</td>
                  <td className="p-3 dado text-muted-foreground">
                    {item.bairro || item.cidade || "—"}
                  </td>
                  <td className="p-3">
                    <div className="space-y-0.5">
                      {!item.tem_site ? (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                          <AlertCircle className="size-2.5" /> Sem site
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Globe className="size-2.5" /> Com site
                        </span>
                      )}

                      {item.instagram && (
                        <p className="text-[10px] text-pink-400 font-mono flex items-center gap-0.5">
                          <Instagram className="size-2.5" /> @{item.instagram}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <BadgePrioridade score={item.score} />
                  </td>
                  <td className="p-3">
                    <BadgeStatus status={item.status} />
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => onAbordar(item)}
                      className="h-7 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold"
                    >
                      <MessageSquare className="size-3" />
                      WhatsApp
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

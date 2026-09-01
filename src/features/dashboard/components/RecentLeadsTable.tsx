import { Link } from "@tanstack/react-router";
import { Building2, ArrowRight, AlertCircle, Globe, Instagram, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePriority } from "@/features/leads/components/BadgePriority";
import { BadgeStatus } from "@/features/leads/components/BadgeStatus";
import type { LeadItem } from "@/lib/leads-mock";

interface RecentLeadsTableProps {
  leads: LeadItem[];
  onAbordar: (lead: LeadItem) => void;
}

export function RecentLeadsTable({ leads, onAbordar }: RecentLeadsTableProps) {
  return (
    <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60 bg-surface/30">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Atividade Recente & Novos Estabelecimentos
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Últimas empresas importadas pela equipe para a base de inteligência
          </CardDescription>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
          <Link to="/leads">
            <span>Ver base completa</span>
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                <th className="p-3 pl-4">Estabelecimento</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Localização</th>
                <th className="p-3">Presença Web</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leads.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="p-3 pl-4">
                    <Link
                      to="/leads/$id"
                      params={{ id: item.id }}
                      className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs line-clamp-1"
                    >
                      {item.nome}
                    </Link>
                  </td>

                  <td className="p-3 text-muted-foreground text-xs">{item.categoria}</td>

                  <td className="p-3 dado text-muted-foreground text-xs">
                    📍 {item.bairro || item.cidade || "—"}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {!item.tem_site ? (
                        <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/25">
                          <AlertCircle className="size-2.5" /> Sem site
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Globe className="size-2.5" /> Com site
                        </span>
                      )}

                      {item.instagram && (
                        <span className="text-[10px] text-pink-400 font-mono hidden md:inline-flex items-center gap-0.5">
                          <Instagram className="size-2.5" /> @{item.instagram}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <BadgePriority score={item.score} />
                  </td>

                  <td className="p-3">
                    <BadgeStatus status={item.status} />
                  </td>

                  <td className="p-3 pr-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => onAbordar(item)}
                      className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold shadow-xs"
                    >
                      <MessageSquare className="size-3" />
                      WhatsApp
                    </Button>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-muted-foreground">
                    Nenhum estabelecimento cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

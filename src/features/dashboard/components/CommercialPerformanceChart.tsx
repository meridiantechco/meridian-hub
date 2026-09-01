import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CommercialPerformanceChartProps {
  dadosCategorias: {
    categoria: string;
    categoriaCompleta: string;
    total: number;
    semSite: number;
  }[];
}

export function CommercialPerformanceChart({
  dadosCategorias,
}: CommercialPerformanceChartProps) {
  const [metricaVisualizacao, setMetricaVisualizacao] = useState<"todas" | "semSite">("todas");

  return (
    <Card className="bg-card border-border/80 shadow-elev flex flex-col justify-between">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-border/40">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Performance Comercial por Segmento
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Distribuição de oportunidades sem site próprio vs. total de estabelecimentos mapeados
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border/60 shrink-0">
          <Button
            variant={metricaVisualizacao === "todas" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMetricaVisualizacao("todas")}
            className="h-6.5 text-[11px] px-2"
          >
            Geral
          </Button>
          <Button
            variant={metricaVisualizacao === "semSite" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMetricaVisualizacao("semSite")}
            className="h-6.5 text-[11px] px-2"
          >
            Sem Site
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosCategorias}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis
                dataKey="categoria"
                stroke="currentColor"
                opacity={0.6}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                opacity={0.6}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "currentColor", opacity: 0.05 }}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "10px",
                  color: "var(--color-foreground)",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                }}
                formatter={(val: number, name: string) => [
                  `${val} empresas`,
                  name === "semSite" ? "Sem site próprio" : "Total mapeado",
                ]}
                labelFormatter={(_, items) => {
                  const item = items[0]?.payload as { categoriaCompleta?: string };
                  return item?.categoriaCompleta || "";
                }}
              />
              {metricaVisualizacao === "todas" && (
                <Bar
                  dataKey="total"
                  fill="var(--color-muted-foreground)"
                  opacity={0.3}
                  radius={[4, 4, 0, 0]}
                  name="total"
                />
              )}
              <Bar
                dataKey="semSite"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                name="semSite"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          {metricaVisualizacao === "todas" && (
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded bg-muted-foreground/30" />
              <span>Total Mapeado</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded bg-primary" />
            <span>Sem Site Próprio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

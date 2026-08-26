import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface SegmentChartsProps {
  dadosCategorias: {
    categoria: string;
    categoriaCompleta: string;
    total: number;
    semSite: number;
  }[];
  dadosFunil: {
    name: string;
    quantidade: number;
    cor: string;
  }[];
  totalLeads: number;
}

export function SegmentCharts({ dadosCategorias, dadosFunil, totalLeads }: SegmentChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras: Oportunidades por Categoria */}
      <Card className="bg-card border-border shadow-elev">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Oportunidades por Segmento</CardTitle>
          <CardDescription className="text-xs">
            Distribuição de estabelecimentos sem site vs total por nicho comercial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosCategorias}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="categoria"
                  stroke="#a19cb2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a19cb2"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161224",
                    borderColor: "#3b2f5c",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  formatter={(val: number, name: string) => [
                    `${val} estabelecimentos`,
                    name === "semSite" ? "Sem site" : "Total",
                  ]}
                  labelFormatter={(_, items) => {
                    const item = items[0]?.payload as { categoriaCompleta?: string };
                    return item?.categoriaCompleta || "";
                  }}
                />
                <Bar dataKey="total" fill="#2b2244" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="semSite" fill="#a855f7" radius={[4, 4, 0, 0]} name="Sem site" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição do Funil */}
      <Card className="bg-card border-border shadow-elev">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Status do Funil Comercial</CardTitle>
          <CardDescription className="text-xs">
            Distribuição percentual dos estabelecimentos em cada fase de negociação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosFunil.map((etapa) => {
              const perc = totalLeads > 0 ? (etapa.quantidade / totalLeads) * 100 : 0;
              return (
                <div key={etapa.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: etapa.cor }}
                      />
                      {etapa.name}
                    </span>
                    <span className="dado text-muted-foreground">
                      {etapa.quantidade} estabelecimentos ({perc.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${perc}%`,
                        backgroundColor: etapa.cor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

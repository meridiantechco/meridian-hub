import { useMemo } from "react";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoriaDespesa, MetricasFinanceiras } from "../types";
import { ROTULOS_CATEGORIAS_DESPESA } from "../services/financialService";

interface FinancialChartsProps {
  metricas: MetricasFinanceiras;
}

const CORES_DONUT: Record<string, string> = {
  tecnologia: "#c084fc",
  marketing: "#f472b6",
  equipe: "#60a5fa",
  operacional: "#fbbf24",
  impostos: "#fb7185",
  outros: "#a1a1aa",
};

export function FinancialCharts({ metricas }: FinancialChartsProps) {
  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const dadosDonutGastos = useMemo(() => {
    return Object.entries(metricas.gastosPorCategoria)
      .filter(([_, valor]) => valor > 0)
      .map(([cat, valor]) => {
        const info = ROTULOS_CATEGORIAS_DESPESA[cat as CategoriaDespesa];
        return {
          name: info?.rotulo || cat,
          key: cat,
          value: Number(valor.toFixed(2)),
          color: CORES_DONUT[cat] || "#a855f7",
        };
      });
  }, [metricas.gastosPorCategoria]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* GRÁFICO 1: EVOLUÇÃO MENSAL DE FLUXO DE CAIXA */}
      <Card className="lg:col-span-2 bg-card border-border shadow-elev">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <BarChart3 className="size-4 text-primary" />
              Evolução do Fluxo de Caixa & Lucratividade
            </CardTitle>
            <CardDescription className="text-xs">
              Comparativo mensal entre Receitas, Gastos e Lucro Líquido apurado
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="h-[280px] w-full">
            {metricas.evolucaoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metricas.evolucaoMensal}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                  <XAxis
                    dataKey="mesRotulo"
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
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }}
                    formatter={(val: any) => [formatarMoeda(Number(val)), ""]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground capitalize">{value}</span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    name="Receita Bruta"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradReceita)"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    name="Despesas & Gastos"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="#f43f5e"
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    name="Lucro Líquido"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradLucro)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Nenhum lançamento no período para gerar o gráfico.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 2: COMPOSIÇÃO DOS GASTOS POR CATEGORIA */}
      <Card className="bg-card border-border shadow-elev">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <PieChartIcon className="size-4 text-pink-400" />
              Onde Estamos Gastando?
            </CardTitle>
            <CardDescription className="text-xs">
              Distribuição percentual dos custos operacionais
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[180px] w-full">
            {dadosDonutGastos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosDonutGastos}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dadosDonutGastos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }}
                    formatter={(val: any) => [formatarMoeda(Number(val)), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Sem despesas no período.
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {dadosDonutGastos.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-muted-foreground text-[11px]">
                    {(
                      (item.value / (metricas.despesaTotal > 0 ? metricas.despesaTotal : 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="font-semibold text-foreground">{formatarMoeda(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

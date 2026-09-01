import https from "https";
import dns from "dns/promises";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler .env
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("==================================================================");
console.log("🔍 DIAGNÓSTICO E TESTES DIRETOS DO SUPABASE — MERIDIAN HUB");
console.log("==================================================================");
console.log(`URL do Supabase: ${SUPABASE_URL}`);
console.log(`Publishable Key Presente: ${Boolean(SUPABASE_PUBLISHABLE_KEY)}`);
console.log(`Service Role Key Presente: ${Boolean(SUPABASE_SERVICE_ROLE_KEY)}`);
console.log("------------------------------------------------------------------\n");

const urlObj = new URL(SUPABASE_URL);
const hostname = urlObj.hostname;

let targetIp = "172.64.149.246";
try {
  const ips = await dns.resolve4(hostname);
  if (ips && ips.length > 0) targetIp = ips[0];
} catch (e) {
  // fallback
}

function supabaseHttpQuery(endpoint, method = "GET", body = null, useServiceRole = true) {
  return new Promise((resolve, reject) => {
    const key = useServiceRole && SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_PUBLISHABLE_KEY;
    const pathStr = `/rest/v1/${endpoint}`;
    
    const options = {
      host: targetIp,
      port: 443,
      path: pathStr,
      method,
      servername: hostname, // Importante para TLS / SSL SNI
      headers: {
        Host: hostname,
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "count=exact",
      },
      timeout: 5000,
    };

    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const contentRange = res.headers["content-range"];
        let count = null;
        if (contentRange && contentRange.includes("/")) {
          const totalPart = contentRange.split("/")[1];
          if (totalPart && totalPart !== "*") {
            count = parseInt(totalPart, 10);
          }
        }

        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }

        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          data: parsed,
          count: count ?? (Array.isArray(parsed) ? parsed.length : null),
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout após 5000ms"));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const resultados = [];

async function testarTabela(nomeTabela, desc) {
  const inicio = Date.now();
  try {
    const res = await supabaseHttpQuery(`${nomeTabela}?select=*&limit=5`, "GET", null, true);
    const duracao = Date.now() - inicio;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const qtd = res.count ?? (Array.isArray(res.data) ? res.data.length : 0);
      resultados.push({
        Entidade: `Tabela: ${nomeTabela}`,
        Status: "OK",
        "Código HTTP": res.statusCode,
        "Qtd Registros": qtd,
        "Tempo Resposta": `${duracao}ms`,
      });
      console.log(`✅ [${nomeTabela}] OK (HTTP ${res.statusCode}): ${qtd} registros encontrados (${duracao}ms)`);
    } else {
      resultados.push({
        Entidade: `Tabela: ${nomeTabela}`,
        Status: "FALHA",
        "Código HTTP": res.statusCode,
        "Qtd Registros": 0,
        "Tempo Resposta": `${duracao}ms`,
      });
      console.log(`❌ [${nomeTabela}] Falha (HTTP ${res.statusCode}):`, res.data);
    }
  } catch (err) {
    resultados.push({
      Entidade: `Tabela: ${nomeTabela}`,
      Status: "ERRO",
      "Código HTTP": 0,
      "Qtd Registros": 0,
      "Tempo Resposta": `${Date.now() - inicio}ms`,
    });
    console.log(`❌ [${nomeTabela}] Erro: ${err.message}`);
  }
}

async function testarRPC(nomeRPC, params) {
  const inicio = Date.now();
  try {
    const res = await supabaseHttpQuery(`rpc/${nomeRPC}`, "POST", params, true);
    const duracao = Date.now() - inicio;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const qtd = Array.isArray(res.data) ? res.data.length : 1;
      resultados.push({
        Entidade: `RPC: ${nomeRPC}`,
        Status: "OK",
        "Código HTTP": res.statusCode,
        "Qtd Registros": qtd,
        "Tempo Resposta": `${duracao}ms`,
      });
      console.log(`✅ [RPC ${nomeRPC}] OK (HTTP ${res.statusCode}): Executado com sucesso (${duracao}ms)`);
    } else {
      resultados.push({
        Entidade: `RPC: ${nomeRPC}`,
        Status: "FALHA",
        "Código HTTP": res.statusCode,
        "Qtd Registros": 0,
        "Tempo Resposta": `${duracao}ms`,
      });
      console.log(`❌ [RPC ${nomeRPC}] Falha (HTTP ${res.statusCode}):`, res.data);
    }
  } catch (err) {
    resultados.push({
      Entidade: `RPC: ${nomeRPC}`,
      Status: "ERRO",
      "Código HTTP": 0,
      "Qtd Registros": 0,
      "Tempo Resposta": `${Date.now() - inicio}ms`,
    });
    console.log(`❌ [RPC ${nomeRPC}] Erro: ${err.message}`);
  }
}

async function run() {
  console.log("▶️ 1. Testando Tabelas do Banco de Dados via REST no Supabase:\n");

  await testarTabela("profiles", "Perfis de usuários");
  await testarTabela("user_roles", "Cargos e RBAC");
  await testarTabela("leads", "Estabelecimentos e leads");
  await testarTabela("buscas", "Histórico de mineração");
  await testarTabela("interacoes", "Histórico de contatos");
  await testarTabela("transacoes_financeiras", "Transações e fluxo de caixa");
  await testarTabela("auditoria_atividades", "Log de auditoria");

  console.log("\n▶️ 2. Testando RPCs Geográficas do Supabase:\n");
  await testarRPC("buscar_leads_bounds", {
    sw_lat: -13.1,
    sw_lng: -38.7,
    ne_lat: -12.8,
    ne_lng: -38.3,
    filtro_categoria: null,
    filtro_status: null,
    filtro_apenas_sem_site: null,
    filtro_score_minimo: null,
    filtro_termo: null,
    limite: 10,
  });

  console.log("\n==================================================================");
  console.log("📊 RESUMO GERAL DOS TESTES NO SUPABASE");
  console.log("==================================================================");
  console.table(resultados);

  const temFalhas = resultados.some((r) => r.Status !== "OK");
  if (temFalhas) {
    console.log("\n⚠️ Alguns testes reportaram falhas. Verifique as mensagens acima.");
  } else {
    console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO NO BANCO SUPABASE!");
  }
}

run();

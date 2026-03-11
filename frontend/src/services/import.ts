import { getCookie } from "@/lib/cookies";
import type {
  ImportPreviewResponse,
  ImportResultResponse,
  ProductConfig,
  ImportPlatform,
} from "@/types/import";

const API = import.meta.env.VITE_API_URL || "/api";

function authHeaders(): Record<string, string> {
  const token = getCookie("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Preview: envia arquivos e recebe resumo do que será importado.
 */
export async function previewImport(
  platform: ImportPlatform,
  files: { file?: File; fileVendas?: File; fileOrigem?: File },
): Promise<ImportPreviewResponse> {
  const form = new FormData();
  form.append("platform", platform);

  if (platform === "kiwify" && files.file) {
    form.append("file", files.file);
  }
  if (platform === "payt") {
    if (files.fileVendas) form.append("file_vendas", files.fileVendas);
    if (files.fileOrigem) form.append("file_origem", files.fileOrigem);
  }

  const res = await fetch(`${API}/import/preview`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro no preview" }));
    throw new Error(err.detail || "Erro no preview");
  }

  return res.json();
}

/**
 * Execute: envia arquivos + configuração dos produtos e importa tudo.
 */
export async function executeImport(
  platform: ImportPlatform,
  files: { file?: File; fileVendas?: File; fileOrigem?: File },
  productsConfig: ProductConfig[],
): Promise<ImportResultResponse> {
  const form = new FormData();
  form.append("platform", platform);
  form.append("products_config", JSON.stringify(productsConfig));

  if (platform === "kiwify" && files.file) {
    form.append("file", files.file);
  }
  if (platform === "payt") {
    if (files.fileVendas) form.append("file_vendas", files.fileVendas);
    if (files.fileOrigem) form.append("file_origem", files.fileOrigem);
  }

  const res = await fetch(`${API}/import/execute`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro na importação" }));
    throw new Error(err.detail || "Erro na importação");
  }

  return res.json();
}

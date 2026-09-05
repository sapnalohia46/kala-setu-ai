import type { Draft } from "@/lib/draft-store";

export type BackendCatalog = {
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  suggested_category: string;
  detected_craft_type: string;
  extracted_features: Record<string, unknown>;
  seo_tags: string[];
};

const BASE_URL = (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, "") ?? "";

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(meta ?? "")?.[1] ?? "image/jpeg";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function pick(features: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = features[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return `₹${value}`;
  }
  return null;
}

export function mapCatalog(data: BackendCatalog, photo: string | null, transcript: string): Draft {
  const features = data.extracted_features ?? {};
  return {
    photo,
    transcript,
    title: data.title_en || data.title_hi || "",
    category: data.suggested_category || "",
    craft: data.detected_craft_type || "",
    material: pick(features, ["material", "materials", "primary_material"]) ?? "",
    price: pick(features, ["suggested_price", "price", "price_range", "estimated_price"]) ?? "",
    description: data.description_en || data.description_hi || "",
    tags: Array.isArray(data.seo_tags) ? data.seo_tags : [],
  };
}

/** Send the uploaded photo (+ spoken/typed text) to the live FastAPI backend. */
export async function generateCatalogueFromBackend(input: { photo: string | null; transcript: string; language?: string }): Promise<Draft> {
  if (!BASE_URL) throw new Error("Backend address is not configured.");
  if (!input.photo) throw new Error("Add a photo so we can read your craft.");

  const form = new FormData();
  form.append("image", dataUrlToBlob(input.photo), "product.jpg");
  if (input.transcript.trim()) form.append("audio_transcript_or_text", input.transcript.trim());
  form.append("source_language", input.language ?? "hi");

  const response = await fetch(`${BASE_URL}/api/v1/catalog/auto-generate`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`The catalogue service could not read this photo (error ${response.status}).`);

  const data = (await response.json()) as BackendCatalog;
  return mapCatalog(data, input.photo, input.transcript);
}

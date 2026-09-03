import { useSyncExternalStore } from "react";
import type { Product } from "@/lib/kala-data";

export type Draft = { photo: string | null; transcript: string; title: string; category: string; craft: string; material: string; price: string; description: string; tags: string[] };

const DRAFT_KEY = "sih2026:draft";
const PUBLISHED_KEY = "sih2026:published";

export const emptyDraft: Draft = { photo: null, transcript: "", title: "", category: "", craft: "", material: "", price: "", description: "", tags: [] };

let draft: Draft = emptyDraft;
let published: Product[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const d = window.localStorage.getItem(DRAFT_KEY);
    if (d) draft = { ...emptyDraft, ...(JSON.parse(d) as Partial<Draft>) };
    const p = window.localStorage.getItem(PUBLISHED_KEY);
    if (p) published = JSON.parse(p) as Product[];
  } catch { /* ignore corrupt storage */ }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(published));
  } catch { /* quota or private mode */ }
}

function subscribe(listener: () => void) { hydrate(); listeners.add(listener); return () => { listeners.delete(listener); }; }

export function useDraft(): Draft { return useSyncExternalStore(subscribe, () => { hydrate(); return draft; }, () => emptyDraft); }
export function usePublished(): Product[] { return useSyncExternalStore(subscribe, () => { hydrate(); return published; }, () => [] as Product[]); }

export function updateDraft(patch: Partial<Draft>) { hydrate(); draft = { ...draft, ...patch }; persist(); emit(); }
export function resetDraft() { hydrate(); draft = emptyDraft; persist(); emit(); }

export function publishDraft(fallbackImage: string): Product {
  hydrate();
  const product: Product = {
    id: `draft-${Date.now()}`,
    title: draft.title || "Handcrafted Jaipur Blue Pottery Vase",
    category: draft.category || "Home Décor · Pottery",
    price: draft.price || "₹950",
    status: "Published",
    image: draft.photo || fallbackImage,
    imageAlt: draft.title || "Newly published handmade craft product",
  };
  published = [product, ...published];
  draft = emptyDraft;
  persist();
  emit();
  return product;
}

/** Mock "AI" enrichment from a photo + spoken description. */
export function generateCatalogue(input: { photo: string | null; transcript: string }): Draft {
  const text = input.transcript.toLowerCase();
  const craft = text.includes("jute") ? "Natural Jute Craft" : text.includes("block") || text.includes("print") ? "Hand Block Printing" : text.includes("weav") || text.includes("textile") ? "Handwoven Textiles" : "Jaipur Blue Pottery";
  const material = craft === "Natural Jute Craft" ? "Jute fibre" : craft === "Jaipur Blue Pottery" ? "Ceramic" : "Cotton";
  return {
    photo: input.photo,
    transcript: input.transcript,
    title: craft === "Jaipur Blue Pottery" ? "Handcrafted Jaipur Blue Pottery Vase" : `Handcrafted ${craft} Piece`,
    category: craft === "Jaipur Blue Pottery" ? "Home Décor → Traditional Pottery" : "Home Décor → Handmade",
    craft,
    material,
    price: "₹850 – ₹1,050",
    description: input.transcript.trim() ? `${input.transcript.trim()} Made slowly by hand, each piece carries the quiet character of traditional craft.` : "A hand-painted piece featuring intricate traditional motifs, made slowly by hand for homes that value story and detail.",
    tags: ["Handmade", "Traditional Craft", craft, "Home Décor"],
  };
}

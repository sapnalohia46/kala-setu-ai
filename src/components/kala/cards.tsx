import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { opportunities, type Opportunity } from "@/lib/kala-data";
import { Button, MatchBar, Score, StatusBadge } from "@/components/kala/ui";

// ==========================================
// 1. EMBEDDED GOOGLE FORM COMPONENT
// ==========================================
export default function Kal() {
  const [formType, setFormType] = useState<"google-form" | "info">("google-form");

  return (
    <div className="max-w-3xl mx-auto my-6 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100 font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Karigar & Buyer Registration</h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Niche diye gaye form ko bharein aur apni details/photos submit karein.
        </p>
      </div>

      {/* Google Form Iframe Container */}
      <div className="w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-inner min-h-[850px] flex justify-center">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSeAlngGQ3eY8EOvSPJOVkHADex-jxdtO0kTJSTx-ox-cUdumw/viewform?embedded=true"
          width="100%"
          height="917"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          className="w-full border-none"
        >
          Loading Google Form…
        </iframe>
      </div>
    </div>
  );
}

// ==========================================
// 2. EXISTING OPPORTUNITY COMPONENTS
// ==========================================
export function OpportunityCard({ opportunity, compact = false }: { opportunity: Opportunity; compact?: boolean }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-terracotta">{opportunity.category}</p>
          <h3 className="mt-1 font-display text-lg font-bold leading-tight text-ink">{opportunity.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{opportunity.buyer}</p>
        </div>
        <Score value={opportunity.score} />
      </div>
      <div className="mt-4">
        <MatchBar value={opportunity.score} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Quantity</p>
          <p className="mt-0.5 font-medium">{opportunity.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="mt-0.5 font-medium">{opportunity.budget}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="mt-0.5 font-medium">{opportunity.location}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Required by</p>
          <p className="mt-0.5 font-medium">{opportunity.deadline.replace(" 2026", "")}</p>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
          {opportunity.reasons.map((reason) => (
            <span key={reason} className="flex items-center gap-1.5">
              <span className="text-moss">✓</span>
              {reason}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <Link
          to="/opportunities/$id"
          params={{ id: opportunity.id }}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          View opportunity →
        </Link>
        {!compact && (
          <Button className="flex-1" onClick={() => window.alert("Interest noted in demo mode.")}>
            Express interest
          </Button>
        )}
      </div>
    </article>
  );
}

export function MiniOpportunity({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Link
      to="/opportunities/$id"
      params={{ id: opportunity.id }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted"
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-saffron/20 text-terracotta">✨</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{opportunity.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {opportunity.buyer} · {opportunity.quantity}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display font-bold text-indigo">{opportunity.score}%</p>
        <p className="font-mono text-[9px] uppercase tracking-[.1em] text-muted-foreground">match</p>
      </div>
      <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">›</span>
    </Link>
  );
}

export function OpportunityMeta({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex gap-3 rounded-xl bg-muted/60 p-3">
        <span className="mt-0.5 text-terracotta">👥</span>
        <div>
          <p className="text-xs text-muted-foreground">Buyer</p>
          <p className="mt-0.5 text-sm font-semibold">{opportunity.buyer}</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-xl bg-muted/60 p-3">
        <span className="mt-0.5 text-terracotta">📦</span>
        <div>
          <p className="text-xs text-muted-foreground">Requirement</p>
          <p className="mt-0.5 text-sm font-semibold">{opportunity.quantity}</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-xl bg-muted/60 p-3">
        <span className="mt-0.5 text-terracotta">📍</span>
        <div>
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="mt-0.5 text-sm font-semibold">{opportunity.location}</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-xl bg-muted/60 p-3">
        <span className="mt-0.5 text-terracotta">📅</span>
        <div>
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="mt-0.5 text-sm font-semibold">{opportunity.deadline}</p>
        </div>
      </div>
    </div>
  );
}

export function OpportunityList({ limit }: { limit?: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {(limit ? opportunities.slice(0, limit) : opportunities).map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  );
}

export function EnquiryStatus({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

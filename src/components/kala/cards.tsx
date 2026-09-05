import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { opportunities, type Opportunity } from "@/lib/kala-data";
import { Button, MatchBar, Score, StatusBadge } from "@/components/kala/ui";
import { supabase } from "@/integrations/supabase/client";


// ==========================================
// 1. COMBINED KARIGAR & BUYER FORM WITH PHOTO UPLOAD
// ==========================================
export default function Kal() {
  const [activeTab, setActiveTab] = useState<"karigar" | "buyer" | "google-form">("karigar");

  // Karigar Form State
  const [karigarData, setKarigarData] = useState({
    fullName: "",
    phone: "",
    aadhaarNumber: "",
    craftType: "",
    address: "",
    photoName: "",
  });
  const [karigarSubmitted, setKarigarSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [karigarBusy, setKarigarBusy] = useState(false);
  const [karigarError, setKarigarError] = useState("");

  // Buyer Form State
  const [buyerData, setBuyerData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    requirementType: "",
    estimatedQuantity: "",
    notes: "",
  });
  const [buyerSubmitted, setBuyerSubmitted] = useState(false);
  const [buyerBusy, setBuyerBusy] = useState(false);
  const [buyerError, setBuyerError] = useState("");

  // Handlers
  const handleKarigarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKarigarData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBuyerData((prev) => ({ ...prev, [name]: value }));
  };

  // Photo select (uploaded to cloud storage on submit)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setKarigarError("Photo 5MB se choti honi chahiye.");
      return;
    }
    setKarigarError("");
    setPhotoFile(file);
    setKarigarData((prev) => ({ ...prev, photoName: file.name }));
  };

  const handleKarigarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (karigarData.aadhaarNumber.length !== 12) {
      setKarigarError("Kripya 12-digit ka sahi Aadhaar Number darj karein.");
      return;
    }
    setKarigarBusy(true);
    setKarigarError("");
    try {
      let photoPath: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("karigar-photos")
          .upload(path, photoFile, { contentType: photoFile.type, upsert: false });
        if (uploadError) throw uploadError;
        photoPath = path;
      }

      const { error: insertError } = await supabase.from("karigar_kyc").insert({
        full_name: karigarData.fullName,
        phone: karigarData.phone,
        aadhaar_number: karigarData.aadhaarNumber,
        craft_type: karigarData.craftType,
        address: karigarData.address || null,
        photo_path: photoPath,
      });
      if (insertError) throw insertError;

      setKarigarSubmitted(true);
    } catch (error) {
      console.error("Karigar KYC submit failed:", error);
      setKarigarError("Submit nahi ho paya. Kripya dobara koshish karein.");
    } finally {
      setKarigarBusy(false);
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyerBusy(true);
    setBuyerError("");
    try {
      const { error } = await supabase.from("buyer_enquiries").insert({
        company_name: buyerData.companyName,
        contact_person: buyerData.contactPerson,
        email: buyerData.email,
        phone: buyerData.phone,
        requirement_type: buyerData.requirementType,
        estimated_quantity: buyerData.estimatedQuantity,
        notes: buyerData.notes || null,
      });
      if (error) throw error;
      setBuyerSubmitted(true);
    } catch (error) {
      console.error("Buyer enquiry submit failed:", error);
      setBuyerError("Requirement post nahi ho payi. Kripya dobara koshish karein.");
    } finally {
      setBuyerBusy(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto my-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 font-sans">
      {/* Navigation Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("karigar")}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "karigar" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          👤 Karigar KYC
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("buyer")}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "buyer" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🛍️ Buyer Enquiry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("google-form")}
          className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "google-form" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📝 Google Form
        </button>
      </div>

      {/* 1. KARIGAR TAB */}
      {activeTab === "karigar" && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Karigar Verification & KYC</h2>
          <p className="text-gray-500 text-xs text-center mb-6">Apni details bharein aur ID photo upload karein.</p>

          {karigarSubmitted ? (
            <div className="p-6 bg-green-50 rounded-xl text-center border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-1">Verification Submitted!</h3>
              <p className="text-sm text-green-600">Aapka details aur photo safaltapurvak submit ho gaya hai.</p>
              <button
                type="button"
                onClick={() => {
                  setKarigarSubmitted(false);
                  setKarigarData({
                    fullName: "",
                    phone: "",
                    aadhaarNumber: "",
                    craftType: "",
                    address: "",
                    photoName: "",
                  });
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Naya Form Bharein
              </button>
            </div>
          ) : (
            <form onSubmit={handleKarigarSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pura Naam (Full Name) *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={karigarData.fullName}
                  onChange={handleKarigarChange}
                  placeholder="Apna naam likhein"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    value={karigarData.phone}
                    onChange={handleKarigarChange}
                    placeholder="10 digit mobile number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    required
                    maxLength={12}
                    value={karigarData.aadhaarNumber}
                    onChange={handleKarigarChange}
                    placeholder="12 digit Aadhaar number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kala / Handcraft Type *</label>
                <select
                  name="craftType"
                  required
                  value={karigarData.craftType}
                  onChange={handleKarigarChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="Pottery">Pottery (Mitti ke bartan)</option>
                  <option value="Weaving">Weaving / Embroidery (Kadhai/Bunai)</option>
                  <option value="Woodwork">Woodwork (Lakdi ka kaam)</option>
                  <option value="Metalcraft">Metalcraft (Dhatu ka kaam)</option>
                  <option value="Painting">Painting / Art</option>
                  <option value="Other">Other (Anya)</option>
                </select>
              </div>

              {/* PHOTO UPLOAD BOX */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Craft / Aadhaar Photo Upload</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-xs text-gray-600 font-medium">📷 Click karke Photo Upload karein</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG (Max 5MB)</p>
                  {karigarData.photoName && (
                    <p className="text-xs text-indigo-600 font-semibold mt-2">Selected File: {karigarData.photoName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pura Pata (Address)</label>
                <textarea
                  name="address"
                  rows={2}
                  value={karigarData.address}
                  onChange={handleKarigarChange}
                  placeholder="Apna address likhein"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition duration-200 text-sm shadow-md"
              >
                Submit KYC Details
              </button>
            </form>
          )}
        </>
      )}

      {/* 2. BUYER TAB */}
      {activeTab === "buyer" && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Buyer Requirement Form</h2>
          <p className="text-gray-500 text-xs text-center mb-6">
            Post your requirements to connect with verified artisans.
          </p>

          {buyerSubmitted ? (
            <div className="p-6 bg-indigo-50 rounded-xl text-center border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-800 mb-1">Requirement Posted!</h3>
              <p className="text-sm text-indigo-600">
                Humari team jald hi aapki requirement ke hisaab se best karigars connect karegi.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBuyerSubmitted(false);
                  setBuyerData({
                    companyName: "",
                    contactPerson: "",
                    email: "",
                    phone: "",
                    requirementType: "",
                    estimatedQuantity: "",
                    notes: "",
                  });
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Post Another Requirement
              </button>
            </div>
          ) : (
            <form onSubmit={handleBuyerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={buyerData.companyName}
                  onChange={handleBuyerChange}
                  placeholder="Apni company ya brand ka naam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={buyerData.contactPerson}
                    onChange={handleBuyerChange}
                    placeholder="Aapka naam"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    value={buyerData.phone}
                    onChange={handleBuyerChange}
                    placeholder="10 digit number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={buyerData.email}
                  onChange={handleBuyerChange}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Craft Category *</label>
                  <select
                    name="requirementType"
                    required
                    value={buyerData.requirementType}
                    onChange={handleBuyerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Pottery">Pottery & Ceramics</option>
                    <option value="Textiles">Textiles & Embroidery</option>
                    <option value="Woodcraft">Woodcraft & Furniture</option>
                    <option value="Metalware">Metalware</option>
                    <option value="Paintings">Paintings & Fine Art</option>
                    <option value="Other">Other Custom Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Quantity *</label>
                  <input
                    type="text"
                    name="estimatedQuantity"
                    required
                    value={buyerData.estimatedQuantity}
                    onChange={handleBuyerChange}
                    placeholder="e.g. 500 units"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Requirement Details / Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={buyerData.notes}
                  onChange={handleBuyerChange}
                  placeholder="Describe your design, budget, or deadline requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition duration-200 text-sm shadow-md"
              >
                Submit Buyer Requirement
              </button>
            </form>
          )}
        </>
      )}

      {/* 3. GOOGLE FORM TAB */}
      {activeTab === "google-form" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-1">Google Form Registration</h2>
          <p className="text-gray-500 text-xs text-center mb-4">
            Aap direct Google Form ke dwara bhi data submit kar sakte hain.
          </p>
          <div className="w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSc-PLACEHOLDER/viewform?embedded=true"
              className="w-full h-full border-none"
              title="Google Form"
            >
              Loading Google Form...
            </iframe>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. EXISTING OPPORTUNITY COMPONENTS (UNCHANGED)
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

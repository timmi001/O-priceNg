import { useState, useRef, useCallback, useEffect } from "react";
import { useCreateListing, useGetCategories } from "@workspace/api-client-react";
import { BottomNav } from "@/components/navigation";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, Camera, Plus, X, ChevronDown,
  MapPin, Navigation, MessageCircle, Eye,
  Loader2, FileText, Sparkles, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Listing } from "@workspace/api-client-react/src/generated/api.schemas";

/* ── helpers ─────────────────────────────────────────────── */
const CONDITIONS = ["New", "Like New", "Used", "Refurbished"] as const;
const MAX_DESC   = 1000;
const NG_CITIES  = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Benin City", "Kaduna", "Owerri", "Warri"];

const CATEGORY_GRADIENTS: Record<string, string> = {
  Phones: "from-violet-900/80 to-purple-950/90",
  Electronics: "from-blue-900/80 to-indigo-950/90",
  Computers: "from-sky-900/80 to-blue-950/90",
  Fashion: "from-pink-900/80 to-rose-950/90",
  Vehicles: "from-orange-900/80 to-amber-950/90",
  "Home & Kitchen": "from-teal-900/80 to-cyan-950/90",
  Property: "from-emerald-900/80 to-green-950/90",
  Appliances: "from-slate-800/80 to-zinc-950/90",
};

const DRAFT_KEY = "oprice_draft";

function saveDraft(data: object) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
}
function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null"); } catch { return null; }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

/* ── sub-components ──────────────────────────────────────── */
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#161616] rounded-3xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function FloatingInput({
  label, value, onChange, type = "text", prefix, required, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: string; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
        floated ? "top-2 text-[10px] text-primary font-semibold" : "top-1/2 -translate-y-1/2 text-[14px] text-white/30"
      }`}>
        {label}{required && " *"}
      </label>
      <div className="flex items-center">
        {prefix && floated && (
          <span className="absolute left-4 top-1/2 translate-y-1 text-[18px] font-black text-white">{prefix}</span>
        )}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent text-white text-[16px] font-semibold outline-none pt-7 pb-3 rounded-2xl transition-colors border border-transparent focus:border-primary/20 ${
            prefix && floated ? "pl-8" : "px-4"
          }`}
        />
      </div>
      <div className={`absolute bottom-0 inset-x-0 h-px transition-colors ${focused ? "bg-primary/40" : "bg-white/5"}`} />
    </div>
  );
}

/* ── Mini preview card (same aesthetic as PinterestCard) ── */
function PreviewCard({ form, imageUrls, categoryName }: {
  form: { title: string; price: string; location: string; condition: string; category: string };
  imageUrls: string[];
  categoryName: string;
}) {
  const gradient = CATEGORY_GRADIENTS[categoryName] ?? "from-zinc-900/80 to-black/90";
  const hasImage = imageUrls.length > 0;

  const mockListing: Partial<Listing> = {
    id: 0,
    title: form.title || "Your listing title",
    price: Number(form.price) || 0,
    location: form.location || "Your location",
    condition: form.condition,
    category: categoryName || form.category,
    sellerName: "You",
    isVerifiedSeller: false,
    offerCount: 0,
    watchCount: 0,
    images: imageUrls,
  };

  return (
    <div className="rounded-[18px] overflow-hidden bg-[#1e1e1e] shadow-lg shadow-black/40 w-[160px] shrink-0">
      <div
        className={`relative w-full aspect-[3/4] overflow-hidden bg-[#111]`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        {hasImage ? (
          <img src={imageUrls[0]} className="absolute inset-0 w-full h-full object-cover" alt="preview" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white/10" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute bottom-2 left-2 z-10">
          <span className="text-[13px] font-black text-white drop-shadow">
            {mockListing.price ? `₦${mockListing.price.toLocaleString()}` : "₦ —"}
          </span>
        </div>
      </div>
      <div className="px-2.5 pt-2 pb-2">
        <h3 className="text-[11px] font-bold text-white line-clamp-2 mb-1 leading-snug">
          {mockListing.title}
        </h3>
        <div className="flex items-center gap-1 text-[9px] text-white/35 mb-1.5">
          <MapPin className="w-2 h-2" />
          <span className="truncate">{mockListing.location}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
          <MessageCircle className="w-3 h-3 text-white/25" />
          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">{form.condition || "New"}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function Sell() {
  const [, setLocation] = useLocation();
  const createListing = useCreateListing();
  const { data: categories } = useGetCategories();

  /* form state */
  const [images, setImages]         = useState<string[]>([]);   // object URLs for preview
  const [activeImg, setActiveImg]   = useState(0);
  const [title, setTitle]           = useState("");
  const [price, setPrice]           = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory]     = useState("");
  const [condition, setCondition]   = useState<string>("New");
  const [description, setDescription] = useState("");
  const [location_, setLocation_]   = useState("");
  const [whatsapp, setWhatsapp]     = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef  = useRef<ReturnType<typeof setTimeout>>();

  /* load draft on mount */
  useEffect(() => {
    const d = loadDraft();
    if (!d) return;
    if (d.title)       setTitle(d.title);
    if (d.price)       setPrice(d.price);
    if (d.originalPrice) setOriginalPrice(d.originalPrice);
    if (d.negotiable)  setNegotiable(d.negotiable);
    if (d.category)    setCategory(d.category);
    if (d.condition)   setCondition(d.condition);
    if (d.description) setDescription(d.description);
    if (d.location)    setLocation_(d.location);
    if (d.whatsapp !== undefined) setWhatsapp(d.whatsapp);
  }, []);

  /* auto-save draft on form change */
  useEffect(() => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveDraft({ title, price, originalPrice, negotiable, category, condition, description, location: location_, whatsapp });
    }, 1000);
    return () => clearTimeout(autoSaveRef.current);
  }, [title, price, originalPrice, negotiable, category, condition, description, location_, whatsapp]);

  /* progress */
  const steps = [images.length > 0, title.trim() !== "", price !== "", category !== "", location_.trim() !== ""];
  const progress = Math.round((steps.filter(Boolean).length / steps.length) * 100);
  const canPublish = steps.every(Boolean);

  /* image handling */
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).slice(0, 10 - images.length).map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...urls]);
  }, [images.length]);

  const removeImage = (i: number) => {
    setImages(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      URL.revokeObjectURL(prev[i]);
      return next;
    });
    if (activeImg >= images.length - 1) setActiveImg(Math.max(0, images.length - 2));
  };

  /* category display name helper */
  const categoryName = categories?.find(c => c.slug === category)?.name ?? category;

  /* publish */
  const handlePublish = () => {
    if (!canPublish) {
      toast.error("Please fill in all required fields");
      return;
    }
    createListing.mutate({
      data: {
        title,
        description,
        price: Number(price),
        condition,
        category,
        location: location_,
        shippingInfo: undefined,
        images: images.length > 0
          ? images.map((_, i) => `https://placehold.co/800x600/99dead/000?text=Photo+${i + 1}`)
          : ["https://placehold.co/800x600/99dead/000?text=No+Photo"],
      },
    }, {
      onSuccess: (listing) => {
        clearDraft();
        toast.success("Listing published! 🎉");
        setLocation(`/listing/${listing.id}`);
      },
      onError: () => toast.error("Failed to publish listing"),
    });
  };

  const handleSaveDraft = () => {
    saveDraft({ title, price, originalPrice, negotiable, category, condition, description, location: location_, whatsapp });
    toast.success("Draft saved");
  };

  return (
    <div className="min-h-[100dvh] bg-[#0d0d0d] text-foreground">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-xl">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setLocation("/")}
              className="w-9 h-9 rounded-full bg-white/6 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <h1 className="text-[20px] font-black text-white leading-tight">Create Listing</h1>
              <p className="text-[11px] text-white/30">Share your item with buyers</p>
            </div>
            <button
              onClick={() => setShowPreview(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                showPreview ? "bg-primary text-primary-foreground" : "bg-white/6 text-white/40 hover:bg-white/10"
              }`}
              data-testid="button-preview"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-bold text-primary shrink-0">{progress}%</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {steps.map((done, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${done ? "bg-primary" : "bg-white/8"}`}
              />
            ))}
          </div>
        </div>
        <div className="h-px bg-white/5" />
      </header>

      <main className="px-3 pt-4 pb-36 space-y-3">

        {/* ── LIVE PREVIEW PANEL ── */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <SectionCard className="p-4">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> Live Preview
                </p>
                <div className="flex items-start gap-3">
                  <PreviewCard form={{ title, price, location: location_, condition, category }} imageUrls={images} categoryName={categoryName} />
                  <div className="flex-1 pt-1 space-y-2">
                    <p className="text-[11px] text-white/30 leading-relaxed">
                      This is exactly how your listing will appear in buyers' feeds.
                    </p>
                    {!canPublish && (
                      <div className="space-y-1.5">
                        {!images.length       && <MissingHint text="Add at least one photo" />}
                        {!title.trim()        && <MissingHint text="Add a title" />}
                        {!price               && <MissingHint text="Set a price" />}
                        {!category            && <MissingHint text="Choose a category" />}
                        {!location_.trim()    && <MissingHint text="Add your location" />}
                      </div>
                    )}
                    {canPublish && (
                      <div className="flex items-center gap-1.5 text-primary text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready to publish!
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PHOTOS ── */}
        <SectionCard>
          <div className="p-4 pb-2">
            <SectionLabel icon={Camera} text="Photos" hint="First photo is the cover · up to 10" />
          </div>

          {images.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mx-3 mb-3 w-[calc(100%-24px)] aspect-[4/3] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 transition-colors bg-white/2 active:scale-[0.99]"
              data-testid="button-add-photos-empty"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary/60" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-white/60">Add Photos</p>
                <p className="text-[11px] text-white/25 mt-0.5">Tap to open camera or gallery</p>
              </div>
            </button>
          ) : (
            <div className="px-3 pb-3">
              {/* Main image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-2 bg-[#111]">
                <img src={images[activeImg]} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                  {activeImg === 0 ? "Cover Photo" : `Photo ${activeImg + 1}`}
                </div>
                <button
                  onClick={() => removeImage(activeImg)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                  data-testid={`button-remove-image-${activeImg}`}
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? "bg-white w-3" : "bg-white/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? "border-primary" : "border-transparent opacity-60"
                    }`}
                    data-testid={`thumb-${i}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`thumb ${i}`} />
                  </button>
                ))}
                {images.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 shrink-0 rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-primary/40 transition-colors"
                    data-testid="button-add-more-photos"
                  >
                    <Plus className="w-5 h-5 text-white/30" />
                  </button>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
            data-testid="input-file-upload"
          />
        </SectionCard>

        {/* ── DETAILS ── */}
        <SectionCard>
          <div className="px-4 pt-4 pb-2">
            <SectionLabel icon={Sparkles} text="Details" hint="Fill in your listing info" />
          </div>

          <FloatingInput
            label="Product title" value={title}
            onChange={setTitle} required
          />

          <div className="flex gap-0">
            <div className="flex-1">
              <FloatingInput
                label="Price" value={price}
                onChange={setPrice}
                type="text" inputMode="decimal"
                prefix="₦" required
              />
            </div>
            {negotiable && (
              <div className="flex-1">
                <FloatingInput
                  label="Original price" value={originalPrice}
                  onChange={setOriginalPrice}
                  type="text" inputMode="decimal"
                  prefix="₦"
                />
              </div>
            )}
          </div>

          {/* Negotiable toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <div>
              <p className="text-[13px] font-semibold text-white/70">Negotiable price</p>
              <p className="text-[10px] text-white/30">Let buyers make offers</p>
            </div>
            <button
              onClick={() => setNegotiable(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative ${negotiable ? "bg-primary" : "bg-white/10"}`}
              data-testid="toggle-negotiable"
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${negotiable ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Condition pills */}
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2.5">Condition</p>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all ${
                    condition === c
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/10"
                  }`}
                  data-testid={`condition-${c.toLowerCase().replace(" ", "-")}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-2.5">Category</p>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-white/5 text-white text-[14px] font-semibold rounded-2xl px-4 py-3 pr-10 border border-white/8 appearance-none outline-none focus:border-primary/40 transition-colors"
                data-testid="select-category"
              >
                <option value="" disabled className="bg-[#161616]">Select a category</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.slug} className="bg-[#161616]">{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </SectionCard>

        {/* ── DESCRIPTION ── */}
        <SectionCard>
          <div className="px-4 pt-4 pb-2">
            <SectionLabel icon={FileText} text="Description" hint="The more detail, the faster you'll sell" />
          </div>
          <div className="px-4 pb-4">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, MAX_DESC))}
              placeholder="Describe your item in detail — include brand, model, condition notes, reason for selling, dimensions, accessories included…"
              className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 resize-none outline-none focus:border-primary/30 transition-colors min-h-[120px]"
              data-testid="textarea-description"
            />
            <div className="flex justify-end mt-1.5">
              <span className={`text-[10px] font-semibold ${description.length > MAX_DESC * 0.9 ? "text-orange-400" : "text-white/20"}`}>
                {description.length}/{MAX_DESC}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── LOCATION ── */}
        <SectionCard>
          <div className="px-4 pt-4 pb-3">
            <SectionLabel icon={MapPin} text="Location" hint="Where are you selling from?" />
          </div>

          {/* Quick city chips */}
          <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-3">
            {NG_CITIES.map(city => (
              <button
                key={city}
                onClick={() => setLocation_(city)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  location_ === city
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-white/40 border border-white/8"
                }`}
                data-testid={`city-${city.toLowerCase().replace(" ", "-")}`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Manual input */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-2xl px-4 py-3 focus-within:border-primary/30 transition-colors">
              <Navigation className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="text"
                placeholder="Or type a custom location…"
                value={location_}
                onChange={e => setLocation_(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
                data-testid="input-location"
              />
              {location_ && (
                <button onClick={() => setLocation_("")} className="text-white/30 hover:text-white/60">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── CONTACT PREFERENCES ── */}
        <SectionCard>
          <div className="px-4 pt-4 pb-3">
            <SectionLabel icon={MessageCircle} text="Contact" hint="How buyers can reach you" />
          </div>
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-3">
              {/* WhatsApp icon — inline SVG */}
              <div className="w-10 h-10 rounded-2xl bg-green-600/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-500" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">WhatsApp</p>
                <p className="text-[11px] text-white/30">Allow buyers to message via WhatsApp</p>
              </div>
            </div>
            <button
              onClick={() => setWhatsapp(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${whatsapp ? "bg-green-500" : "bg-white/10"}`}
              data-testid="toggle-whatsapp"
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${whatsapp ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </SectionCard>

      </main>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Progress strip */}
        <div className="h-0.5 bg-white/5">
          <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        <div className="bg-[#0d0d0d]/98 backdrop-blur-xl border-t border-white/6 px-4 pt-3 pb-6 flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex-1 py-3.5 rounded-2xl bg-white/6 border border-white/8 text-white/60 text-[14px] font-bold hover:bg-white/10 transition-colors"
            data-testid="button-save-draft"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={createListing.isPending}
            className={`flex-2 flex-[2] py-3.5 rounded-2xl text-[14px] font-black transition-all flex items-center justify-center gap-2 ${
              canPublish
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-90 active:scale-[0.98]"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
            data-testid="button-publish"
          >
            {createListing.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Publish Listing</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── tiny helpers ── */
function SectionLabel({ icon: Icon, text, hint }: { icon: React.ElementType; text: string; hint: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <p className="text-[13px] font-black text-white leading-tight">{text}</p>
        <p className="text-[10px] text-white/30">{hint}</p>
      </div>
    </div>
  );
}

function MissingHint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/30">
      <span className="w-1 h-1 rounded-full bg-white/20" />
      {text}
    </div>
  );
}

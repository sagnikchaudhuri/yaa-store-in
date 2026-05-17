"use client";

import { useState, useMemo } from "react";
import {
  Search, Plus, Filter, Eye, EyeOff, Edit2, Trash2, Zap,
  Star, Package, CheckCircle, XCircle, Clock, ImagePlus,
  Building2, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useStore, useFranchises, useCategories } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/lib/toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import type { DashboardProduct, ProductStatus } from "@/lib/dashboard-data";

// ─── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProductStatus, { label: string; bg: string; color: string }> = {
  listed:    { label: "Live",      bg: "oklch(0.64 0.14 160 / 0.12)", color: "oklch(0.38 0.13 160)" },
  unlisted:  { label: "Hidden",    bg: "oklch(0.75 0.04 260 / 0.14)", color: "oklch(0.48 0.05 260)" },
  scheduled: { label: "Scheduled", bg: "oklch(0.55 0.22 280 / 0.12)", color: "oklch(0.38 0.18 280)" },
};

function StatusBadge({ status }: { status: ProductStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status === "listed"    && <CheckCircle className="h-3 w-3" />}
      {status === "unlisted"  && <XCircle     className="h-3 w-3" />}
      {status === "scheduled" && <Clock       className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

function StockCell({ stock }: { stock: number }) {
  const color = stock === 0 ? "oklch(0.47 0.22 22)" : stock < 15 ? "oklch(0.65 0.18 50)" : "oklch(0.38 0.13 160)";
  const barPct = Math.min(100, (stock / 50) * 100);
  return (
    <div>
      <span className="font-bold text-sm" style={{ color }}>{stock === 0 ? "Out" : stock}</span>
      {stock > 0 && (
        <div className="mt-1 h-1 w-12 rounded-full" style={{ background: "oklch(0.92 0.015 80)" }}>
          <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

// ─── Image slot manager ────────────────────────────────────────────
function ImageSlots({
  images, onChange,
}: {
  images: (string | null)[];
  onChange: (imgs: (string | null)[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function addImage(idx: number) {
    const url = window.prompt("Enter image URL (or leave blank for placeholder):");
    if (url === null) return;
    const next = [...images];
    next[idx] = url.trim() || `__placeholder_${idx + 1}`;
    onChange(next);
  }

  function removeImage(idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    const next = [...images];
    next[idx] = null;
    onChange(next);
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) return;
    const next = [...images];
    [next[dragIdx], next[toIdx]] = [next[toIdx], next[dragIdx]];
    onChange(next);
    setDragIdx(null);
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Images</p>
      <div className="flex gap-2">
        {/* Hero slot */}
        <div
          className="relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary transition-colors flex-shrink-0"
          style={{
            width: "88px", height: "88px",
            borderColor: images[0] ? "oklch(0.68 0.19 44)" : "oklch(0.88 0.015 80)",
            background: images[0] ? "oklch(0.68 0.19 44 / 0.08)" : "oklch(0.97 0.008 78)",
          }}
          onClick={() => !images[0] && addImage(0)}
          draggable={!!images[0]}
          onDragStart={() => handleDragStart(0)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(0)}
        >
          {images[0] ? (
            <>
              {images[0].startsWith("__placeholder") ? (
                <Package className="h-6 w-6" style={{ color: "oklch(0.68 0.19 44)" }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
              )}
              <button
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                onClick={(e) => removeImage(0, e)}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" style={{ color: "oklch(0.68 0.19 44)" }} />
              <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "oklch(0.68 0.19 44)" }}>Hero</span>
            </>
          )}
        </div>
        {/* Gallery slots */}
        <div className="grid grid-cols-4 gap-2 flex-1">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative"
              style={{
                borderColor: images[idx] ? "oklch(0.68 0.19 44 / 0.50)" : "oklch(0.88 0.015 80)",
                background: images[idx] ? "oklch(0.68 0.19 44 / 0.05)" : "oklch(0.97 0.008 78)",
              }}
              onClick={() => !images[idx] && addImage(idx)}
              draggable={!!images[idx]}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
            >
              {images[idx] ? (
                <>
                  {images[idx]!.startsWith("__placeholder") ? (
                    <Package className="h-4 w-4" style={{ color: "oklch(0.68 0.19 44)" }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[idx]!} alt="" className="w-full h-full object-cover rounded-xl" />
                  )}
                  <button
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    onClick={(e) => removeImage(idx, e)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </>
              ) : (
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">
        Hero = product cards. Gallery = detail view. Drag to reorder. Click + to add.
      </p>
    </div>
  );
}

// ─── Category Manager ──────────────────────────────────────────────
function CategoryManager({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const { addToast }        = useToast();
  const [newName,       setNewName]       = useState("");
  const [newEmoji,      setNewEmoji]      = useState("📦");
  const [editId,        setEditId]        = useState<string | null>(null);
  const [editName,      setEditName]      = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    const id = `cat${Date.now()}`;
    dispatch({ type: "CATEGORY_CREATE", payload: { id, name: newName.trim(), emoji: newEmoji, active: true } });
    dispatch({ type: "LOG_ADD", payload: { action: "Category added", details: `${newName.trim()} added`, time: "Just now", severity: "info" } });
    addToast(`Category "${newName.trim()}" added`, "success");
    setNewName(""); setNewEmoji("📦");
  }

  function handleToggle(id: string, active: boolean) {
    dispatch({ type: "CATEGORY_UPDATE", payload: { id, updates: { active: !active } } });
    addToast(`Category ${active ? "deactivated" : "activated"}`, "info");
  }

  function handleEditSave(id: string) {
    if (!editName.trim()) return;
    dispatch({ type: "CATEGORY_UPDATE", payload: { id, updates: { name: editName.trim() } } });
    addToast("Category updated", "success");
    setEditId(null);
  }

  function handleDelete(id: string) {
    const c = state.categories.find(x => x.id === id);
    const inUse = state.products.filter(p => p.category.toLowerCase() === c?.name.toLowerCase()).length;
    if (inUse > 0) {
      addToast(`Cannot delete — ${inUse} product${inUse > 1 ? "s use" : " uses"} this category`, "error");
      setConfirmDelete(null);
      return;
    }
    dispatch({ type: "CATEGORY_DELETE", payload: id });
    dispatch({ type: "LOG_ADD", payload: { action: "Category deleted", details: `${c?.name} removed`, time: "Just now", severity: "warning" } });
    addToast("Category removed", "info");
    setConfirmDelete(null);
  }

  return (
    <>
      {confirmDelete && (
        <ConfirmModal
          title="Remove category?"
          message="Products assigned to this category will retain their current category name. This cannot be undone."
          confirmLabel="Remove"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            <div>
              <h2 className="font-heading font-black text-lg text-foreground">Category Manager</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{state.categories.length} categories</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">✕</button>
          </div>

          {/* Add new */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Add Category</p>
            <div className="flex gap-2">
              <input
                className="w-14 border rounded-xl px-2 py-2 text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: "oklch(0.88 0.015 80)" }}
                value={newEmoji}
                onChange={e => setNewEmoji(e.target.value)}
                placeholder="📦"
              />
              <input
                className="flex-1 border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: "oklch(0.88 0.015 80)" }}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Category name"
                onKeyDown={e => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.68 0.19 44)" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
            {state.categories.map(c => {
              const usageCount = state.products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
              return (
                <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                  <span className="text-xl flex-shrink-0">{c.emoji}</span>
                  {editId === c.id ? (
                    <input
                      autoFocus
                      className="flex-1 border rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      style={{ borderColor: "oklch(0.88 0.015 80)" }}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEditSave(c.id); if (e.key === "Escape") setEditId(null); }}
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold ${c.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
                        {c.name}
                      </span>
                      {usageCount > 0 && (
                        <span className="ml-2 text-[10px] font-bold text-muted-foreground">{usageCount} products</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {editId === c.id ? (
                      <>
                        <button onClick={() => handleEditSave(c.id)} className="text-xs font-bold px-2.5 py-1 rounded-lg text-white" style={{ background: "oklch(0.68 0.19 44)" }}>Save</button>
                        <button onClick={() => setEditId(null)} className="text-xs font-bold px-2.5 py-1 rounded-lg border" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggle(c.id, c.active)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors hover:bg-gray-50"
                          style={{ borderColor: "oklch(0.88 0.015 80)", color: c.active ? "oklch(0.40 0.12 160)" : "oklch(0.55 0.05 260)" }}
                        >
                          {c.active ? "Active" : "Off"}
                        </button>
                        <button
                          onClick={() => { setEditId(c.id); setEditName(c.name); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.98 0.006 78)" }}>
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "oklch(0.68 0.19 44)" }}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Product form state ────────────────────────────────────────────
interface ProductForm {
  name: string;
  franchise: string;
  character: string;
  category: string;
  price: string;
  stock: string;
  status: ProductStatus;
  scheduledAt: string;
  isDrop: boolean;
  isLimited: boolean;
  isFeatured: boolean;
  tags: string;
  images: (string | null)[];
}

function blankForm(franchiseDefault = "", categoryDefault = ""): ProductForm {
  return {
    name: "", franchise: franchiseDefault, character: "", category: categoryDefault,
    price: "", stock: "", status: "listed", scheduledAt: "",
    isDrop: false, isLimited: false, isFeatured: false, tags: "",
    images: [null, null, null, null, null],
  };
}
function productToForm(p: DashboardProduct): ProductForm {
  return {
    name: p.name, franchise: p.franchise, character: p.character ?? "",
    category: p.category, price: String(p.price), stock: String(p.stock),
    status: p.status, scheduledAt: p.scheduledAt ?? "",
    isDrop: p.isDrop, isLimited: p.isLimited, isFeatured: p.isFeatured,
    tags: p.tags.join(", "), images: p.images ?? [null, null, null, null, null],
  };
}

// ─── Product modal ─────────────────────────────────────────────────
function ProductModal({
  product, onClose, onSave,
}: {
  product?: DashboardProduct;
  onClose: () => void;
  onSave: (form: ProductForm) => void;
}) {
  const isEdit     = !!product;
  const franchises = useFranchises();
  const categories = useCategories();
  const firstCat   = categories.find(c => c.active)?.name ?? "";
  const [form, setForm] = useState<ProductForm>(
    product ? productToForm(product) : blankForm("", firstCat)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof ProductForm>(key: K, val: ProductForm[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())      e.name     = "Product name is required";
    if (!form.franchise.trim()) e.franchise = "Franchise is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Valid price required";
    if (form.stock === "" || isNaN(Number(form.stock))) e.stock = "Valid stock required";
    if (form.status === "scheduled" && !form.scheduledAt) e.scheduledAt = "Schedule date required";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  }

  const inputClass = "w-full border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
  const borderStyle = (key: string) => ({
    borderColor: errors[key] ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
          <div>
            <h2 className="font-heading font-black text-lg text-foreground">{isEdit ? "Edit Listing" : "New Listing"}</h2>
            {isEdit && <p className="text-xs text-muted-foreground mt-0.5">{product.id}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Images */}
          <ImageSlots images={form.images} onChange={(imgs) => set("images", imgs)} />

          {/* Product name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Product Name *</label>
            <input className={inputClass} style={borderStyle("name")} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Gojo Satoru Figure" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Franchise + category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Franchise *</label>
              <select
                className={`${inputClass} bg-white`}
                style={borderStyle("franchise")}
                value={form.franchise}
                onChange={e => set("franchise", e.target.value)}
              >
                <option value="">Select franchise</option>
                {franchises.filter(f => f.active).map(f => (
                  <option key={f.id} value={f.name}>{f.emoji} {f.name}</option>
                ))}
              </select>
              {errors.franchise && <p className="text-xs text-red-500 mt-1">{errors.franchise}</p>}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Category</label>
              <select className={`${inputClass} bg-white`} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.category} onChange={e => set("category", e.target.value)}>
                {categories.filter(c => c.active).map(c => (
                  <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Character */}
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Character / Subject</label>
            <input className={inputClass} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.character} onChange={e => set("character", e.target.value)} placeholder="e.g. Gojo Satoru" />
          </div>

          {/* Price + stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Price ($) *</label>
              <input type="number" step="0.01" min="0" className={inputClass} style={borderStyle("price")} value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Stock *</label>
              <input type="number" min="0" className={inputClass} style={borderStyle("stock")} value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Tags</label>
            <input className={inputClass} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="naruto, figure, limited (comma-separated)" />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(["listed", "unlisted", "scheduled"] as ProductStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const isOn = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className="px-3 py-2.5 rounded-xl border-2 text-center cursor-pointer transition-all"
                    style={{
                      borderColor: isOn ? cfg.color : "oklch(0.90 0.015 80)",
                      background: isOn ? cfg.bg : "transparent",
                    }}
                  >
                    <p className="text-xs font-black capitalize" style={{ color: isOn ? cfg.color : "oklch(0.55 0.05 260)" }}>{s}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduled date */}
          {form.status === "scheduled" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                className={inputClass}
                style={borderStyle("scheduledAt")}
                value={form.scheduledAt}
                onChange={e => set("scheduledAt", e.target.value)}
              />
              {errors.scheduledAt && <p className="text-xs text-red-500 mt-1">{errors.scheduledAt}</p>}
            </div>
          )}

          {/* Flags */}
          <div className="grid grid-cols-3 gap-3">
            {([
              { label: "Drop Item", key: "isDrop",     icon: "⚡" },
              { label: "Limited",   key: "isLimited",  icon: "🔥" },
              { label: "Featured",  key: "isFeatured", icon: "⭐" },
            ] as Array<{ label: string; key: keyof ProductForm & ("isDrop" | "isLimited" | "isFeatured"); icon: string }>).map(({ label, key, icon }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: form[key] ? "oklch(0.68 0.19 44 / 0.50)" : "oklch(0.90 0.015 80)",
                  background: form[key] ? "oklch(0.68 0.19 44 / 0.05)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={e => set(key, e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs font-semibold text-foreground">{icon} {label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.98 0.006 78)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-gray-50 transition-colors" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "oklch(0.68 0.19 44)" }}>
            {isEdit ? "Save Changes" : "Create Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Franchise Manager ─────────────────────────────────────────────
function FranchiseManager({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    const id = `f${Date.now()}`;
    dispatch({ type: "FRANCHISE_CREATE", payload: { id, name: newName.trim(), emoji: newEmoji, color: "oklch(0.68 0.19 44)", active: true } });
    dispatch({ type: "LOG_ADD", payload: { action: "Franchise added", details: `${newName.trim()} added`, time: "Just now", severity: "info" } });
    addToast(`Franchise "${newName.trim()}" added`, "success");
    setNewName(""); setNewEmoji("✨");
  }

  function handleToggle(id: string, active: boolean) {
    dispatch({ type: "FRANCHISE_UPDATE", payload: { id, updates: { active: !active } } });
    addToast(`Franchise ${active ? "deactivated" : "activated"}`, "info");
  }

  function handleEditSave(id: string) {
    if (!editName.trim()) return;
    dispatch({ type: "FRANCHISE_UPDATE", payload: { id, updates: { name: editName.trim() } } });
    addToast("Franchise updated", "success");
    setEditId(null);
  }

  function handleDelete(id: string) {
    const f = state.franchises.find(x => x.id === id);
    dispatch({ type: "FRANCHISE_DELETE", payload: id });
    dispatch({ type: "LOG_ADD", payload: { action: "Franchise deleted", details: `${f?.name} removed`, time: "Just now", severity: "warning" } });
    addToast("Franchise removed", "info");
    setConfirmDelete(null);
  }

  return (
    <>
      {confirmDelete && (
        <ConfirmModal
          title="Remove franchise?"
          message="Products assigned to this franchise will retain their franchise name. This cannot be undone."
          confirmLabel="Remove"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            <div>
              <h2 className="font-heading font-black text-lg text-foreground">Franchise Manager</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{state.franchises.length} franchises</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">✕</button>
          </div>

          {/* Add new */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Add Franchise</p>
            <div className="flex gap-2">
              <input
                className="w-14 border rounded-xl px-2 py-2 text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: "oklch(0.88 0.015 80)" }}
                value={newEmoji}
                onChange={e => setNewEmoji(e.target.value)}
                placeholder="🎌"
              />
              <input
                className="flex-1 border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: "oklch(0.88 0.015 80)" }}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Franchise name"
                onKeyDown={e => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.68 0.19 44)" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
            {state.franchises.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-6 py-3">
                <span className="text-xl flex-shrink-0">{f.emoji}</span>
                {editId === f.id ? (
                  <input
                    autoFocus
                    className="flex-1 border rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ borderColor: "oklch(0.88 0.015 80)" }}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleEditSave(f.id); if (e.key === "Escape") setEditId(null); }}
                  />
                ) : (
                  <span className={`flex-1 text-sm font-semibold ${f.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
                    {f.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {editId === f.id ? (
                    <>
                      <button onClick={() => handleEditSave(f.id)} className="text-xs font-bold px-2.5 py-1 rounded-lg text-white" style={{ background: "oklch(0.68 0.19 44)" }}>Save</button>
                      <button onClick={() => setEditId(null)} className="text-xs font-bold px-2.5 py-1 rounded-lg border" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggle(f.id, f.active)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "oklch(0.88 0.015 80)", color: f.active ? "oklch(0.40 0.12 160)" : "oklch(0.55 0.05 260)" }}
                      >
                        {f.active ? "Active" : "Off"}
                      </button>
                      <button
                        onClick={() => { setEditId(f.id); setEditName(f.name); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(f.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.98 0.006 78)" }}>
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "oklch(0.68 0.19 44)" }}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Filter pill ───────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
      style={active ? { background: "oklch(0.68 0.19 44)", color: "white" } : { background: "oklch(0.94 0.010 78)", color: "oklch(0.48 0.05 260)" }}
    >
      {label}
    </button>
  );
}

const STATUS_PILLS: Array<"All" | ProductStatus> = ["All", "listed", "unlisted", "scheduled"];
const PAGE_SIZE = 12;

// ─── Page ──────────────────────────────────────────────────────────
export default function ListingsPage() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const products = state.products;

  const [search,        setSearch]        = useState("");
  const [franchise,     setFranchise]     = useState("All");
  const [category,      setCategory]      = useState("All");
  const [status,        setStatus]        = useState<"All" | ProductStatus>("All");
  const [modal,         setModal]         = useState<"new" | DashboardProduct | null>(null);
  const [showFranchise, setShowFranchise] = useState(false);
  const [showCategory,  setShowCategory]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [page,          setPage]          = useState(1);

  const franchiseOptions = ["All", ...state.franchises.filter(f => f.active).map(f => f.name)];
  const categoryOptions  = ["All", ...state.categories.filter(c => c.active).map(c => c.name)];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.franchise.toLowerCase().includes(search.toLowerCase())) return false;
      if (franchise !== "All" && p.franchise.toLowerCase() !== franchise.toLowerCase()) return false;
      // Category comparison is case-insensitive: seed data uses "figures" but manager uses "Figures"
      if (category  !== "All" && p.category.toLowerCase()  !== category.toLowerCase())  return false;
      if (status    !== "All" && p.status     !== status)    return false;
      return true;
    });
  }, [products, search, franchise, category, status]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave(form: ProductForm) {
    if (modal === "new") {
      const newProd: DashboardProduct = {
        id: `p${Date.now()}`,
        name: form.name,
        franchise: form.franchise,
        character: form.character || undefined,
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        status: form.status,
        scheduledAt: form.scheduledAt || undefined,
        isDrop: form.isDrop,
        isLimited: form.isLimited,
        isFeatured: form.isFeatured,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        views: 0,
        orders: 0,
        images: form.images,
      };
      dispatch({ type: "PRODUCT_CREATE", payload: newProd });
      dispatch({ type: "LOG_ADD", payload: { action: "Product created", details: `${form.name} added to store`, time: "Just now", severity: "info" } });
      addToast(`"${form.name}" added to listings`, "success");
    } else if (modal && typeof modal !== "string") {
      dispatch({
        type: "PRODUCT_UPDATE",
        payload: {
          id: (modal as DashboardProduct).id,
          updates: {
            name: form.name, franchise: form.franchise, character: form.character || undefined,
            category: form.category, price: parseFloat(form.price), stock: parseInt(form.stock),
            status: form.status, scheduledAt: form.scheduledAt || undefined,
            isDrop: form.isDrop, isLimited: form.isLimited, isFeatured: form.isFeatured,
            tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
            images: form.images,
          },
        },
      });
      dispatch({ type: "LOG_ADD", payload: { action: "Product updated", details: `${form.name} edited`, time: "Just now", severity: "info" } });
      addToast(`"${form.name}" updated`, "success");
    }
    setModal(null);
  }

  function handleToggleVisibility(p: DashboardProduct) {
    dispatch({ type: "PRODUCT_TOGGLE_VISIBILITY", payload: p.id });
    const newVis = p.status === "listed" ? "hidden" : "visible";
    dispatch({ type: "LOG_ADD", payload: { action: "Visibility changed", details: `${p.name} set to ${newVis}`, time: "Just now", severity: "info" } });
    addToast(`"${p.name}" ${p.status === "listed" ? "hidden" : "listed"}`, "info");
  }

  function handleDelete(id: string) {
    const p = products.find(x => x.id === id);
    dispatch({ type: "PRODUCT_DELETE", payload: id });
    dispatch({ type: "LOG_ADD", payload: { action: "Product deleted", details: `${p?.name} removed from store`, time: "Just now", severity: "warning" } });
    addToast(`"${p?.name}" deleted`, "warning");
    setConfirmDelete(null);
  }

  const liveCount      = products.filter(p => p.status === "listed").length;
  const scheduledCount = products.filter(p => p.status === "scheduled").length;
  const unlistedCount  = products.filter(p => p.status === "unlisted").length;
  const outCount       = products.filter(p => p.stock === 0).length;

  return (
    <>
      {modal && (
        <ProductModal
          product={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {showFranchise && <FranchiseManager onClose={() => setShowFranchise(false)} />}
      {showCategory  && <CategoryManager  onClose={() => { setShowCategory(false); setPage(1); }} />}
      {confirmDelete && (
        <ConfirmModal
          title="Delete listing?"
          message="This product will be permanently removed from your store. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>Inventory</p>
            <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Listings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {products.length} products · <span style={{ color: "oklch(0.38 0.13 160)" }}>{liveCount} live</span> · <span className="text-muted-foreground">{outCount} out of stock</span>
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowFranchise(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border hover:bg-white transition-colors"
              style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
            >
              <Building2 className="h-4 w-4" />
              Franchises
            </button>
            <button
              onClick={() => setShowCategory(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border hover:bg-white transition-colors"
              style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
            >
              <Package className="h-4 w-4" />
              Categories
            </button>
            <button
              onClick={() => { setModal("new"); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: "oklch(0.68 0.19 44)" }}
            >
              <Plus className="h-4 w-4" />
              Add Listing
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {STATUS_PILLS.map((s) => {
            const pillLabel =
              s === "All"       ? `All (${products.length})`                                   :
              s === "listed"    ? `Live (${products.filter(p => p.status === "listed").length})`  :
              s === "unlisted"  ? `Hidden (${products.filter(p => p.status === "unlisted").length})` :
              `Scheduled (${products.filter(p => p.status === "scheduled").length})`;
            return (
              <FilterPill
                key={s}
                label={pillLabel}
                active={status === s}
                onClick={() => { setStatus(s); setPage(1); }}
              />
            );
          })}
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl p-3.5 border shadow-sm mb-4 flex flex-wrap gap-2.5 items-center" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 min-w-[180px]" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name or franchise…"
              className="text-sm placeholder:text-muted-foreground focus:outline-none flex-1 bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select value={franchise} onChange={(e) => { setFranchise(e.target.value); setPage(1); }} className="border rounded-xl px-3 py-2 text-xs font-semibold bg-white focus:outline-none" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            {franchiseOptions.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="border rounded-xl px-3 py-2 text-xs font-semibold bg-white focus:outline-none" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            {categoryOptions.map(c => <option key={c}>{c === "All" ? "All Categories" : c}</option>)}
          </select>
          <span className="text-xs font-bold text-muted-foreground ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.975 0.007 78)" }}>
                  {["Product", "Franchise", "Category", "Price", "Stock", "Status", "Flags", "Views", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.008 78)" }}>
                {paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-orange-50/30 transition-colors"
                    style={{
                      opacity: p.status === "unlisted" ? 0.55 : 1,
                      borderLeft: p.status === "unlisted"
                        ? "3px solid oklch(0.75 0.04 260 / 0.55)"
                        : p.stock === 0
                        ? "3px solid oklch(0.47 0.22 22 / 0.40)"
                        : "3px solid transparent",
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "oklch(0.94 0.010 78)" }}>
                          {p.images?.[0] && !p.images[0].startsWith("__placeholder") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Package className="h-4 w-4" style={{ color: "oklch(0.65 0.15 44)" }} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-snug">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground whitespace-nowrap">{p.franchise}</td>
                    <td className="px-5 py-3.5"><span className="capitalize text-xs font-semibold text-muted-foreground">{p.category}</span></td>
                    <td className="px-5 py-3.5"><span className="font-heading font-black text-sm text-foreground">{formatPrice(p.price)}</span></td>
                    <td className="px-5 py-3.5"><StockCell stock={p.stock} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 items-center">
                        {p.isDrop     && <span title="Drop item" className="text-sm">⚡</span>}
                        {p.isLimited  && <span title="Limited"   className="text-sm">🔥</span>}
                        {p.isFeatured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                        {!p.isDrop && !p.isLimited && !p.isFeatured && <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.views.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal(p)}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                          style={{ color: "oklch(0.68 0.19 44)" }}
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => p.status !== "scheduled" && handleToggleVisibility(p)}
                          disabled={p.status === "scheduled"}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ opacity: p.status === "scheduled" ? 0.3 : 1, cursor: p.status === "scheduled" ? "not-allowed" : "pointer" }}
                          title={
                            p.status === "scheduled" ? "Scheduled listing — use Edit to change status" :
                            p.status === "listed"    ? "Hide listing" :
                                                       "Make listing visible"
                          }
                        >
                          {p.status === "listed"    && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                          {p.status === "unlisted"  && <Eye    className="h-3.5 w-3.5 text-green-600" />}
                          {p.status === "scheduled" && <Clock  className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="flex items-center px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginated.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-semibold">No listings match your filters</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
                {(search || franchise !== "All" || category !== "All" || status !== "All") && (
                  <button
                    onClick={() => { setSearch(""); setFranchise("All"); setCategory("All"); setStatus("All"); setPage(1); }}
                    className="mt-3 text-xs font-bold px-4 py-2 rounded-xl text-white"
                    style={{ background: "oklch(0.68 0.19 44)" }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border hover:bg-white transition-colors disabled:opacity-40" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border hover:bg-white transition-colors disabled:opacity-40" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Live",         value: liveCount,      color: "oklch(0.38 0.13 160)", bg: "oklch(0.64 0.14 160 / 0.08)" },
            { label: "Scheduled",    value: scheduledCount, color: "oklch(0.38 0.18 280)", bg: "oklch(0.55 0.22 280 / 0.08)" },
            { label: "Hidden",       value: unlistedCount,  color: "oklch(0.48 0.05 260)", bg: "oklch(0.75 0.04 260 / 0.08)" },
            { label: "Out of Stock", value: outCount,       color: "oklch(0.47 0.22 22)",  bg: "oklch(0.47 0.22 22 / 0.08)"  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border shadow-sm text-center" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <p className="font-heading font-black text-2xl" style={{ color }}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

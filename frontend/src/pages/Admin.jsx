import { useEffect, useState, useMemo } from "react";
import api, { formatApiError } from "@/lib/api";
import { Pencil, Trash2, Plus, X, Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { optimizeImageUrl, calculateDiscount } from "@/lib/utils";

const EMPTY = {
  title: "",
  image_url: "",
  price: "",
  category: "shirts",
  tags: [],
  fabric: "",
  sizes: "",
  color: "",
  specifications: "",
  discount: "",
};

export default function Admin() {
    // List of all categories retrieved from backend
    const [categories, setCategories] = useState([]);
    // List of all products in inventory
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Tracks editing mode: null (idle), "new" (adding product), or string product ID (editing)
    const [editing, setEditing] = useState(null);
    // Local state representing the product add/edit form fields
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    
    // Tracks currently checked product IDs in the inventory table
    const [selectedIds, setSelectedIds] = useState([]);
    // Holds input string value for bulk discount (e.g. "20%")
    const [bulkDiscount, setBulkDiscount] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);

    // Compute products matching active search criteria and category filter
    const filteredProducts = useMemo(() => {
        let list = products;
        if (selectedCategory !== "all") {
            list = list.filter((p) => p.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    (p.color || "").toLowerCase().includes(q) ||
                    (p.fabric || "").toLowerCase().includes(q) ||
                    (p.specifications || "").toLowerCase().includes(q) ||
                    (p.tags || []).some((t) => t.toLowerCase().includes(q))
            );
        }
        return list;
    }, [products, selectedCategory, searchQuery]);

    // Loads both categories and products in parallel from backend APIs on mount
    const loadAll = async () => {
        setLoading(true);
        try {
            const [c, p] = await Promise.all([api.get("/categories"), api.get("/products")]);
            setCategories(c.data);
            setProducts(p.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    // Formats and opens the form to add a brand new product
    const startNew = () => {
        setForm(EMPTY);
        setEditing("new");
        setError("");
    };

    // Pre-populates the form with existing details of the selected product, extracting the discount tag if any
    const startEdit = (p) => {
        const discountTag = (p.tags || []).find((t) => t.toLowerCase().startsWith("discount:"));
        const discountVal = discountTag ? discountTag.substring(9).trim() : "";
        setForm({
            title: p.title || "",
            image_url: p.image_url || "",
            price: p.price ?? "",
            category: p.category || "shirts",
            tags: (p.tags || []).filter((t) => !t.toLowerCase().startsWith("discount:")),
            fabric: p.fabric || "",
            sizes: p.sizes || "",
            color: p.color || "",
            specifications: p.specifications || "",
            discount: discountVal,
        });
        setEditing(p.id);
        setError("");
    };

    // Resets form state and returns dashboard to idle mode
    const cancel = () => {
        setEditing(null);
        setForm(EMPTY);
        setError("");
    };

    // Appends or strips specific badges (New, Trending, etc.) to the local form tags
    const toggleTag = (t) => {
        setForm((f) =>
            f.tags.includes(t) ? { ...f, tags: f.tags.filter((x) => x !== t) } : { ...f, tags: [...f.tags, t] },
        );
    };

    // Uploads selected image file and updates form's image_url
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const { data } = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setForm(f => ({ ...f, image_url: data.url }));
            toast.success("Image uploaded to the realm");
        } catch (err) {
            const msg = formatApiError(err.response?.data?.detail) || err.message || "Something went wrong. Please try again.";
            toast.error("Upload failed: " + msg);
        } finally {
            setUploading(false);
        }
    };

    // Submits individual product additions or updates to the backend
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            let finalTags = (form.tags || []).filter(t => !t.toLowerCase().startsWith("discount:"));
            if (form.discount && form.discount.trim()) {
                finalTags.push("Discount: " + form.discount.trim());
            }
            const payload = { 
                ...form, 
                price: parseFloat(form.price) || 0,
                tags: finalTags
            };
            delete payload.discount;
            if (editing === "new") {
                const { data } = await api.post("/products", payload);
                setProducts((prev) => [data, ...prev]);
                toast.success("Artifact added to the realm");
            } else {
                const { data } = await api.put(`/products/${editing}`, payload);
                setProducts((prev) => prev.map((p) => (p.id === editing ? data : p)));
                toast.success("Artifact updated");
            }
            cancel();
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail) || err.message || "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Permanently removes a product from inventory
    const remove = async (id) => {
        if (!confirm("Delete this artifact from the realm?")) return;
        try {
                await api.delete(`/products/${id}`);
                setProducts((prev) => prev.filter((p) => p.id !== id));
                toast.success("Artifact removed");
        } catch (err) {
                toast.error(formatApiError(err.response?.data?.detail) || err.message || "Something went wrong. Please try again.");
            }
    };

// Calls the backend bulk action API to add/update a discount tag for all checked product IDs
const applyBulkDiscount = async () => {
    if (!bulkDiscount.trim()) {
        toast.error("Please enter a discount value");
        return;
    }
    setBulkLoading(true);
    try {
        await api.post("/products/bulk-discount", {
            product_ids: selectedIds,
            discount: bulkDiscount.trim(),
        });
        // Update tags list locally to reflect the new discount without triggering a full page refresh
        setProducts((prev) =>
            prev.map((p) => {
                if (selectedIds.includes(p.id)) {
                    const newTags = (p.tags || []).filter(
                        (t) => !t.toLowerCase().startsWith("discount:")
                    );
                    newTags.push("Discount: " + bulkDiscount.trim());
                    return { ...p, tags: newTags };
                }
                return p;
            })
        );
        toast.success(`Discount ${bulkDiscount.trim()} applied to ${selectedIds.length} artifacts`);
        setSelectedIds([]);
        setBulkDiscount("");
    } catch (err) {
        toast.error("Failed to apply bulk discount: " + (formatApiError(err.response?.data?.detail) || err.message));
    } finally {
        setBulkLoading(false);
    }
};

// Calls the backend bulk action API to remove all discount tags from the selected product IDs
const clearBulkDiscount = async () => {
    if (!confirm(`Remove all discount tags from ${selectedIds.length} selected artifacts?`)) return;
    setBulkLoading(true);
    try {
        await api.post("/products/bulk-discount", {
            product_ids: selectedIds,
            discount: "",
        });
        // Update local tags list to remove discount tags
        setProducts((prev) =>
            prev.map((p) => {
                if (selectedIds.includes(p.id)) {
                    const newTags = (p.tags || []).filter(
                        (t) => !t.toLowerCase().startsWith("discount:")
                    );
                    return { ...p, tags: newTags };
                }
                return p;
            })
        );
        toast.success(`Discount tags removed from ${selectedIds.length} artifacts`);
        setSelectedIds([]);
    } catch (err) {
        toast.error("Failed to remove bulk discount: " + (formatApiError(err.response?.data?.detail) || err.message));
    } finally {
        setBulkLoading(false);
    }
};

  const renderForm = (isMobileInline = false) => {
    return (
      <form
        onSubmit={save}
        data-testid="admin-product-form"
        className={`border border-[#d4af37]/30 bg-[#0a0a0a] p-3 space-y-3 ${
          isMobileInline ? "mt-2 mb-3 w-full" : "sticky top-[60px]"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">
            {editing === "new" ? "New Artifact" : "Edit Artifact"}
          </h2>
          <button
            type="button"
            onClick={cancel}
            className="text-white/50 hover:text-white"
            data-testid="admin-form-cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Field label="Title" testid="admin-input-title">
          <input
            required
            data-testid="admin-input-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="kgf-input"
          />
        </Field>
        <Field label="Image URL" testid="admin-input-image">
          <div className="flex gap-2 items-center mt-1">
            <input
              required
              type="text"
              placeholder="https://... or upload file"
              data-testid="admin-input-image"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="kgf-input flex-1"
            />
            <label className="shrink-0 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 text-[9px] tracking-[0.2em] uppercase px-2.5 py-1.5 text-white font-medium select-none">
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹)">
            <input
              required
              type="number"
              min="0"
              step="1"
              data-testid="admin-input-price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="kgf-input"
            />
          </Field>
          <Field label="Category">
            <select
              data-testid="admin-input-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="kgf-input bg-[#0a0a0a]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-[#0a0a0a]">
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Fabric">
          <input
            data-testid="admin-input-fabric"
            value={form.fabric}
            onChange={(e) => setForm({ ...form, fabric: e.target.value })}
            className="kgf-input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sizes">
            <input
              data-testid="admin-input-sizes"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="kgf-input"
            />
          </Field>
          <Field label="Color">
            <input
              data-testid="admin-input-color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="kgf-input"
            />
          </Field>
        </div>

        <Field label="Tags">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {["New", "Trending", "In-Store Only", "Not Available"].map((t) => (
              <button
                type="button"
                key={t}
                data-testid={`admin-tag-${t.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => toggleTag(t)}
                className={`text-[9px] tracking-[0.25em] uppercase px-2 py-1 border transition-colors ${
                  form.tags.includes(t)
                    ? "bg-[#d4af37] text-black border-[#d4af37] font-bold"
                    : "text-white/70 border-white/15 hover:border-white/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-2.5 flex gap-2 items-center">
            <span className="text-[9px] tracking-[0.2em] uppercase text-white/45 shrink-0">Discount:</span>
            <input
              type="text"
              placeholder="e.g. 20% or 30%"
              value={form.discount || ""}
              onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))}
              className="kgf-input py-1 text-[11px] flex-grow"
            />
          </div>
        </Field>

        <Field label="Specifications">
          <textarea
            rows={4}
            data-testid="admin-input-specifications"
            value={form.specifications}
            onChange={(e) =>
              setForm({ ...form, specifications: e.target.value })
            }
            className="w-full bg-transparent border border-white/15 focus:border-[#d4af37] outline-none p-2 text-[12px] text-white transition-colors"
          />
        </Field>

        {error && (
          <div
            data-testid="admin-form-error"
            className="text-[11px] text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-1.5"
          >
            {error}
          </div>
        )}

        <button
          disabled={saving}
          data-testid="admin-form-save"
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#d4af37] text-black px-3 py-2.5 text-[10px] tracking-[0.35em] uppercase font-bold hover:bg-[#e5c158] disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          Save
        </button>
      </form>
    );
  };

return (
    <div className="bg-[#050505] min-h-[calc(100vh-49px)]">
        <div className ="border-b border-white/10 px-3 py-3">
            <div className ="mx-auto max-w-[1400px] flex items-center justify-between">
                <div >
                <div className="text-[10px] tracking-[0.45em] uppercase text-[#d4af37]">
              Sovereign Control
            </div>
    <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
Admin · Inventory
            </h1>
          </div>
    <button
        data-testid="admin-add-btn"
onClick = { startNew }
className ="inline-flex items-center gap-1.5 bg-[#d4af37] text-black px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#e5c158] transition-colors"
    >
    <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add Artifact
          </button>
        </div>
      </div>

    <div className="mx-auto max-w-[1400px] px-3 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form (Desktop-only Sidebar) */}
        <div className="lg:col-span-1 order-2 lg:order-1 hidden lg:block">
          {editing ? (
            renderForm(false)
          ) : (
            <div className="border border-white/10 bg-[#0a0a0a] p-4 text-center sticky top-[60px]">
              <div className="text-[10px] tracking-[0.45em] uppercase text-white/40 mb-2">
                Idle
              </div>
              <div className="font-display text-base">
                Select an artifact to edit, or add a new one to the realm.
              </div>
            </div>
          )}
        </div>

        {/* Inventory Table */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="border border-white/10 bg-[#0a0a0a]">
            {/* Search and Filter Bar */}
            <div className="p-3 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.01]">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 focus:border-[#d4af37]/60 outline-none text-[12px] pl-8 pr-3 py-2 transition-colors text-white"
                />
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <span className="text-[9px] tracking-[0.2em] uppercase text-white/45 shrink-0">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#0d0d0d] border border-white/10 focus:border-[#d4af37]/60 outline-none text-[12px] px-3 py-2 text-white w-full sm:w-40"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>



            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="p-3 border-b border-[#d4af37]/35 bg-[#d4af37]/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="text-[11px] tracking-wider text-[#d4af37] font-semibold">
                  {selectedIds.length} {selectedIds.length === 1 ? "artifact" : "artifacts"} selected
                </div>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Discount e.g. 20%"
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.value)}
                    className="bg-[#0d0d0d] border border-[#d4af37]/30 focus:border-[#d4af37] outline-none text-[11px] px-2.5 py-1.5 text-white w-32 placeholder-white/30"
                  />
                  <button
                    onClick={applyBulkDiscount}
                    disabled={bulkLoading}
                    className="bg-[#d4af37] text-black text-[9px] tracking-[0.2em] uppercase font-bold px-3 py-2 hover:bg-[#e5c158] transition-colors disabled:opacity-55"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearBulkDiscount}
                    disabled={bulkLoading}
                    className="border border-white/10 hover:border-red-500 hover:text-red-400 text-white/70 text-[9px] tracking-[0.2em] uppercase font-bold px-3 py-2 transition-colors disabled:opacity-55"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Mobile-only Add Form at the top of the list */}
            {editing === "new" && (
              <div className="lg:hidden p-3 border-b border-[#d4af37]/30 bg-[#0a0a0a]">
                {renderForm(true)}
              </div>
            )}

            <div className="hidden sm:grid grid-cols-[30px_60px_1fr_90px_120px_70px] gap-2 px-3 py-2 border-b border-white/10 text-[9px] tracking-[0.3em] uppercase text-white/40">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredProducts.map(p => p.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  className="rounded border-white/20 accent-[#d4af37] w-3.5 h-3.5 cursor-pointer bg-transparent"
                />
              </div>
              <div>Image</div>
              <div>Title</div>
              <div>Price</div>
              <div>Category</div>
              <div className="text-right">Actions</div>
            </div>
            {loading ? (
              <div className="p-10 flex items-center justify-center text-white/40 text-[11px]">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
              </div>
            ) : products.length === 0 ? (
              <div className="p-10 text-center text-white/50 text-[12px]">
                No artifacts. Add your first one.
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-10 text-center text-white/40 text-[12px]">
                No items match your search/filter criteria.
              </div>
            ) : (
              <div data-testid="admin-inventory-table">
                {filteredProducts.map((p) => {
                  const discountInfo = calculateDiscount(p.price, p.tags);
                  return (
                  <div key={p.id} className="border-b border-white/5 last:border-0">
                    <div
                      data-testid={`admin-row- ${ p.id }`}
                      className="flex sm:grid sm:grid-cols-[30px_60px_1fr_90px_120px_70px] items-center gap-3 sm:gap-2 px-3 py-3 sm:py-2 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="shrink-0 flex items-center justify-start">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, p.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== p.id));
                            }
                          }}
                          className="rounded border-white/20 accent-[#d4af37] w-3.5 h-3.5 cursor-pointer bg-transparent"
                        />
                      </div>
                      <div className="w-12 h-14 bg-[#1a1a1a] overflow-hidden shrink-0">
                        <img
                          src={optimizeImageUrl(p.image_url, 100)}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 sm:contents">
                        <div className="min-w-0 sm:pr-2">
                          <div className="text-[13px] truncate font-medium text-white">{p.title}</div>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            <span className="sm:hidden text-[8px] tracking-[0.2em] uppercase text-white/50 bg-white/5 px-1 border border-white/10">
                              {p.category}
                            </span>
                            {(p.tags || []).map((t) => {
                              const isDiscount = t.toLowerCase().startsWith("discount:");
                              const displayName = isDiscount ? t.substring(9).trim() + " OFF" : t;
                              return (
                                <span
                                  key={t}
                                  className={`text-[8px] tracking-[0.2em] uppercase px-1 ${
                                    isDiscount
                                      ? "bg-[#d4af37] text-black font-bold border border-[#d4af37]"
                                      : "text-[#d4af37] border border-[#d4af37]/40"
                                  }`}
                                >
                                  {displayName}
                                </span>
                              );
                            })}
                          </div>
                          <div className="sm:hidden text-[#d4af37] text-[12px] font-bold font-display mt-1">
                            {discountInfo ? (
                              <div className="flex items-center gap-1.5">
                                <span>₹{Number(discountInfo.discountedPrice).toLocaleString("en-IN")}</span>
                                <span className="line-through text-white/40 text-[10px] font-body">₹{Number(p.price).toLocaleString("en-IN")}</span>
                              </div>
                            ) : (
                              <span>₹{Number(p.price).toLocaleString("en-IN")}</span>
                            )}
                          </div>
                        </div>
                        <div className="hidden sm:block text-[#d4af37] text-[13px] font-bold font-display">
                          {discountInfo ? (
                            <div className="flex flex-col">
                              <span>₹{Number(discountInfo.discountedPrice).toLocaleString("en-IN")}</span>
                              <span className="line-through text-white/40 text-[10px] font-body -mt-0.5">₹{Number(p.price).toLocaleString("en-IN")}</span>
                            </div>
                          ) : (
                            <span>₹{Number(p.price).toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        <div className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-white/60 truncate">
                          {p.category}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 shrink-0">
                        <button
                          data-testid={`admin-edit- ${ p.id }`}
                          onClick={() => startEdit(p)}
                          className="p-2 sm:p-1.5 border border-white/10 hover:border-[#d4af37] hover:text-[#d4af37] text-white/70 bg-white/[0.02] sm:bg-transparent"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-3 sm:w-3" strokeWidth={1.5} />
                        </button>
                        <button
                          data-testid={`admin-delete-${ p.id }`}
                          onClick={() => remove(p.id)}
                          className="p-2 sm:p-1.5 border border-white/10 hover:border-red-500 hover:text-red-400 text-white/70 bg-white/[0.02] sm:bg-transparent"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    {/* Mobile-only inline Edit form directly under the edited row */}
                    {editing === p.id && (
                      <div className="lg:hidden p-3 border-t border-[#d4af37]/20 bg-[#0a0a0a]/40">
                        {renderForm(true)}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[9px] tracking-[0.4em] uppercase text-white/45">
        {label}
      </label>
      {children}
    </div>
  );
}

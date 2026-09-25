import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductDetailSheet, { STORE_ADDRESS } from "@/components/ProductDetailSheet";
import { MapPin, Phone, Search, Loader2 } from "lucide-react";

export default function Catalog() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [c, p] = await Promise.all([
                    api.get("/categories"),
          api.get("/products"),
        ]);
                setCategories(c.data);
                setProducts(p.data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Filters products dynamically based on category selection and search query match in title, color, or specs
    const filtered = useMemo(() => {
        let list = products;
        if (active !== "all") list = list.filter((p) => p.category === active);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    (p.color || "").toLowerCase().includes(q) ||
                    (p.specifications || "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [products, active, query]);

    // Opens the detailed modal sheet for the clicked product card
    const onOpen = (product) => {
        setSelected(product);
        setOpen(true);
    };

    // Label for the active filter section display title
    const catLabel =
        active === "all"
            ? "All Realms"
            : categories.find((c) => c.slug === active)?.name || active;

    return (
        <div className="bg-[#050505] min-h-[calc(100vh-49px)]">
    {/* Compact banner */ }
    <div className="border-b border-white/8 px-3 py-3">
        <div className ="mx-auto max-w-[1400px] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div >
            <div className="text-[10px] tracking-[0.45em] uppercase text-[#d4af37]">
              The KGF Catalog
            </div>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
    { catLabel }
            </h1>
          </div>
        <div className="flex items-center gap-2 sm:max-w-xs w-full">
            <div className ="relative flex-1">
                <Search className ="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                    <input
    data-testid="catalog-search-input"
    value = { query }
    onChange = {(e) => setQuery(e.target.value)
}
placeholder ="Search the realm…"
className ="w-full bg-[#0d0d0d] border border-white/10 focus:border-[#d4af37]/60 outline-none text-[12px] pl-7 pr-2 py-2 transition-colors"
    />
            </div>
          </div>
        </div>
      </div>

    {/* Category strip */ }
    <div className ="border-b border-white/8 px-3">
        <div className ="mx-auto max-w-[1400px] overflow-x-auto no-scrollbar">
            <div className ="flex gap-1.5 py-2 min-w-max">
                <CatChip
testid ="cat-all"
label ="All"
sub ="Every Realm"
active = { active === "all"}
onClick = {() => setActive("all")}
    />
{
    categories.map((c) => (
        <CatChip
            key={c.slug}
            testid={`cat-${c.slug}`}
            label={c.name}
            sub={c.subtitle}
            active={active === c.slug}
            onClick={() => setActive(c.slug)}
        />
    ))
}
          </div>
        </div>
      </div>

    {/* Grid */ }
    <div className ="mx-auto max-w-[1400px] px-3 py-4">
        {
        loading?(
          <div className ="flex items-center justify-center py-20 text-white/50 text-[11px] tracking-[0.3em] uppercase">
            <Loader2 className ="h-4 w-4 animate-spin mr-2" /> Loading the realm…
          </div>
        ) : filtered.length === 0 ? (
    <div
        data-testid="catalog-empty"
className ="text-center text-white/50 py-20 text-[12px] tracking-[0.2em] uppercase"
    >
    No artifacts found in this realm.
          </div>
        ) : (
    <motion.div
        data-testid="catalog-grid"
layout
className ="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3"
    >
{
    filtered.map((p) => (
        <ProductCard key={p.id} product={p} onClick={onOpen} />
    ))
}
          </motion.div>
        )}
      </div>

    {/* Store address strip */ }
    <div className ="border-t border-white/10 px-3 py-4 mt-2">
        <div className ="mx-auto max-w-[1400px] border border-[#d4af37]/40 bg-[#0a0a0a] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className ="flex items-start gap-2">
                <MapPin className ="h-4 w-4 text-[#d4af37] mt-0.5" strokeWidth={1.5} />
                    <div >
                    <div className="text-[10px] tracking-[0.4em] uppercase text-[#d4af37]">
                Visit the Store
              </div>
    <div className="text-[12px] text-white/85">
{ STORE_ADDRESS.name } — { STORE_ADDRESS.line1 }, { STORE_ADDRESS.line2 }
              </div>
            </div>
          </div>
    <a
        href={`tel:${STORE_ADDRESS.phone}`}
        className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.3em] uppercase text-white border border-white/15 hover:border-[#d4af37] hover:text-[#d4af37] px-3 py-1.5 transition-colors"
data-testid="catalog-store-call"
    >
    <Phone className="h-3 w-3" strokeWidth={1.5} /> {STORE_ADDRESS.phone}
          </a>
        </div>
      </div>

    <ProductDetailSheet product={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}

// CatChip displays a clickable category filter button showing name and a brief subtitle description
function CatChip({ label, sub, active, onClick, testid }) {
    return (
        <button
            data-testid={testid}
            onClick={onClick}
            className={`relative shrink-0 px-3 py-2 border text-left transition-colors ${active
                    ? "border-[#d4af37] bg-[#d4af37]/8"
                    : "border-white/10 hover:border-white/30 bg-transparent"
            }`}
        >
            <div
                className={`text-[12px] font-medium tracking-tight ${
                    active ? "text-[#d4af37]" : "text-white"
                }`}
            >
                {label}
            </div>
            <div className="text-[8px] tracking-[0.35em] uppercase text-white/40">{sub}</div>
        </button>
    );
}

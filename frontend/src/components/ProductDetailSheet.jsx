import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MapPin, Phone, Clock } from "lucide-react";
import { optimizeImageUrl, getTagStyles, calculateDiscount } from "@/lib/utils";

// Static details of the physical storefront to render on the product details page
export const STORE_ADDRESS = {
  name: "KGF — Kings Get Fashion",
  line1: "Above Powerhouse Gym, Mata Ka Than",
  line2: "Rawat Nagar, Jodhpur, Rajasthan 342001",
  phone: "+91 xxxxx xxxxx",
  hours: "Mon — Sun · 7:00 AM — 11:00 PM",
};

/**
 * ProductDetailSheet renders a sliding overlay on the right of the screen
 * displaying high resolution image, active highlights, sizing/fabric specs, and store directions.
 */
export default function ProductDetailSheet({ product, open, onOpenChange }) {
    if (!product) return null;
    const discountInfo = calculateDiscount(product.price, product.tags);

    return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="product-detail-sheet"
        side="right"
        className="w-full sm:max-w-md bg-[#0a0a0a] border-l border-[#d4af37]/30 text-white p-0 overflow-y-auto"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{product.title}</SheetTitle>
        </SheetHeader>

        <div className="relative aspect-[4/5] w-full bg-[#111]">
        <img
          src={optimizeImageUrl(product.image_url, 600)}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className ="absolute bottom-0 left-0 right-0 p-3">
            {/* If product contains tags, map over and render them. Maps "Discount: X%" to "X% OFF" */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-1.5 mb-2">
                {product.tags.map((t) => {
                  const isDiscount = t.toLowerCase().startsWith("discount:");
                  const displayName = isDiscount ? t.substring(9).trim() + " OFF" : t;
                  return (
                    <span
                      key={t}
                      className={`text-[9px] tracking-[0.25em] uppercase font-bold px-1.5 py-0.5 ${getTagStyles(t)}`}
                    >
                      {displayName}
                    </span>
                  );
                })}
              </div>
            )}
    <h2
        data-testid="product-detail-title"
    className ="font-display text-2xl leading-tight tracking-tight"
        >
        { product.title }
            </h2>
        <div className="mt-1 flex items-baseline gap-2.5 flex-wrap">
          {discountInfo ? (
            <>
              <span
                data-testid="product-detail-price"
                className="font-display text-2xl text-[#d4af37] font-bold"
              >
                ₹{Number(discountInfo.discountedPrice).toLocaleString("en-IN")}
              </span>
              <span className="font-display text-lg line-through text-white/40">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-rose-300 bg-rose-950/70 border border-rose-500/35 px-1.5 py-0.5">
                {discountInfo.percent} OFF
              </span>
            </>
          ) : (
            <span
              data-testid="product-detail-price"
              className="font-display text-2xl text-[#d4af37] font-bold"
            >
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          )}
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
            {product.category}
          </span>
        </div>
          </div>
        </div>

            <div className="p-4 space-y-4">
          {/* Specs */ }
            <div className ="space-y-2">
        <h3 className ="text-[10px] tracking-[0.4em] uppercase text-white/40">
              Specifications
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
        <SpecRow label ="Fabric" value={product.fabric} />
        <SpecRow label ="Sizes" value={product.sizes} />
        <SpecRow label ="Color" value={product.color} />
            </div>
            {
                product.specifications && (
                    <p
                        data-testid="product-detail-specifications"
                className ="text-[13px] leading-relaxed text-white/70 mt-2 font-body"
              >
                    { product.specifications }
              </p>
            )
    }
          </div>

        <div className="kgf-divider" />

    {/* Come to Store */ }
    <div
        data-testid="product-detail-store-card"
    className ="relative border border-[#d4af37] bg-[#0f0f0f] p-3.5"
        >
        <div className="absolute -top-2 left-3 bg-[#0a0a0a] px-2">
            <span className ="text-[9px] tracking-[0.4em] uppercase text-[#d4af37]">
                Available Exclusively In-Store
              </span>
            </div>
        <p className="font-display italic text-lg mt-1 text-white/95">
              Want to make it yours ? <span className="text-[#d4af37]">Visit the Store.</span>
            </p>

        <div className="mt-3 space-y-1.5">
            <div className ="flex items-start gap-2">
                <MapPin className ="h-3.5 w-3.5 text-[#d4af37] mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div >
                    <div className="text-[13px] font-medium">{STORE_ADDRESS.name}</div>
                        <div className ="text-[11px] text-white/60">{STORE_ADDRESS.line1}</div>
                            <div className ="text-[11px] text-white/60">{STORE_ADDRESS.line2}</div>
                </div>
              </div>
        <div className="flex items-center gap-2">
            <Phone className ="h-3.5 w-3.5 text-[#d4af37] shrink-0" strokeWidth={1.5} />
                <a
    href = {`tel:${STORE_ADDRESS.phone}`
}
data-testid="product-detail-phone"
className ="text-[12px] text-white/85 hover:text-[#d4af37] tracking-wide"
    >
    { STORE_ADDRESS.phone }
                </a>
              </div>
    <div className="flex items-center gap-2">
        <Clock className ="h-3.5 w-3.5 text-[#d4af37] shrink-0" strokeWidth={1.5} />
            <span className ="text-[11px] text-white/60">{STORE_ADDRESS.hours}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SpecRow({ label, value }) {
    return (
        <div className="border border-white/8 p-2">
            <div className ="text-[9px] tracking-[0.3em] uppercase text-white/40">{label}</div>
                <div className ="text-[12px] text-white mt-0.5">{value || "—"}</div>
    </div>
  );
}

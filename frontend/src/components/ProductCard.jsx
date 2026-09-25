import { motion } from "framer-motion";
import { optimizeImageUrl, getTagStyles, calculateDiscount } from "@/lib/utils";

export default function ProductCard({ product, onClick }) {
    const discountInfo = calculateDiscount(product.price, product.tags);

    return (
        <motion.button
            data-testid={`product-card-${product.id}`}
            onClick={() => onClick(product)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4, ease: "easeOut" }}
      className ="product-card group relative text-left bg-[#0d0d0d] border border-white/8 hover:border-[#d4af37]/40 transition-colors overflow-hidden"
    >
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
                    <img
          src={optimizeImageUrl(product.image_url, 400)}
          alt={product.title}
            loading="lazy"
    className ="product-image w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
    {
        product.tags && product.tags.length > 0 && (
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
        {
            product.tags.map((t) => {
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
            })
        }
          </div>
        )
    }
      </div>
        <div className="p-2 flex items-center justify-between gap-2 border-t border-white/5">
            <div className ="min-w-0">
                <h3 className ="text-[13px] font-medium text-white truncate font-body">
    { product.title }
          </h3>
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 truncate">
    { product.category }
          </p>
        </div>
        <div className="text-right whitespace-nowrap">
          {discountInfo ? (
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-bold text-[#d4af37] font-display">
                ₹{Number(discountInfo.discountedPrice).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] line-through text-white/40 font-body -mt-0.5">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            </div>
          ) : (
            <div className="text-[13px] font-bold text-[#d4af37] font-display">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
    
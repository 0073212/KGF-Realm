import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function optimizeImageUrl(url, width = 600) {
  if (!url) return "";
  
  if (url.startsWith("/")) return url;
  
  try {
    if (url.includes("images.unsplash.com")) {
      if (!url.includes("w=")) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}auto=format&fit=crop&w=${width}&q=80`;
      }
    } else if (url.includes("images.pexels.com")) {
      if (!url.includes("w=")) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}`;
      }
    }
  } catch (e) {
    console.error("Error optimizing image URL:", e);
  }
  return url;
}

export function getTagStyles(tag) {
  const t = tag.toLowerCase();
  if (t.startsWith("discount:")) {
    return "bg-rose-950/70 text-rose-300 border border-rose-500/35";
  }
  if (t === "trending") {
    return "bg-[#d4af37] text-black border border-[#d4af37]";
  }
  if (t === "new") {
    return "bg-emerald-950/70 text-emerald-300 border border-emerald-500/35";
  }
  if (t === "not available") {
    return "bg-red-950/70 text-red-300 border border-red-500/35";
  }
  // Default (e.g. In-Store Only, or any other tag)
  return "bg-black/80 text-[#d4af37] border border-[#d4af37]/40";
}

export function calculateDiscount(price, tags = []) {
  if (!price || !tags || !Array.isArray(tags)) return null;
  const discountTag = tags.find((t) => t && t.toLowerCase().startsWith("discount:"));
  if (!discountTag) return null;

  const raw = discountTag.substring(9).trim().replace(/off/i, "").trim();
  const numMatch = raw.match(/(\d+(\.\d+)?)/);
  if (!numMatch) return null;

  const num = parseFloat(numMatch[1]);
  if (isNaN(num) || num <= 0) return null;

  let discountedPrice;
  if (raw.includes("%") || num <= 99) {
    discountedPrice = Math.round(price * (1 - num / 100));
  } else {
    discountedPrice = Math.max(0, Math.round(price - num));
  }

  if (discountedPrice >= price) return null;

  return {
    originalPrice: price,
    discountedPrice: discountedPrice,
    percent: raw.includes("%") ? `${num}%` : `${num}%`,
  };
}

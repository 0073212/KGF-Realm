import { Crown } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#050505] py-8 px-4 mt-auto">
      <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3 w-3 text-[#d4af37]" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white">
              KGF REALM
            </span>
          </div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 text-center md:text-left mt-1">
            © {new Date().getFullYear()} KGF. All Rights Reserved.
          </p>
        </div>

        {/* Center/Right Side: Hallmark */}
        <div className="flex items-center gap-2 border border-white/5 bg-white/[0.01] px-4 py-2 hover:border-[#d4af37]/20 transition-colors duration-300">
          <div className="text-[9px] tracking-[0.25em] uppercase text-white/45">
            Hallmark ·
          </div>
          <div className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase">
            <span className="text-white/60">Crafted by</span>
            <span className="metallic-gold font-bold tracking-[0.4em] drop-shadow-sm">
              Yash Goyal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Landing() {
    const [phase, setPhase] = useState(0); // 0: KGF, 1: expand to full name
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 1400);
        return () => clearTimeout(t1);
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-49px)] w-full bg-[#050505] text-white overflow-x-hidden grain">
    {/* Background image */ }
    <div
        className="absolute inset-0 opacity-30"
    style = {{
        backgroundImage:
        "url('https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?auto=format&fit=crop&w=1200&q=75')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "grayscale(40%) contrast(1.1)",
    }
}
      />
    <div className ="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

{/* Subtle gold corner accents */ }
<div className="absolute top-3 left-3 w-12 h-12 border-l border-t border-[#d4af37]/40" />
    <div className ="absolute top-3 right-3 w-12 h-12 border-r border-t border-[#d4af37]/40" />
        <div className ="absolute bottom-3 left-3 w-12 h-12 border-l border-b border-[#d4af37]/40" />
            <div className ="absolute bottom-3 right-3 w-12 h-12 border-r border-b border-[#d4af37]/40" />

                <div className ="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-49px)] px-4 py-12">
                    <motion.div
initial = {{ opacity: 0, y: -8 }}
animate = {{ opacity: 1, y: 0 }}
transition = {{ duration: 0.6, delay: 0.2 }}
className ="flex items-center gap-2 mb-4"
    >
    <Crown className="h-3 w-3 text-[#d4af37]" strokeWidth={1.5} />
        <span className ="text-[10px] tracking-[0.5em] uppercase text-white/60">
Est. — A Realm of Style
          </span>
    <Crown className="h-3 w-3 text-[#d4af37]" strokeWidth={1.5} />
        </motion.div>

    <div className="relative flex flex-col items-center" data-testid="hero-brand-reveal">
        <AnimatePresence mode ="wait">
{
    phase === 0 ? (
        <motion.div
            key="kgf"
    initial = {{
        opacity: 0, scale: 0.7, letterSpacing: "0.4em" }}
        animate = {{
            opacity: 1, scale: 1, letterSpacing: "0em" }}
            exit = {{
                opacity: 0, scale: 1.4, letterSpacing: "0.6em", filter: "blur(8px)" }}
                transition = {{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }
            }
            className ="font-display metallic-gold text-[22vw] sm:text-[18vw] md:text-[14vw] leading-none font-black"
                >
                KGF
              </motion.div>
            ) : (
                <motion.div
                    key="full"
            initial = {{ opacity: 0, y: 20 }
        }
        animate = {{ opacity: 1, y: 0 }
    }
    transition = {{
        duration: 0.8, ease: "easeOut" }}
        className ="text-center"
            >
            <div className="flex items-center justify-center gap-3 sm:gap-5">
                <motion.span
        initial = {{ x: 30, opacity: 0 }
    }
    animate = {{ x: 0, opacity: 1 }
}
transition = {{ delay: 0.05, duration: 0.6 }}
className ="font-display metallic-gold text-5xl sm:text-7xl md:text-8xl font-black leading-none"
    >
    Kings
                  </motion.span>
    <motion.span
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-display italic text-3xl sm:text-5xl md:text-6xl text-white/85 font-light leading-none"
            >
            Get
                  </motion.span>
    <motion.span
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="font-display metallic-gold text-5xl sm:text-7xl md:text-8xl font-black leading-none"
            >
            Fashion
                  </motion.span>
                </div>

    <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-4 max-w-xl mx-auto text-[13px] sm:text-sm text-white/65 leading-relaxed"
            >
            A meticulously curated realm of menswear — armor for the modern monarch.
                  Crafted fabrics, sovereign accessories, and chronographs reserved for the
                  bold.
                </motion.p>

    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
            <Link
                to={user ? (user.role === "admin" ? "/admin" : "/catalog") : "/auth?mode=register"}
                state={{ mode: "register" }}
                data-testid="hero-cta-explore"
                className="group inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#e5c158] text-black px-6 py-3 text-[11px] tracking-[0.35em] uppercase font-bold glow-gold transition-all"
            >
                Explore the Realm
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
            <Link
                to={user ? (user.role === "admin" ? "/admin" : "/catalog") : "/auth?mode=login"}
                state={{ mode: "login" }}
                data-testid="hero-cta-preview"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-[#d4af37]/60 text-white/80 hover:text-white px-6 py-3 text-[11px] tracking-[0.35em] uppercase transition-colors"
            >
                Preview Realms
            </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

    {/* Pillars strip */ }
    <motion.div
initial = {{ opacity: 0 }}
animate = {{ opacity: phase === 1 ? 1 : 0 }}
transition = {{ delay: 1.5, duration: 0.8 }}
id ="categories"
className ="mt-10 w-full max-w-4xl border-t border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10"
    >
{
    [
    {
        t: "The Armor", s: "Shirts & Tees" },
            {
                t: "The Foundation", s: "Shoes & Sneakers" },
            {
                        t: "Chronographs", s: "Watches" },
            {
                            t: "The Statement", s: "Jackets" },
          ].map((p, i) => (
                                <div
                                    key={i}
                                    className="bg-[#050505] px-3 py-3 flex items-center justify-between"
                            >
              <div>
                <div className="font-display text-sm text-white">{p.t}</div>
                <div className="text-[9px] tracking-[0.35em] uppercase text-white/40">
                  { p.s }
                </div>
              </div>
                                <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" strokeWidth={1.5} />
            </div>
          ))
                        }
        </motion.div>
      </div>
    </div>
  );
    }

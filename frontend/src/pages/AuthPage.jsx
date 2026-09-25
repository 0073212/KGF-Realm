import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
// formatApiError handles unpacking server responses nicely for user feedback
import { formatApiError } from "@/lib/api";
import { Crown, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    
    // Default mode is detected from URL query string or previous router state
    const initialMode = location.state?.mode || searchParams.get("mode") || "login";

    const [mode, setMode] = useState(initialMode); // login | register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Retrieve auth handlers from the global AuthProvider context
    const { user, login, register } = useAuth();
    const navigate = useNavigate();
    
    // Redirect origin path after successful login
    const from = location.state?.from || "/catalog";

    // Synchronize current registration/login tabs when user switches them via query routes
    useEffect(() => {
        const routeMode = location.state?.mode || new URLSearchParams(location.search).get("mode");
        if (routeMode === "login" || routeMode === "register") {
            setMode(routeMode);
        }
    }, [location]);

    // Automatically redirect authenticated users away from the auth page
    useEffect(() => {
        if (user) {
            navigate(user.role === "admin" ? "/admin" : from, { replace: true });
        }
    }, [user, navigate, from]);

    // Handles register or login form submissions
    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "login") {
                const data = await login(email, password);
                toast.success(`Welcome to the Realm, ${data.name || data.email}`);
                navigate(data.role === "admin" ? "/admin" : from, { replace: true });
            } else if (mode === "register") {
                const data = await register(email, password, name);
                toast.success(`Welcome to the Realm, ${data.name || data.email}`);
                navigate(data.role === "admin" ? "/admin" : from, { replace: true });
            }
        } catch (err) {
            const msg = formatApiError(err.response?.data?.detail) || err.message || "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-49px)] flex items-center justify-center bg-[#050505] px-3 py-8 overflow-hidden">
            <div
    className ="absolute inset-0 opacity-25"
    style = {{
        backgroundImage:
        "url('https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?auto=format&fit=crop&w=1200&q=75')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "grayscale(60%) blur(2px)",
    }
}
      />
    <div className ="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />

        <motion.div
initial = {{ opacity: 0, y: 12 }}
animate = {{ opacity: 1, y: 0 }}
transition = {{
    duration: 0.5, ease: "easeOut" }}
    className ="relative glass w-full max-w-sm p-6 sm:p-7"
    data-testid="auth-card"
        >
        <div className="flex flex-col items-center mb-5">
            <Crown className ="h-4 w-4 text-[#d4af37]" strokeWidth={1.5} />
                <h1 className ="font-display metallic-gold text-3xl mt-1 font-bold tracking-tight">
    KGF
          </h1>
        <span className="text-[9px] tracking-[0.45em] uppercase text-white/55 mt-1">
          {mode === "login" ? "Enter the Realm" : "Claim Your Crown"}
        </span>
      </div>

      {(mode === "login" || mode === "register") && (
        <div className="flex gap-1 bg-white/5 p-0.5 mb-5">
          <button
            data-testid="auth-tab-login"
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 text-[10px] tracking-[0.3em] uppercase py-1.5 transition-colors ${
              mode === "login"
                ? "bg-[#d4af37] text-black font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            data-testid="auth-tab-register"
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 text-[10px] tracking-[0.3em] uppercase py-1.5 transition-colors ${
              mode === "register"
                ? "bg-[#d4af37] text-black font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-[9px] tracking-[0.4em] uppercase text-white/45">
              Name
            </label>
            <input
              data-testid="auth-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="kgf-input"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="text-[9px] tracking-[0.4em] uppercase text-white/45">
            Email
          </label>
          <input
            data-testid="auth-input-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="kgf-input"
            placeholder="you@kingdom.com"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="text-[9px] tracking-[0.4em] uppercase text-white/45">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              data-testid="auth-input-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="kgf-input pr-10"
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#d4af37] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            data-testid="auth-error"
            className="text-[11px] text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-1.5"
          >
            {error}
          </div>
        )}

        <button
          data-testid="auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4af37] hover:bg-[#e5c158] disabled:opacity-60 text-black font-bold py-2.5 text-[11px] tracking-[0.35em] uppercase glow-gold transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {mode === "login" ? "Enter" : "Create Account"}
        </button>
      </form>
      </motion.div>
    </div>
  );
}

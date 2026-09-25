import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Crown, LogOut, ShieldCheck } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const onLogout = async () => {
        await logout();
        navigate("/");
  };

    return (
        <header
            data-testid="kgf-navbar"
    className ="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl"
        >
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-3 py-2.5">
            <Link
    to = {
        user?"/catalog" : "/"}
          data-testid="navbar-brand"
          className ="flex items-center gap-2 group"
        >
            <Crown className="h-4 w-4 text-[#d4af37]" strokeWidth={1.5} />
            <span className ="font-display text-base tracking-tight metallic-gold">
            KGF
          </span>
        <span className="text-[10px] tracking-[0.35em] uppercase text-white/60 hidden sm:inline">
            Kings Get Fashion
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Render admin link only for admin users and when not currently viewing the dashboard */}
          {user && user.role === "admin" && location.pathname !== "/admin" && (
            <Link
              to="/admin"
              data-testid="navbar-admin-link"
              className="text-[10px] tracking-[0.3em] uppercase border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-2.5 py-1.5 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3 w-3" strokeWidth={1.5} /> Admin
            </Link>
          )}

          {/* Render logged-in user's email on wider viewports */}
          {user && (
            <span
              data-testid="navbar-user-email"
              className="hidden sm:inline text-[11px] text-white/50"
            >
              {user.email}
            </span>
          )}

          {/* Toggle between Logout button and Login link based on auth status */}
          {user ? (
            <button
              data-testid="navbar-logout-btn"
              onClick={onLogout}
              className="text-[10px] tracking-[0.3em] uppercase border border-white/15 hover:border-white/40 text-white/80 hover:text-white px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="h-3 w-3" strokeWidth={1.5} /> Logout
            </button>
          ) : (
            <Link
              to="/auth"
              data-testid="navbar-login-link"
              className="text-[10px] tracking-[0.3em] uppercase bg-[#d4af37] text-black hover:bg-[#e5c158] px-3 py-1.5 transition-colors"
            >
              Enter
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

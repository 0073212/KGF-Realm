import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user } = useAuth();
    const location = useLocation();

    if (user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div
        data-testid="auth-loading"
        className ="text-[10px] tracking-[0.4em] uppercase text-white/40"
            >
            Loading the Realm…
        </div>
      </div>
    );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }

    if (adminOnly && user.role !== "admin") {
    return <Navigate to="/catalog" replace />;
}

return children;
}

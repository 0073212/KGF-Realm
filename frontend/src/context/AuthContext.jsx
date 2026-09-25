import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // null = checking, false = unauthenticated, object = user
    const [user, setUser] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
      setUser(data);
        } catch {
            setUser(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
    if (data.token) localStorage.setItem("kgf_token", data.token);
    setUser({ id: data.id, email: data.email, name: data.name, role: data.role });
        return data;
    };

    const register = async (email, password, name) => {
        const { data } = await api.post("/auth/register", { email, password, name });
        if (data.token) localStorage.setItem("kgf_token", data.token);
        setUser({ id: data.id, email: data.email, name: data.name, role: data.role });
        return data;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
    } catch {
            // ignore
        }
        localStorage.removeItem("kgf_token");
    setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

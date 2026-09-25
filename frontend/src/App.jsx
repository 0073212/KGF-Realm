import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import Catalog from "@/pages/Catalog";
import Admin from "@/pages/Admin";

function App() {
    return (
        <div className="App font-body min-h-screen flex flex-col bg-[#050505] text-white">
            <BrowserRouter >
            <AuthProvider>
                <div className="flex flex-col min-h-screen w-full">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route
                                path="/catalog"
                                element={
                                    <ProtectedRoute>
                                        <Catalog />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <Admin />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
                <Toaster theme="dark" position="top-right" richColors closeButton />
            </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

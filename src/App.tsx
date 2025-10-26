// 1. Asegúrate de que 'useEffect' esté importado aquí arriba
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { CartDrawer } from "@/components/CartDrawer";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
// (Ya no hay código duplicado aquí)

const queryClient = new QueryClient();

// 2. Cambiamos tu 'const App = () => (' por 'const App = () => {'
//    Esto nos permite añadir lógica ANTES del 'return'.
const App = () => {

  // 3. PEGAMOS EL CÓDIGO 'useEffect' AQUÍ
  useEffect(() => {
    // Intenta ocultar el logo de inmediato
    const badge = document.getElementById('lovable-badge');
    if (badge) {
      badge.style.display = 'none';
    }

    // Si el logo tarda en aparecer, lo volvemos a intentar
    // después de un segundo. Es más robusto.
    const timer = setTimeout(() => {
      const badgeAfterTimer = document.getElementById('lovable-badge');
      if (badgeAfterTimer) {
        badgeAfterTimer.style.display = 'none';
      }
    }, 1000); // 1000 ms = 1 segundo

    // Limpia el timer
    return () => clearTimeout(timer);
    
  }, []); // El array vacío [] hace que se ejecute solo una vez

  // 4. Añadimos 'return' para devolver tu aplicación
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}; // <-- Se cierra el { de la función

export default App;


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
import React, { useEffect } from 'react';

function App() {

  useEffect(() => {
    // Se ejecuta después de que el componente se renderiza
    const badge = document.getElementById('lovable-badge');
    
    if (badge) {
      // Si encuentra el logo, lo oculta
      badge.style.display = 'none';
    }
  }, []); // El array vacío [] hace que este efecto se ejecute solo una vez

  // ...resto de tu componente
  return (
    <div className="App">
      {/* ...el contenido de tu app */}
    </div>
  );
}

export default App;
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
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

export default App;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Clock } from "lucide-react";
import Header from "@/components/Header";
const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  useEffect(() => {
    // If no order ID, redirect to home
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);
  if (!orderId) {
    return null;
  }
  return <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                ¡Pedido Enviado Exitosamente!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Código de tu pedido:</p>
                <p className="text-xl font-bold text-pink-600 font-mono">
                  #{orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-pink-500" />
                  <span>Tu pedido ha sido enviado por WhatsApp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-pink-500" />
                  <span>Nuestro equipo se pondrá en contacto contigo pronto</span>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-800 mb-2">¿Qué sigue?</h3>
                <p className="text-sm text-pink-700">
                  Hemos enviado los detalles de tu pedido por WhatsApp. Nuestro equipo 
                  revisará tu solicitud y se comunicará contigo para confirmar los detalles 
                  y coordinar la entrega.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => navigate("/")} className="w-full bg-pink-500 hover:bg-pink-600">
                  Continuar Comprando
                </Button>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default ThankYou;
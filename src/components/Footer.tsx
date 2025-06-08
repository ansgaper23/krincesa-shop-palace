
import { useStoreConfig } from "@/hooks/useProducts";
import { Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";

const Footer = () => {
  const { data: storeConfig } = useStoreConfig();

  const handleWhatsAppClick = () => {
    const whatsappNumber = storeConfig?.whatsapp_number || "+51999999999";
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const message = encodeURIComponent("¡Hola! Necesito ayuda con mi pedido.");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-400">{storeConfig?.store_name || 'Krincesa Distribuidora'}</h3>
            <p className="text-gray-300 text-sm mb-4">
              {storeConfig?.site_description || 'Tu tienda de confianza para productos de belleza y accesorios.'}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-400">Contacto</h3>
            <div className="space-y-3">
              {storeConfig?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-pink-400" />
                  <a href={`mailto:${storeConfig.email}`} className="text-gray-300 hover:text-pink-300 text-sm">
                    {storeConfig.email}
                  </a>
                </div>
              )}
              
              {storeConfig?.whatsapp_number && (
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-4 w-4 text-pink-400" />
                  <button 
                    onClick={handleWhatsAppClick}
                    className="text-gray-300 hover:text-pink-300 text-sm"
                  >
                    {storeConfig.whatsapp_number}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-400">Síguenos</h3>
            <div className="flex space-x-4">
              {storeConfig?.facebook_url && (
                <a 
                  href={storeConfig.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-300 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              
              {storeConfig?.instagram_url && (
                <a 
                  href={storeConfig.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-300 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              
              {storeConfig?.whatsapp_number && (
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-gray-300 hover:text-pink-300 transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-pink-500/30 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 {storeConfig?.store_name || 'Krincesa Distribuidora'}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

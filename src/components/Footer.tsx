
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
    <footer className="bg-gradient-to-r from-pink-50 to-white border-t border-pink-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-600">{storeConfig?.store_name || 'Krincesa Distribuidora'}</h3>
            <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">
              {storeConfig?.site_description || 'Tu tienda de confianza para productos de belleza y accesorios en todo el Perú.'}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-600">Contacto</h3>
            <div className="space-y-3">
              {storeConfig?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-pink-500" />
                  <a href={`mailto:${storeConfig.email}`} className="text-gray-600 hover:text-pink-500 text-sm">
                    {storeConfig.email}
                  </a>
                </div>
              )}
              
              {storeConfig?.whatsapp_number && (
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-4 w-4 text-pink-500" />
                  <button 
                    onClick={handleWhatsAppClick}
                    className="text-gray-600 hover:text-pink-500 text-sm"
                  >
                    {storeConfig.whatsapp_number}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-600">Síguenos</h3>
            <div className="flex space-x-4">
              {storeConfig?.facebook_url && (
                <a 
                  href={storeConfig.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                  aria-label="Síguenos en Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              
              {storeConfig?.instagram_url && (
                <a 
                  href={storeConfig.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                  aria-label="Síguenos en Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              
              {storeConfig?.tiktok_url && (
                <a 
                  href={storeConfig.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                  aria-label="Síguenos en TikTok"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              
              {storeConfig?.whatsapp_number && (
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                  aria-label="Contáctanos por WhatsApp"
                >
                  <MessageCircle className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-pink-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 {storeConfig?.store_name || 'Krincesa Distribuidora'}. Todos los derechos reservados. Distribuidora nacional en Perú.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

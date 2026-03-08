
import { useStoreConfig } from "@/hooks/useProducts";
import { Facebook, Instagram, Mail } from "lucide-react";

const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);


const Footer = () => {
  const { data: storeConfig } = useStoreConfig();

  const handleWhatsAppClick = () => {
    const whatsappNumber = storeConfig?.whatsapp_number || "+51999999999";
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const message = encodeURIComponent("¡Hola! Necesito ayuda con mi pedido.");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--theme-footer-bg)', borderTopColor: 'var(--theme-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-primary)' }}>{storeConfig?.store_name || 'Krincesa Distribuidora'}</h3>
            <p className="text-sm mb-4 whitespace-pre-line" style={{ color: 'var(--theme-footer-text)' }}>
              {storeConfig?.site_description || 'Tu tienda de confianza para productos de belleza y accesorios en todo el Perú.'}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-primary)' }}>Contacto</h3>
            <div className="space-y-3">
              {storeConfig?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                  <a href={`mailto:${storeConfig.email}`} className="hover:opacity-80 text-sm" style={{ color: 'var(--theme-footer-text)' }}>
                    {storeConfig.email}
                  </a>
                </div>
              )}
              
              {storeConfig?.whatsapp_number && (
                <div className="flex items-center space-x-3">
                  <WhatsAppIcon className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                  <button 
                    onClick={handleWhatsAppClick}
                    className="hover:opacity-80 text-sm"
                    style={{ color: 'var(--theme-footer-text)' }}
                  >
                    {storeConfig.whatsapp_number}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-primary)' }}>Síguenos</h3>
            <div className="flex space-x-4">
              {storeConfig?.facebook_url && (
                <a 
                  href={storeConfig.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Síguenos en Facebook"
                  style={{ color: 'var(--theme-footer-text)' }}
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              
              {storeConfig?.instagram_url && (
                <a 
                  href={storeConfig.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Síguenos en Instagram"
                  style={{ color: 'var(--theme-footer-text)' }}
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              
              {storeConfig?.tiktok_url && (
                <a 
                  href={storeConfig.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Síguenos en TikTok"
                  style={{ color: 'var(--theme-footer-text)' }}
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              
              {storeConfig?.whatsapp_number && (
                <button 
                  onClick={handleWhatsAppClick}
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Contáctanos por WhatsApp"
                  style={{ color: 'var(--theme-footer-text)' }}
                >
                  <WhatsAppIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center" style={{ borderTopColor: 'var(--theme-primary)' }}>
          <p className="text-sm" style={{ color: 'var(--theme-footer-text)' }}>
            © 2024 {storeConfig?.store_name || 'Krincesa Distribuidora'}. Todos los derechos reservados. Distribuidora nacional en Perú.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

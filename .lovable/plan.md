

## Plan de Implementación: Skeleton Loaders, Quick View Modal y Animaciones

### 1. **Skeleton Loaders para Productos**

**Objetivo:** Mostrar placeholders mientras cargan los productos para mejor experiencia de carga percibida.

**Archivos a modificar:**
- `src/pages/Index.tsx` - Agregar estado de carga y renderizar skeletons
- Ya existe `src/components/ui/skeleton.tsx` que usaremos

**Implementación:**
- Crear un componente `ProductCardSkeleton` que replique la estructura de `ProductCard`
- Mostrar grid de 20 skeletons mientras `isLoading` es `true`
- Los skeletons incluirán:
  - Rectángulo animado para la imagen (aspect-square)
  - Líneas animadas para badges
  - Líneas animadas para el nombre del producto
  - Líneas animadas para los precios
  - Rectángulo animado para el botón

### 2. **Quick View Modal**

**Objetivo:** Ver detalles del producto en un modal sin salir del listado y agregar al carrito directamente.

**Archivos a crear:**
- `src/components/ProductQuickView.tsx` - Componente del modal

**Archivos a modificar:**
- `src/components/ProductCard.tsx` - Agregar botón de vista rápida (ícono de ojo)
- `src/pages/Index.tsx` - Gestionar el estado del modal

**Implementación:**
- Usar el componente `Dialog` de Radix UI (ya disponible)
- El modal incluirá:
  - Galería de imágenes del producto (imagen principal + adicionales)
  - Información del producto (nombre, marca, categoría, descripción)
  - Selector de cantidad con botones +/-
  - Indicador de precio por mayor cuando aplique
  - Botón "Agregar al carrito"
  - Link "Ver detalles completos" que lleva a la página del producto
- Agregar un botón con ícono de ojo en la esquina superior derecha de cada `ProductCard`
- El botón aparecerá al hacer hover sobre la card

### 3. **Animaciones de Entrada y Hover Mejorados**

**Objetivo:** Agregar animaciones suaves fade-in cuando aparecen productos y mejorar efectos hover.

**Archivos a modificar:**
- `src/components/ProductCard.tsx` - Mejorar animaciones hover
- `src/pages/Index.tsx` - Agregar animaciones staggered a los productos

**Implementación:**

**Animaciones de Entrada (Fade-in staggered):**
- Usar las animaciones de Tailwind disponibles en el proyecto
- Aplicar `animate-fade-in` a cada producto con delay incremental
- Los productos aparecerán uno tras otro con efecto cascada sutil
- Usar `animation-delay` CSS para crear efecto staggered

**Efectos Hover Mejorados en ProductCard:**
- Mantener el `scale-105` actual pero agregar:
  - Sombra más prominente al hacer hover (`shadow-xl`)
  - Transición suave del borde con color primario
  - Elevación visual con `translate-y`
  - Overlay sutil sobre la imagen con degradado
  - Transformación sutil del botón "Añadir" (escala y brillo)

**Nuevas animaciones CSS:**
```css
/* Fade in con delay para stagger effect */
.product-card-enter {
  animation: fade-in 0.4s ease-out forwards;
  opacity: 0;
}

/* Hover mejorado */
.product-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Estructura de Componentes

```
src/
├── components/
│   ├── ProductCard.tsx (modificado)
│   │   - Botón Quick View en hover
│   │   - Animaciones hover mejoradas
│   │   - Clase de animación fade-in
│   │
│   └── ProductQuickView.tsx (nuevo)
│       - Modal con Dialog de Radix UI
│       - Galería de imágenes
│       - Selector de cantidad
│       - Info del producto
│       - Botón agregar al carrito
│
└── pages/
    └── Index.tsx (modificado)
        - ProductCardSkeleton component inline
        - Estado para modal Quick View
        - Renderizado condicional: skeletons vs productos
        - Animación staggered en productos
```

### Flujo de Usuario

1. **Carga Inicial:**
   - Usuario entra al home
   - Ve 20 skeleton loaders animados
   - Los productos cargan y aparecen con fade-in staggered

2. **Interacción con Productos:**
   - Hover sobre un producto → elevación y sombra
   - Aparece botón de "vista rápida" (ícono ojo) en esquina superior derecha
   - Click en ojo → abre Quick View modal
   - Click en producto → va a página de detalle (comportamiento actual)

3. **Quick View Modal:**
   - Modal se abre con animación fade + scale
   - Usuario puede cambiar cantidad
   - Puede agregar al carrito sin salir del listado
   - Puede ver imágenes adicionales
   - Link para ver detalles completos

### Detalles Técnicos

**Skeleton Loaders:**
- Usar hook `isLoading` del query `useProducts()`
- Grid de 20 skeletons (mismo que el `visibleCount` inicial)
- Animación pulse de Tailwind

**Quick View:**
- Estado local: `const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)`
- Modal se cierra con ESC o click fuera
- Responsive: en móvil ocupa más espacio vertical

**Animaciones:**
- CSS puro con variables CSS para delays
- Aprovechar animaciones existentes en `tailwind.config.ts`
- Performance: usar `transform` y `opacity` (GPU-accelerated)


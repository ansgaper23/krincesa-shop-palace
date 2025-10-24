
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductsManager from '@/components/admin/ProductsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import OrdersManager from '@/components/admin/OrdersManager';
import CouponsManager from '@/components/admin/CouponsManager';
import StoreConfigManager from '@/components/admin/StoreConfigManager';
import { SalesStats } from '@/components/admin/SalesStats';
import { Package, Tag, ShoppingCart, Percent, Settings, BarChart3, ArrowLeft } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    {
      id: 'stats',
      label: 'Estadísticas',
      icon: BarChart3,
      component: SalesStats,
      description: 'Resumen de ventas y productos más vendidos'
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      component: ProductsManager,
      description: 'Gestiona tu catálogo de productos'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: ShoppingCart,
      component: OrdersManager,
      description: 'Revisa y gestiona los pedidos'
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: Tag,
      component: CategoriesManager,
      description: 'Organiza tus productos por categorías'
    },
    {
      id: 'coupons',
      label: 'Cupones',
      icon: Percent,
      component: CouponsManager,
      description: 'Crea y gestiona cupones de descuento'
    },
    {
      id: 'config',
      label: 'Configuración',
      icon: Settings,
      component: StoreConfigManager,
      description: 'Configura tu tienda'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-4 max-w-7xl">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Panel Admin
            </h1>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Salir del panel</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Gestiona tu tienda desde este panel de control
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-6">
          {/* Mobile tabs - compact grid */}
          <div className="block md:hidden">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2">
                <TabsList className="grid w-full grid-cols-3 gap-1 bg-transparent p-0 h-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center gap-1 p-2 text-xs h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px] leading-tight">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </CardContent>
            </Card>
          </div>

          {/* Desktop tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-6 bg-card border shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab content */}
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-3 sm:space-y-6 mt-3 sm:mt-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      {tab.label}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm hidden sm:block">
                      {tab.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <Component />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

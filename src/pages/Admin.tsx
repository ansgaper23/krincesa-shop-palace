
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProductsManager from '@/components/admin/ProductsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import OrdersManager from '@/components/admin/OrdersManager';
import CouponsManager from '@/components/admin/CouponsManager';
import StoreConfigManager from '@/components/admin/StoreConfigManager';
import { Package, Tag, ShoppingCart, Percent, Settings } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      component: ProductsManager,
      description: 'Gestiona tu catálogo de productos'
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: Tag,
      component: CategoriesManager,
      description: 'Organiza tus productos por categorías'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: ShoppingCart,
      component: OrdersManager,
      description: 'Revisa y gestiona los pedidos'
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona tu tienda desde este panel de control
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile tabs - dropdown style */}
          <div className="block sm:hidden">
            <Card>
              <CardContent className="p-3">
                <TabsList className="grid w-full grid-cols-2 gap-1 bg-transparent p-0">
                  {tabs.slice(0, 2).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                <TabsList className="grid w-full grid-cols-3 gap-1 bg-transparent p-0 mt-2">
                  {tabs.slice(2).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </CardContent>
            </Card>
          </div>

          {/* Desktop tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab content */}
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <tab.icon className="h-5 w-5 text-pink-500" />
                      {tab.label}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {tab.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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

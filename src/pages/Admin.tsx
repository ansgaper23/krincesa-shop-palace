
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import ProductsManager from '@/components/admin/ProductsManager';
import StoreConfigManager from '@/components/admin/StoreConfigManager';
import CouponsManager from '@/components/admin/CouponsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona tu tienda Krincesa Distribuidora</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="store">Configuración</TabsTrigger>
            <TabsTrigger value="coupons">Cupones</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoriesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Tienda</CardTitle>
              </CardHeader>
              <CardContent>
                <StoreConfigManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cupones</CardTitle>
              </CardHeader>
              <CardContent>
                <CouponsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

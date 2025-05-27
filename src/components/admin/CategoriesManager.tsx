
import { useState } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';

const CategoriesManager = () => {
  const { data: categories, refetch } = useCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    await queryClient.refetchQueries({ queryKey: ['categories'] });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) return;

    try {
      const result = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select();
      
      console.log('Create category result:', result);
      
      if (result.error) throw result.error;
      
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado correctamente.",
      });
      
      await invalidateQueries();
      await refetch();
      setNewCategoryName('');
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al crear la categoría.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (categoryId: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      const result = await supabase
        .from('categories')
        .update({ name: newName.trim() })
        .eq('id', categoryId)
        .select();
      
      console.log('Update category result:', result);
      
      if (result.error) throw result.error;
      
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado correctamente.",
      });
      
      await invalidateQueries();
      await refetch();
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al actualizar la categoría.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
    
    try {
      const result = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      console.log('Delete category result:', result);
      
      if (result.error) throw result.error;
      
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente.",
      });
      
      await invalidateQueries();
      await refetch();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar la categoría.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (category: any) => {
    setEditingCategory(category.id);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Categorías</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nombre de la Categoría</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Maquillaje"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                  Crear Categoría
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {editingCategory === category.id ? (
                    <div className="flex space-x-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEdit(category.id, editName)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="font-medium">{category.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {editingCategory !== category.id && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CategoriesManager;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export const ImageUpload = ({ value, onChange, label }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Hubo un error al subir la imagen.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Subir imagen
              </span>
            </Label>
            <Input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
            />
          </div>
        </div>
      )}
      
      <div className="mt-2">
        <Label htmlFor="image-url">O pegar URL de imagen</Label>
        <Input
          id="image-url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      </div>
    </div>
  );
};

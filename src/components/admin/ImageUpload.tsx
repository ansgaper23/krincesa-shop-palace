
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

  const compressAndConvertToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a WebP con compresión
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          'image/webp',
          0.8 // Calidad del 80%
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      console.log('Starting image upload and compression...');
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      console.log('Original file:', file.name, file.size, 'bytes');
      
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen.');
      }

      // Verificar tamaño original (máximo 10MB antes de compresión)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 10MB.');
      }

      // Comprimir y convertir a WebP
      console.log('Compressing and converting to WebP...');
      const compressedBlob = await compressAndConvertToWebP(file);
      console.log('Compressed file size:', compressedBlob.size, 'bytes');
      console.log('Compression ratio:', ((file.size - compressedBlob.size) / file.size * 100).toFixed(1) + '%');

      // Crear FormData para enviar a la función Edge
      const formData = new FormData();
      formData.append('file', compressedBlob, 'image.webp');

      console.log('Uploading to Cloudflare R2...');

      // Llamar a la función Edge para subir a Cloudflare R2
      const { data, error } = await supabase.functions.invoke('upload-to-r2', {
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      onChange(data.url);
      
      const compressionPercentage = ((file.size - compressedBlob.size) / file.size * 100).toFixed(1);
      toast({
        title: "Imagen subida a Cloudflare R2",
        description: `Imagen optimizada ${compressionPercentage}% y almacenada en CDN.`,
      });

      // Limpiar el input
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: error.message || "Hubo un error al subir la imagen.",
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
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
            onError={(e) => {
              console.error('Error loading image:', value);
              e.currentTarget.src = '/placeholder.svg';
            }}
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div>
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="relative"
                asChild
              >
                <span>
                  {uploading ? 'Subiendo a CDN...' : 'Seleccionar imagen'}
                </span>
              </Button>
            </Label>
            <Input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
            />
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, GIF hasta 10MB (se subirá a Cloudflare R2 CDN)
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="image-url">O pegar URL de imagen</Label>
        <Input
          id="image-url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>
    </div>
  );
};

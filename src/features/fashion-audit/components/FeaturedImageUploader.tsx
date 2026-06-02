import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export interface FeaturedImageUploaderProps {
  image: string | null;
  onChange: (image: string | null) => void;
}

export function FeaturedImageUploader({
  image,
  onChange,
}: FeaturedImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-stone-700">Featured image</div>

      {image ? (
        <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <img
            src={image}
            alt="Featured"
            className="max-h-48 w-full rounded-lg object-cover"
          />
          <div className="flex items-center justify-end border-t border-stone-100 px-2 py-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => onChange(null)}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-white px-4 py-6 text-center transition-colors',
            dragOver
              ? 'border-brand-400 bg-brand-50'
              : 'border-stone-200 hover:border-stone-300',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <ImagePlus className="h-5 w-5" />
          </div>
          <p className="text-sm text-stone-600">
            Drop an image here, or
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          <p className="text-xs text-stone-400">PNG, JPG, GIF up to ~5MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default FeaturedImageUploader;

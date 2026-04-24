import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Camera, X, Upload } from 'lucide-react';
import { Supplier } from '@/types/warehouse';
import { compressImage } from '@/lib/imageUtils';

interface ItemFormProps {
  initialData?: any;
  suppliers?: Supplier[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ItemForm({ initialData, suppliers = [], onSubmit, onCancel }: ItemFormProps) {
  const [photo, setPhoto] = React.useState<string | null>(initialData?.imageUrl || null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        setPhoto(compressed);
      } catch (err) {
        console.error("Image processing error:", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      category: formData.get('category'),
      quantity: Number(formData.get('quantity')),
      location: formData.get('location'),
      description: formData.get('description'),
      imageUrl: photo,
      supplierId: formData.get('supplierId'),
      qrCode: formData.get('sku'),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Edit Sparepart' : 'Add New Sparepart'}</DialogTitle>
        <DialogDescription>
          {initialData ? 'Perbarui detail sparepart yang sudah ada.' : 'Masukkan detail sparepart baru untuk didaftarkan ke gudang BSD.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 py-4">
        {/* Photo Section */}
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-muted/30 group">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {photo ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border shadow-sm">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setPhoto(null)}
                className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-elnusa-blue transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border">
                <Camera size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isProcessing ? "Processing..." : "Add Photo"}
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right text-xs uppercase font-bold">Name</Label>
          <Input id="name" name="name" className="col-span-3 h-9" required defaultValue={initialData?.name} placeholder='Contoh: Drill Pipe 5"' />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sku" className="text-right text-xs uppercase font-bold">SKU</Label>
          <Input id="sku" name="sku" className="col-span-3 h-9 font-mono" required defaultValue={initialData?.sku} placeholder="Contoh: DP-001" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="category" className="text-right text-xs uppercase font-bold">Category</Label>
            <Input id="category" name="category" className="h-9" defaultValue={initialData?.category} placeholder="Drilling" />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="quantity" className="text-right text-xs uppercase font-bold">Qty</Label>
            <Input id="quantity" name="quantity" type="number" className="h-9" required defaultValue={initialData?.quantity || "0"} />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right text-xs uppercase font-bold">Loc</Label>
          <Input id="location" name="location" className="col-span-3 h-9" defaultValue={initialData?.location} placeholder="Contoh: A-01" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="supplierId" className="text-right text-xs uppercase font-bold">Supplier</Label>
          <select 
            id="supplierId" 
            name="supplierId" 
            className="col-span-3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            defaultValue={initialData?.supplierId || ""}
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90">
          {initialData ? 'Update Sparepart' : 'Save Sparepart'}
        </Button>
      </DialogFooter>
    </form>
  );
}

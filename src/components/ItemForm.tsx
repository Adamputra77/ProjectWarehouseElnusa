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

interface ItemFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ItemForm({ initialData, onSubmit, onCancel }: ItemFormProps) {
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
      imageUrl: formData.get('imageUrl'),
      qrCode: formData.get('sku'),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Edit Item' : 'Add New Inventory Item'}</DialogTitle>
        <DialogDescription>
          {initialData ? 'Perbarui detail barang yang sudah ada.' : 'Masukkan detail barang baru untuk didaftarkan ke gudang BSD.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" name="name" className="col-span-3" required defaultValue={initialData?.name} placeholder='Contoh: Drill Pipe 5"' />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sku" className="text-right">SKU/Code</Label>
          <Input id="sku" name="sku" className="col-span-3" required defaultValue={initialData?.sku} placeholder="Contoh: DP-001" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Input id="category" name="category" className="col-span-3" defaultValue={initialData?.category} placeholder="Contoh: Drilling" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">Qty</Label>
          <Input id="quantity" name="quantity" type="number" className="col-span-3" required defaultValue={initialData?.quantity || "0"} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">Location</Label>
          <Input id="location" name="location" className="col-span-3" defaultValue={initialData?.location} placeholder="Contoh: A-01" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Desc</Label>
          <Input id="description" name="description" className="col-span-3" defaultValue={initialData?.description} placeholder="Deskripsi singkat..." />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" className="col-span-3" defaultValue={initialData?.imageUrl} placeholder="https://..." />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90">
          {initialData ? 'Update Item' : 'Save Item'}
        </Button>
      </DialogFooter>
    </form>
  );
}

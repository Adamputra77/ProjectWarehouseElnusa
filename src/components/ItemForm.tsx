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
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ItemForm({ onSubmit, onCancel }: ItemFormProps) {
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
      qrCode: formData.get('sku'), // Default QR code to SKU
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogDescription>
          Masukkan detail barang baru untuk didaftarkan ke gudang BSD.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" name="name" className="col-span-3" required placeholder='Contoh: Drill Pipe 5"' />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sku" className="text-right">SKU/Code</Label>
          <Input id="sku" name="sku" className="col-span-3" required placeholder="Contoh: DP-001" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Input id="category" name="category" className="col-span-3" placeholder="Contoh: Drilling" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">Initial Qty</Label>
          <Input id="quantity" name="quantity" type="number" className="col-span-3" required defaultValue="0" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">Location</Label>
          <Input id="location" name="location" className="col-span-3" placeholder="Contoh: A-01" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Desc</Label>
          <Input id="description" name="description" className="col-span-3" placeholder="Deskripsi singkat..." />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90">Save Item</Button>
      </DialogFooter>
    </form>
  );
}

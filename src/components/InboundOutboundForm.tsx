import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { WarehouseItem, TransactionType } from '@/types/warehouse';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

interface InboundOutboundFormProps {
  item: WarehouseItem;
  type: TransactionType;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function InboundOutboundForm({ item, type, onSubmit, onCancel }: InboundOutboundFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit({
      itemId: item.id,
      type,
      quantity: Number(formData.get('quantity')),
      notes: formData.get('notes'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{type === 'inbound' ? 'Stock In' : 'Stock Out'}</DialogTitle>
        <DialogDescription>
          {type === 'inbound' 
            ? `Adding new stock for ${item.name}.` 
            : `Removing stock for ${item.name}.`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-muted">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Stock</p>
            <p className="text-2xl font-black text-elnusa-blue">{item.quantity}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Location</p>
            <p className="text-sm font-bold">{item.location}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider">Quantity to {type === 'inbound' ? 'Add' : 'Remove'}</Label>
          <Input 
            id="quantity" 
            name="quantity" 
            type="number" 
            min="1" 
            max={type === 'outbound' ? item.quantity : undefined}
            required 
            defaultValue="1"
            className="h-12 text-lg font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider">Notes / Reference</Label>
          <Input id="notes" name="notes" placeholder="e.g. PO-123, Maintenance, etc." className="h-11" />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">Cancel</Button>
        <Button 
          type="submit" 
          className={cn(
            "font-black uppercase tracking-widest",
            type === 'inbound' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          )}
        >
          Confirm {type === 'inbound' ? 'Inbound' : 'Outbound'}
        </Button>
      </DialogFooter>
    </form>
  );
}

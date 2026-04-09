import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <div className="space-y-2">
          <Label>Current Quantity</Label>
          <div className="p-3 rounded-md bg-muted text-sm font-bold">
            {item.quantity}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity to {type === 'inbound' ? 'Add' : 'Remove'}</Label>
          <Input 
            id="quantity" 
            name="quantity" 
            type="number" 
            min="1" 
            max={type === 'outbound' ? item.quantity : undefined}
            required 
            defaultValue="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Reason for movement..." />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          type="submit" 
          className={type === 'inbound' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
        >
          Confirm {type === 'inbound' ? 'Inbound' : 'Outbound'}
        </Button>
      </DialogFooter>
    </form>
  );
}

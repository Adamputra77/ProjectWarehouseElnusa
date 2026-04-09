import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WarehouseItem } from '@/types/warehouse';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BorrowFormProps {
  item: WarehouseItem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function BorrowForm({ item, onSubmit, onCancel }: BorrowFormProps) {
  const [dueDate, setDueDate] = React.useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit({
      itemId: item.id,
      notes: formData.get('notes'),
      dueDate: dueDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Borrow Item</DialogTitle>
        <DialogDescription>
          Record a borrowing transaction for <strong>{item.name}</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Item Details</Label>
          <div className="p-3 rounded-md bg-muted text-sm">
            <p><strong>SKU:</strong> {item.sku}</p>
            <p><strong>Available:</strong> {item.quantity}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date (Optional)</Label>
          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Purpose of borrowing..." />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90">Confirm Borrowing</Button>
      </DialogFooter>
    </form>
  );
}

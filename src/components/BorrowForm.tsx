import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SparepartItem } from '@/types/warehouse';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Camera, ClipboardList, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/imageUtils';

interface BorrowFormProps {
  item: SparepartItem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function BorrowForm({ item, onSubmit, onCancel }: BorrowFormProps) {
  const [dueDate, setDueDate] = React.useState<Date>();
  const [photo, setPhoto] = React.useState<string | null>(null);
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
    onSubmit({
      itemId: item.id,
      purpose: formData.get('purpose'),
      notes: formData.get('notes'),
      initialPhotoUrl: photo,
      dueDate: dueDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Borrow Sparepart</DialogTitle>
        <DialogDescription>
          Record a borrowing transaction for <strong>{item.name}</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-muted">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Sparepart to Borrow</p>
            <p className="text-lg font-black text-elnusa-blue">{item.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Available</p>
            <p className="text-sm font-bold">{item.quantity} Units</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList size={14} className="text-elnusa-blue" />
            Purpose / Keperluan
          </Label>
          <Input id="purpose" name="purpose" placeholder="Contoh: Perbaikan unit DRL-01" className="h-11 border-elnusa-blue/20 focus-visible:ring-elnusa-blue" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-left font-bold h-11 border-elnusa-blue/20",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-elnusa-blue" />
                {dueDate ? format(dueDate, "dd/MM/yyyy") : <span className="text-xs">Target Kembali</span>}
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
            <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={14} className="text-elnusa-blue" />
              Initial Condition
            </Label>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {photo ? (
              <div className="relative h-11 rounded-md border border-elnusa-blue/20 overflow-hidden group">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setPhoto(null)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 border-elnusa-blue/20 border-dashed hover:bg-elnusa-blue/5"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Take Photo / Gallery"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider">Additional Notes</Label>
          <Input id="notes" name="notes" placeholder="Catatan tambahan lainnya..." className="h-11 border-elnusa-blue/20" />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">Cancel</Button>
        <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90 font-black uppercase tracking-widest">
          Confirm Borrowing
        </Button>
      </DialogFooter>
    </form>
  );
}

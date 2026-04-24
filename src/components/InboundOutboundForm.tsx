import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SparepartItem, TransactionType } from '@/types/warehouse';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';

interface InboundOutboundFormProps {
  item: SparepartItem;
  type: TransactionType;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function InboundOutboundForm({ item, type, onSubmit, onCancel }: InboundOutboundFormProps) {
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        setEvidenceImage(compressed);
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
      type,
      quantity: Number(formData.get('quantity')),
      notes: formData.get('notes'),
      evidenceUrl: evidenceImage
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{type === 'inbound' ? 'Sparepart In' : 'Sparepart Out'}</DialogTitle>
        <DialogDescription>
          {type === 'inbound' 
            ? `Adding new sparepart stock for ${item.name}.` 
            : `Removing sparepart stock for ${item.name}.`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-muted">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Sparepart Stock</p>
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

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider">Photo Evidence (Optional)</Label>
          {!evidenceImage ? (
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-muted rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/30 transition-colors">
                <Camera className="text-muted-foreground" size={24} />
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  {isProcessing ? "Processing..." : "Tap to take photo or upload"}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border">
              <img src={evidenceImage} alt="Evidence" className="w-full h-32 object-cover" />
              <button 
                type="button"
                onClick={() => setEvidenceImage(null)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          )}
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

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BorrowRecord } from '@/types/warehouse';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Camera, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';

interface ReturnFormProps {
  record: BorrowRecord;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ReturnForm({ record, onSubmit, onCancel }: ReturnFormProps) {
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
      recordId: record.id,
      returnPhotoUrl: photo,
      returnNotes: formData.get('returnNotes'),
      status: 'returned',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle2 className="text-green-500" size={20} />
          Pengembalian Sparepart
        </DialogTitle>
        <DialogDescription>
          Konfirmasi pengembalian untuk <strong>{record.itemName}</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {record.initialPhotoUrl && (
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Kondisi Awal (Foto)</Label>
            <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
              <img 
                src={record.initialPhotoUrl} 
                alt="Initial Condition" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Camera size={14} className="text-elnusa-blue" />
            Foto Kondisi Kembali
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
            <div className="relative aspect-video rounded-lg overflow-hidden border border-elnusa-blue/20 group">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setPhoto(null)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-24 border-elnusa-blue/20 border-dashed hover:bg-elnusa-blue/5 flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Camera size={24} className="text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-tight">
                {isProcessing ? "Processing..." : "Ambil Foto Kondisi Akhir"}
              </span>
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="returnNotes" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-orange-500" />
            Catatan Kondisi / Kerusakan
          </Label>
          <textarea 
            id="returnNotes" 
            name="returnNotes" 
            placeholder="Sebutkan jika ada kerusakan atau bagian yang harus diperbaiki..." 
            className="flex min-h-[100px] w-full rounded-md border border-elnusa-blue/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elnusa-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">Batal</Button>
        <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90 font-black uppercase tracking-widest">
          Selesaikan Pengembalian
        </Button>
      </DialogFooter>
    </form>
  );
}

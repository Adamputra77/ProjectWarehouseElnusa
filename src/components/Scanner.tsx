import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanLine, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
}

export function Scanner({ onScan, isScanning }: ScannerProps) {
  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScan, isScanning]);

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-zinc-900 text-white">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-elnusa-blue rounded-lg">
            <ScanLine size={20} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-lg uppercase tracking-widest font-black">QR Scanner</CardTitle>
            <CardDescription className="text-white/50 text-[10px] uppercase font-bold">Point camera at item label</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          <div id="reader" className="overflow-hidden rounded-xl border-2 border-elnusa-blue/30 bg-black aspect-square md:aspect-video"></div>
          
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <AlertCircle className="text-elnusa-yellow shrink-0" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider">Instructions</p>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Ensure the QR code is within the frame and well-lit. The system will automatically detect the SKU and open the item details.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

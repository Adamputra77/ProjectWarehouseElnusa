import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanLine, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
}

export function Scanner({ onScan, isScanning }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const isRunningRef = useRef(false);

  // Update the ref when onScan changes without restarting the effect
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanRef.current(decodedText);
          },
          () => {
            // Silent error for frame failures
          }
        );
        isRunningRef.current = true;
      } catch (err) {
        console.error("Scanner start error:", err);
        isRunningRef.current = false;
      }
    };

    startScanner();

    return () => {
      const stopScanner = async () => {
        if (scannerRef.current && isRunningRef.current) {
          try {
            isRunningRef.current = false;
            await scannerRef.current.stop();
            scannerRef.current.clear();
          } catch (err) {
            console.warn("Scanner stop warning:", err);
          }
        }
      };
      stopScanner();
    };
  }, [isScanning]);

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-zinc-900 text-white">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-elnusa-blue rounded-lg">
            <ScanLine size={20} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-lg uppercase tracking-widest font-black">QR Scanner</CardTitle>
            <CardDescription className="text-white/50 text-[10px] uppercase font-bold">Point camera at sparepart label</CardDescription>
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
                Ensure the QR code is within the frame and well-lit. The system will automatically detect the SKU and open the sparepart details.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

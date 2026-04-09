import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

export function Scanner({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
  disableFlip = false,
}: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps,
        qrbox,
        aspectRatio,
        disableFlip,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        // We might want to stop or pause here depending on UX
      },
      (error) => {
        if (onScanFailure) onScanFailure(error);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Failed to clear html5QrcodeScanner', error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure, fps, qrbox, aspectRatio, disableFlip]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-lg border border-border bg-muted">
      <div id="reader" className="w-full"></div>
    </div>
  );
}

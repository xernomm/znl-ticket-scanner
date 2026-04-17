import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { XCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isScanning: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, isScanning }) => {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [hasError, setHasError] = React.useState(false);

  const startScanner = async () => {
    try {
      setHasError(false);
      if (!qrRef.current) {
        qrRef.current = new Html5Qrcode("reader");
      }
      
      if (qrRef.current && !qrRef.current.isScanning) {
        await qrRef.current.start(
          { facingMode: { ideal: "environment" } },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          () => {} // silent error callback for frame failures
        );
      }
    } catch (err) {
      console.error("Scanner failed to start", err);
      setHasError(true);
    }
  };

  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      if (qrRef.current && qrRef.current.isScanning) {
        qrRef.current.stop().catch(e => console.warn(e));
      }
    }

    return () => {
      if (qrRef.current && qrRef.current.isScanning) {
        qrRef.current.stop().catch(e => console.warn(e));
      }
    };
  }, [isScanning]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center">
      <div id="reader" className="w-full h-full [&>video]:object-cover [&>video]:h-full [&>video]:w-full"></div>
      
      {/* Visual Overlay */}
      {isScanning && !hasError && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-64 h-64 border-2 border-primary rounded-[2rem] relative shadow-[0_0_0_2000px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-[10%] w-[80%] h-1 bg-primary shadow-[0_0_15px_#6366f1] animate-[scanMove_2.5s_infinite_linear]"></div>
          </div>
          <p className="mt-8 text-white/80 font-medium px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            Arahkan kamera ke Barcode Tiket
          </p>
        </div>
      )}

      {/* Manual Start Fallback (for mobile security policy) */}
      {hasError && (
        <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <p className="text-white mb-4 font-medium">Auto-start kamera diblokir browser</p>
          <button 
            onClick={startScanner}
            className="btn-primary w-fit px-8"
          >
            Aktifkan Kamera
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanMove {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;

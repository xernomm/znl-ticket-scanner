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
  const isTransitioning = useRef(false);

  const startScanner = async () => {
    if (isTransitioning.current) return;
    
    try {
      isTransitioning.current = true;
      setHasError(false);

      // Wait a bit for the DOM to be fully ready and sized
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = document.getElementById("reader");
      if (!element || element.clientWidth === 0) {
        console.warn("Scanner element not ready or zero-width");
        isTransitioning.current = false;
        return;
      }

      if (!qrRef.current) {
        qrRef.current = new Html5Qrcode("reader");
      }
      
      if (qrRef.current && !qrRef.current.isScanning) {
        await qrRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 256, height: 256 } },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          () => {} // silent error callback for frame failures
        );
      }
    } catch (err) {
      console.error("Scanner failed to start", err);
      if (document.getElementById("reader")) {
        setHasError(true);
      }
    } finally {
      isTransitioning.current = false;
    }
  };

  useEffect(() => {
    const toggleScanner = async () => {
      if (isScanning) {
        await startScanner();
      } else {
        if (qrRef.current && qrRef.current.isScanning && !isTransitioning.current) {
          try {
            isTransitioning.current = true;
            await qrRef.current.stop();
          } catch (e) {
            console.warn(e);
          } finally {
            isTransitioning.current = false;
          }
        }
      }
    };

    toggleScanner();

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
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-65 h-65 border-4 border-primary/40 md:border-primary rounded-[2.5rem] relative shadow-[0_0_0_2000px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 left-[10%] w-[80%] h-1 bg-primary shadow-[0_0_20px_#6366f1] animate-[scanMove_2.5s_infinite_linear]"></div>
          </div>
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

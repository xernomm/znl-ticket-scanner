import React from 'react';
import { CheckCircle2, XCircle, Info, User, Zap, Mail, ChevronRight } from 'lucide-react';

interface ResultData {
  valid?: boolean;
  message?: string;
  reason?: string;
  route_match?: boolean;
  data?: {
    passenger?: { name: string };
    booking_type: string;
    pickup: string;
    dropoff?: string;
  };
}

interface ResultModalProps {
  isOpen: boolean;
  result: ResultData | null;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, result, onClose }) => {
  if (!isOpen || !result) return null;

  const success = result.valid !== false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
      <div className="bg-surface border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${success ? 'bg-success/10 text-success border border-success/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-error/10 text-error border border-error/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
          {success ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>

        <h2 className={`text-2xl font-bold text-center mb-2 ${result.route_match === false ? 'text-warning' : (success ? 'text-success' : 'text-error')}`}>
          {result.route_match === false ? 'Rute Berbeda!' : (success ? 'Validasi Berhasil' : 'Gagal Validasi')}
        </h2>
        
        <p className="text-text-muted text-center mb-8">
          {result.message || (success ? 'Tiket telah diverifikasi.' : 'Tiket tidak valid atau expired.')}
        </p>

        {result.data && success && (
          <div className="bg-bg/50 border border-white/5 rounded-2xl p-6 mb-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 align-start text-left">
              <span className="text-text-muted text-xs flex items-center gap-2 px-1">
                <User size={14} className="text-primary"/> Penumpang
              </span>
              <span className="text-white font-bold text-lg pl-6">
                {result.data.passenger?.name || 'Unknown'}
              </span>
            </div>
            
            <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-text-muted text-[10px] uppercase tracking-wider px-1">Layanan</span>
                <span className="text-white font-medium pl-6">
                  {result.data.booking_type === 'single_booking' ? 'Langganan (Member)' : 'Public Transport / Reguler'}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 text-left">
                <span className="text-text-muted text-[10px] uppercase tracking-wider px-1">Detail Rute</span>
                <div className="pl-6 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    <span className="text-white text-xs">{result.data.pickup}</span>
                  </div>
                  {result.data.dropoff && (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      <span className="text-white text-xs">{result.data.dropoff}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!success && result.reason && (
          <div className="bg-error/5 border border-error/10 rounded-2xl p-4 mb-8 text-center text-error/80 text-sm italic">
            Alasan: {result.reason}
          </div>
        )}

        <button onClick={onClose} className="btn-primary flex items-center justify-center gap-2 group">
          Selesai <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ResultModal;

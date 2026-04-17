import React, { useState, useEffect, useMemo } from 'react';
import { apiService, apiHelpers, setAccessToken } from './services/apiService';
import Sidebar from './components/Sidebar';
import VehicleCatalog from './components/VehicleCatalog';
import QRScanner from './components/QRScanner';
import ResultModal from './components/ResultModal';
import { LogOut, MapPin, Scan, Keyboard, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualTicketId, setManualTicketId] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: null as number | null, lng: null as number | null });

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('scanner_token');
      if (token) {
        await checkSession();
      } else {
        await loadVehicles();
      }
      setIsInitialized(true);
      startLocationWatch();
    };
    init();
  }, []);

  const startLocationWatch = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn("GPS Access Denied"),
        { enableHighAccuracy: true }
      );
    }
  };

  const checkSession = async () => {
    try {
      const res = await apiService.scanner.getSession();
      if (res.data.success) {
        setCurrentVehicle(res.data.data.vehicle);
        setIsScanning(true);
      } else {
        setAccessToken(null);
        await loadVehicles();
      }
    } catch (err) {
      setAccessToken(null);
      await loadVehicles();
    }
  };

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.scanner.getVehicles();
      setVehicles(res.data.data);
    } catch (err) {
      console.error("Gagal memuat kendaraan", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions ---
  const handleLogin = async (vehicle: any) => {
    if (!vehicle.is_available) {
      if (!confirm(`Unit ${vehicle.serial_number} sedang digunakan di lain device. Paksa masuk?`)) return;
      try {
        await apiService.scanner.forceLogout(vehicle.id, vehicle.vehicle_type);
      } catch (e) {
        alert("Gagal memaksa keluar sesi lain");
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await apiService.scanner.login(vehicle.id, vehicle.vehicle_type);
      setAccessToken(res.data.data.session_token);
      setCurrentVehicle(res.data.data.vehicle);
      setIsScanning(true);
    } catch (err) {
      alert(apiHelpers.handleError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Keluar dari unit kendaraan ini?')) return;
    try {
      await apiService.scanner.logout();
    } catch (e) { }
    setAccessToken(null);
    setCurrentVehicle(null);
    setIsScanning(false);
    loadVehicles();
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!isScanning) return;
    setIsScanning(false);

    let ticketId = decodedText;
    try {
      const data = JSON.parse(decodedText);
      ticketId = data.id || data.ticket_id || decodedText;
    } catch (e) { }

    await verifyTicket(ticketId);
  };

  const verifyTicket = async (ticketId: string) => {
    try {
      const res = await apiService.scanner.verifyTicket(ticketId, userLocation.lat, userLocation.lng);
      setScanResult(res.data);
    } catch (err) {
      setScanResult(apiHelpers.handleError(err));
    }
  };

  const handleManualVerify = () => {
    if (manualTicketId.trim()) {
      verifyTicket(manualTicketId.trim());
      setManualTicketId('');
    }
  };

  // --- Filtering Logic ---
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesCategory = activeCategory === 'all' || v.vehicle_type === activeCategory;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        v.serial_number.toLowerCase().includes(lowerSearch) ||
        (v.route?.route_name || '').toLowerCase().includes(lowerSearch) ||
        (v.driver?.name || '').toLowerCase().includes(lowerSearch);

      return matchesCategory && matchesSearch;
    });
  }, [vehicles, activeCategory, searchTerm]);

  // --- Render ---
  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-screen flex text-text-main overflow-hidden bg-bg">
      {/* Sidebar for navigation and category filtering */}
      {!currentVehicle && (
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {!currentVehicle ? (
          /* Login View: Vehicle Catalog */
          <VehicleCatalog
            vehicles={filteredVehicles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectVehicle={handleLogin}
          />
        ) : (
          /* Dashboard View: Scanner */
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Nav Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-white/5 pr-8">
                <div className={`p-3 rounded-xl ${currentVehicle.vehicle_type === 'bus' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  <Scan size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentVehicle.serial_number}</h2>
                  <div className="flex items-center gap-2 text-text-muted text-xs">
                    <MapPin size={12} />
                    <span>{currentVehicle.route?.route_name || 'Tanpa Rute Terpilih'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 hover:bg-error/20 transition-all flex items-center gap-2 font-bold"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>

            {/* Main Scanner Section */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
              <div className="flex-[2] relative min-h-[300px]">
                <QRScanner onScanSuccess={onScanSuccess} isScanning={isScanning} />
              </div>

              {/* Manual Input Panel */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-surface border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-text-muted font-bold text-xs uppercase tracking-widest px-2">
                    <Keyboard size={14} />
                    Input Manual
                  </div>
                  <input
                    type="text"
                    placeholder="Masukkan ID Tiket..."
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                    className="bg-bg/50 border border-white/10 rounded-2xl p-4 text-lg outline-none focus:border-primary/50 transition-all"
                  />
                  <button
                    onClick={handleManualVerify}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    Verifikasi
                  </button>
                </div>

                <div className="flex-1 bg-surface border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center opacity-40 italic text-sm">
                  <p>Aplikasi dalam mode petugas.<br />Silakan scan tiket penumpang atau masukkan ID secara manual.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Verification Result Modal */}
      <ResultModal
        isOpen={!!scanResult}
        result={scanResult}
        onClose={() => { setScanResult(null); setTimeout(() => setIsScanning(true), 150); }}
      />

      {/* Global CSS transition for pages */}
      <style>{`
        .animate-in { animation: animateIn 0.3s ease-out forwards; }
        @keyframes animateIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;

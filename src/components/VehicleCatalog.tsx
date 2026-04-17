import React from 'react';
import { Search, MapPin, User } from 'lucide-react';

interface Vehicle {
  id: string;
  serial_number: string;
  vehicle_type: 'bus' | 'angkot';
  is_available: boolean;
  route?: {
    route_name: string;
  };
  driver?: {
    name: string;
  };
}

interface VehicleCatalogProps {
  vehicles: Vehicle[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectVehicle: (v: Vehicle) => void;
}

const VehicleCatalog: React.FC<VehicleCatalogProps> = ({ vehicles, searchTerm, setSearchTerm, onSelectVehicle }) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with Search */}
      <div className="p-8 pb-4">
        <h2 className="text-3xl font-bold mb-6">Unit Kendaraan</h2>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari nomor seri, rute, atau driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-lg"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="flex-1 overflow-y-auto p-8 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length > 0 ? (
          vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => onSelectVehicle(v)}
              className={`text-left card-premium flex flex-col gap-4 group relative overflow-hidden ${!v.is_available ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              {/* Illustration Background */}
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <img 
                  src={v.vehicle_type === 'bus' ? '/assets/bus-icon.png' : '/assets/angkot.png'} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${v.vehicle_type === 'bus' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                  {v.vehicle_type}
                </span>
                {!v.is_available && (
                  <span className="text-[10px] text-error font-bold bg-error/10 px-2 py-1 rounded-md">DIOPERASIKAN</span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{v.serial_number}</h3>
                <div className="flex items-center gap-2 text-text-muted text-sm mt-1">
                  <MapPin size={14} />
                  <span>{v.route?.route_name || 'Tanpa Rute'}</span>
                </div>
                {v.driver?.name && (
                  <div className="flex items-center gap-2 text-text-muted text-sm mt-1 font-medium italic">
                    <User size={14} />
                    <span>{v.driver.name}</span>
                  </div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-text-muted">
            <p className="text-lg">Tidak ada kendaraan yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCatalog;

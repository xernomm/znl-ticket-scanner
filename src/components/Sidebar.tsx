import React from 'react';
import { Bus, Car, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', name: 'Semua', icon: LayoutGrid },
    { id: 'bus', name: 'Bus', icon: Bus },
    { id: 'angkot', name: 'Angkot', icon: Car },
  ];

  return (
    <div className="w-20 md:w-64 bg-surface border-r border-white/5 flex flex-col items-center md:items-start py-8 px-4 transition-all duration-300">
      <div className="hidden md:block mb-10 px-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
          ZNL Scanner
        </h1>
        <p className="text-text-muted text-xs mt-1">Fleet Management</p>
      </div>

      <nav className="flex flex-col gap-4 w-full">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <cat.icon size={24} className={activeCategory === cat.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
            <span className="hidden md:block font-medium">{cat.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

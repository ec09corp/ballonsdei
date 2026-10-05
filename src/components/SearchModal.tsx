import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../types/database';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.tags && String(p.tags).toLowerCase().includes(term))
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl overflow-hidden border border-[#E8DED7] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="p-4 border-b border-[#EBE2DB] bg-white flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8D5844] shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por flores, rosas, peluches, sombrerera, cilindros..."
            className="w-full text-sm bg-transparent border-none text-[#2E2421] placeholder:text-[#A89890] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-[#8A796F] hover:text-[#2E2421]"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#F2ECE6] rounded-full transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-xs text-[#8C7A70] space-y-2 font-light">
              <p>Escribe para buscar cualquier producto o servicio de BALLONSDEI.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Rosas', 'Sombrerera', 'Peluches', 'Quinceaños', 'Alquiler', 'Cilindros'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="px-2.5 py-1 bg-white border border-[#D5C2B8] rounded-full text-[11px] text-[#5C4D46] hover:border-[#8D5844] hover:text-[#8D5844] transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C7A70]">
              No encontramos productos que coincidan con "{searchTerm}".
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 bg-white hover:bg-[#F5EFEB] rounded-xl border border-[#EDE5DF] cursor-pointer transition-colors group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#EAE2DC] shrink-0">
                  <img
                    src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=200&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-medium text-[#2E2421] truncate group-hover:text-[#8D5844] transition-colors">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#7A6B63] mt-0.5">
                    <span>${(p.available_for_rental && p.rental_price ? p.rental_price : p.price).toFixed(2)}</span>
                    {p.available_for_rental && <span className="text-[#556B5C]">· Alquiler</span>}
                    {p.gift_type === 'fixed' && <span>· Regalo Fijo</span>}
                    {p.gift_type === 'variable' && <span>· Regalo Variable</span>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C5B5AA] group-hover:text-[#8D5844] group-hover:translate-x-1 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

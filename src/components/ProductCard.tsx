import React from 'react';
import { Eye, Gift, Calendar, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types/database';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onCustomizeProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewProduct,
  onCustomizeProduct 
}) => {
  const { addItem } = useCart();

  const mainImage =
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';

  const isOutOfStock = product.stock <= 0 && !product.available_for_rental;
  const isRental = product.available_for_rental;
  const displayPrice = isRental && product.rental_price ? product.rental_price : product.price;

  // Zero-Pill Discipline: Editorial status text instead of colored pill capsules
  const getEditionLabel = () => {
    if (isOutOfStock) return 'Pieza Agotada';
    if (product.is_new) return 'Nueva Creación';
    if (isRental) return 'Mobiliario VIP';
    if (product.gift_type === 'variable') return 'Personalizable en 2D';
    if (product.gift_type === 'fixed') return 'Diseño de Colección';
    return null;
  };

  const editionLabel = getEditionLabel();

  return (
    <article 
      onClick={() => onViewProduct(product)}
      className="group flex flex-col bg-white border border-[#EAE3DC] rounded-2xl overflow-hidden cursor-pointer transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-[#C5A059]/60 hover:shadow-lg hover:shadow-[#241A23]/4"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/5 overflow-hidden bg-[#FAF6F2]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          loading="lazy"
        />

        {/* Zero-Pill Editorial Status Tag: Clean unboxed typography */}
        {editionLabel && (
          <div className="absolute top-3.5 left-3.5 pointer-events-none">
            <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm backdrop-blur-md ${
              isOutOfStock 
                ? 'bg-stone-900/80 text-stone-300' 
                : 'bg-white/90 text-[#7D5B28] border border-[#C5A059]/30'
            }`}>
              {editionLabel}
            </span>
          </div>
        )}

        {/* Desktop Quick Look affordance (accessible and gated to hover) */}
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] font-semibold tracking-wider uppercase bg-white/95 text-[#241A23] px-2.5 py-1.5 rounded-full shadow-sm border border-[#EAE3DC] flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#763D8B]" />
            <span>Ver detalle</span>
          </span>
        </div>
      </div>

      {/* Info Content: Pure Editorial Typography */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata clean text with bullet separators (Zero-Pill Rule) */}
          <div className="flex items-center gap-2 text-[10px] text-[#8A7383] uppercase tracking-[0.18em] mb-1.5 font-medium">
            <span>{isRental ? 'Alquiler para eventos' : product.gift_type !== 'none' ? 'Regalo de autor' : 'Floristería'}</span>
            {product.size && (
              <>
                <span className="text-[#C5A059]" aria-hidden="true">·</span>
                <span>{product.size}</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg text-[#241A23] font-normal leading-snug line-clamp-2 group-hover:text-[#763D8B] transition-colors duration-150">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Strip */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE6] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl sm:text-2xl font-light text-[#241A23]">
              ${displayPrice.toFixed(2)}
            </span>
            {isRental && (
              <span className="text-[10px] text-[#7A6B63] font-light uppercase tracking-wider">/ día</span>
            )}
            {product.previous_price && (
              <span className="text-xs text-[#A89890] line-through font-light ml-1">
                ${product.previous_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Emil Kowalski Tactile Action Trigger */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {onCustomizeProduct && !isRental && (
              <button
                type="button"
                onClick={() => onCustomizeProduct(product)}
                className="btn-tactile text-[11px] font-semibold text-[#763D8B] hover:text-[#52255E] bg-[#763D8B]/8 hover:bg-[#763D8B]/15 px-3 py-1.5 rounded-full transition-colors duration-150 cursor-pointer flex items-center gap-1 active:scale-[0.97]"
                title="Personalizar en lienzo 2D"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#763D8B]" />
                <span className="hidden xs:inline">Personalizar</span>
              </button>
            )}

            {isRental ? (
              <button
                type="button"
                onClick={() => onViewProduct(product)}
                className="btn-tactile text-xs font-semibold text-[#435C4E] hover:text-[#2E4036] bg-[#435C4E]/10 hover:bg-[#435C4E]/18 px-3 py-1.5 rounded-full transition-colors duration-150 flex items-center gap-1 cursor-pointer active:scale-[0.97]"
              >
                <Calendar className="w-3 h-3" />
                <span>Reservar</span>
              </button>
            ) : isOutOfStock ? (
              <span className="text-xs text-[#8C3A3A] font-medium tracking-wide">Agotado</span>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product, 1)}
                className="btn-tactile text-xs font-semibold text-white bg-[#763D8B] hover:bg-[#602F72] px-3.5 py-1.5 rounded-full shadow-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer active:scale-[0.97]"
                title="Añadir al carrito"
              >
                <Gift className="w-3.5 h-3.5 text-[#F3E2C4]" />
                <span>Añadir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

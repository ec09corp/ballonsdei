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

  return (
    <div className="group flex flex-col bg-white border border-[#EAE1DA] rounded-2xl overflow-hidden hover:border-[#C5A059]/60 hover:shadow-[0_20px_35px_-12px_rgba(36,18,43,0.15)] transition-all duration-300">
      {/* Product Image Box */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF6F3] cursor-pointer" onClick={() => onViewProduct(product)}>
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Status / Category tag top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.is_new && (
            <span className="px-2.5 py-0.5 bg-[#241A23] text-white text-[9px] font-semibold tracking-[0.18em] uppercase rounded-full shadow-xs">
              Nouveau
            </span>
          )}
          {product.gift_type === 'fixed' && (
            <span className="px-2.5 py-0.5 bg-[#763D8B] text-white text-[9px] font-semibold tracking-[0.16em] uppercase rounded-full shadow-xs">
              Édition Fixe
            </span>
          )}
          {product.gift_type === 'variable' && (
            <span className="px-2.5 py-0.5 bg-[#8D5844] text-white text-[9px] font-semibold tracking-[0.16em] uppercase rounded-full shadow-xs">
              Sur Mesure
            </span>
          )}
          {isRental && (
            <span className="px-2.5 py-0.5 bg-[#435C4E] text-white text-[9px] font-semibold tracking-[0.16em] uppercase rounded-full shadow-xs">
              Alquiler VIP
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-0.5 bg-[#8C3A3A] text-white text-[9px] font-semibold tracking-[0.16em] uppercase rounded-full shadow-xs">
              Agotado
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="btn-icon-tactile p-3 bg-white text-[#2B1D28] hover:bg-[#763D8B] hover:text-white rounded-full shadow-lg cursor-pointer"
            title="Ver galería y detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onCustomizeProduct && !isRental && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCustomizeProduct(product);
              }}
              className="btn-icon-tactile p-3 bg-[#FAF8F5] text-[#763D8B] hover:bg-[#763D8B] hover:text-white rounded-full shadow-lg cursor-pointer"
              title="Personalizar arreglo en el lienzo interactivo"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
          {!isRental && !isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product, 1);
              }}
              className="btn-icon-tactile p-3 bg-[#763D8B] text-white hover:bg-[#5F2D72] rounded-full shadow-lg cursor-pointer"
              title="Agregar al carrito"
            >
              <Gift className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata clean text */}
          <div className="flex items-center gap-2 text-[11px] text-[#86707F] uppercase tracking-wider mb-1.5 font-light">
            <span>{isRental ? 'Alquiler para eventos' : product.gift_type !== 'none' ? 'Regalo de autor' : 'Floristería'}</span>
            {product.size && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.size}</span>
              </>
            )}
          </div>

          <h3
            onClick={() => onViewProduct(product)}
            className="font-serif text-base sm:text-lg text-[#2B1D28] font-medium leading-snug line-clamp-2 hover:text-[#763D8B] transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#F2ECE6] flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xl sm:text-2xl font-medium text-[#241A23]">
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

          <div className="flex items-center gap-2">
            {onCustomizeProduct && !isRental && (
              <button
                type="button"
                onClick={() => onCustomizeProduct(product)}
                className="btn-tactile text-[11px] font-bold text-[#763D8B] hover:text-white hover:bg-[#763D8B] bg-[#763D8B]/10 px-2.5 py-1 rounded-lg cursor-pointer"
                title="Personalizar en el lienzo"
              >
                <span>Personalizar</span>
              </button>
            )}

            {isRental ? (
              <button
                onClick={() => onViewProduct(product)}
                className="btn-tactile text-xs font-medium text-[#526B5C] hover:text-[#38483D] flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reservar</span>
              </button>
            ) : isOutOfStock ? (
              <span className="text-xs text-[#8C3A3A] font-medium">Agotado</span>
            ) : (
              <button
                onClick={() => addItem(product, 1)}
                className="btn-tactile text-xs font-semibold text-[#763D8B] hover:text-white hover:bg-[#763D8B] bg-[#763D8B]/10 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span>Añadir</span>
                <span className="text-base leading-none font-bold">+</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

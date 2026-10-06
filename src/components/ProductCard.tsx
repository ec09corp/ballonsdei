import React from 'react';
import { Eye, Gift, Calendar, SlidersHorizontal, Sparkles } from 'lucide-react';
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
  const isVariableGift = product.gift_type === 'variable';
  const isFixedGift = product.gift_type === 'fixed';
  const displayPrice = isRental && product.rental_price ? product.rental_price : product.price;

  // Zero-Pill Discipline: Editorial status text instead of colored pill capsules
  const getEditionLabel = () => {
    if (isOutOfStock) return 'Pieza Agotada';
    if (product.is_new) return 'Nueva Creación';
    if (isRental) return 'Mobiliario VIP';
    if (isVariableGift) return 'Personalizable a tu Gusto';
    if (isFixedGift) return 'Diseño de Colección (Fijo)';
    return null;
  };

  const editionLabel = getEditionLabel();

  return (
    <article 
      onClick={() => onViewProduct(product)}
      className="group flex flex-col bg-white border border-[#EAE3DC] rounded-2xl overflow-hidden cursor-pointer transition-[transform,box-shadow,border-color] duration-240 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#C5A059]/60 hover:shadow-xl hover:shadow-[#241A23]/8 active:scale-[0.99] active:duration-75"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/5 overflow-hidden bg-[#FAF6F2]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transform transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] will-change-transform"
          loading="lazy"
        />

        {/* Zero-Pill Editorial Status Tag: Clean unboxed typography with WCAG AA contrast */}
        {editionLabel && (
          <div className="absolute top-3.5 left-3.5 pointer-events-none">
            <span className={`text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm backdrop-blur-md transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOutOfStock 
                ? 'bg-stone-900/85 text-stone-200' 
                : isVariableGift
                ? 'bg-[#763D8B]/95 text-white shadow-xs'
                : 'bg-white/95 text-[#7D5B28] border border-[#C5A059]/40'
            }`}>
              {editionLabel}
            </span>
          </div>
        )}

        {/* Desktop Quick Look affordance (accessible and gated to hover with spring slide-up) */}
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
          <span className="text-[10px] font-semibold tracking-wider uppercase bg-white/95 text-[#241A23] px-2.5 py-1.5 rounded-full shadow-sm border border-[#EAE3DC] flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#763D8B]" />
            <span>Ver detalle</span>
          </span>
        </div>
      </div>

      {/* Info Content: Pure Editorial Typography */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata clean text with bullet separators (Zero-Pill Rule + WCAG AA contrast #6E5A69) */}
          <div className="flex items-center gap-2 text-[10px] text-[#6E5A69] uppercase tracking-[0.18em] mb-1.5 font-medium">
            <span>
              {isRental 
                ? 'Alquiler para eventos' 
                : isVariableGift
                ? 'Regalo Personalizable'
                : isFixedGift
                ? 'Regalo Fijo'
                : 'Floristería'}
            </span>
            {product.size && (
              <>
                <span className="text-[#7D5B28]" aria-hidden="true">·</span>
                <span>{product.size}</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg text-[#241A23] font-normal leading-snug line-clamp-2 group-hover:text-[#763D8B] transition-colors duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]">
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
              <span className="text-[10px] text-[#6E5A69] font-light uppercase tracking-wider">/ día</span>
            )}
            {product.previous_price && (
              <span className="text-xs text-[#8A796F] line-through font-light ml-1">
                ${product.previous_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Emil Kowalski Tactile Action Triggers */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Customization Action: available for variable gifts AND as an option to modify fixed gifts */}
            {onCustomizeProduct && !isRental && (
              <button
                type="button"
                onClick={() => onCustomizeProduct(product)}
                aria-label={isVariableGift ? `Personalizar ${product.name} en el estudio visual` : `Modificar ${product.name} a tu gusto`}
                className={`btn-spring-action text-[11px] font-semibold px-2.5 sm:px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1 group/btn ${
                  isVariableGift 
                    ? 'text-white bg-[#763D8B] hover:bg-[#602F72] shadow-xs hover:shadow-md hover:shadow-[#763D8B]/25' 
                    : 'text-[#763D8B] hover:text-[#52255E] bg-[#763D8B]/10 hover:bg-[#763D8B]/18 border border-[#763D8B]/25'
                }`}
                title={isVariableGift ? "Personalizar este regalo a tu gusto" : "Modificar este diseño a tu gusto (cambiar globos, frase o detalles)"}
              >
                <SlidersHorizontal className="w-3 h-3 text-current transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:rotate-45" />
                <span className="hidden xs:inline">{isVariableGift ? 'Personalizar' : 'Modificar'}</span>
              </button>
            )}

            {isRental ? (
              <button
                type="button"
                onClick={() => onViewProduct(product)}
                aria-label={`Reservar ${product.name}`}
                className="btn-spring-action text-xs font-semibold text-[#374D40] hover:text-[#1F2C24] bg-[#435C4E]/10 hover:bg-[#435C4E]/20 px-3.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3" />
                <span>Reservar</span>
              </button>
            ) : isOutOfStock ? (
              <span className="text-xs text-[#8C3A3A] font-medium tracking-wide">Agotado</span>
            ) : !isVariableGift ? (
              <button
                type="button"
                onClick={() => addItem(product, 1)}
                aria-label={`Añadir ${product.name} tal cual al carrito`}
                className="btn-spring-action text-xs font-semibold text-[#241A23] hover:text-[#763D8B] bg-[#FAF4F7] hover:bg-[#F2E5EF] border border-[#E4D7E0] hover:border-[#763D8B]/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-sm"
                title="Añadir diseño fijo tal cual al carrito"
              >
                <Gift className="w-3.5 h-3.5 text-[#763D8B]" />
                <span>Añadir</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};

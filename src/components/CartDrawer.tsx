import React from 'react';
import { X, Trash2, ArrowRight, Gift, Calendar, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings } from '../types/database';

interface CartDrawerProps {
  settings: StoreSettings;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  settings,
  onProceedToCheckout,
}) => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div 
        className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#EBE2DB] animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#EBE2DB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#8D5844]" />
            <h2 className="font-serif text-xl font-medium text-[#2E2421]">
              Tu Carrito ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#F2ECE6] rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-[#8C7A70]">
              <div className="w-16 h-16 rounded-full bg-[#EFE8E2] flex items-center justify-center text-[#A89890]">
                <Gift className="w-8 h-8" />
              </div>
              <p className="font-serif text-lg text-[#382B26]">Tu carrito está vacío</p>
              <p className="text-xs text-[#8C7A70] max-w-xs font-light">
                Descubre nuestros arreglos florales, regalos fijos y opciones de alquiler para llenar este momento de magia.
              </p>
              <button
                onClick={closeCart}
                className="mt-2 px-6 py-2.5 bg-[#8D5844] hover:bg-[#744533] text-white text-xs font-medium uppercase tracking-wider rounded-md transition-colors"
              >
                Comenzar a Comprar
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product_id}-${item.selected_variant || 'default'}`}
                className="flex gap-4 p-3 bg-white rounded-xl border border-[#EDE5DF] shadow-2xs relative"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5EFEB] shrink-0 border border-[#EAE2DC]">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-sm font-medium text-[#2E2421] line-clamp-1">
                        {item.product_name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.product_id, item.selected_variant)}
                        className="text-[#B3A298] hover:text-[#8C3A3A] transition-colors p-1"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.is_rental && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#556B5C] bg-[#556B5C]/10 px-1.5 py-0.5 rounded-xs mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Alquiler
                        {item.rental_start_date && ` (${item.rental_start_date})`}
                      </span>
                    )}

                    {item.customization && (
                      <div className="mt-1 space-y-0.5 text-[10px] text-stone-600 bg-stone-50 p-1.5 rounded border border-stone-200">
                        {item.customization.balloonType && (
                          <p><strong className="text-stone-700">Globo:</strong> {item.customization.balloonType}</p>
                        )}
                        {item.customization.balloonText && (
                          <p><strong className="text-stone-700">Frase:</strong> "{item.customization.balloonText}" ({item.customization.vinylColor})</p>
                        )}
                        {item.customization.colorPalette && (
                          <p><strong className="text-stone-700">Colores:</strong> {item.customization.colorPalette}</p>
                        )}
                        {item.customization.ribbonType && (
                          <p><strong className="text-stone-700">Lazo:</strong> {item.customization.ribbonType}</p>
                        )}
                        {item.customization.plushToy && item.customization.plushToy !== 'Sin peluche' && (
                          <p><strong className="text-stone-700">Peluche:</strong> {item.customization.plushToy}</p>
                        )}
                        {item.customization.extras && item.customization.extras.length > 0 && (
                          <p><strong className="text-stone-700">Extras:</strong> {item.customization.extras.map(e => e.name).join(', ')}</p>
                        )}
                      </div>
                    )}

                    {item.dedication_message && (
                      <p className="text-[10px] text-[#8C7A70] italic line-clamp-1 mt-0.5">
                        "{item.dedication_message}"
                      </p>
                    )}
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5EFEB]">
                    <div className="flex items-center border border-[#D5C2B8] rounded bg-[#FAF8F5]">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity - 1, item.selected_variant)
                        }
                        className="px-2 py-0.5 text-xs text-[#423530] hover:bg-[#EFE8E2]"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-semibold text-[#2E2421]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity + 1, item.selected_variant)
                        }
                        className="px-2 py-0.5 text-xs text-[#423530] hover:bg-[#EFE8E2]"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-[#2E2421]">
                      ${item.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#EBE2DB] bg-white space-y-4">
            <div className="space-y-1.5 text-xs text-[#6B5A52]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-[#2E2421]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío estimado:</span>
                <span className="text-[#8D5844] font-medium">Calculado en checkout</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#2E2421] pt-2 border-t border-[#EBE2DB]">
                <span>Total Estimado:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                closeCart();
                onProceedToCheckout();
              }}
              className="btn-cta-emil w-full py-3.5 bg-[#8D5844] hover:bg-[#744533] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceder al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-[#8C7A70] hover:text-[#2E2421] transition-colors py-1 cursor-pointer"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

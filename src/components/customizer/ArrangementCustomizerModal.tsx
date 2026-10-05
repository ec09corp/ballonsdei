import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Gift, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Eye, 
  RotateCcw, 
  Palette,
  Truck,
  ShieldCheck,
  Package,
  Layers,
  HelpCircle,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Product } from '../../types/database';
import { 
  CustomizerElementItem, 
  CanvasPlacedElement, 
  CanvasTextElement, 
  ArrangementDesignData 
} from '../../types/customizer';
import { customizerService } from '../../services/customizerService';
import { InteractiveArrangementCanvas } from './InteractiveArrangementCanvas';
import { CustomizerElementPanel } from './CustomizerElementPanel';
import { CustomizerPreviewModal } from './CustomizerPreviewModal';
import { useCart } from '../../context/CartContext';
import { soundEffects } from '../../lib/soundEffects';

interface ArrangementCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseProduct: Product | null;
  allProducts?: Product[];
  onSelectBaseProduct?: (p: Product) => void;
}

export const ArrangementCustomizerModal: React.FC<ArrangementCustomizerModalProps> = ({
  isOpen,
  onClose,
  baseProduct,
  allProducts = [],
  onSelectBaseProduct,
}) => {
  const { addItem } = useCart();

  // Selected base product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(baseProduct);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Catalog of elements
  const [catalogElements, setCatalogElements] = useState<CustomizerElementItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Placed objects on Canvas
  const [elements, setElements] = useState<CanvasPlacedElement[]>([]);
  const [texts, setTexts] = useState<CanvasTextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<{
    elements: CanvasPlacedElement[];
    texts: CanvasTextElement[];
  }[]>([]);
  const [redoStack, setRedoStack] = useState<{
    elements: CanvasPlacedElement[];
    texts: CanvasTextElement[];
  }[]>([]);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDesign, setPreviewDesign] = useState<ArrangementDesignData | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Sync base product when changed
  useEffect(() => {
    if (baseProduct) {
      setSelectedProduct(baseProduct);
      setSelectedPhotoIndex(0);
    }
  }, [baseProduct]);

  // Load catalog elements
  useEffect(() => {
    const loadElements = async () => {
      setIsLoadingCatalog(true);
      try {
        const elems = await customizerService.getElements('all', true);
        setCatalogElements(elems);
      } catch (err) {
        console.error('Error loading customizer elements:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    if (isOpen) {
      loadElements();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve base product images
  const currentProduct = selectedProduct || allProducts[0] || null;
  const productImages = currentProduct?.images && currentProduct.images.length > 0
    ? currentProduct.images
    : [
        {
          id: 'placeholder',
          product_id: currentProduct?.id || 'prod',
          image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
          position: 1,
        },
      ];

  const currentReferencePhoto = productImages[selectedPhotoIndex]?.image_url || productImages[0]?.image_url;

  // Price calculations
  const basePrice = currentProduct ? currentProduct.price : 45.00;
  const customizationPrice = elements.reduce((sum, el) => sum + el.price, 0);
  const totalPrice = basePrice + customizationPrice;

  // Push to history
  const pushHistory = (newElements: CanvasPlacedElement[], newTexts: CanvasTextElement[]) => {
    setHistory((prev) => [...prev.slice(-20), { elements: [...elements], texts: [...texts] }]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) return;
    soundEffects.playClick();
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, { elements: [...elements], texts: [...texts] }]);
    setElements(previous.elements);
    setTexts(previous.texts);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSelectedId(null);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    soundEffects.playClick();
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, { elements: [...elements], texts: [...texts] }]);
    setElements(next.elements);
    setTexts(next.texts);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setSelectedId(null);
  };

  // Add Element to Canvas
  const handleAddElement = (catalogItem: CustomizerElementItem) => {
    pushHistory(elements, texts);

    // Initial position in canvas with slight random offset to prevent stacking
    const randomOffset = (Math.random() - 0.5) * 16;
    const newElement: CanvasPlacedElement = {
      id: `canvas-elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      elementId: catalogItem.id,
      type: catalogItem.category,
      name: catalogItem.name,
      image: catalogItem.image_url,
      x: 50 + randomOffset,
      y: 50 + randomOffset,
      width: catalogItem.default_width || 85,
      height: catalogItem.default_height || 85,
      rotation: 0,
      color: catalogItem.default_color || undefined,
      price: catalogItem.price,
      zIndex: elements.length + texts.length + 1,
    };

    const nextElements = [...elements, newElement];
    setElements(nextElements);
    setSelectedId(newElement.id);
  };

  // Add Text to Canvas
  const handleAddText = (text: string, color: string, fontFamily: string, fontSize: number) => {
    pushHistory(elements, texts);

    const randomOffset = (Math.random() - 0.5) * 10;
    const newText: CanvasTextElement = {
      id: `canvas-text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      x: 50 + randomOffset,
      y: 35 + randomOffset,
      fontSize,
      color,
      fontFamily,
      rotation: 0,
      zIndex: elements.length + texts.length + 2,
    };

    const nextTexts = [...texts, newText];
    setTexts(nextTexts);
    setSelectedId(newText.id);
  };

  // Update Elements on Canvas
  const handleUpdateElements = (newElements: CanvasPlacedElement[], recordHistory = true) => {
    if (recordHistory) {
      pushHistory(elements, texts);
    }
    setElements(newElements);
  };

  // Update Texts on Canvas
  const handleUpdateTexts = (newTexts: CanvasTextElement[], recordHistory = true) => {
    if (recordHistory) {
      pushHistory(elements, texts);
    }
    setTexts(newTexts);
  };

  // Update Selected Element Color
  const handleUpdateSelectedColor = (colorHex: string) => {
    if (!selectedId) return;
    pushHistory(elements, texts);
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, color: colorHex } : el))
    );
  };

  // Update Selected Text
  const handleUpdateSelectedText = (text: string, color: string, fontFamily: string, fontSize: number) => {
    if (!selectedId) return;
    pushHistory(elements, texts);
    setTexts((prev) =>
      prev.map((tx) =>
        tx.id === selectedId
          ? { ...tx, text, color, fontFamily, fontSize }
          : tx
      )
    );
  };

  // Delete Selected Element / Text
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    pushHistory(elements, texts);
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setTexts((prev) => prev.filter((tx) => tx.id !== selectedId));
    setSelectedId(null);
  };

  // Duplicate Selected Element / Text
  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    const elem = elements.find((e) => e.id === selectedId);
    if (elem) {
      pushHistory(elements, texts);
      const duplicate: CanvasPlacedElement = {
        ...elem,
        id: `canvas-elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: Math.min(90, elem.x + 6),
        y: Math.min(90, elem.y + 6),
        zIndex: elements.length + texts.length + 1,
      };
      setElements([...elements, duplicate]);
      setSelectedId(duplicate.id);
      return;
    }

    const tx = texts.find((t) => t.id === selectedId);
    if (tx) {
      pushHistory(elements, texts);
      const duplicate: CanvasTextElement = {
        ...tx,
        id: `canvas-text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: Math.min(90, tx.x + 6),
        y: Math.min(90, tx.y + 6),
        zIndex: elements.length + texts.length + 1,
      };
      setTexts([...texts, duplicate]);
      setSelectedId(duplicate.id);
    }
  };

  // Bring to Front
  const handleBringToFront = () => {
    if (!selectedId) return;
    pushHistory(elements, texts);
    const maxZ = Math.max(...elements.map((e) => e.zIndex), ...texts.map((t) => t.zIndex), 1);
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, zIndex: maxZ + 1 } : el))
    );
    setTexts((prev) =>
      prev.map((tx) => (tx.id === selectedId ? { ...tx, zIndex: maxZ + 1 } : tx))
    );
  };

  // Send to Back
  const handleSendToBack = () => {
    if (!selectedId) return;
    pushHistory(elements, texts);
    const minZ = Math.min(...elements.map((e) => e.zIndex), ...texts.map((t) => t.zIndex), 1);
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, zIndex: Math.max(1, minZ - 1) } : el))
    );
    setTexts((prev) =>
      prev.map((tx) => (tx.id === selectedId ? { ...tx, zIndex: Math.max(1, minZ - 1) } : tx))
    );
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (elements.length === 0 && texts.length === 0) return;
    if (window.confirm('¿Deseas reiniciar el diseño del lienzo?')) {
      pushHistory(elements, texts);
      setElements([]);
      setTexts([]);
      setSelectedId(null);
    }
  };

  // Continue to Order -> Open Preview Modal
  const handleContinueToOrder = () => {
    soundEffects.playPop();

    // Compile design summary
    const elementCounts = elements.reduce((acc, el) => {
      acc[el.name] = (acc[el.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryParts = Object.entries(elementCounts).map(([name, qty]) => `${qty}x ${name}`);
    if (texts.length > 0) {
      summaryParts.push(`Dedicatoria: "${texts[0].text}"`);
    }

    const design: ArrangementDesignData = {
      productId: currentProduct?.id,
      productName: currentProduct?.name || 'Arreglo Personalizado',
      referenceImage: currentReferencePhoto,
      elements,
      texts,
      basePrice,
      customizationPrice,
      totalPrice,
      summaryText: summaryParts.join(' · '),
    };

    setPreviewDesign(design);
    setIsPreviewOpen(true);
  };

  // Confirm in Preview Modal -> Add to Cart & Open Cart Drawer
  const handleConfirmAddToCart = async () => {
    if (!previewDesign || !currentProduct) return;

    // Save design configuration to local / Supabase
    await customizerService.saveDesign(previewDesign);

    // Map to GiftCustomization schema for compatibility with cart and order service
    const customPayload = {
      balloonText: texts[0]?.text || '',
      balloonType: elements.find((e) => e.type === 'globos')?.name || 'Globo Personalizado',
      vinylColor: texts[0]?.color || 'Dorado Metálico',
      colorPalette: 'Personalizada en Estudio',
      ribbonType: elements.find((e) => e.type === 'cintas')?.name || 'Satén Sedoso',
      plushToy: elements.find((e) => e.type === 'peluches')?.name || 'Sin peluche',
      plushPrice: elements.find((e) => e.type === 'peluches')?.price || 0,
      extras: elements.map((e) => ({ name: e.name, price: e.price })),
    };

    // Add to cart with full customization payload and total calculated price
    addItem(currentProduct, 1, {
      customization: customPayload,
      customPrice: totalPrice,
      dedication: texts[0]?.text,
    });

    setIsPreviewOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-6xl bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden my-auto border border-[#E8DED7] flex flex-col max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-[#EBE2DB] bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#763D8B] text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-4 h-4 text-[#F6E3BA]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base sm:text-lg font-bold text-[#2E2421]">
                  Personalización de Arreglos
                </span>
                <span className="px-2 py-0.5 bg-[#763D8B]/10 text-[#763D8B] text-[10px] font-bold rounded-full uppercase">
                  Estudio Visual
                </span>
              </div>
              <p className="text-[11px] text-[#7A6B63] hidden sm:block">
                Diseña, arrastra y combina flores, globos, peluches y dedicatorias a tu medida.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-stone-500 block leading-tight">Total Estimado:</span>
              <span className="text-lg font-bold text-[#763D8B]">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar personalizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 lg:p-7 space-y-7">
          
          {/* ========================================================================= */}
          {/* 1. SECCIÓN: IMAGEN DE REFERENCIA                                         */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8DED7] shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Reference Image Large Display with Carousel controls */}
              <div className="relative w-full md:w-5/12 max-w-[340px] aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#F5EFEB] to-[#EAE2DC] border border-[#DFCFC1] shadow-inner shrink-0 group">
                <img
                  src={currentReferencePhoto}
                  alt={currentProduct?.name || 'Arreglo de Referencia'}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />

                {/* Photo arrows if multiple photos */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md cursor-pointer transition-all"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev === productImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md cursor-pointer transition-all"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Badge */}
                <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                  Foto de Referencia
                </div>

                {/* Indicator */}
                <div className="absolute bottom-3 right-3 bg-white/90 text-stone-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                  {selectedPhotoIndex + 1} / {productImages.length}
                </div>
              </div>

              {/* Text & Base Product Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#C19B65]/15 text-[#8E6D38] text-[10px] font-bold uppercase rounded-full">
                    Arreglo Base
                  </span>
                  <span className="text-xs text-stone-500">· SKU: {currentProduct?.sku || 'BD-ARREG'}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E2421]">
                  Personaliza tu arreglo
                </h2>

                <p className="text-xs sm:text-sm text-[#7A6B63] font-light leading-relaxed">
                  Modifica el diseño como quieras y crea una idea de cómo quieres que quede tu arreglo. Agrega flores frescas, globos, chocolates, peluches y dedicatorias en vinilo.
                </p>

                {/* Base Product Selector (If user wants to choose another arrangement from catalog) */}
                {allProducts.length > 1 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Cambiar Arreglo Base de Referencia:
                    </label>
                    <select
                      value={currentProduct?.id || ''}
                      onChange={(e) => {
                        const found = allProducts.find((p) => p.id === e.target.value);
                        if (found) {
                          setSelectedProduct(found);
                          setSelectedPhotoIndex(0);
                          onSelectBaseProduct?.(found);
                        }
                      }}
                      className="w-full max-w-sm text-xs p-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 font-medium"
                    >
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Thumbnails row for reference images */}
                {productImages.length > 1 && (
                  <div className="pt-2 flex items-center gap-2 overflow-x-auto">
                    {productImages.map((img, idx) => (
                      <button
                        type="button"
                        key={img.id || idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPhotoIndex === idx
                            ? 'border-[#763D8B] scale-105 shadow-xs'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt="Miniatura"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2 & 3. LIENZO DE PERSONALIZACIÓN + PANEL DE ELEMENTOS                      */}
          {/* Responsive Layout: Side-by-side on desktop, stacked on mobile            */}
          {/* ========================================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#763D8B] font-bold uppercase tracking-wider block">
                  Lienzo Interactivo 2D
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2E2421]">
                  Editor Visual de Composición
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="text-xs text-stone-500 hover:text-rose-600 font-medium cursor-pointer"
              >
                Limpiar lienzo
              </button>
            </div>

            {/* Canvas + Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left on PC: The Interactive Canvas */}
              <div className="lg:col-span-7 flex flex-col gap-2">
                <InteractiveArrangementCanvas
                  elements={elements}
                  texts={texts}
                  selectedId={selectedId}
                  onSelectId={setSelectedId}
                  onUpdateElements={handleUpdateElements}
                  onUpdateTexts={handleUpdateTexts}
                  onDeleteSelected={handleDeleteSelected}
                  onDuplicateSelected={handleDuplicateSelected}
                  onBringToFront={handleBringToFront}
                  onSendToBack={handleSendToBack}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={history.length > 0}
                  canRedo={redoStack.length > 0}
                  referenceImageUrl={currentReferencePhoto}
                  canvasRef={canvasRef}
                />
              </div>

              {/* Right on PC, Below on Mobile: The Elements Panel */}
              <div className="lg:col-span-5 h-full">
                <CustomizerElementPanel
                  elementsList={catalogElements}
                  selectedId={selectedId}
                  placedElements={elements}
                  placedTexts={texts}
                  onAddElement={handleAddElement}
                  onAddText={handleAddText}
                  onUpdateSelectedColor={handleUpdateSelectedColor}
                  onUpdateSelectedText={handleUpdateSelectedText}
                  onDeleteSelected={handleDeleteSelected}
                />
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 6. INFORMACIÓN DEL PEDIDO / RESUMEN EN TIEMPO REAL                        */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DED7] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] text-[#763D8B] font-bold uppercase tracking-wider block">
                  Resumen de tu Diseño
                </span>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  Detalles del Arreglo Personalizado
                </h4>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] text-stone-500 block">Total con tu personalización:</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#763D8B]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Elements list summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#FAF7F4] rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-800 block mb-1">Producto Base:</span>
                <span className="text-stone-600 block">{currentProduct?.name || 'Arreglo Especial'}</span>
                <span className="font-bold text-stone-900 mt-1 block">${basePrice.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-[#FAF7F4] rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-800 block mb-1">
                  Elementos en Lienzo ({elements.length}):
                </span>
                {elements.length === 0 ? (
                  <span className="text-stone-400 italic">Ningún accesorio añadido</span>
                ) : (
                  <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                    {elements.map((el) => (
                      <div key={el.id} className="flex justify-between text-stone-600">
                        <span className="truncate max-w-[120px]">{el.name}</span>
                        <span className="font-medium">+${el.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <span className="font-bold text-[#763D8B] mt-1 block">
                  Subtotal: +${customizationPrice.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F4] rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-800 block mb-1">
                  Dedicatoria en Lienzo:
                </span>
                {texts.length === 0 ? (
                  <span className="text-stone-400 italic">Sin texto personalizado</span>
                ) : (
                  <div className="space-y-1">
                    {texts.map((t) => (
                      <p key={t.id} className="italic text-[#763D8B] font-semibold line-clamp-2">
                        «{t.text}»
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Trust guarantees bar */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-[#7A6B63] font-light gap-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#763D8B]" />
                <span>Despacho con embalaje seguro en Ciudad de Panamá</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#763D8B]" />
                <span>El arreglo se elaborará idéntico a tu diseño final</span>
              </span>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* 7. BOTÓN FINAL: CONTINUAR CON MI PEDIDO                                  */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#EBE2DB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-stone-500 block">Total con tu personalización:</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2E2421]">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleContinueToOrder}
              className="btn-cta-emil flex-1 sm:flex-initial py-3.5 px-8 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUAR CON MI PEDIDO</span>
              <ArrowRight className="w-4 h-4 text-[#F6E3BA]" />
            </button>
          </div>
        </div>
      </div>

      {/* 8. VISTA PREVIA FINAL MODAL */}
      <CustomizerPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        designData={previewDesign}
        onConfirmAddToCart={handleConfirmAddToCart}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Truck, 
  Store, 
  CreditCard, 
  Calendar, 
  Send, 
  AlertCircle, 
  Gift, 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings, Order } from '../types/database';
import { orderService } from '../services/orderService';

interface CheckoutModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  settings,
  onClose,
  onOrderCompleted,
}) => {
  const { items, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'Yappy' | 'Tarjeta'>('Yappy');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedImage, setCopiedImage] = useState(false);

  if (!isOpen) return null;

  const deliveryCost = deliveryType === 'delivery' ? settings.delivery_fee || 5.0 : 0;
  const grandTotal = subtotal + deliveryCost;

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('El comprobante es muy grande (máximo 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setReceiptImage(ev.target.result as string);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyReceipt = async () => {
    if (!receiptImage) return;
    try {
      // Convert data URL to Blob for clipboard
      const res = await fetch(receiptImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 3000);
    } catch (err) {
      // Fallback
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 3000);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa tu nombre y número de teléfono.');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      setErrorMsg('Por favor ingresa la dirección de entrega para el delivery.');
      return;
    }

    if (!deliveryDate) {
      setErrorMsg('Por favor selecciona la fecha deseada para la entrega o retiro.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { order, error } = await orderService.createOrder(
        {
          customer_name: fullName,
          customer_email: email || 'cliente@ballonsdei.com',
          customer_phone: phone,
          delivery_address: deliveryType === 'delivery' ? address : `Retiro en Boutique ${settings.store_name || 'Ballonsdei'}`,
          delivery_date: deliveryDate,
          delivery_type: deliveryType,
          payment_method: paymentMethod,
          notes,
          receipt_url: receiptImage,
          receipt_ref: receiptRef.trim() || null,
        },
        items,
        deliveryCost
      );

      if (error || !order) {
        throw error || new Error('No se pudo procesar el pedido');
      }

      setCompletedOrder(order);
      clearCart();
      if (onOrderCompleted) {
        onOrderCompleted(order);
      }

      // Automatically register & redirect to WhatsApp with order details & receipt reference
      const waUrl = getWhatsAppSummaryUrl(order, receiptRef, !!receiptImage);
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.warn('Popup blocked, WhatsApp link available on screen:', e);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registrando el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppSummaryUrl = (order: Order, receiptRefParam?: string, hasReceiptImage?: boolean) => {
    const cleanPhone = (settings.whatsapp_number || '+50760000000').replace(/[^0-9]/g, '');
    const productList = (order.order_items || [])
      .map((it) => {
        let text = `• ${it.quantity}x ${it.product_name} ($${it.total_price.toFixed(2)})`;
        if (it.customization) {
          const c = it.customization;
          const details: string[] = [];
          if (c.balloonType) details.push(`  🎈 Globo: ${c.balloonType}`);
          if (c.balloonText) details.push(`  ✍️ Frase en globo: "${c.balloonText}" (${c.vinylColor || 'Vinilo'})`);
          if (c.colorPalette) details.push(`  🎨 Colores: ${c.colorPalette}`);
          if (c.ribbonType) details.push(`  🎀 Lazo: ${c.ribbonType}`);
          if (c.plushToy && c.plushToy !== 'Sin peluche') details.push(`  🧸 Peluche: ${c.plushToy}`);
          if (c.extras && c.extras.length > 0) details.push(`  ✨ Extras: ${c.extras.map((e) => e.name).join(', ')}`);
          if (details.length > 0) {
            text += '\n' + details.join('\n');
          }
        }
        if (it.dedication_message) {
          text += `\n  💌 Dedicatoria tarjeta: "${it.dedication_message}"`;
        }
        return text;
      })
      .join('\n\n');

    const ref = receiptRefParam || order.receipt_ref || '';
    const hasImage = hasReceiptImage || !!order.receipt_url;

    let receiptSummary = '';
    if (order.payment_method === 'Yappy') {
      if (ref && hasImage) {
        receiptSummary = `*Comprobante Yappy:* Adjunto ✅ (Ref #${ref})\n`;
      } else if (hasImage) {
        receiptSummary = `*Comprobante Yappy:* Adjunto en captura ✅\n`;
      } else if (ref) {
        receiptSummary = `*Comprobante Yappy:* Ref #${ref}\n`;
      } else {
        receiptSummary = `*Comprobante Yappy:* Por enviar por este chat\n`;
      }
    }

    const msg = `¡Hola ${settings.store_name || 'Ballonsdei'}! Acabo de registrar mi pedido #${order.order_number}:\n\n` +
      `*Cliente:* ${order.customer_name}\n` +
      `*Teléfono:* ${order.customer_phone}\n` +
      `*Fecha Deseada:* ${order.delivery_date}\n` +
      `*Modalidad:* ${order.delivery_type === 'delivery' ? 'Envío a domicilio' : 'Retiro en Boutique'}\n` +
      (order.delivery_type === 'delivery' ? `*Dirección:* ${order.delivery_address}\n` : '') +
      `*Método de Pago:* ${order.payment_method}\n` +
      receiptSummary +
      `\n*Productos Solicitados:*\n${productList}\n\n` +
      `*Total a Pagar:* $${order.total.toFixed(2)}\n\n` +
      (order.notes ? `*Nota/Dedicatoria:* ${order.notes}\n\n` : '') +
      (hasImage 
        ? `📸 *(Te adjunto la imagen del comprobante de Yappy a continuación)* 👇✨`
        : `Quedo atento a su confirmación. ¡Muchas gracias!`);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl overflow-hidden my-auto border border-[#E8DED7] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EBE2DB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#2E2421]">
              {completedOrder ? '¡Pedido Registrado con Éxito!' : 'Finalizar Pedido'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#F2ECE6] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1">
          {completedOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#8D5844] font-medium block">
                  Código de Pedido
                </span>
                <h3 className="font-serif text-3xl font-medium text-[#2E2421] mt-1">
                  #{completedOrder.order_number}
                </h3>
                <p className="text-xs text-[#7A6B63] mt-2 max-w-md mx-auto font-light">
                  Hemos guardado tu pedido en nuestro sistema. A continuación puedes enviar tu confirmación directa por WhatsApp a nuestro equipo para coordinar la entrega.
                </p>
              </div>

              {/* Order quick summary box */}
              <div className="p-4 bg-white rounded-xl border border-[#EBE2DB] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#7A6B63]">Cliente:</span>
                  <span className="font-medium text-[#2E2421]">{completedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6B63]">Fecha solicitada:</span>
                  <span className="font-medium text-[#2E2421]">{completedOrder.delivery_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6B63]">Método de Pago:</span>
                  <span className="font-medium text-[#2E2421]">{completedOrder.payment_method}</span>
                </div>
                {completedOrder.receipt_ref && (
                  <div className="flex justify-between">
                    <span className="text-[#7A6B63]">Ref. Comprobante Yappy:</span>
                    <span className="font-semibold text-emerald-700">#{completedOrder.receipt_ref}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7A6B63]">Total a liquidar:</span>
                  <span className="font-bold text-[#8D5844] text-sm">${completedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6B63]">Estado:</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-xs font-medium">
                    Pendiente de confirmación
                  </span>
                </div>
              </div>

              {/* Receipt Preview if attached */}
              {receiptImage && (
                <div className="p-4 bg-white rounded-xl border border-emerald-200 max-w-md mx-auto text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Comprobante de Pago Yappy Adjuntado
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyReceipt}
                      className="text-[11px] text-[#8D5844] hover:underline flex items-center gap-1"
                    >
                      {copiedImage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedImage ? '¡Copiado!' : 'Copiar Imagen'}</span>
                    </button>
                  </div>
                  <div className="aspect-16/9 max-h-40 rounded-lg overflow-hidden border border-[#EDE5DF] bg-[#FAF8F5]">
                    <img src={receiptImage} alt="Comprobante Yappy" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-[#7A6B63]">
                    Al abrir WhatsApp, tu mensaje llevará la confirmación. Si deseas, puedes pegar también la captura en el chat.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={getWhatsAppSummaryUrl(completedOrder, receiptRef, !!receiptImage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido y Comprobante por WhatsApp</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#FAF8F5] hover:bg-[#EFE8E2] text-[#423530] border border-[#D5C2B8] text-xs sm:text-sm font-medium tracking-wider uppercase rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Order Items Snapshot */}
              <div className="p-4 bg-white rounded-xl border border-[#EDE5DF] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#8D5844]" />
                  Resumen de Compra ({items.length} artículos)
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.product_id} className="flex justify-between text-xs text-[#423530]">
                      <span className="truncate max-w-[260px]">
                        {it.quantity}x {it.product_name}
                      </span>
                      <span className="font-medium">${it.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#F2ECE6] flex justify-between text-xs font-semibold text-[#2E2421]">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52]">
                  1. Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#423530] block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Sofía Valdés"
                      className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#423530] block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. +507 6000-0000"
                      className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#423530] block mb-1">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Preferences */}
              <div className="space-y-4 pt-2 border-t border-[#EBE2DB]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52]">
                  2. Entrega y Fechas
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-[#8D5844] bg-[#8D5844]/5 ring-1 ring-[#8D5844]'
                        : 'border-[#D5C2B8] bg-white'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#8D5844]" />
                    <div>
                      <span className="text-xs font-semibold text-[#2E2421] block">Envío a Domicilio</span>
                      <span className="text-[10px] text-[#7A6B63]">+${settings.delivery_fee.toFixed(2)} tarifa</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-[#8D5844] bg-[#8D5844]/5 ring-1 ring-[#8D5844]'
                        : 'border-[#D5C2B8] bg-white'
                    }`}
                  >
                    <Store className="w-5 h-5 text-[#8D5844]" />
                    <div>
                      <span className="text-xs font-semibold text-[#2E2421] block">Retiro en Boutique</span>
                      <span className="text-[10px] text-[#7A6B63]">Sin costo adicional</span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#423530] block mb-1">Fecha Deseada *</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                      />
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-[#423530] block mb-1">Dirección de Entrega Exacta *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Edificio, casa, calle o referencias para el mensajero"
                        className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 pt-2 border-t border-[#EBE2DB]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A52]">
                  3. Método de Pago (Yappy o Tarjeta)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {(['Yappy', 'Tarjeta'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === method
                          ? 'border-[#8D5844] bg-[#8D5844] text-white shadow-xs'
                          : 'border-[#D5C2B8] bg-white text-[#423530] hover:bg-[#F2ECE6]'
                      }`}
                    >
                      {method === 'Yappy' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>{method === 'Yappy' ? 'Yappy' : 'Tarjeta de Crédito / Débito'}</span>
                    </button>
                  ))}
                </div>

                {/* Dedicated Yappy Payment Box & Receipt Uploader */}
                {paymentMethod === 'Yappy' && (
                  <div className="p-4 bg-gradient-to-br from-[#FAF5F7] to-[#F5EFF3] rounded-xl border border-[#E2D2DC] space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8D9E3]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#763D8B] text-white text-[11px] font-bold rounded-sm uppercase tracking-wide">
                          Yappy
                        </span>
                        <span className="text-xs font-semibold text-[#2E2421]">
                          Pagar a: {settings.store_name || 'Ballonsdei'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#763D8B]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-[#52404E] space-y-1">
                      <p>
                        <strong>1.</strong> Entra a tu app de Banco General / Yappy y envía <strong>${grandTotal.toFixed(2)}</strong> al número:{' '}
                        <strong className="text-[#2E2421] bg-white px-2 py-0.5 rounded border border-[#E0D3DB]">
                          {settings.whatsapp_number || settings.phone || '+507 6000-0000'}
                        </strong>
                      </p>
                      <p>
                        <strong>2.</strong> Toma una captura de pantalla del comprobante y súbela aquí abajo:
                      </p>
                    </div>

                    {/* Receipt File Upload */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-medium text-[#423530] block">
                        Comprobante de Pago Yappy (Foto o Captura) *
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 border-2 border-dashed border-[#CBB8C5] hover:border-[#763D8B] bg-white p-3 rounded-lg text-center cursor-pointer transition-colors group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center gap-2 text-xs text-[#763D8B] group-hover:text-[#58256B]">
                            <Upload className="w-4 h-4 shrink-0" />
                            <span className="font-medium">
                              {receiptImage ? 'Cambiar imagen de comprobante' : 'Subir captura de Yappy'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8A796F] block mt-0.5">
                            Formatos PNG, JPG o WEBP (máx. 5MB)
                          </span>
                        </label>
                      </div>

                      {/* Receipt Preview */}
                      {receiptImage && (
                        <div className="p-2.5 bg-white rounded-lg border border-emerald-300 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-12 h-12 rounded bg-[#FAF8F5] overflow-hidden border border-[#E8DED7] shrink-0">
                              <img src={receiptImage} alt="Comprobante" className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Comprobante cargado
                              </span>
                              <span className="text-[10px] text-[#7A6B63] block truncate">
                                Listo para enviar con tu pedido a WhatsApp
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1 font-medium"
                          >
                            Quitar
                          </button>
                        </div>
                      )}

                      {/* Receipt Reference Input */}
                      <div>
                        <label className="text-[11px] font-medium text-[#423530] block mb-1">
                          N° de Confirmación o Referencia Yappy (Opcional)
                        </label>
                        <input
                          type="text"
                          value={receiptRef}
                          onChange={(e) => setReceiptRef(e.target.value)}
                          placeholder="Ej. #948271 o nombre en Yappy"
                          className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#763D8B] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-[#7A6B63] italic">
                  * Al confirmar el pedido, serás redirigido automáticamente a WhatsApp con el detalle de tu compra y tu comprobante listo.
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-2 border-t border-[#EBE2DB]">
                <label className="text-xs font-medium text-[#423530] block">
                  Notas Adicionales o Dedicatoria para Tarjeta:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe aquí tu dedicatoria especial o indicaciones para el timbre/portería..."
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                />
              </div>

              {/* Final Total and Action */}
              <div className="p-4 bg-[#F2ECE6] rounded-xl border border-[#E3D7CE] space-y-2">
                <div className="flex justify-between text-xs text-[#6B5A52]">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between text-xs text-[#6B5A52]">
                    <span>Costo de Envío:</span>
                    <span>${deliveryCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#2E2421] pt-2 border-t border-[#DFD1C6]">
                  <span>Total a Pagar:</span>
                  <span className="text-[#8D5844]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#8D5844] hover:bg-[#744533] disabled:bg-[#D5C2B8] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Guardando Pedido...</span>
                ) : (
                  <>
                    <span>Confirmar y Enviar Pedido</span>
                    <span>(${grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

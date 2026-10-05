import React from 'react';
import { ArrowRight, SlidersHorizontal, CheckCircle2, Phone } from 'lucide-react';

interface AtelierCraftsmanshipProps {
  onOpenCustomizer?: () => void;
  onExploreCatalog?: () => void;
}

export const AtelierCraftsmanship: React.FC<AtelierCraftsmanshipProps> = ({
  onOpenCustomizer,
  onExploreCatalog,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Selección Botánica Matutina',
      desc: 'Cada arreglo comienza al amanecer con la inspección individual de rosas ecuatorianas y follajes importados, garantizando pétalos turgentes y fragancia viva.',
    },
    {
      num: '02',
      title: 'Caligrafía & Globos de Foil Europeo',
      desc: 'Rotulamos dedicatorias personalizadas con vinilo de alta adherencia sobre globos de látex orgánico 100% biodegradable y burbujas de acabado cristal.',
    },
    {
      num: '03',
      title: 'Fidelidad al Lienzo 2D',
      desc: 'Nuestros maestros floristas reciben las coordenadas exactas de lo que compones en la pantalla: tipo de base, cinta de tela, peluche y mensajes.',
    },
    {
      num: '04',
      title: 'Despacho Climatizado & Foto Previa',
      desc: 'Antes de salir a la ruta en Ciudad de Panamá, recibes una fotografía en alta resolución de tu creación terminada por WhatsApp para tu absoluta tranquilidad.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F4] border-t border-[#EAE3DC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.26em] uppercase text-[#7D5B28] mb-3">
            <span>SAVOIR-FAIRE ARTISANAL</span>
            <span className="text-[#C5A059]">✦</span>
            <span>PANAMÁ</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#241A23] font-light tracking-tight leading-tight">
            De la Inspiración al Regalo: <br />
            <span className="italic font-normal text-[#763D8B]">La Excelencia del Detalle Hecho a Mano</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#6E5A69] font-light leading-relaxed max-w-2xl">
            Rechazamos la producción en serie. Cada bouquet y caja sombrerera es concebida como una obra irrepetible que fusiona la botánica fresca con el arte moderno en globos.
          </p>
        </div>

        {/* Asymmetrical Craftsmanship Spread (Breaking the 4-card template) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Left: The 4 Steps in Editorial Sequential Flow */}
          <div className="lg:col-span-7 divide-y divide-[#EAE3DC] border-y border-[#EAE3DC]">
            {steps.map((step) => (
              <div key={step.num} className="py-6 sm:py-7 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group">
                <span className="font-serif text-2xl sm:text-3xl text-[#C5A059] font-light shrink-0">
                  {step.num}
                </span>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-serif text-lg sm:text-xl font-normal text-[#241A23] group-hover:text-[#763D8B] transition-colors duration-150">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#73636F] font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: The Physical Atelier Workshop Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3DC] shadow-sm space-y-6">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FAF6F2] relative">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                  alt="Taller de flores y globos Ballonsdei"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[10px] font-semibold tracking-widest uppercase block text-[#F3E2C4]">
                    Taller & Boutique
                  </span>
                  <span className="font-serif text-sm font-light">
                    Ciudad de Panamá
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-xl font-normal text-[#241A23]">
                  ¿Tienes una visión o paleta particular?
                </h4>
                <p className="text-xs sm:text-sm text-[#73636F] font-light leading-relaxed">
                  Ingresa al estudio interactivo 2D y combina globos, flores, peluches y dedicatorias con desglose inmediato de presupuesto, o solicita una asesoría por WhatsApp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {onOpenCustomizer && (
                  <button
                    type="button"
                    onClick={onOpenCustomizer}
                    className="btn-tactile flex-1 py-3 px-5 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-semibold tracking-wider uppercase rounded-full shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-[background-color,transform] duration-150 active:scale-[0.97]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Abrir Lienzo 2D</span>
                  </button>
                )}

                {onExploreCatalog && (
                  <button
                    type="button"
                    onClick={onExploreCatalog}
                    className="btn-tactile py-3 px-5 bg-white hover:bg-[#FAF4F7] text-[#241A23] border border-[#D9C8D4] text-xs font-semibold tracking-wider uppercase rounded-full flex items-center justify-center gap-2 cursor-pointer transition-[border-color,background-color] duration-150 active:scale-[0.97]"
                  >
                    <span>Ver Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

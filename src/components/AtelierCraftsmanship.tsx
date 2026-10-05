import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, SlidersHorizontal } from 'lucide-react';

interface AtelierCraftsmanshipProps {
  onOpenCustomizer?: () => void;
  onExploreCatalog?: () => void;
}

export const AtelierCraftsmanship: React.FC<AtelierCraftsmanshipProps> = ({
  onOpenCustomizer,
  onExploreCatalog,
}) => {
  const pillars = [
    {
      number: '01',
      title: 'Selección Botánica de Autor',
      desc: 'Flores de corte fresco seleccionadas a mano cada mañana. Garantía de durabilidad y fragancia natural en cada composición.',
    },
    {
      number: '02',
      title: 'Globos de Lujo & Vinilo Personalizado',
      desc: 'Látex orgánico 100% biodegradable y foil de manufactura europea, rotulados con caligrafía artística de alta resolución.',
    },
    {
      number: '03',
      title: 'Lienzo de Composición 2D en Vivo',
      desc: 'Nuestra tecnología visual te permite combinar flores, globos, peluches y dedicatorias con desglose exacto de inversión.',
    },
    {
      number: '04',
      title: 'Entrega VIP & Guante Blanco',
      desc: 'Vehículos con climatización controlada y confirmación fotográfica enviada a tu WhatsApp antes de salir a la ruta.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F4] border-t border-[#EAE3DC] relative overflow-hidden">
      {/* Decorative Gold Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#D4AF37]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D4AF37]/35 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#7D5B28]">
              L'ART DE LA CÉLÉBRATION
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#241A23] font-light tracking-tight leading-tight">
            La Excelencia del Detalle en Cada <span className="italic font-normal text-[#763D8B]">Creación</span>
          </h2>

          <div className="flex items-center justify-center gap-3 py-1">
            <span className="w-12 h-px bg-[#D4AF37]/40" />
            <span className="text-[#C5A059] text-xs">✦</span>
            <span className="w-12 h-px bg-[#D4AF37]/40" />
          </div>

          <p className="text-sm sm:text-base text-[#6E5A69] font-light leading-relaxed">
            Fusionamos la alta floristería internacional con técnicas vanguardistas de arte en globos y una plataforma digital que te permite diseñar tu regalo ideal en tiempo real.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-14">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-7 border border-[#E9DFD8] hover:border-[#D4AF37]/60 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-[#C5A059] block group-hover:scale-105 transition-transform duration-300">
                  {pillar.number}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#241A23] leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#73636F] font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-[#F2ECE6] flex items-center justify-between">
                <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-[#8B6E47]">
                  Estándar Atelier
                </span>
                <span className="w-2 h-2 rounded-full bg-[#C5A059]/40 group-hover:bg-[#763D8B] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Rolex-Style Bottom Banner with Atelier Visual */}
        <div className="rounded-3xl bg-gradient-to-r from-[#241228] via-[#2F1535] to-[#241228] text-white p-8 sm:p-12 border border-[#C5A059]/35 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Subtle Ambient Vignette */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#763D8B]/30 blur-2xl pointer-events-none" />
          
          <div className="space-y-3 text-center lg:text-left max-w-2xl relative z-10">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase block">
              EXPERIENCIA A MEDIDA
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-tight">
              ¿Deseas una composición única que no esté en el catálogo?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Ingresa al estudio de composición 2D y diseña cada elemento, o escríbenos directamente por WhatsApp para una asesoría exclusiva con nuestros maestros artesanos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 relative z-10 w-full sm:w-auto">
            {onOpenCustomizer && (
              <button
                type="button"
                onClick={onOpenCustomizer}
                className="btn-cta-emil w-full sm:w-auto px-7 py-3.5 bg-[#C5A059] hover:bg-[#B38D48] text-[#1E0D22] text-xs font-bold tracking-[0.16em] uppercase rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#1E0D22]" />
                <span>Abrir Lienzo 2D</span>
              </button>
            )}

            {onExploreCatalog && (
              <button
                type="button"
                onClick={onExploreCatalog}
                className="btn-tactile w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-semibold tracking-[0.16em] uppercase rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

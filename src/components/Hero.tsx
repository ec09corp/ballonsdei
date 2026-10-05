import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, SlidersHorizontal, Award, Shield, Clock, Compass } from 'lucide-react';
import { StoreSettings } from '../types/database';

interface HeroProps {
  settings: StoreSettings;
  onExplore: (category?: string) => void;
  onOpenCustomizer?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExplore, onOpenCustomizer }) => {
  const [scrollY, setScrollY] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth scroll listener for multi-layer parallax
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D perspective mouse tilt for the luxury visual showcase
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    setIsHoveringCard(false);
    setTilt({ x: 0, y: 0 });
  };

  // Parallax offsets
  const backgroundParallax = scrollY * 0.18;
  const imageParallax = scrollY * 0.08;
  const badgeParallax = -scrollY * 0.05;

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-4 pb-12 sm:pb-20 border-b border-[#EAE3DC]">
      {/* Background Parallax Atmospheric Ambient Glow */}
      <div 
        className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#763D8B]/8 via-[#D4AF37]/6 to-transparent blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(0, ${backgroundParallax}px, 0)`,
        }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#D4AF37]/8 via-[#763D8B]/5 to-transparent blur-3xl pointer-events-none"
        style={{
          transform: `translate3d(0, ${-backgroundParallax * 0.7}px, 0)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Rolex-Style Haute Horlogerie Header Tag */}
        <div className="text-center pt-2 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-[#D4AF37]/40 shadow-xs backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#7D5B28]">
              HAUTE FLORISTERIE & BALLOON ATELIER • PANAMÁ
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Monumental Editorial Presentation */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#C5A059] uppercase block font-sans">
                Edición de Autor 2024
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] text-[#241A23] leading-[1.08] font-light tracking-tight">
                {settings.hero_title || (
                  <>
                    La Excelencia de Cada <span className="italic font-normal text-[#763D8B]">Momento</span>
                  </>
                )}
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#6E5A69] font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {settings.hero_subtitle ||
                'Composiciones de alta floristería, globos de lujo con caligrafía en vinilo y mobiliario exclusivo. Diseñados con la precisión del detalle y despachados con servicio de guante blanco en Panamá.'}
            </p>

            {/* CTAs with Emil Kowalski Micro-Interactions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onExplore('flores')}
                className="btn-cta-emil w-full sm:w-auto px-8 py-4 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase shadow-lg shadow-[#763D8B]/20 flex items-center justify-center gap-2.5 rounded-full cursor-pointer group"
              >
                <span>Explorar Colección</span>
                <ArrowRight className="w-4 h-4 text-[#F3E2C4] transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              {onOpenCustomizer ? (
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="btn-tactile w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#FAF4F7] text-[#2E1E2B] border border-[#D9C8D4] hover:border-[#763D8B]/50 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase shadow-xs flex items-center justify-center gap-2.5 rounded-full cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#763D8B]" />
                  <span>Personalizar en Lienzo 2D</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onExplore('regalos-fijos')}
                  className="btn-tactile w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#FAF4F7] text-[#2E1E2B] border border-[#D9C8D4] text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase shadow-xs flex items-center justify-center gap-2 rounded-full cursor-pointer"
                >
                  <span>Descubrir Regalos</span>
                </button>
              )}
            </div>

            {/* Haute Horlogerie Quality Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#EAE3DC] text-center lg:text-left">
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#241A23] block font-normal tracking-tight">
                  100%
                </span>
                <span className="text-[11px] text-[#8A7383] font-light tracking-wide uppercase">
                  Flores Frescas VIP
                </span>
              </div>
              <div className="border-x border-[#EAE3DC] px-2">
                <span className="font-serif text-2xl sm:text-3xl text-[#C5A059] block font-normal tracking-tight">
                  Lienzo 2D
                </span>
                <span className="text-[11px] text-[#8A7383] font-light tracking-wide uppercase">
                  Previsualización Real
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#241A23] block font-normal tracking-tight">
                  Yappy
                </span>
                <span className="text-[11px] text-[#8A7383] font-light tracking-wide uppercase">
                  Pago Inmediato B.G.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Parallax 3D Perspective Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHoveringCard(true)}
              onMouseLeave={handleMouseLeave}
              className="relative mx-auto max-w-lg lg:max-w-none transition-transform duration-200 ease-out"
              style={{
                transform: isHoveringCard
                  ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.01, 1.01, 1.01)`
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
              }}
            >
              {/* Outer Decorative Gold Frame */}
              <div className="absolute -inset-2.5 rounded-3xl border border-[#D4AF37]/35 opacity-70 pointer-events-none transition-all duration-500" />
              
              {/* Main Card with Parallax Image Shift */}
              <div className="relative aspect-4/5 sm:aspect-5/6 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#EDE4DD]">
                <img
                  src={
                    settings.hero_image ||
                    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1800&q=80'
                  }
                  alt={`Arreglos florales y globos en ${settings.store_name || 'Ballonsdei'}`}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-700 ease-out will-change-transform"
                  style={{
                    transform: `translate3d(0, ${imageParallax}px, 0) scale(1.05)`,
                  }}
                  loading="eager"
                />

                {/* Subtle Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1023]/60 via-transparent to-black/10 pointer-events-none" />

                {/* Top Corner Seal */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D4AF37]/50 shadow-sm flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-[10px] font-bold tracking-widest text-[#2E1E2B] uppercase">
                    Pieza de Autor
                  </span>
                </div>

                {/* Floating Bottom Card with Counter-Parallax */}
                <div 
                  className="absolute bottom-5 left-5 right-5 p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-xl border border-[#E7D6DF] shadow-xl flex items-center justify-between gap-4 transition-transform duration-500 ease-out"
                  style={{
                    transform: `translate3d(0, ${badgeParallax}px, 0)`,
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#D4AF37]/40 shrink-0 bg-[#FAF7F9] shadow-xs">
                      <img
                        src={
                          settings.hero_badge_image ||
                          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80'
                        }
                        alt="Diseño Insignia"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#763D8B] font-bold tracking-[0.16em] uppercase block">
                        Diseño Insignia
                      </span>
                      <span className="font-serif text-base sm:text-lg font-medium text-[#241A23] truncate block">
                        {settings.hero_badge_title || 'Bouquet Imperial & Sombrerera'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onExplore('flores')}
                    className="btn-icon-tactile p-3 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-full shadow-md cursor-pointer shrink-0"
                    aria-label="Ver colección insignia"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Haute Horlogerie 4-Pillar Trust Ribbon */}
      <div className="mt-12 sm:mt-16 border-t border-[#EAE3DC] bg-[#FAF6F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-4 h-4 text-[#763D8B]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241A23] tracking-wide uppercase block">
                  Puntualidad Absoluta
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Envíos programados en hora VIP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241A23] tracking-wide uppercase block">
                  Flores & Globos de Autor
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Calidad premium de importación
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-4 h-4 text-[#763D8B]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241A23] tracking-wide uppercase block">
                  Lienzo Interactivo 2D
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Personalización visual en vivo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Shield className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241A23] tracking-wide uppercase block">
                  Garantía de Satisfacción
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Confirmación fotográfica previa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

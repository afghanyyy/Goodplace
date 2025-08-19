"use client";
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { DotButton, useDotButton } from './EmblaCarouselDotButton';
import { PrevButton, NextButton, usePrevNextButtons } from './EmblaCarouselArrowButtons';
import Image from 'next/image';

const luxurySlides = [
  {
    image: '/next.svg',
    title: 'Baccarat Rouge 540',
    desc: 'Aroma mewah, ikonik, dan tahan lama.'
  },
  {
    image: '/vercel.svg',
    title: 'Aqua Universalis',
    desc: 'Segar, ceria, cocok untuk sehari-hari.'
  },
  {
    image: '/window.svg',
    title: 'Oud Satin Mood',
    desc: 'Bold, misterius, dan elegan.'
  }
];

const options = { loop: true, align: 'center', skipSnaps: false };

const EmblaCarousel: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla py-8">
      <div className="embla__viewport overflow-hidden rounded-xl shadow-lg relative" ref={emblaRef}>
        <div className="embla__container flex">
          {luxurySlides.map((slide, idx) => (
            <div className="embla__slide min-w-0 flex-shrink-0 w-full flex flex-col items-center px-4" key={idx}>
              <div className="w-full max-w-xs sm:max-w-sm aspect-square rounded-xl overflow-hidden mb-4">
                <Image src={slide.image} alt={slide.title} width={720} height={720} className="w-full h-full object-cover" />
              </div>
              {/* NEW badge for FRUIROSA slide */}
              {slide.title === 'FRUIROSA' && (
                <div className="flex justify-center mb-2 -mt-1" aria-hidden>
                  <span className="badge-new" data-animate="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="#bfa16a" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.9 4.3L18 8l-4 2.8L14 16l-2-1.4L10 16l.9-5.2L7 8l4.1-1.7L12 2z" />
                    </svg>
                    NEW
                  </span>
                </div>
              )}
              <div className={`${slide.title === 'FRUIROSA' ? 'text-2xl sm:text-3xl font-extrabold' : 'text-lg font-semibold'} text-black text-center`}>{slide.title}</div>
              <div className="text-gray-700 text-center px-2">{slide.desc}</div>
            </div>
          ))}
        </div>
        {/* Arrow buttons overlayed inside viewport */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center px-4 -translate-y-1/2 pointer-events-none">
          <div className="pointer-events-auto">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          </div>
          <div className="pointer-events-auto">
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>
        </div>
      </div>
      {/* Dots below carousel */}
      <div className="embla__controls flex flex-col items-center mt-6">
        <div className="embla__dots flex gap-3 mt-2">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={
                'embla__dot w-4 h-4 rounded-full border-2 border-[#bfa16a] shadow-lg transition-all duration-200 ' +
                (index === selectedIndex
                  ? 'bg-[#bfa16a] scale-110 shadow-[0_0_10px_#bfa16a]'
                  : 'bg-white hover:bg-[#f7e7c1]')
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;

// Usage example (add to your homepage):
// <EmblaCarousel slides={luxurySlides} options={{ loop: true, align: 'center' }} />

import React from 'react';
import { EmblaCarouselType } from 'embla-carousel';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

export const PrevButton: React.FC<ButtonProps> = ({ onClick, disabled, children }) => (
  <button
    className="embla__button embla__button--prev bg-white border-2 border-[#bfa16a] text-[#bfa16a] rounded-full shadow-lg w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-[#bfa16a] hover:text-white disabled:opacity-50"
    onClick={onClick}
    disabled={disabled}
    aria-label="Previous slide"
    type="button"
    style={{ opacity: disabled ? 0.5 : 1 }}
  >
    <svg className="embla__button__svg" viewBox="0 0 532 532" width={24} height={24}>
      <path
        fill="currentColor"
        d="M355.66 11.354c13.793-13.805 36.208-13.805 50.001 0 13.785 13.804 13.785 36.238 0 50.034L201.22 266l204.442 204.61c13.785 13.805 13.785 36.239 0 50.044-13.793 13.796-36.208 13.796-50.002 0a5994246.277 5994246.277 0 0 0-229.332-229.454 35.065 35.065 0 0 1-10.326-25.126c0-9.2 3.393-18.26 10.326-25.2C172.192 194.973 332.731 34.31 355.66 11.354Z"
      />
    </svg>
    {children}
  </button>
);

export const NextButton: React.FC<ButtonProps> = ({ onClick, disabled, children }) => (
  <button
    className="embla__button embla__button--next bg-white border-2 border-[#bfa16a] text-[#bfa16a] rounded-full shadow-lg w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-[#bfa16a] hover:text-white disabled:opacity-50"
    onClick={onClick}
    disabled={disabled}
    aria-label="Next slide"
    type="button"
    style={{ opacity: disabled ? 0.5 : 1 }}
  >
    <svg className="embla__button__svg" viewBox="0 0 532 532" width={24} height={24}>
      <path
        fill="currentColor"
        d="M176.34 520.646c-13.793 13.805-36.208 13.805-50.001 0-13.785-13.804-13.785-36.238 0-50.034L330.78 266 126.34 61.391c-13.785-13.805-13.785-36.239 0-50.044 13.793-13.796 36.208-13.796 50.002 0 22.928 22.947 206.395 206.507 229.332 229.454a35.065 35.065 0 0 1 10.326 25.126c0 9.2-3.393 18.26-10.326 25.2-45.865 45.901-206.404 206.564-229.332 229.52Z"
      />
    </svg>
    {children}
  </button>
);

export function usePrevNextButtons(emblaApi: EmblaCarouselType | undefined) {
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick: () => emblaApi && emblaApi.scrollPrev(),
    onNextButtonClick: () => emblaApi && emblaApi.scrollNext(),
  };
}

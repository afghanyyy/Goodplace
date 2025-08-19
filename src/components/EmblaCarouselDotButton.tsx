"use client";
import React from 'react';

type DotButtonProps = {
  onClick: () => void;
  className?: string;
};

export const DotButton: React.FC<DotButtonProps> = ({ onClick, className }) => {
  const isSelected = className?.includes('embla__dot--selected');
  return (
    <button
      type="button"
      className={className || ''}
      onClick={onClick}
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: isSelected ? '#111' : '#bfa16a',
        margin: '0 4px',
        border: 'none',
        opacity: isSelected ? 1 : 0.5,
        boxShadow: isSelected ? '0 0 8px #111' : '0px 0px 50px #bfa16a',
        transition: 'background 0.3s, box-shadow 0.3s, opacity 0.3s',
      }}
      aria-label="Go to slide"
    />
  );
};

type EmblaApi = {
  scrollSnapList: () => number[];
  selectedScrollSnap: () => number;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  scrollTo: (index: number) => void;
};

export function useDotButton(emblaApi: EmblaApi | null) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick: (index: number) => emblaApi && emblaApi.scrollTo(index),
  };
}

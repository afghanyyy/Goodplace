'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles, Command } from 'lucide-react';
import Image from 'next/image';

// Interface untuk item parfum
interface ParfumItem {
  id?: string;
  name: string;
  desc?: string;
  price?: string;
  images: string[];
}

interface MobileSmartSearchProps {
  openProduct: (product: ParfumItem) => void;
  products: ParfumItem[];
}

export default function MobileSmartSearch({ openProduct, products }: MobileSmartSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParfumItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filteredResults = products.filter((item: ParfumItem) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setSearchResults(filteredResults);
  }, [searchQuery, products]);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={index} className="bg-[#bfa16a]/20 text-[#bfa16a]">{part}</span> : 
        part
    );
  };

  return (
    <div className="lg:hidden w-full">
      {/* Mobile Search Trigger */}
      {!isSearchOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setIsSearchOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="w-full px-4 py-3 flex items-center gap-3 bg-white/95 rounded-xl backdrop-blur-lg border border-black/10 shadow-sm"
        >
          <Search size={18} className="text-black/60" />
          <span className="text-sm text-black/40">Cari Parfum disini...</span>
        </motion.button>
      )}

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-50 pb-safe"
          >
            <div ref={searchRef} className="h-full flex flex-col">
              {/* Search Header */}
              <div className="px-4 py-3 border-b border-black/5 flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 -ml-2 rounded-xl hover:bg-black/5"
                >
                  <X size={20} className="text-black/60" />
                </motion.button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Cari parfum favorit Anda..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsTyping(true);
                      setTimeout(() => setIsTyping(false), 1000);
                    }}
                    className="w-full bg-transparent border-none outline-none text-black/90 placeholder-black/40 text-base"
                  />
                </div>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchQuery('')}
                    className="p-2 rounded-xl hover:bg-black/5"
                  >
                    <X size={16} className="text-black/60" />
                  </motion.button>
                )}
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-black/40" />
                      <span className="text-sm text-black/60">Hasil Pencarian</span>
                    </div>
                    {searchResults.length > 0 && (
                      <span className="text-xs text-black/40">
                        {searchResults.length} parfum ditemukan
                      </span>
                    )}
                  </div>

                  {searchResults.length === 0 && searchQuery && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Search className="w-12 h-12 text-black/20 mb-3" />
                      </motion.div>
                      <p className="text-black/40 mb-1">Tidak ada hasil yang ditemukan</p>
                      <p className="text-sm text-black/30">Coba kata kunci yang berbeda</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {searchResults.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          openProduct(item);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-4 p-3 active:bg-black/5 rounded-xl transition-colors group"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                          <Image 
                            src={item.images[0]} 
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-black/80 truncate group-hover:text-black transition-colors">
                            {highlightText(item.name, searchQuery)}
                          </h4>
                          <p className="text-black/50 text-sm truncate mt-1 group-hover:text-black/60 transition-colors">
                            {highlightText(item.desc || '', searchQuery)}
                          </p>
                          {item.price && (
                            <p className="text-black/70 text-sm font-medium mt-2 group-hover:text-black transition-colors">
                              {item.price}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-black/40" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

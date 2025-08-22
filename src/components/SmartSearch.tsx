'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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

interface SmartSearchProps {
  openProduct: (product: ParfumItem) => void;
  products: ParfumItem[]; // Menambahkan prop products
}

export default function SmartSearch({ openProduct, products }: SmartSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParfumItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();

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
    <div ref={searchRef} className="relative max-w-3xl w-full mx-auto px-4 hidden lg:block">
      <motion.div 
        initial={false}
        animate={isSearchOpen ? { 
          width: "100%",
          height: "64px",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          borderColor: "rgba(0, 0, 0, 0.1)"
        } : {
          width: "240px",
          height: "48px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(0, 0, 0, 0.05)"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={() => {
          if (!isSearchOpen) {
            setIsSearchOpen(true);
            // Delay fokus untuk menunggu animasi selesai
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className={`flex items-center relative overflow-hidden mx-auto
          border-2 rounded-2xl backdrop-blur-xl shadow-lg cursor-pointer
          hover:bg-white/20 transition-colors group/search`}
      >
        <div className="flex items-center w-full px-2 gap-2">
          <motion.div
            initial={false}
            animate={isSearchOpen ? { width: "auto" } : { width: "100%" }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl group-hover/search:bg-black/5 transition-colors"
            >
              <Search size={20} className="text-black/80" />
            </motion.div>
            {!isSearchOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-sm text-black/60"
              >
                <Command size={12} />
                <span>Cari Parfum disini...</span>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div
            initial={false}
            animate={isSearchOpen ? { width: "100%" } : { width: "0%" }}
            className="flex-1 overflow-hidden"
          >
            <input
              type="text"
              placeholder="Cari parfum favorit Anda..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 1000);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
              ref={inputRef}
              className="w-full bg-transparent border-none outline-none text-black/90 placeholder-black/40 text-base cursor-text"
            />
          </motion.div>

          <AnimatePresence>
            {isSearchOpen && searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchQuery('')}
                className="p-2 rounded-xl hover:bg-black/5 transition-colors"
              >
                <X size={16} className="text-black/60" />
              </motion.button>
            )}
          </AnimatePresence>

          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 text-xs text-black/40"
            >
              <span>ESC</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white/95 rounded-2xl shadow-2xl border border-black/5 backdrop-blur-2xl overflow-hidden z-50"
          >
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

              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {searchResults.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 0.995 }}
                    onClick={() => {
                      openProduct(item);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-4 p-3 cursor-pointer rounded-xl hover:bg-black/5 transition-all duration-200 group"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
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
                    <ArrowRight className="w-4 h-4 text-black/0 group-hover:text-black/40 transition-all duration-300" />
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-black/5">
                <div className="flex items-center justify-between text-xs text-black/40">
                  <div className="flex items-center gap-2">
                    <Command size={12} />
                    <span>+</span>
                    <span>K</span>
                    <span className="text-black/30">untuk mencari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>ESC</span>
                    <span className="text-black/30">untuk menutup</span>
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

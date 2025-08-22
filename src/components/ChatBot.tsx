'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import '@/app/chatbot.css';

// FAQs data structure
// Typing effect component
const TypeWriter = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 10); // Kecepatan typing, bisa disesuaikan

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayedText}</span>;
};

const chatFaqs = {
  greeting: "Hoollaaaaaaaaa, GPmin disiniii :3 Adaa yg bisa GPmin bantu?",
  menu: `Silakan pilih nomor pertanyaan berikut:\n1. Apa yang membuat parfum Goodplace istimewa?\n2. Berapa lama aroma Goodplace bertahan?\n3. Apakah Goodplace memiliki parfum unisex?\n4. Apakah tersedia ukuran travel friendly?\n5. Bagaimana cara mendapatkan parfum Goodplace?\n\nKetik nomor 1-5 untuk memilih pertanyaan atau ketik pesan lainnya.`,
  questions: [
    "Apa yang membuat parfum Goodplace istimewa?",
    "Berapa lama aroma Goodplace bertahan?",
    "Apakah Goodplace memiliki parfum unisex?",
    "Apakah tersedia ukuran travel friendly?",
    "Bagaimana cara mendapatkan parfum Goodplace?"
  ],
  answers: [
    "Goodplace tidak sekadar parfum, tapi sebuah pengalaman. Setiap tetesnya diracik dengan bahan pilihan berkualitas tinggi, menghadirkan aroma yang elegan, berkarakter, dan meninggalkan kesan mendalam di setiap momen Anda.",
    "Dengan konsentrasi esensi yang kaya, parfum Goodplace mampu bertahan hingga 6–10 jam. Cukup semprotkan di titik nadi, dan biarkan aromanya menemani langkah Anda seharian.",
    "Ya. Goodplace menghadirkan koleksi unisex yang memadukan kesegaran dan kehangatan. Satu aroma, dua jiwa—untuk pria dan wanita yang percaya diri mengekspresikan diri tanpa batas.",
    "Tentu. Goodplace hadir dalam botol 30ml yang praktis untuk dibawa ke mana saja, serta 100ml untuk Anda yang ingin menikmati keharumannya lebih lama. Elegan, fleksibel, dan selalu siap menemani perjalanan Anda.",
    "Parfum Goodplace tersedia melalui website resmi, official store di marketplace, dan boutique partner pilihan. Pastikan selalu membeli dari channel resmi untuk mendapatkan keaslian dan kualitas terbaik."
  ]
};

export default function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{type: 'bot' | 'user', content: string, isTyping?: boolean}>>([]);
  const [userInput, setUserInput] = useState('');
  const [showQuestions, setShowQuestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 320, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const minSize = { width: 280, height: 400 };
  const maxSize = { width: 600, height: 800 };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize chat with greeting and menu when opened
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      setChatMessages([
        { type: 'bot', content: chatFaqs.greeting },
        { type: 'bot', content: chatFaqs.menu }
      ]);
    }
  }, [isChatOpen, chatMessages.length]);

  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message immediately
    setChatMessages(prev => [...prev, { type: 'user', content: userInput }]);
    setUserInput('');
    setShowQuestions(false);

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if input is a number between 1-5
    const questionNum = parseInt(userInput);
    if (!isNaN(questionNum) && questionNum >= 1 && questionNum <= 5) {
      const index = questionNum - 1;
      setSelectedQuestion(index);
      setChatMessages(prev => [
        ...prev,
        { type: 'bot', content: chatFaqs.answers[index], isTyping: true }
      ]);
    } else {
      // Show bot response and menu
      setChatMessages(prev => [
        ...prev,
        { type: 'bot', content: "Maaf, saya belum bisa menjawab pesan tersebut.\n\nBerikut pertanyaan yang dapat saya bantu:", isTyping: true },
        { type: 'bot', content: chatFaqs.menu, isTyping: true }
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            drag={!isResizing && !isScrolling}
            dragMomentum={false}
            dragElastic={0}
            dragTransition={{ power: 0 }}
            dragPropagation={false}
            onDragStart={(e) => {
              // Prevent drag on resize handles
              const target = e.target as HTMLElement;
              if (target.className.includes('react-resizable-handle')) {
                e.preventDefault();
              }
            }}
            style={{ x: position.x, y: position.y }}
            onDrag={(e, info) => {
              if (!isResizing) {
                setPosition({
                  x: info.offset.x + position.x,
                  y: info.offset.y + position.y
                });
              }
            }}
          >
            <Resizable
              width={size.width}
              height={size.height}
              minConstraints={[minSize.width, minSize.height]}
              maxConstraints={[maxSize.width, maxSize.height]}
              onResizeStart={() => setIsResizing(true)}
              onResize={(e, { size: newSize }) => {
                setSize(newSize);
              }}
              onResizeStop={() => setIsResizing(false)}
              resizeHandles={['se', 'sw', 'ne', 'nw']}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ width: size.width, height: size.height }}
                className="mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden relative will-change-transform"
            >
            {/* Chat Header */}
            <div className="bg-[#bfa16a] p-4 flex justify-between items-center cursor-move">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Image src="/LogoGP1.png" alt="CS Avatar" width={32} height={32} className="rounded-full" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Good Place</h3>
                  <p className="text-white/80 text-sm">Customer Service</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  setPosition({ x: 0, y: 0 }); // Reset posisi ke awal
                }}
                className="text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-full"
                aria-label="Tutup chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50" 
              style={{ height: size.height - 140 }}
              onScroll={() => {
                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current);
                }
                setIsScrolling(true);
                scrollTimeoutRef.current = setTimeout(() => {
                  setIsScrolling(false);
                }, 150);
              }}
            >
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.1 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-white/80 flex-shrink-0 overflow-hidden shadow-sm mt-2 mr-2">
                      <Image src="/LogoGP1.png" alt="CS" width={24} height={24} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-[#bfa16a] text-white shadow-sm'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.type === 'bot' && msg.isTyping ? (
                        <TypeWriter 
                          text={msg.content} 
                          onComplete={() => {
                            setChatMessages(prev => 
                              prev.map((m, i) => 
                                i === idx ? { ...m, isTyping: false } : m
                              )
                            );
                          }}
                        />
                      ) : (
                        msg.content
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-6 h-6 rounded-full bg-white/80 flex-shrink-0 overflow-hidden shadow-sm mt-2 mr-2">
                    <Image src="/LogoGP1.png" alt="CS" width={24} height={24} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Invisible element for scrolling */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ketik pesan atau pilih nomor 1-5..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#bfa16a] text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#bfa16a] text-white p-2 rounded-full hover:bg-[#a88c5c] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </form>
            </div>
              </motion.div>
            </Resizable>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        onClick={() => {
          setIsChatOpen(prev => !prev);
          if (!isChatOpen) {
            setPosition({ x: 0, y: 0 }); // Reset posisi saat dibuka
          }
        }}
        className="bg-[#bfa16a] hover:bg-[#a88c5c] text-white p-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-3 group cursor-pointer"
        initial={{ y: 0 }}
        animate={{ 
          y: [-4, 4, -4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ 
          scale: 1.05,
          y: 0,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Image
          src="/cs-icon-white.jpg"
          alt="CS Icon"
          width={24}
          height={24}
          className="transition-transform duration-300 group-hover:rotate-12"
        />
        <span className="hidden sm:inline font-medium tracking-wide">CS</span>
      </motion.button>
    </div>
  );
}

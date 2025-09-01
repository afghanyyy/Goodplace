'use client';

import { useState, useEffect, useRef } from 'react';
import { useFloatingButtons } from '@/context/FloatingButtonsContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Resizable } from 'react-resizable';
import { generateAIResponse } from '@/services/ai';
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
  const { hidden } = useFloatingButtons();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    type: 'bot' | 'user';
    content: string;
    isTyping?: boolean;
    timestamp?: number;
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState({ width: 320, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const minSize = { width: 280, height: 400 };
  const maxSize = { width: 600, height: 800 };

  // Check if near footer
  useEffect(() => {
    const checkFooterVisibility = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const threshold = 150; // pixels before footer
        setIsNearFooter(footerRect.top - window.innerHeight + threshold < 0);
      }
    };

    window.addEventListener('scroll', checkFooterVisibility);
    checkFooterVisibility(); // Check initially
    
    return () => window.removeEventListener('scroll', checkFooterVisibility);
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Update timestamps periodically
  useEffect(() => {
    if (isChatOpen && chatMessages.length > 0) {
      const interval = setInterval(() => {
        // Force re-render to update timestamps
        setChatMessages(prev => [...prev]);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isChatOpen, chatMessages.length]);

  // Format message timestamp
  const formatMessageTime = (messageTimestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - messageTimestamp) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    return new Date(messageTimestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      const timestamp = Date.now();
      setChatMessages([
        { type: 'bot', content: chatFaqs.greeting, timestamp },
        { type: 'bot', content: chatFaqs.menu, timestamp }
      ]);
    }
  }, [isChatOpen, chatMessages.length]);

  // Function to get AI response
  const getAIResponse = async (userMessage: string) => {
    try {
      // First try to detect if it's a FAQ
      const questionNum = parseInt(userMessage);
      if (!isNaN(questionNum) && questionNum >= 1 && questionNum <= 5) {
        const index = questionNum - 1;
        return chatFaqs.answers[index];
      }

      // If not a FAQ, use AI to generate a response
      const aiResponse = await generateAIResponse(userMessage);
      return aiResponse;
      
    } catch (error) {
      console.error('AI Error Details:', error);
      
      // Check if error is an object with message property
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a token error
      if (errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
        return "Maaf, sedang ada masalah dengan koneksi AI. Admin perlu mengecek token HuggingFace.";
      }
      
      // Check if it's a model error
      if (errorMessage.includes('model')) {
        return "Maaf, sedang ada masalah dengan model AI. Silakan hubungi admin.";
      }

      return "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti atau pilih dari menu berikut:\n" + chatFaqs.menu;
    }
  };

  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message immediately with timestamp
    const userMessageTime = Date.now();
    const userMessage = userInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage, timestamp: userMessageTime }]);
    setUserInput('');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse(userMessage);
      const botResponseTime = Date.now();

      // Add bot response
      setChatMessages(prev => [
        ...prev,
        { type: 'bot', content: aiResponse, isTyping: true, timestamp: botResponseTime }
      ]);
    } catch (error) {
      console.error('Chat Error:', error);
      const botResponseTime = Date.now();
      
      // Add error message
      setChatMessages(prev => [
        ...prev,
        { 
          type: 'bot', 
          content: "Maaf, saya sedang mengalami kendala. Silakan coba lagi nanti.", 
          isTyping: true, 
          timestamp: botResponseTime 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-4 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      <AnimatePresence>
        {!hidden && isChatOpen && (
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
                    <div>
                      <p className="text-sm leading-relaxed whitespace-pre-line mb-1">
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
                      {msg.timestamp && (
                        <p className={`text-[10px] ${msg.type === 'user' ? 'text-white/80' : 'text-gray-400'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      )}
                    </div>
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
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'a' || e.code === 'KeyA') && (e.ctrlKey || e.metaKey)) {
                      e.currentTarget.select();
                      e.preventDefault();
                    }
                  }}
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
      <AnimatePresence mode="wait">
        {!hidden && !isNearFooter && !isChatOpen && (
          <motion.button
            onClick={() => {
              setIsChatOpen(prev => !prev);
              if (!isChatOpen) {
                setPosition({ x: 0, y: 0 }); // Reset posisi saat dibuka
              }
            }}
            className="bg-[#bfa16a] hover:bg-[#a88c5c] text-white p-3 sm:p-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1,
              y: [-4, 4, -4],
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              y: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: { duration: 0.2 }
            }}
            whileHover={{ scale: 1.05, y: 0 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/cs-icon-white.jpg"
              alt="CS Icon"
              width={24}
              height={24}
              className="transition-transform duration-300 group-hover:rotate-12 w-6 h-6 sm:w-[24px] sm:h-[24px]"
            />
            <span className="text-white text-sm font-medium hidden sm:inline">Chat with us</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

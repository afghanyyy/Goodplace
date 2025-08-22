"use client";
import Image from "next/image";
import DOMPurify from 'dompurify';
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from 'swiper';
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { AnimatePresence, motion as m } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
// ...existing code...
import EmblaCarousel from "@/components/EmblaCarousel";
import ChatBot from "@/components/ChatBot";
import ScrollToTop from "@/components/ScrollToTop";
import SmartSearch from "@/components/SmartSearch";
import MobileSmartSearch from "@/components/MobileSmartSearch";
// import { sub } from "framer-motion/client";

// Convert array to be compatible with both components
const products = [
	{
		name: "FRUIROSA PERFUME Eau De Parfum",
		images: ["/parfum2.png", "/catalog1.png"],
		// price: "$325",
		desc: " Parfum wanita floral fruity yang ceria dan ringan. Aroma nanas dan markisa yang tropis di awal, bunga peony dan persik di tengah, lalu musk dan amber di dasar. Sempurna untuk hari-hari cerah atau\u00a0liburan.",
        
	},
	{
		name: "Aqua Universalis",
		images: ["/catalog2.png", "/catalog1.png"],
		price: "$225",
		desc: "Segar, ceria, cocok untuk sehari-hari dan suasana santai.",
	},
	{
		name: "Oud Satin Mood",
	   images: ["/catalog2.png", "/catalog1.png"],
		price: "$375",
		desc: "Bold, misterius, dan elegan. Membuat kesan tak terlupakan.",
	},
];


export default function Home() {
	// Scroll to top on every page load/refresh
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'auto' });
	}, []);
	// Scroll to top on every page load/refresh
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'auto' });
	}, []);
	 // Disable right-click, inspect element shortcuts, and text copy/select
	 useEffect(() => {
		 const handleContextMenu = (e: MouseEvent) => e.preventDefault();
		 const handleKeyDown = (e: KeyboardEvent) => {
			 // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
			 if (
				 e.key === 'F12' ||
				 (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
				 (e.ctrlKey && e.key === 'U')
			 ) {
				 e.preventDefault();
			 }
		 };
		 const handleCopy = (e: ClipboardEvent) => e.preventDefault();
		 const handleSelectStart = (e: Event) => e.preventDefault();
		 document.addEventListener('contextmenu', handleContextMenu);
		 document.addEventListener('keydown', handleKeyDown);
		 document.addEventListener('copy', handleCopy);
		 document.addEventListener('selectstart', handleSelectStart);
		 return () => {
			 document.removeEventListener('contextmenu', handleContextMenu);
			 document.removeEventListener('keydown', handleKeyDown);
			 document.removeEventListener('copy', handleCopy);
			 document.removeEventListener('selectstart', handleSelectStart);
		 };
	 }, []);
	const [showCookie, setShowCookie] = useState(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);	
		const [loading, setLoading] = useState(true);
		const [selectedProduct, setSelectedProduct] = useState<
			(typeof products[0] & { images: string[]; desc: string }) | null
		>(null);
			const modalSwiperRef = useRef<SwiperCore | null>(null);
			const [modalZoomes, setModalZoomes] = useState<Record<number, number>>({});
			const [modalOffsets, setModalOffsets] = useState<Record<number, { x: number; y: number }>>({});
			const draggingRef = useRef<{ idx: number | null; isDown: boolean; startX: number; startY: number; lastX: number; lastY: number }>({ idx: null, isDown: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });

			const getActiveSlideIndex = () => {
				const s = modalSwiperRef.current as unknown as { realIndex?: number; activeIndex?: number } | null;
				if (!s) return 0;
				return typeof s.realIndex === 'number' ? s.realIndex : (s.activeIndex || 0);
			};

			const zoomInActive = (step = 0.3, max = 10	) => {
				const idx = getActiveSlideIndex();
				setModalZoomes((prev) => {
					const cur = prev[idx] ?? 1;
					const next = Math.min(cur + step, max);
					if (next <= 1) setModalOffsets((o) => ({ ...o, [idx]: { x: 0, y: 0 } }));
					return { ...prev, [idx]: next };
				});
			};

			const zoomOutActive = (step = 0.3, min = 1) => {
				const idx = getActiveSlideIndex();
				setModalZoomes((prev) => {
					const cur = prev[idx] ?? 1;
					const next = Math.max(cur - step, min);
					if (next <= 1) setModalOffsets((o) => ({ ...o, [idx]: { x: 0, y: 0 } }));
					return { ...prev, [idx]: next };
				});
			};

			const startPointerDrag = (e: React.PointerEvent<HTMLDivElement>, idx: number) => {
				const zoom = modalZoomes[idx] ?? 1;
				if (zoom <= 1) return; // only pan when zoomed
				try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
				draggingRef.current = {
					idx,
					isDown: true,
					startX: e.clientX,
					startY: e.clientY,
					lastX: modalOffsets[idx]?.x ?? 0,
					lastY: modalOffsets[idx]?.y ?? 0,
				};
			};

			const movePointerDrag = (e: React.PointerEvent<HTMLDivElement>, idx: number) => {
				const d = draggingRef.current;
				if (!d || !d.isDown || d.idx !== idx) return;
				const dx = e.clientX - d.startX;
				const dy = e.clientY - d.startY;
				const newX = d.lastX + dx;
				const newY = d.lastY + dy;
				setModalOffsets((prev) => ({ ...prev, [idx]: { x: newX, y: newY } }));
				e.preventDefault();
			};

			const endPointerDrag = (e: React.PointerEvent<HTMLDivElement>) => {
				const d = draggingRef.current;
				if (!d) return;
				try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
				draggingRef.current = { idx: null, isDown: false, startX: 0, startY: 0, lastX: 0, lastY: 0 };
			};

			useEffect(() => {
				if (!modalIsOpen) setModalOffsets({});
			}, [modalIsOpen]);
	const [showConfetti, setShowConfetti] = useState(false);
	const [showNav, setShowNav] = useState(false);

	function openProduct(product: (typeof products)[0]) {
		setModalZoomes({});
		setModalOffsets({});
		setSelectedProduct(product);
		setModalIsOpen(true);
	}

	function handleCardKey(e: React.KeyboardEvent, product: (typeof products)[0]) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openProduct(product);
		}
	}

	function closeModal() {
		setModalIsOpen(false);
		// reset zoom/pan so reopening starts fresh
		setModalZoomes({});
		setModalOffsets({});
		setSelectedProduct(null);
	}

			useEffect(() => {
				setLoading(true);
				const timer = setTimeout(() => setLoading(false), 3500);
				return () => clearTimeout(timer);
			}, []);

			// show cookie consent only after initial loading overlay completes
			useEffect(() => {
				if (!loading) {
					const consent = localStorage.getItem('gp_cookie_consent');
					if (consent !== 'accepted') setShowCookie(true);
				}
			}, [loading]);

			// Prevent page scrolling while the loading overlay is visible (robust for mobile/desktop)
			useEffect(() => {
				if (typeof window === 'undefined') return;
				let scrollY = 0;
				const prev = {
					position: document.body.style.position,
					top: document.body.style.top,
					left: document.body.style.left,
					right: document.body.style.right,
					width: document.body.style.width,
					overflow: document.body.style.overflow,
					touchAction: document.body.style.touchAction,
				};

				const preventWheel = (e: Event) => { e.preventDefault(); };
				const preventTouch = (e: Event) => { e.preventDefault(); };
				const preventKey = (e: KeyboardEvent) => {
					if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) e.preventDefault();
				};

				if (loading) {
					// freeze scroll position
					scrollY = window.scrollY || window.pageYOffset || 0;
					document.body.style.position = 'fixed';
					document.body.style.top = `-${scrollY}px`;
					document.body.style.left = '0';
					document.body.style.right = '0';
					document.body.style.width = '100%';
					document.body.style.overflow = 'hidden';
					document.body.style.touchAction = 'none';

					// prevent wheel/touchmove (must be non-passive)
					window.addEventListener('wheel', preventWheel, { passive: false });
					window.addEventListener('touchmove', preventTouch, { passive: false });
					// prevent keyboard scroll keys
					window.addEventListener('keydown', preventKey, { passive: false } as AddEventListenerOptions);

					return () => {
						window.removeEventListener('wheel', preventWheel);
						window.removeEventListener('touchmove', preventTouch);
						window.removeEventListener('keydown', preventKey);
						// restore styles and scroll position
						document.body.style.position = prev.position || '';
						document.body.style.top = prev.top || '';
						document.body.style.left = prev.left || '';
						document.body.style.right = prev.right || '';
						document.body.style.width = prev.width || '';
						document.body.style.overflow = prev.overflow || '';
						document.body.style.touchAction = prev.touchAction || '';
						window.scrollTo(0, scrollY);
					};
				}
				return; // nothing to cleanup when not loading
			}, [loading]);

	const heroRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const handleScroll = () => {
			if (heroRef.current) {
				const y = window.scrollY;
				heroRef.current.style.backgroundPosition = `center ${y * 0.3}px`;
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Scroll to top button
	const [showScroll, setShowScroll] = useState(false);
	useEffect(() => {
		const onScroll = () => setShowScroll(window.scrollY > 300);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// 3D tilt effect for product cards
	function handleTilt(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		const card = e.currentTarget;
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((y - centerY) / centerY) * 8;
		const rotateY = ((x - centerX) / centerX) * -8;
		card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
	}
	function resetTilt(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		e.currentTarget.style.transform = '';
	}

	// Accordion state for footer
	const [footerAccordion, setFooterAccordion] = useState({
		kontak: false,
		tautan: false,
		marketplace: false,
	});

	const toggleAccordion = (key: 'kontak' | 'tautan' | 'marketplace') => {
		setFooterAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
	};

  // Pagination state for Koleksi Parfume
	const parfumRows = [
		[products[0], products[1], products[2]],
		[
			{ name: "Amyris Femme", images: ["/catalog2.png", "/catalog1.png"], price: "$295", desc: "Parfum wanita floral fruity yang ceria dan ringan. Aroma nanas dan markisa yang tropis di awal, bunga peony dan persik di tengah, lalu musk dan amber di dasar. Sempurna untuk hari-hari cerah atau\u00a0liburan.." },
			{ name: "Gentle Fluidity Gold", images: ["/catalog2.png", "/catalog1.png"], price: "$310", desc: "Wangi musky vanilla yang elegan." },
			{ name: "L'Homme À la rose", images: ["/catalog2.png", "/catalog1.png"], price: "$280", desc: "Maskulin segar dengan sentuhan rose." },
		],
		[
			{ name: "Aqua Vitae", images: ["/catalog2.png", "/catalog1.png"], price: "$250", desc: "Citrus segar, cocok untuk siang hari." },
			{ name: "Oud", images: ["/catalog2.png", "/catalog1.png"], price: "$390", desc: "Oud klasik, mewah dan tahan lama." },
			{ name: "Petit Matin", images: ["/catalog2.png", "/catalog1.png"], price: "$265", desc: "Aroma pagi Paris yang lembut." },
		],
	];
	const [parfumPage, setParfumPage] = useState(0);

  // Responsif: 1 row per page di mobile, 2 di tablet, 3 di desktop
  const [rowsPerPage, setRowsPerPage] = useState(1);
  useEffect(() => {
	function handleResize() {
	  if (window.innerWidth >= 1024) setRowsPerPage(3);
	  else if (window.innerWidth >= 640) setRowsPerPage(2);
	  else setRowsPerPage(1);
	}
	handleResize();
	window.addEventListener('resize', handleResize);
	return () => window.removeEventListener('resize', handleResize);
  }, []);

  const parfumPages = [];
  for (let i = 0; i < parfumRows.length; i += rowsPerPage) {
	parfumPages.push(parfumRows.slice(i, i + rowsPerPage));
  }

// Clamp page
useEffect(() => {
	if (parfumPage > parfumPages.length - 1) setParfumPage(parfumPages.length - 1);
}, [rowsPerPage, parfumPage, parfumPages.length]);

 // Refs for scroll targets
 const homeRef = useRef<HTMLDivElement>(null);
 const koleksiRef = useRef<HTMLDivElement>(null);
 const bestSellerRef = useRef<HTMLDivElement>(null);
 const storiesRef = useRef<HTMLDivElement>(null);
 const footerRef = useRef<HTMLElement>(null);

 // Scroll handler
 const handleNavClick = (section: string) => {
	 let ref: React.RefObject<HTMLElement> | null = null;
	 if (section === "Home") ref = homeRef;
	 else if (section === "Fragrances") ref = koleksiRef;
	 else if (section === "Collections") ref = bestSellerRef;
	 else if (section === "About") ref = storiesRef;
	 else if (section === "Contact") ref = footerRef;
	 if (ref && ref.current) {
		 ref.current.scrollIntoView({ behavior: "smooth", block: section === "Contact" ? "end" : "start" });
	 }
 };

 return (
 	<div
			ref={homeRef}
			className="min-h-screen text-black font-sans relative overflow-x-hidden"
			style={{
				userSelect: 'none',
				WebkitUserSelect: 'none',
				MozUserSelect: 'none',
				msUserSelect: 'none',
				backgroundImage: 'url(/242424.png)',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center center',
				// opacity: 0.8
			}}
		>
		<Toaster position="top-right" />
		{/* Cookie Consent Popup - Modern, Elegant, Interactive */}
		{showCookie && (
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 40 }}
				transition={{ duration: 0.5 }}
				className="fixed bottom-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-lg border-t border-[#bfa16a] shadow-2xl px-4 sm:px-8 py-5 flex flex-col items-center gap-3"
				style={{ boxShadow: '0 8px 32px 0 rgba(191,161,106,0.18)' }}
			>
				<div className="flex items-center gap-3">
					<svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#bfa16a" /><path d="M10 20c0 2 2 4 6 4s6-2 6-4" stroke="#fff8f0" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="14" r="1.5" fill="#fff8f0" /><circle cx="20" cy="14" r="1.5" fill="#fff8f0" /></svg>
					<span className="text-base font-semibold text-[#bfa16a]">Cookies</span>
				</div>
				<div className="text-sm text-gray-700 text-center font-medium">
					We use cookies to improve your browsing experience, analyze traffic, and personalize content. By clicking Accept, you agree to the use of cookies. Click Decline to reject non-essential cookies.<br />
					Learn more in our <a href="#" className="underline text-[#bfa16a] hover:text-[#a88c5c]">Cookie Policy</a>.
				</div>
				<div className="flex gap-3 mt-2">
					<button
						className="px-5 py-2 rounded-full bg-[#bfa16a] text-white font-bold shadow hover:bg-[#a88c5c] transition focus:outline-none"
						onClick={() => {
							localStorage.setItem('gp_cookie_consent', 'accepted');
							setShowCookie(false);
							toast.success('Cookies accepted!');
						}}
						aria-label="Accept Cookies"
					>
						Accept
					</button>
					<button
						className="px-5 py-2 rounded-full bg-white text-[#bfa16a] font-bold border border-[#bfa16a] shadow hover:bg-[#f7f7fa] transition focus:outline-none"
						onClick={() => {
							localStorage.setItem('gp_cookie_consent', 'declined');
							setShowCookie(false);
							// toast('Cookies declined', { icon: '🚫' });
						}}
						aria-label="Decline Cookies"
					>
						Decline
					</button>
				</div>
			</motion.div>
		)}
			{/* Modern & Elegant Loading Animation */}
					{loading && (
						<div className="fixed inset-0 bg-gradient-to-br from-[#bfa16a]/60 via-[#fff8f0]/80 to-[#222]/80 flex items-center justify-center z-[9999]">
							<div className="flex flex-col items-center gap-8">
								<div className="relative flex items-center justify-center">
									<div className="absolute w-[260px] h-[260px] rounded-full border-8 border-gradient animate-spin-slow" />
									<Image src="/load2.gif" alt="Loading..." width={220} height={220} className="w-[220px] h-[220px] object-contain" priority />
								</div>
								<span className="text-3xl sm:text-4xl font-extrabold text-[#bfa16a] drop-shadow-lg animate-shimmer relative">
									Good Place
								</span>
								<span className="text-base sm:text-lg text-white/80 font-medium animate-fadein">
									Memulai pengalaman mewah...
								</span>
							</div>
							<style jsx global>{`
								.border-gradient {
									border-image: linear-gradient(120deg, #bfa16a 0%, #fff8f0 50%, #bfa16a 100%) 1;
								}
								@keyframes spin-slow {
									0% { transform: rotate(0deg); }
									100% { transform: rotate(360deg); }
								}
								.animate-spin-slow {
									animation: spin-slow 2.5s linear infinite;
								}
								@keyframes shimmer {
									0% { background-position: -200px 0; }
									100% { background-position: 200px 0; }
								}
								.animate-shimmer {
									background: linear-gradient(90deg, #bfa16a 0%, #fff8f0 50%, #bfa16a 100%);
									background-size: 200% 100%;
									animation: shimmer 2.2s linear infinite;
									-webkit-background-clip: text;
									-webkit-text-fill-color: transparent;
								}
								@keyframes fadein {
									0% { opacity: 0; }
									100% { opacity: 1; }
								}
								.animate-fadein {
									animation: fadein 1.2s ease-in;
								}
							`}</style>
						</div>
					)}

			{/* Navigation Bar */}
			<motion.nav
				className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 sm:py-6 bg-white shadow-sm fixed top-0 left-0 w-full z-30 gap-2 sm:gap-0"
			>
			   <motion.div
				   initial={{ x: -100, opacity: 0 }}
				   animate={{ x: 0, opacity: 1 }}
				   transition={{ duration: 0.7 }}
				   className="flex items-center h-12"
			   >
				   <Image
					   src="/LogoGP1.png"
					   alt="Good Place Logo"
					   width={180}
					   height={48}
					   priority
					   className="object-contain h-35 w-35"
				   />
			   </motion.div>

               {/* Smart Search */}
               <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.7, delay: 0.2 }}
                   className="hidden md:block flex-1 max-w-xl mx-8"
               >
                   <SmartSearch openProduct={openProduct} products={parfumRows.flat()} />
               </motion.div>
				{/* Responsive nav: modern hamburger + drawer for mobile */}
				<div className="block sm:hidden absolute left-4 top-1/2 -translate-y-1/2 z-40">
					<button
						onClick={() => setShowNav(!showNav)}
						aria-label={showNav ? "Tutup menu" : "Buka menu"}
						className="relative w-11 h-11 flex items-center justify-center rounded-full border border-transparent hover:border-[#bfa16a] bg-white/95 shadow-lg focus:outline-none transition-all duration-250"
					>
						{/* Elegant animated hamburger lines */}
						<motion.span initial={false} animate={showNav ? { rotate: 90 } : { rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="block w-6 h-6 relative">
							<motion.span animate={showNav ? { y: 6, rotate: 45, background: '#bfa16a' } : { y: 0, rotate: 0, background: '#222' }} transition={{ duration: 0.28 }} className="absolute left-0 top-0 w-6 h-[2px] rounded-full bg-black" />
							<motion.span animate={showNav ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} className="absolute left-0 top-2 w-6 h-[2px] rounded-full bg-black" />
							<motion.span animate={showNav ? { y: -6, rotate: -45, background: '#bfa16a' } : { y: 4, rotate: 0, background: '#222' }} transition={{ duration: 0.28 }} className="absolute left-0 top-4 w-6 h-[2px] rounded-full bg-black" />
						</motion.span>
					</button>
				</div>

				{/* Mobile drawer overlay */}
				{showNav && (
					<div className="fixed inset-0 z-30 flex">
						{/* backdrop */}
						<button aria-hidden className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNav(false)} />
						{/* sliding panel */}
						<motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="ml-auto w-72 max-w-full bg-white/95 backdrop-blur-lg shadow-2xl p-6 flex flex-col gap-6">
							<div className="flex items-center justify-between">
								<span className="text-lg font-semibold text-[#222]">Menu</span>
								<button onClick={() => setShowNav(false)} aria-label="Tutup menu" className="text-gray-700 bg-white/60 hover:text-[#bfa16a] rounded-full p-2 shadow">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
								</button>
							</div>
							<nav className="flex flex-col gap-4 mt-2">
								{["Home", "Fragrances", "Collections", "About", "Contact"].map((item) => (
									<button key={item} onClick={() => { handleNavClick(item); setShowNav(false); }} className="text-left text-lg font-medium text-[#111] hover:text-[#bfa16a] transition py-2">
										{item}
									</button>
								))}
							</nav>
							<div className="mt-auto">
								<hr className="border-gray-200 mb-4" />
								<div className="flex gap-3">
									<a href="#" className="text-gray-600 hover:text-[#bfa16a]">Instagram</a>
									<a href="#" className="text-gray-600 hover:text-[#bfa16a]">Tokopedia</a>
									<a href="#" className="text-gray-600 hover:text-[#bfa16a]">Shopee</a>
								</div>
							</div>
						</motion.aside>
					</div>
				)}
					<ul className={`hidden sm:flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm font-medium sm:bg-transparent sm:static sm:top-auto transition-all duration-300 z-20`}>
		 				{[
		 					"Home", "Fragrances", "Collections", "About", "Contact"
		 				].map((item, i) => (
		 					<motion.li
		 						key={i}
		 						initial={{ opacity: 0, y: -20 }}
		 						animate={{ opacity: 1, y: 0 }}
		 						transition={{ delay: i * 0.1 }}
		 						className="group cursor-pointer transition text-black px-4 py-2 sm:p-0 relative"
		 					>
		 						<span
		 							className="relative z-10 group-hover:text-[#000000] group-focus:text-[#bfa16a] transition-colors duration-200"
		 							onClick={() => handleNavClick(item)}
		 							role="button"
		 							style={{ cursor: "pointer" }}
		 							tabIndex={0}
		 						>
		 							{item}
		 							<span className="pointer-events-none absolute left-0 -bottom-1 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 transition-transform duration-300 origin-left rounded"></span>
		 						</span>
		 					</motion.li>
		 				))}
		 			</ul>
			</motion.nav>

 			{/* Hero Section with SwiperJS vertical, pagination, and full background image + animated SVG blob + parallax */}
 			<motion.section
 				ref={heroRef}
 				className="relative w-full flex items-center justify-center overflow-hidden select-none mt-20 touch-pan-y"
 				style={{ 
					background: 'linear-gradient(120deg, #f7e8d0 0%, #e9e6f6 100%)', 
					backgroundSize: 'cover', 
					backgroundPosition: 'center 0px', 
					minHeight: '400px', 
					height: '60vh',
					touchAction: 'pan-y pinch-zoom'
				}}
 				initial={{ opacity: 0, y: 60 }}
 				whileInView={{ opacity: 1, y: 0 }}
 				viewport={{ once: true, amount: 0.3 }}
 				transition={{ duration: 0.8 }}
 			>
				{/* Animated SVG blob */}
				<motion.svg initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.3, scale: 1 }} transition={{ duration: 1.2 }} className="absolute -top-24 -left-24 w-[420px] h-[420px] z-0" viewBox="0 0 400 400" fill="none">
					<motion.path d="M320,200Q320,280,200,320Q80,280,80,200Q80,120,200,80Q320,120,320,200Z" fill="#bfa16a" initial={{ scale: 0.7 }} animate={{ scale: 1.1 }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }} />
				</motion.svg>
		<Swiper
			direction="vertical"
			modules={[Pagination, Autoplay]}
			slidesPerView={1}
			spaceBetween={30}
			touchRatio={0}
			simulateTouch={false}
			allowTouchMove={false}
			pagination={{ clickable: true }}
			autoplay={{ delay: 5000, disableOnInteraction: false }}
			className="w-full h-full mySwiper touch-pan-y"
			style={{ 
				minHeight: '400px', 
				height: '60vh',
				touchAction: 'pan-y pinch-zoom'
			}}
		>
					{[
						{ bg: "/wallpaper1.jpg", text: "GOOD PLACE" },
						{ bg: "/wallpaper2.jpg", text: "Seni Keharuman yang Bikin Mewah" },
						{ bg: "/background1.jpg", text: "Tampil mewah dan elegan" },
					].map((slide, idx) => (
						<SwiperSlide key={idx}>
							<div className="swiper-slide-custom relative w-full h-full flex items-center justify-center">
								<div
									className="absolute inset-0 w-full h-full bg-center bg-cover sm:bg-cover"
									style={{ backgroundImage: `url(${slide.bg})` }}
								>
									<div className="absolute inset-0 bg-black/40" />
								</div>
								<div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
									<motion.h1
										initial={{ opacity: 0, y: 40 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.8, delay: 0.2 }}
										className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-bold drop-shadow-lg px-4 text-center"
										style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
										key={slide.text}
									>
										{slide.text}
									</motion.h1>
								</div>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
				<style jsx global>{`
	  .mySwiper .swiper-pagination {
		position: absolute;
		right: 24px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 20;
	  }
	  .mySwiper .swiper-pagination-bullet {
		background: #fff;
		opacity: 0.7;
		width: 12px;
		height: 12px;
		margin: 8px 0;
		transition: background 0.2s, opacity 0.2s;
	  }
	  .mySwiper .swiper-pagination-bullet-active {
		background: #bfa16a;
		opacity: 1;
	  }
	  .swiper-slide-custom {
		background: #222;
		display: flex;
		align-items: center;
		justify-content: center;
	  }
	`}</style>
			</motion.section>

 			<motion.section
 				ref={koleksiRef}
 				className="relative px-4 sm:px-8 md:px-12 pb-10 sm:pb-16 mt-10 sm:mt-16"
 				initial={{ opacity: 0, y: 60 }}
 				whileInView={{ opacity: 1, y: 0 }}
 				viewport={{ once: true, amount: 0.3 }}
 				transition={{ duration: 0.8 }}
 			>
				<motion.h2
					initial={{ opacity: 0, x: -60 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7 }}
					className="text-3xl font-light mb-10 text-black relative group cursor-pointer flex flex-col justify-center items-center w-full gap-8"
					tabIndex={0}
				>
					<div className="w-full max-w-3xl mx-auto">
						<MobileSmartSearch openProduct={openProduct} products={parfumRows.flat()} />
					</div>
					<span className="relative group-hover:text-[#bfa16a] group-focus:text-[#bfa16a] transition-colors duration-200 text-center mt-2">
						Koleksi Parfum
						{/* base underline + animated gold overlay */}
						<span className="pointer-events-none absolute left-0 -bottom-1 w-full h-[3px]">
							{/* base line */}
							<span className="block w-full h-full bg-[#000] rounded opacity-95" />
							{/* animated overlay grow-from-left similar to header */}
							<span className="absolute left-0 top-0 h-full w-full bg-[#bfa16a] rounded origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus:scale-x-100" />
						</span>
					</span>
				</motion.h2>
		<div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-10">
					{parfumPages[parfumPage].map((row, i) => (
						<div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
							{row.map((product, j) => (
								<motion.div
									key={j}
									initial={{ opacity: 0, y: 16 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.45, delay: j * 0.06 }}
									whileHover={{ boxShadow: '0 8px 32px 0 rgba(191,161,106,0.18)', zIndex: 2 }}
									className="product-card group bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center transition hover:shadow-2xl border border-[#e5e5e5] cursor-pointer will-change-transform w-full"
									onMouseMove={handleTilt}
									onMouseLeave={resetTilt}
									onClick={() => openProduct(product)}
									onKeyDown={(e) => handleCardKey(e, product)}
									tabIndex={0}
									role="button"
									aria-label={`Lihat detail ${product.name}`}
								>
					{(() => {
						const isRound = product.images[0]?.includes('catalog2.png');
						return (
							<div className={`relative w-full max-w-[340px] sm:max-w-[340px] aspect-square mb-3 sm:mb-4 overflow-hidden mx-auto ${isRound ? 'rounded-3xl' : 'rounded-xl'}`}>
								<Image
										src={product.images[0]}
										alt={product.name}
										fill
										className={`${isRound ? 'object-cover rounded-3xl' : 'object-cover rounded-xl'} card-media group-hover:scale-105 transition-transform duration-300`}
										sizes="(max-width: 640px) 80vw, 320px"
									/>
								<div className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isRound ? 'rounded-3xl' : 'rounded-xl'}`}>
									<span className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
										<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
										Lihat Detail
									</span>
								</div>
							</div>
						);
					})()}
									{/* NEW badge (centered above FRUIROSA product name) */}
										<div className="flex justify-center mb-2 -mt-1" aria-hidden>
											<button
												className="badge-new"
												data-animate="true"
												data-tooltip={`Produk baru — ${product.name}`}
												aria-label={`Produk baru: ${product.name}. Klik untuk info`}
												// onClick={(e) => { e.stopPropagation(); toast(product.name + ' is new ✨', { icon: '🌟' }); }}
												onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toast(product.name + ' is new ✨', { icon: '🌟' }); } }}
											>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="#bfa16a" strokeWidth="1.5">
													<path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.9 4.3L18 8l-4 2.8L14 16l-2-1.4L10 16l.9-5.2L7 8l4.1-1.7L12 2z" />
												</svg>
												NEW
											</button>
										</div>
									<div className={`text-2xl sm:text-3xl font-extrabold mb-1 text-black text-center`}>
										{product.name.includes('Eau De Parfum') ? (
											<>
												<span className="block">{product.name.replace(/\s*Eau De Parfum$/i, '')}</span>
												<span className="block text-sm font-medium text-gray-600 handwritten">Eau De Parfum</span>
											</>
										) : (
											product.name
										)}
									</div>
				  <div className="text-[#bfa16a] text-lg sm:text-xl font-bold mb-2 text-center">
					{product.price}
				  </div>
				</motion.div>
			  ))}
			</div>
		  ))}
		  {/* Pagination UI */}
		  <div className="flex justify-center items-center gap-2 mt-4 select-none">
			<button
			  onClick={() => setParfumPage((p) => Math.max(0, p - 1))}
			  disabled={parfumPage === 0}
			  className={`rounded-full w-9 h-9 flex items-center justify-center border border-[#bfa16a] text-[#bfa16a] bg-white shadow transition hover:bg-[#bfa16a] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed`}
			  aria-label="Sebelumnya"
			>
			  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6l-6 6 6 6"/></svg>
			</button>
			{parfumPages.map((_, idx) => (
			  <button
				key={idx}
				onClick={() => setParfumPage(idx)}
				className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition
				  ${parfumPage === idx ? 'bg-[#bfa16a] text-white border-[#bfa16a]' : 'bg-white text-[#bfa16a] border-[#bfa16a] hover:bg-[#bfa16a] hover:text-white'}`}
				aria-label={`Halaman ${idx + 1}`}
			  >
				{idx + 1}
			  </button>
			))}
			<button
			  onClick={() => setParfumPage((p) => Math.min(parfumPages.length - 1, p + 1))}
			  disabled={parfumPage === parfumPages.length - 1}
			  className={`rounded-full w-9 h-9 flex items-center justify-center border border-[#bfa16a] text-[#bfa16a] bg-white shadow transition hover:bg-[#bfa16a] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed`}
			  aria-label="Berikutnya"
			>
			  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l6 6-6 6"/></svg>
			</button>
		  </div>
		</div>
			</motion.section>
			

			{/* Best Seller */}
			<motion.section
				ref={bestSellerRef}
				className="py-6 sm:py-20 px-4 sm:px-8 relative overflow-hidden"
	 		initial={{ opacity: 0, y: 60 }}
	 		whileInView={{ opacity: 1, y: 0 }}
	 		viewport={{ once: true, amount: 0.3 }}
	 		transition={{ duration: 0.8 }}
 			>
				<motion.h2
					className="text-3xl font-light mb-10 text-black relative group cursor-pointer flex justify-center items-center w-full z-10"
					tabIndex={0}
				>
					<span className="relative group-hover:text-[#bfa16a] group-focus:text-[#bfa16a] transition-colors duration-200 text-center">
						Best Seller Bulan Juli
						<span className="pointer-events-none absolute left-0 -bottom-1 w-full h-[3px]">
							<span className="block w-full h-full bg-[#000] rounded opacity-95" />
							<span className="absolute left-0 top-0 h-full w-full bg-[#bfa16a] rounded origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus:scale-x-100" />
						</span>
					</span>
				</motion.h2>
				<div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
					{products.map((product) => (
						<motion.div
							key={product.name}
							whileHover={{ scale: 1.08, rotate: 2 }}
							className="flex flex-col items-center w-full"
						>
							<Image
								src={product.images[0]}
								alt={product.name}
								width={320}
								height={320}
								className="mb-4 object-cover rounded-xl"
							/>
							<div className="text-xl font-medium mb-2">
								{product.name.includes('Eau De Parfum') ? (
									<>
										<span className="block">{product.name.replace(/\s*Eau De Parfum$/i, '')}</span>
											<span className="block text-sm font-medium text-gray-600 handwritten">Eau De Parfum</span>
									</>
								) : (
									product.name
								)}
							</div>
							<div className="text-[#bfa16a] font-semibold mb-2">
								{product.price}
							</div>
							<button
								onClick={() => {
									setSelectedProduct(product);
									setModalIsOpen(true);
									toast.success("Kamu memilih " + product.name);
								}}
								className="mt-2 px-4 sm:px-6 py-2 bg-[#bfa16a] text-white rounded-full hover:bg-[#a88c5c] transition relative overflow-hidden group"
							>
								<span className="absolute inset-0 pointer-events-none">
									<span className="ripple block w-full h-full rounded-full opacity-0 group-active:opacity-40 bg-white"></span>
								</span>
								Lihat Detail & Beli Sekarang!
							</button>
						</motion.div>
					))}
				</div>

				{/* Modal */}
				<AnimatePresence>
					{modalIsOpen && selectedProduct && (
						<Modal
							isOpen={modalIsOpen}
							onRequestClose={() => closeModal()}
							className="bg-transparent outline-none flex items-center justify-center min-h-screen"
							overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
							ariaHideApp={false}
							shouldCloseOnOverlayClick={true}
						>
							{/* Fixed close for small screens (ensures visible even if dialog content scrolls) */}
							<button
								onClick={() => closeModal()}
								className="fixed top-4 right-4 z-60 md:hidden bg-white/90 text-gray-700 hover:text-[#bfa16a] rounded-full p-2 shadow-lg"
								aria-label="Tutup"
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
							</button>
							<m.div
								initial={{ opacity: 0, scale: 0.85, y: 60 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.85, y: 60 }}
								transition={{ duration: 0.35, type: "spring" }}
								className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-xs sm:max-w-md w-full flex flex-col items-center relative"
							>
								{/* Close button */}
								<button
									onClick={() => closeModal()}
									className="absolute top-4 right-4 text-gray-400 hover:text-[#bfa16a] text-xl font-bold"
									aria-label="Tutup"
								>
									×
								</button>
								{/* Product image carousel */}
								<div className="w-full flex flex-col items-center mb-4">
																	<div className="relative w-full max-w-[340px] aspect-square mb-2 mx-auto">
																		<div className="relative w-full h-full flex flex-row items-center justify-center">
																			{/* Zoom controls */}
							                                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
							                                                                 					<button
							                                                                 						className="bg-white/80 rounded-full p-2 shadow hover:bg-[#bfa16a] hover:text-white transition flex items-center justify-center mb-1"
							                                                                 						style={{ border: '1px solid #bfa16a' }}
							                                                                 						onClick={() => zoomInActive()}
							                                                                 						aria-label="Zoom In"
							                                                                 						>
							                                                                 							<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="9"/><line x1="11" y1="7" x2="11" y2="15"/><line x1="7" y1="11" x2="15" y2="11"/></svg>
							                                                                 						</button>
							                                                                 						<button
							                                                                 						className="bg-white/80 rounded-full p-2 shadow hover:bg-[#bfa16a] hover:text-white transition flex items-center justify-center"
							                                                                 						style={{ border: '1px solid #bfa16a' }}
							                                                                 						onClick={() => zoomOutActive()}
							                                                                 						aria-label="Zoom Out"
							                                                                 						>
							                                                                 							<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="9"/><line x1="7" y1="11" x2="15" y2="11"/></svg>
							                                                                 						</button>
							                                                                 					</div>
																			<Swiper
																				direction="vertical"
																				slidesPerView={1}
																				loop
																				pagination={{ clickable: true }}
																				className="w-full h-full modal-swiper"
																				style={{ width: '100%' }}
																				onSwiper={(swiper) => { modalSwiperRef.current = swiper; }}
																			>
																				{selectedProduct.name === "Baccarat Rouge 540"
																					? ["/catalog1.png", "/catalog2.png"].map((img, idx) => (
																								<SwiperSlide key={idx}>
																									<div className="w-full h-full flex items-center justify-center">
																										<div
																											style={{
																												transform: `translate(${modalOffsets[idx]?.x ?? 0}px, ${modalOffsets[idx]?.y ?? 0}px) scale(${modalZoomes[idx] ?? 1})`,
																												transition: 'transform 0.08s',
																												touchAction: 'none',
																											}}
																											className="relative w-full h-full overflow-hidden"
																											onPointerDown={(e) => startPointerDrag(e, idx)}
																											onPointerMove={(e) => movePointerDrag(e, idx)}
																											onPointerUp={(e) => endPointerDrag(e)}
																											onPointerCancel={(e) => endPointerDrag(e)}
																										>
																											<div className="absolute inset-0 w-full h-full">
																												<Image src={img} alt={selectedProduct.name + idx} fill className="w-full h-full object-cover rounded-xl" sizes="(max-width: 640px) 90vw, 720px" />
																											</div>
																										</div>
																									</div>
																								</SwiperSlide>
																							))
																					: selectedProduct.images.map((img, idx) => (
																								<SwiperSlide key={idx}>
																									<div className="w-full h-full flex items-center justify-center">
																										<div
																											style={{
																												transform: `translate(${modalOffsets[idx]?.x ?? 0}px, ${modalOffsets[idx]?.y ?? 0}px) scale(${modalZoomes[idx] ?? 1})`,
																												transition: 'transform 0.08s',
																												touchAction: 'none',
																											}}
																											className="relative w-full h-full overflow-hidden"
																											onPointerDown={(e) => startPointerDrag(e, idx)}
																											onPointerMove={(e) => movePointerDrag(e, idx)}
																											onPointerUp={(e) => endPointerDrag(e)}
																											onPointerCancel={(e) => endPointerDrag(e)}
																										>
																											<div className="absolute inset-0 w-full h-full">
																												<Image src={img} alt={selectedProduct.name + idx} fill className="w-full h-full object-cover rounded-xl" sizes="(max-width: 640px) 90vw, 720px" />
																											</div>
																										</div>
																									</div>
																								</SwiperSlide>
																							))}
																			</Swiper>
																			{/* Arrow buttons for vertical navigation on right side using ref */}
																			<div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
																				<button
																					className="bg-white/80 rounded-full p-2 shadow hover:bg-[#bfa16a] hover:text-white transition flex items-center justify-center"
																					style={{ border: '1px solid #bfa16a' }}
																					onClick={() => {
																						if (modalSwiperRef.current) modalSwiperRef.current.slidePrev();
																					}}
																					aria-label="Sebelumnya"
																				>
																					<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8l-6 6h12z"/></svg>
																				</button>
																				<button
																					className="bg-white/80 rounded-full p-2 shadow hover:bg-[#bfa16a] hover:text-white transition flex items-center justify-center"
																					style={{ border: '1px solid #bfa16a' }}
																					onClick={() => {
																						if (modalSwiperRef.current) modalSwiperRef.current.slideNext();
																					}}
																					aria-label="Berikutnya"
																				>
																					<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16l6-6H6z"/></svg>
																				</button>
																			</div>
																		</div>
																	</div>
				
								</div>
								<div className="text-lg sm:text-2xl font-bold mb-1 text-center text-black">
									{selectedProduct.name.includes('Eau De Parfum') ? (
										<>
											<span className="block">{selectedProduct.name.replace(/\s*Eau De Parfum$/i, '')}</span>
											<span className="block text-sm font-medium text-gray-600">Eau De Parfum 30ml</span>
										</>
									) : (
										selectedProduct.name
									)}
								</div>
								<div className="text-[#bfa16a] text-base sm:text-xl font-semibold mb-2">{selectedProduct.price}</div>
								<p className="mb-4 text-center text-gray-700 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProduct.desc) }} />
								{/* Share button */}
								<button
											onClick={() => {
												navigator.clipboard.writeText(window.location.origin);
												toast.success("Link Berhasil disalin!");
											}}
									className="mb-4 px-3 sm:px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm flex items-center gap-2 transition"
								>
									<svg width="18" height="18" fill="none" stroke="#bfa16a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 001 1h10a1 1 0 001-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v10"/></svg>
									Bagikan Produk
								</button>
								{/* Buy button with confetti */}
								<button
											onClick={() => {
												window.open("https://shopee.co.id/", "_blank");
											}}
									className="px-4 sm:px-6 py-2 bg-[#bfa16a] text-white rounded-full hover:bg-[#a88c5c] transition font-semibold text-base sm:text-lg relative overflow-hidden group"
								>
									<span className="absolute inset-0 pointer-events-none">
										<span className="ripple block w-full h-full rounded-full opacity-0 group-active:opacity-40 bg-white"></span>
									</span>
									Beli Sekarang
								</button>
								{/* Confetti animation */}
								{showConfetti && (
									<m.div
										initial={{ opacity: 0, scale: 0.7 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.7 }}
										transition={{ duration: 0.5 }}
										className="pointer-events-none absolute inset-0 flex items-center justify-center z-50"
									>
										<svg width="180" height="80" viewBox="0 0 180 80" fill="none">
											<circle cx="30" cy="40" r="6" fill="#bfa16a">
												<animate attributeName="cy" values="40;10;40" dur="1.2s" repeatCount="indefinite" />
											</circle>
											<circle cx="90" cy="40" r="6" fill="#e9e6f6">
												<animate attributeName="cy" values="40;70;40" dur="1.2s" repeatCount="indefinite" />
											</circle>
											<circle cx="150" cy="40" r="6" fill="#bfa16a">
												<animate attributeName="cy" values="40;15;40" dur="1.2s" repeatCount="indefinite" />
											</circle>
										</svg>
									</m.div>
								)}
							</m.div>
						</Modal>
					)}
				</AnimatePresence>
			</motion.section>


			{/* Our Stories Section - Modern, Interactive, Animated */}
 			<motion.section
 				ref={storiesRef}
 				className="py-16 sm:py-24 px-4 sm:px-8 relative"
 				initial={{ opacity: 0, y: 60 }}
 				whileInView={{ opacity: 1, y: 0 }}
 				viewport={{ once: true, amount: 0.3 }}
 				transition={{ duration: 0.8 }}
 			>
				<motion.h2
					initial={{ opacity: 0, x: -60 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7 }}
					className="text-4xl font-extrabold mb-14 text-black relative group cursor-pointer flex justify-center items-center w-full tracking-tight drop-shadow-lg"
					tabIndex={0}
				>
					<span className="relative group-hover:text-[#bfa16a] group-focus:text-[#bfa16a] transition-colors duration-200 text-center">
						Our Stories
						<span className="pointer-events-none absolute left-0 -bottom-1 w-full h-[3px]">
							<span className="block w-full h-full bg-[#000] rounded opacity-95" />
							<span className="absolute left-0 top-0 h-full w-full bg-[#bfa16a] rounded origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus:scale-x-100" />
						</span>
					</span>
				</motion.h2>
				<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
					{[{
						title: "Perjalanan Good Place",
						desc: "Dimulai dari passion akan keharuman, Good Place lahir untuk menghadirkan parfum mewah yang tak hanya wangi, tapi juga bercerita. Setiap botol adalah kisah, setiap aroma adalah kenangan.",
						image: "/LogoGP1.png"
					}, {
						title: "Inovasi & Eksklusivitas",
						desc: "Kami selalu berinovasi dalam menciptakan aroma yang unik dan eksklusif. Tim kami terdiri dari perfumer terbaik dunia yang berkolaborasi untuk menghasilkan koleksi parfum yang tak tertandingi.",
						image: "/window.svg"
					}, {
						title: "Komunitas & Cerita Pelanggan",
						desc: "Setiap pelanggan adalah bagian dari cerita kami. Kami bangga menjadi bagian dari momen spesial Anda, dari hadiah hingga kenangan tak terlupakan.",
						image: "/vercel.svg"
					}].map((story, idx) => (
						<motion.div
							key={idx}
							whileHover={{ scale: 1.06, boxShadow: '0 12px 48px 0 rgba(191,161,106,0.22)', y: -8 }}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.7, delay: idx * 0.2 }}
							className="backdrop-blur-lg bg-white/60 border border-[#e5e5e5] rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:bg-white/80 transition-all duration-300"
						>
							{/* Gradient accent floating blob */}
							<motion.div
								initial={{ opacity: 0, scale: 0.7, y: 30 }}
								animate={{ opacity: 0.18, scale: 1, y: 0 }}
								transition={{ duration: 1.2, delay: 0.5 }}
								className="absolute -top-10 -left-10 w-32 h-32 z-0 pointer-events-none"
							>
								<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="50" rx="40" ry="32" fill="url(#gradStory)" />
									<defs>
										<linearGradient id="gradStory" x1="0" y1="0" x2="100" y2="100">
											<stop offset="0%" stopColor="#bfa16a" stopOpacity="0.7" />
											<stop offset="100%" stopColor="#fff8f0" stopOpacity="0.3" />
										</linearGradient>
									</defs>
								</svg>
							</motion.div>
							<motion.div
								initial={{ scale: 0.8, rotate: -8 }}
								whileHover={{ scale: 1.08, rotate: 0 }}
								transition={{ duration: 0.5 }}
								className="mb-6 relative z-10"
							>
								<Image src={story.image} alt={story.title} width={90} height={90} className="object-contain rounded-2xl drop-shadow-xl" />
							</motion.div>
							<motion.h3
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="text-2xl font-bold mb-3 text-[#bfa16a] drop-shadow-sm"
							>
								{story.title}
							</motion.h3>
							<motion.p
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.3 }}
								className="text-gray-700 mb-4 font-medium"
							>
								{story.desc}
							</motion.p>
							<motion.button
								whileHover={{ backgroundColor: '#bfa16a', color: '#fff', scale: 1.08 }}
								transition={{ duration: 0.3 }}
								className="mt-2 px-6 py-2 rounded-full bg-white/80 text-[#bfa16a] font-bold shadow hover:bg-[#bfa16a] hover:text-white focus:outline-none border border-[#bfa16a]"
								onClick={() => window.alert('Terima kasih telah membaca cerita kami!')}
							>
								Baca Selengkapnya
							</motion.button>
							{/* Parallax accent blob bottom right */}
							<motion.div
								initial={{ opacity: 0, x: 40, scale: 0.7 }}
								animate={{ opacity: 0.14, x: 0, scale: 1 }}
								transition={{ duration: 1.2, delay: 0.7 }}
								className="absolute -bottom-10 -right-10 w-32 h-32 z-0 pointer-events-none"
							>
								<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="50" rx="36" ry="28" fill="url(#gradStory2)" />
									<defs>
										<linearGradient id="gradStory2" x1="0" y1="0" x2="100" y2="100">
											<stop offset="0%" stopColor="#fff8f0" stopOpacity="0.5" />
											<stop offset="100%" stopColor="#bfa16a" stopOpacity="0.2" />
										</linearGradient>
									</defs>
								</svg>
							</motion.div>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* Footer */}
 	  <footer ref={footerRef} className="bg-[#222] text-white py-8 sm:py-12 mt-10 sm:mt-16 shadow-inner relative overflow-hidden text-xs sm:text-base">
		{/* Animated Parfume Bottle Silhouette Footer */}
		<motion.svg
		  initial={{ opacity: 0, scale: 0.8 }}
		  animate={{ opacity: 0.22, scale: 1, y: [0, 18, 0] }}
		  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
		  className="absolute top-2 right-2 sm:top-4 sm:right-12 w-[90px] sm:w-[140px] md:w-[180px] h-[160px] z-0 pointer-events-none"
		  viewBox="0 0 120 220"
		  fill="none"
		>
		  <defs>
			<linearGradient id="parfumFooter" x1="35" y1="60" x2="85" y2="170" gradientTransform="rotate(10)">
			  <stop offset="0%" stopColor="#bfa16a" stopOpacity="0.95" />
			  <stop offset="100%" stopColor="#fff8f0" stopOpacity="0.7" />
			</linearGradient>
		  </defs>
	  {/* Botol parfum kotak siluet */}
	  {/* Badan botol kotak */}
	  <rect x="32" y="60" width="56" height="110" rx="6" fill="url(#parfumFooter)" />
	  {/* Leher botol */}
	  <rect x="50" y="40" width="20" height="24" rx="3" fill="#bfa16a" opacity="0.95" />
	  {/* Tutup botol */}
	  <rect x="46" y="25" width="28" height="18" rx="3" fill="#bfa16a" opacity="0.95" />
	  {/* Highlight */}
	  <rect x="60" y="80" width="8" height="40" rx="2" fill="#fff8f0" opacity="0.18" />
		</motion.svg>
						<div className="max-w-6xl mx-auto flex flex-col md:flex-row md:flex-nowrap justify-between items-start md:items-start gap-4 sm:gap-6 px-4 text-left">
							<div className="flex flex-col items-start gap-4 w-full md:w-1/3">
						<span className="text-2xl font-bold tracking-wide">Good Place</span>
						<span className="text-sm text-gray-400">Seni Keharuman Mewah & Modern</span>
						<div className="flex gap-4 mt-2">
							<motion.a
								href="https://www.instagram.com/goodplace_parfum/"
								aria-label="Instagram"
								className="hover:text-[#bfa16a] transition"
								whileHover={{ scale: 1.2, rotate: -10 }}
								whileTap={{ scale: 0.95 }}
							>
								<svg width="24" height="24" fill="currentColor">
									<path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm6.5-.5a1 1 0 110 2 1 1 0 010-2z" />
								</svg>
							</motion.a>
							<motion.a
								href="#"
								aria-label="Facebook"
								className="hover:text-[#bfa16a] transition"
								whileHover={{ scale: 1.2, rotate: 10 }}
								whileTap={{ scale: 0.95 }}
							>
								<svg width="24" height="24" fill="currentColor">
									<path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5.019 3.676 9.163 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.631.771-1.631 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.324 21.163 22 17.019 22 12z" />
								</svg>
							</motion.a>
							<motion.a
								href="#"
								aria-label="WhatsApp"
								className="hover:text-[#bfa16a] transition"
								whileHover={{ scale: 1.2, rotate: 5 }}
								whileTap={{ scale: 0.95 }}
							>
								<svg width="24" height="24" fill="currentColor">
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.075.149.198 2.099 3.205 5.077 4.487.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347z" />
								</svg>
							</motion.a>
						</div>
						{/* Scroll to top button */}
						{/* {showScroll && (
							<motion.button
								initial={{ opacity: 0, y: 40 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4 }}
								onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
								className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-[#bfa16a] text-white p-3 rounded-full shadow-lg hover:bg-[#a88c5c] transition overflow-hidden group"
								aria-label="Scroll to top"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								<span className="absolute inset-0 pointer-events-none">
									<span className="ripple block w-full h-full rounded-full opacity-0 group-active:opacity-40 bg-white"></span>
								</span>
								<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
							</motion.button>
						)} */}
						{/* Floating WhatsApp chat button */}
						<motion.a
							href="https://wa.me/6288801858508"
							target="_blank"
							rel="noopener"
							className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition flex items-center"
							aria-label="Chat WhatsApp"
							animate={{ y: [0, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
						>
							<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.075.149.198 2.099 3.205 5.077 4.487.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347z"/></svg>
							<span className="ml-2 hidden md:inline font-semibold">Chat</span>
						</motion.a>
						{/* Ripple effect for scroll to top button */}
						<style jsx global>{`
	.ripple {
	  animation: ripple 0.5s linear;
	}
	@keyframes ripple {
	  0% { opacity: 0.4; transform: scale(0.8); }
	  100% { opacity: 0; transform: scale(2.2); }
	}
  `}</style>
					</div>
		  {/* Accordion Kontak */}
		  <div className="flex flex-col gap-2 items-start w-full md:w-1/6 mt-6 md:mt-0">
			<button
			  className="flex items-center justify-between w-full md:w-auto font-semibold mb-2 focus:outline-none"
			  onClick={() => toggleAccordion('kontak')}
			  aria-expanded={footerAccordion.kontak}
			  aria-controls="footer-kontak"
			>
			  Kontak
			  <svg className={`ml-2 transition-transform duration-200 ${footerAccordion.kontak ? 'rotate-90' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4"/></svg>
			</button>
			<div
			  id="footer-kontak"
			  className={`flex flex-col gap-3 transition-all duration-300 overflow-hidden
				${footerAccordion.kontak ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
				md:max-h-none md:opacity-100 md:pl-0
				${footerAccordion.kontak ? 'pointer-events-auto' : 'pointer-events-none'}
				md:pointer-events-auto
			  `}
			>
			  <span className="text-sm text-gray-400">Email: info@goodplace.com</span>
			  <span className="text-sm text-gray-400">WA: 0812-3456-7890</span>
			  <span className="text-sm text-gray-400">Alamat: Bandung, Indonesia</span>
			</div>
		  </div>
					{/* Marketplace accordion (mobile) */}
					<div className="flex flex-col gap-2 items-start w-full md:w-1/6 mt-6 md:mt-0">
						<button
							className="flex items-center justify-between w-full md:w-auto font-semibold mb-2 focus:outline-none"
							onClick={() => toggleAccordion('marketplace')}
							aria-expanded={footerAccordion.marketplace}
							aria-controls="footer-marketplace"
						>
							Marketplace
							<svg className={`ml-2 transition-transform duration-200 ${footerAccordion.marketplace ? 'rotate-90' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4"/></svg>
						</button>
						<div
							id="footer-marketplace"
							className={`flex flex-col gap-2 pl-2 transition-all duration-300 overflow-hidden
								${footerAccordion.marketplace ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
								md:max-h-none md:opacity-100 md:pl-0
								${footerAccordion.marketplace ? 'pointer-events-auto' : 'pointer-events-none'}
								md:pointer-events-auto
							`}
						>
							<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Shopee</a>
							<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Tokopedia</a>
							<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Lazada</a>
							<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Tik Tok Shop</a>
						</div>
					</div>
		  {/* Accordion Tautan Cepat */}
		  <div className="flex flex-col gap-2 items-start w-full md:w-1/6 mt-6 md:mt-0">
			<button
			  className="flex items-center justify-between w-full md:w-auto font-semibold mb-2 focus:outline-none"
			  onClick={() => toggleAccordion('tautan')}
			  aria-expanded={footerAccordion.tautan}
			  aria-controls="footer-tautan"
			>
			  Tautan Cepat
			  <svg className={`ml-2 transition-transform duration-200 ${footerAccordion.tautan ? 'rotate-90' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4"/></svg>
			</button>
			<div
			  id="footer-tautan"
			  className={`flex flex-col gap-2 pl-2 transition-all duration-300 overflow-hidden
				${footerAccordion.tautan ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
				md:max-h-none md:opacity-100 md:pl-0
				${footerAccordion.tautan ? 'pointer-events-auto' : 'pointer-events-none'}
				md:pointer-events-auto
			  `}
			>
			  <a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Instagram</a>
					<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Twitter</a>
					<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Tiktok</a>
					<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Youtube</a>
					<a href="#" className="text-sm text-gray-400 hover:text-[#bfa16a]">Linkedln</a>
			</div>
			{/* Marketplace */}

				
		  </div>
				</div>
				<div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-white">© 2025 Good Place. All rights reserved.</div>
			</footer>
			<ScrollToTop />
			<ChatBot />
		</div>
	);
}

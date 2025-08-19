"use client";
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<div className="text-center p-8">
				<h1 className="text-6xl font-extrabold text-[#bfa16a]">404</h1>
				<p className="mt-4 text-xl text-black">Halaman tidak ditemukan.</p>
				<div className="mt-6">
					<Link href="/" className="px-6 py-2 bg-[#bfa16a] text-white rounded-full">Kembali ke Beranda</Link>
				</div>
			</div>
		</div>
	);
}

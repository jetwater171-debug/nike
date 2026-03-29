"use client";

import { motion } from "framer-motion";
import { Search, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: smoothEase }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="relative z-10 flex items-center gap-4 group">
          <div className="w-10 h-10 relative overflow-hidden flex items-center justify-center">
            {/* Using a generic jordan logo or text since we might not have a perfect SVG */}
            <Image
              src="/assets/jordan_logo.png"
              alt="Jordan Logo"
              width={32}
              height={32}
              className="object-contain filter invert opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="text-sm font-medium tracking-widest uppercase hidden md:block">
            Jordan II 26/27
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-gray-300">
          <Link href="#design" className="hover:text-white transition-colors">
            Design
          </Link>
          <Link href="#performance" className="hover:text-white transition-colors">
            Performance
          </Link>
          <Link href="#history" className="hover:text-white transition-colors">
            Legado
          </Link>
        </nav>

        <div className="flex items-center gap-6 text-white">
          <button className="hover:text-gray-300 transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button className="hover:text-gray-300 transition-colors relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--nike-neon)] text-black text-[10px] flex items-center justify-center rounded-full font-bold">
              1
            </span>
          </button>
          <button className="md:hidden">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.header>
  );
}

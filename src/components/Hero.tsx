"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase },
  },
};

export function Hero() {
  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-emerald-900/20 blur-[120px] mix-blend-screen z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full gap-8 grid lg:grid-cols-2 lg:gap-16 items-center relative z-10">
        
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <motion.div variants={itemVariants} className="inline-block">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#00ffaa] uppercase mb-4 shadow-[0_0_20px_rgba(0,255,170,0.1)]">
              Edição Jogador Oficial 26/27
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white uppercase"
          >
            Ataque
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Fulminante.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-lg text-lg sm:text-xl text-gray-400 font-light leading-relaxed"
          >
            Camisa Seleção Brasileira Jordan II. Tecida com a inovação Dri-FIT ADV e um visual "Neon Ocean", inspirado nas cores de advertência letal do raro Sapo-Flecha amazônico.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex items-center gap-6">
            <button className="bg-[#00ffaa] text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(0,255,170,0.3)]">
              Avise-me quando lançar
            </button>
            <button className="text-white hover:text-gray-300 uppercase tracking-wider text-sm font-semibold flex items-center gap-2 group transition-colors">
              <span className="w-10 h-[1px] bg-white/30 group-hover:bg-white group-hover:w-16 transition-all duration-300"></span>
              Descobrir Design
            </button>
          </motion.div>
        </motion.div>

        {/* Image Content (Asymmetrical) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, ease: smoothEase, delay: 0.3 }}
          className="relative lg:h-[80vh] flex items-center justify-center mt-12 lg:mt-0"
        >
          {/* Neon Ring behind the jersey */}
          <div className="absolute inset-0 m-auto w-3/4 max-w-[500px] aspect-square rounded-full border border-white/10 blur-[2px]" />
          <div className="absolute inset-0 m-auto w-[65%] max-w-[400px] aspect-square rounded-full border border-[#00ffaa]/20 blur-[1px] shadow-[0_0_80px_rgba(0,255,170,0.1)]" />

          <Image
            src="/assets/brazil_jersey.png"
            alt="Nike Brazil Jordan II 26/27 Jersey"
            width={800}
            height={1000}
            priority
            className="relative z-10 w-full max-w-[600px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-[2deg] hover:rotate-[0deg] transition-transform duration-700 hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
}

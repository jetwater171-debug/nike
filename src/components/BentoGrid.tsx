"use client";

import { motion } from "framer-motion";
import { Droplets, Activity, Zap } from "lucide-react";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function BentoGrid() {
  const bentoVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1, ease: smoothEase },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section id="performance" className="max-w-7xl mx-auto px-6 py-24 relative bg-black">
      <motion.div
        variants={bentoVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
      >
        {/* Large Tile - Dri-FIT */}
        <motion.div
          variants={item}
          className="md:col-span-2 row-span-1 md:row-span-2 rounded-[2rem] bg-zinc-900 border border-white/10 p-10 flex flex-col justify-between overflow-hidden relative group"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-8 overflow-hidden backdrop-blur-md">
             <Droplets className="text-[#00ffaa]" strokeWidth={1.5} size={28} />
          </div>

          <div className="relative z-10 max-w-sm">
            <h3 className="text-3xl font-bold tracking-tight text-white mb-4">
              Dri-FIT ADV: Respirabilidade Absoluta
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Projetada para máximo desempenho em campo. Nossa tecnologia pioneira de absorção de umidade aliada a zonas de ventilação estratégicas mantém a temperatura corporal do atleta sob total controle mesmo sob extrema pressão.
            </p>
          </div>
          
          {/* Abstract texture for background */}
          <div className="absolute right-[-10%] bottom-[-10%] w-2/3 max-w-[400px] aspect-square bg-gradient-radial from-white/[0.03] to-transparent rounded-full pointer-events-none" />
        </motion.div>

        {/* Small upper tile - Jordan Heritage */}
        <motion.div
          variants={item}
          className="col-span-1 rounded-[2rem] bg-zinc-900 border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="relative z-10 w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
             <Activity className="text-white" strokeWidth={1.5} size={20} />
          </div>
          
          <div className="relative z-10 mt-auto">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-2 block">
              O Legado
            </span>
            <h4 className="text-xl font-semibold text-white">
              Herança Jordan
            </h4>
            <p className="text-sm text-gray-400 mt-2 font-light">
              Um crossover histórico. Pela primeira vez, a grandeza do Jumpman assina o manto pentacampeão.
            </p>
          </div>
        </motion.div>

        {/* Small lower tile - Toxina Sapo-Flecha (Neon Ocean) */}
        <motion.div
          variants={item}
          className="col-span-1 rounded-[2rem] bg-[#00ffaa]/5 border border-[#00ffaa]/20 p-8 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffaa]/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center border border-[#00ffaa]/30 backdrop-blur-md">
             <Zap className="text-[#00ffaa]" strokeWidth={1.5} size={20} />
          </div>
          
          <div className="relative z-10 mt-auto">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#00ffaa] mb-2 block">
              Inspiração Sapo-Flecha
            </span>
            <h4 className="text-xl font-semibold text-white">
              Sinal de Predação
            </h4>
            <p className="text-sm text-gray-400 mt-2 font-light">
              As vibrantes tonalidades Neon Ocean alertam: esta é a peçonha natural da Seleção Brasileira, letal aos adversários.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}

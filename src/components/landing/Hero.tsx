'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calculator, Phone } from 'lucide-react';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Stenläggning-i-Stockholm.jpg"
          alt="Professionell stenläggning i Stockholm"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#C8A55C]/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.div variants={item} className="mb-6">
            <div className="w-10 h-0.5 bg-gold mb-6" />
            <span className="text-gold text-sm font-medium tracking-widest uppercase">
              Stenläggare i Stockholm sedan 2018
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-6 tracking-tight"
          >
            Professionell
            <br />
            stenläggning
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-white/65 mb-10 max-w-lg leading-relaxed"
          >
            Få en kostnadsfri offert på 3 minuter. Vi är den enda stenläggaren
            i Stockholm med en online-kalkylator.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 bg-gold hover:bg-gold-dark text-charcoal font-semibold shadow-lg border-0"
            >
              <Link href="/kalkyl" className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Räkna pris direkt
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 border-white/20 text-white/90 hover:bg-white/10 bg-transparent"
            >
              <a href="tel:+46735757897" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Ring oss
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-6 text-sm text-white/40"
          >
            <span>11 medarbetare</span>
            <span className="w-px h-3 bg-white/20" />
            <span>26.5 MSEK omsättning</span>
            <span className="w-px h-3 bg-white/20" />
            <span>Hela Stockholmsområdet</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Kostar hembesöket något?',
    answer: 'Nej, hembesöket är helt kostnadsfritt och utan förpliktelser. Vi besöker dig, bedömer förutsättningarna och lämnar en offert — utan att det kostar dig något.',
  },
  {
    question: 'Hur lång tid tar hembesöket?',
    answer: 'Ett hembesök tar normalt 45–60 minuter. Under besöket mäter vi upp, diskuterar dina önskemål och bedömer förutsättningarna.',
  },
  {
    question: 'När får jag min offert?',
    answer: 'Du får en detaljerad offert inom 48 timmar efter hembesöket. Offerten innehåller alla kostnader specificerade så att du kan ta ett välgrundat beslut.',
  },
  {
    question: 'Vilka områden betjänar ni?',
    answer: 'Vi betjänar hela Stockholmsområdet inklusive Bromma, Nacka, Sollentuna, Täby, Lidingö, Danderyd och omgivande kommuner.',
  },
  {
    question: 'Måste jag bestämma mig direkt?',
    answer: 'Nej, absolut inte. Offerten är giltig i 30 dagar och du bestämmer i din egen takt. Vi finns här om du har frågor.',
  },
];

export function BookingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-sand-50 py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="w-10 h-0.5 bg-gold mx-auto mb-6" />
        <h2 className="font-display text-2xl md:text-3xl text-center text-charcoal mb-10">
          Vanliga frågor
        </h2>
        <div className="divide-y divide-sand-200">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="flex w-full items-center justify-between py-5 text-left group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-display text-lg text-charcoal pr-4 group-hover:text-gold-dark transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-stone-400 shrink-0 transition-transform duration-300',
                    openIndex === i && 'rotate-180 text-gold'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                    className="overflow-hidden"
                  >
                    <p className="text-stone-500 leading-relaxed pb-5">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

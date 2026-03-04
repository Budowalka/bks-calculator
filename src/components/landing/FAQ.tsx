'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Vad kostar stenläggning per m²?',
    answer:
      'Priset varierar beroende på material och förutsättningar. Marksten kostar vanligtvis 800–1 500 kr/m², betongplattor 600–1 200 kr/m² och natursten från 1 200 kr/m². Använd vår kalkylator för att få en prisuppskattning anpassad efter ditt projekt.',
  },
  {
    question: 'Hur lång tid tar ett stenläggningsprojekt?',
    answer:
      'En typisk uppfart (30–50 m²) tar cirka 3–5 arbetsdagar. Större projekt som uteplatser eller trädgårdsanläggningar kan ta 1–2 veckor. Tidsplanen beror på markförhållanden, materialval och projektets omfattning.',
  },
  {
    question: 'Behöver jag bygglov för stenläggning?',
    answer:
      'I de flesta fall behövs inget bygglov för stenläggning på din egen tomt. Undantag kan gälla vid förändring av markhöjd, dagvattenhantering eller om fastigheten ligger inom detaljplanerat område med särskilda bestämmelser.',
  },
  {
    question: 'Vilka material kan jag välja?',
    answer:
      'Vi arbetar med alla vanliga material: marksten, betongplattor, gatsten (smågatsten och storgatsten), natursten, granithällar, skiffer och asfalt. Varje material har sina fördelar beroende på användningsområde, estetik och budget.',
  },
  {
    question: 'Vad ingår i en offert från BKS?',
    answer:
      'Vår offert inkluderar allt: material, arbete, maskintransport, schaktning, underarbete, stenläggning, fogning och bortforsling av schaktmassor. Inga dolda kostnader — du ser exakt vad varje del kostar.',
  },
  {
    question: 'Hur förbereder man marken före stenläggning?',
    answer:
      'Markförberedelse inkluderar schaktning (bortgrävning av jord), utläggning av bärlager (makadam/kross), kompaktering med vibratorplatta, och avjämning med sättsand. En korrekt grund är avgörande för att stenläggningen ska hålla i många år.',
  },
  {
    question: 'Jobbar ni under vintern?',
    answer:
      'Vi utför stenläggning främst under säsongen april–november, då markförhållandena är optimala. Under vintern kan vi planera och förbereda projekt. Kontakta oss gärna under vintern för att boka in våren.',
  },
  {
    question: 'Vilka områden betjänar ni?',
    answer:
      'Vi betjänar hela Stockholmsområdet inklusive Bromma, Nacka, Sollentuna, Täby, Lidingö, Danderyd och omgivande kommuner.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-sand-50 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="w-10 h-0.5 bg-gold mb-6 mx-auto" />
        <h2 className="font-display text-3xl md:text-4xl text-center text-charcoal mb-4">
          Vanliga frågor
        </h2>
        <p className="text-center text-stone-500 mb-12">
          Svar på de vanligaste frågorna om stenläggning i Stockholm
        </p>

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
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
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

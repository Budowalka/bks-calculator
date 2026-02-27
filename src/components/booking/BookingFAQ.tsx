'use client';

import { useState } from 'react';
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
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
          Vanliga frågor
        </h2>
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="flex w-full items-center justify-between py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200',
                    openIndex === i && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  openIndex === i ? 'max-h-60 pb-5' : 'max-h-0'
                )}
              >
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

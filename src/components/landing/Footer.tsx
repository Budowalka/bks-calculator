import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#141413] text-stone-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <Image
              src="/images/logo-bks.png"
              alt="BKS Entreprenad"
              width={100}
              height={33}
              className="h-6 w-auto drop-shadow-[0_1px_2px_rgba(255,255,255,0.15)]"
            />
            <p className="text-sm leading-relaxed">
              Professionell stenläggning och markarbete i Stockholmsområdet
              sedan 2018.
            </p>
            <div className="text-xs text-stone-600">
              BKS Äkeri AB · Org.nr 559179-6700
            </div>
          </div>

          <div>
            <h4 className="text-stone-300 text-sm font-medium mb-4 tracking-wide uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/kalkyl"
                  className="hover:text-gold transition-colors"
                >
                  Kalkylator
                </Link>
              </li>
              <li>
                <Link
                  href="/boka-hembesok"
                  className="hover:text-gold transition-colors"
                >
                  Boka hembesök
                </Link>
              </li>
              <li>
                <a
                  href="#om-oss"
                  className="hover:text-gold transition-colors"
                >
                  Om oss
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-gold transition-colors">
                  Vanliga frågor
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-stone-300 text-sm font-medium mb-4 tracking-wide uppercase">
              Kontakt
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold" />
                <a
                  href="tel:+46735757897"
                  className="hover:text-gold transition-colors"
                >
                  073-575 78 97
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <a
                  href="mailto:ramiro@bksakeri.se"
                  className="hover:text-gold transition-colors"
                >
                  ramiro@bksakeri.se
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold mt-0.5" />
                <span>Kungsgatan 29, 111 56 Stockholm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} BKS Äkeri AB. Alla rättigheter
          förbehållna.
        </div>
      </div>
    </footer>
  );
}

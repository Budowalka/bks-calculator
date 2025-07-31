import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Stenläggning-i-Stockholm.jpg"
            alt="Professionell stenläggning i Stockholm"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-indigo-900/40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/logo-bks.png"
                alt="BKS Logo"
                width={180}
                height={60}
                className="h-12 w-auto md:h-16"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-4xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-4">
                  Räkna priset på din
                  <span className="block text-blue-600">stenläggning</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  Få en professionell offert på bara <strong>3 minuter</strong>. 
                  <br className="hidden md:block" />
                  Helt kostnadsfritt och utan förpliktelser.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-10 py-6 bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Link href="/kalkyl" className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Starta kalkylatorn
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Kostnadsfritt</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>3 minuter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Utan förpliktelser</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/80 backdrop-blur-sm border-y border-blue-100">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Så fungerar det
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tre enkla steg till din professionella stenläggningsoffert
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow bg-white/90">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  1. Fyll i formulär
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Svara på enkla frågor om ditt projekt. Tar bara 3 minuter och kräver inga tekniska kunskaper.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow bg-white/90">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  2. Få din offert
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Få en detaljerad offert direkt baserad på verkliga kostnader och vår mångåriga erfarenhet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow bg-white/90">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  3. Boka hembesök
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Boka kostnadsfritt hembesök för exakt mätning och slutlig offert. Utan förpliktelser.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/Stenlägning-färdig-projekt.jpg"
            alt="Färdig stenläggning"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Redo att börja?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Ta det första steget mot din drömträdgård. 
              <br className="hidden md:block" />
              Få din professionella offert på <strong className="text-white">under 3 minuter</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="text-xl px-12 py-6 bg-white text-blue-700 hover:bg-blue-50 shadow-2xl font-semibold">
              <Link href="/kalkyl" className="flex items-center gap-3">
                <Calculator className="w-6 h-6" />
                Starta kalkylatorn nu
              </Link>
            </Button>
          </div>

          {/* Additional trust signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium">100% kostnadsfritt</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-300" />
              <span className="font-medium">Tar bara 3 minuter</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium">Inga förpliktelser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

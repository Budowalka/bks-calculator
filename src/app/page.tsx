import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              BKS Calculator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Få en professionell offert för stenläggning på bara några minuter. 
              Helt kostnadsfritt och utan förpliktelser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/kalkyl">
                Räkna pris direkt
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Läs mer om oss
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Snabb offert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Få en detaljerad prisuppskattning på bara 3-5 minuter genom vår smarta kalkylator.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏗️</span>
                Professionellt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Baserat på verkliga kostnader och många års erfarenhet av stenläggning i Stockholm.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📞</span>
                Kostnadsfritt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ingen kostnad för offerten. Boka sedan hembesök för exakt prisuppgift.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 py-16 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Redo att börja ditt projekt?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ta det första steget mot en skönare utemiljö med vår stenläggningskalkylator.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/kalkyl">
              Starta kalkylatorn →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

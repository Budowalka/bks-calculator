// Constants for the BKS Calculator application

import { MaterialOption } from './types';

// Material options with images from smova.se
export const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    value: 'Asfalt',
    label: 'Asfalt',
    image: '/images/materials/asfalt.jpg',
    description: 'Slät och praktisk yta för alla typer av trafik'
  },
  {
    value: 'Marksten',
    label: 'Marksten', 
    image: '/images/materials/marksten.jpg',
    description: 'Klassisk och hållbar stenläggning'
  },
  {
    value: 'Betongplattor',
    label: 'Betongplattor',
    image: '/images/materials/betongplattor.jpg', 
    description: 'Modern och stilren betonglösning'
  },
  {
    value: 'Smågatsten',
    label: 'Smågatsten',
    image: '/images/materials/smagatsten.jpg',
    description: 'Traditionell charm med smågatsten'
  },
  {
    value: 'Storgatsten', 
    label: 'Storgatsten',
    image: '/images/materials/storgatsten.jpg',
    description: 'Robust och tidlös storgatsten'
  },
  {
    value: 'Granithällar',
    label: 'Granithällar',
    image: '/images/materials/granithall.jpg', 
    description: 'Exklusiv natursten av högsta kvalitet'
  },
  {
    value: 'Skiffer',
    label: 'Skiffer',
    image: '/images/materials/skiffer.jpg',
    description: 'Elegant och unik skiffer'
  }
];

// Site preparation options
export const PREPARATION_OPTIONS = [
  {
    value: 'Området är utgrävt och klart för stenläggning',
    title: 'Klart för läggning',
    description: 'Området är redan utgrävt och förberett'
  },
  {
    value: 'Området kräver lätt nivellering',
    title: 'Behöver nivellering', 
    description: 'Mindre markarbeten behövs'
  },
  {
    value: 'Området har inte förberetts än',
    title: 'Inte förberett',
    description: 'Omfattande schakt- och förberedelsearbeten'
  }
];

// Usage type options
export const USAGE_OPTIONS = [
  {
    value: 'Trafikyta',
    title: 'Trafikyta',
    description: 'För bilar och andra fordon (t.ex. biluppfart eller parkering)'
  },
  {
    value: 'Gångyta', 
    title: 'Gångyta',
    description: 'Enbart för fotgängare (t.ex. terrass eller gångväg)'
  }
];

// Grouting options
export const GROUTING_OPTIONS = [
  {
    value: 'Ögreshämande fogsand',
    title: 'Ögreshämande fogsand',
    description: 'Perfekt för områden som behöver en stabil fog som även hindrar ogräs från att växa',
    popular: true
  },
  {
    value: 'Flexibel hårdfog',
    title: 'Flexibel hårdfog', 
    description: 'Används för rörliga underlag, absorberar rörelser och minimerar sprickrisker'
  }
];

// Curb material options
export const CURB_MATERIAL_OPTIONS = [
  {
    value: 'Granitkantsten',
    label: 'Granitkantsten',
    image: '/images/materials/granitkantsten.jpg',
    description: 'Hållbar granit av högsta kvalitet'
  },
  {
    value: 'Betongkantsten',
    label: 'Betongkantsten', 
    image: '/images/materials/betongkantsten.jpg',
    description: 'Praktisk och kostnadseffektiv betong'
  }
];

// Machine access options
export const MACHINE_ACCESS_OPTIONS = [
  {
    value: 'Plats för att köra in med 6 ton maskin ca 2 m bredd',
    title: 'Stor maskin (6 ton)',
    description: 'Behöver 2 meter bredd - snabbast och mest effektivt',
    width: '2m',
    weight: '6 ton'
  },
  {
    value: 'Plats för att köra in med 3 ton maskin ca 1,5 m bredd', 
    title: 'Medium maskin (3 ton)',
    description: 'Behöver 1,5 meter bredd - bra balans mellan effektivitet och tillgänglighet',
    width: '1,5m', 
    weight: '3 ton'
  },
  {
    value: 'Plats för att köra in med 1,5 ton maskin ca 1 m bredd',
    title: 'Liten maskin (1,5 ton)',
    description: 'Behöver endast 1 meter bredd - för trånga utrymmen',
    width: '1m',
    weight: '1,5 ton'
  }
];

// Yes/No options for crane access
export const CRANE_ACCESS_OPTIONS = [
  {
    value: 'Ja',
    title: 'Ja, finns plats',
    description: 'Tillräckligt med utrymme för lastbil (ca 10 meter) framför fastigheten'
  },
  {
    value: 'Nej',
    title: 'Nej, begränsat',
    description: 'Begränsat utrymme - material måste transporteras för hand'
  }
];

// Social proof messages for different steps
export const SOCIAL_PROOF = {
  material: "Marksten är vårt mest populära val (68% väljer detta)",
  usage: "De flesta kunder väljer gångyta för trädgårdsprojekt", 
  final: "450+ nöjda kunder har fått offert genom vår kalkylator"
};

// Default form values
export const DEFAULT_FORM_VALUES = {
  area: 50,
  fog: 'Ögreshämande fogsand' as const,
  kantsten_need: 'Nej' as const,
  plats_kranbil: 'Ja' as const
};
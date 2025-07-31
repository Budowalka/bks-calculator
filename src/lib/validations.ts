import { z } from 'zod';

// Form validation schemas using Zod

export const FormDataSchema = z.object({
  // Material and project specifications
  materialval: z.enum(['Asfalt', 'Marksten', 'Betongplattor', 'Smågatsten', 'Storgatsten', 'Granithällar', 'Skiffer']),
  area: z.number().min(10, 'Minsta område är 10m²').max(500, 'Största område är 500m²'),
  forberedelse: z.enum([
    'Området har inte förberetts än', 
    'Området kräver lätt nivellering', 
    'Området är utgrävt och klart för stenläggning'
  ]),
  anvandning: z.enum(['Trafikyta', 'Gångyta']),
  fog: z.enum(['Ögreshämande fogsand', 'Flexibel hårdfog']),
  
  // Curb specifications
  kantsten_need: z.enum(['Ja', 'Nej']),
  kantsten_langd: z.number().min(1).max(200).optional(),
  materialval_kantsten: z.enum(['Betongkantsten', 'Granitkantsten']).optional(),
  
  // Site access
  maskin_plats: z.enum([
    'Plats för att köra in med 1,5 ton maskin ca 1 m bredd',
    'Plats för att köra in med 3 ton maskin ca 1,5 m bredd', 
    'Plats för att köra in med 6 ton maskin ca 2 m bredd'
  ]),
  plats_kranbil: z.enum(['Ja', 'Nej'])
}).refine((data) => {
  // If kantsten_need is 'Ja', then kantsten_langd and materialval_kantsten are required
  if (data.kantsten_need === 'Ja') {
    return data.kantsten_langd && data.materialval_kantsten;
  }
  return true;
}, {
  message: 'Kantsten längd och material krävs när kantsten behövs',
  path: ['kantsten_langd']
});

export const CustomerInfoSchema = z.object({
  first_name: z.string().min(2, 'Förnamn måste vara minst 2 tecken'),
  last_name: z.string().min(2, 'Efternamn måste vara minst 2 tecken'),
  phone: z.string().regex(/^\+?[0-9\s\-()]{8,15}$/, 'Ogiltigt telefonnummer'),
  email: z.string().email('Ogiltig e-postadress'),
  marketing_consent: z.boolean().optional()
});

export const CompleteFormSchema = FormDataSchema.merge(z.object({
  customer: CustomerInfoSchema
}));

// Individual step validation schemas
export const Step1Schema = z.object({
  materialval: FormDataSchema.shape.materialval
});

export const Step2Schema = z.object({
  area: FormDataSchema.shape.area
});

export const Step3Schema = z.object({
  forberedelse: FormDataSchema.shape.forberedelse
});

export const Step4Schema = z.object({
  anvandning: FormDataSchema.shape.anvandning
});

export const Step5Schema = z.object({
  fog: FormDataSchema.shape.fog
});

export const Step6Schema = z.object({
  kantsten_need: FormDataSchema.shape.kantsten_need,
  kantsten_langd: FormDataSchema.shape.kantsten_langd,
  materialval_kantsten: FormDataSchema.shape.materialval_kantsten
}).refine((data) => {
  if (data.kantsten_need === 'Ja') {
    return data.kantsten_langd && data.materialval_kantsten;
  }
  return true;
}, {
  message: 'Längd och material krävs för kantsten',
  path: ['kantsten_langd']
});

export const Step7Schema = z.object({
  maskin_plats: FormDataSchema.shape.maskin_plats
});

export const Step8Schema = z.object({
  plats_kranbil: FormDataSchema.shape.plats_kranbil
});

export const Step9Schema = CustomerInfoSchema;

export type FormDataType = z.infer<typeof FormDataSchema>;
export type CustomerInfoType = z.infer<typeof CustomerInfoSchema>;
export type CompleteFormType = z.infer<typeof CompleteFormSchema>;
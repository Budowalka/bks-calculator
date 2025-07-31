// BKS Calculator Business Logic - implements decision tree from documentation

import { FormData, QuoteItem, Quote, PricingComponent } from './types';
import { findPricingComponent, generateQuoteId, getValidUntilDate } from './airtable';

export class BKSCalculator {
  private pricing: PricingComponent[];

  constructor(pricing: PricingComponent[]) {
    this.pricing = pricing;
  }

  /**
   * Calculate complete quote based on form data
   */
  calculateQuote(formData: FormData): Quote {
    const items: QuoteItem[] = [];

    // Phase 1: Fixed components (always included)
    items.push(...this.getFixedComponents());

    // Phase 2: Conditional components (decision tree)
    items.push(...this.getConditionalComponents(formData));

    // Calculate totals and create quote
    const totalSek = items.reduce((sum, item) => sum + item.total_sek, 0);
    const totalWithVat = totalSek * 1.25; // 25% VAT
    const estimatedDays = this.calculateWorkDays(items);
    const categorySummary = this.calculateCategorySummary(items);

    return {
      quote_id: generateQuoteId(),
      items,
      categories_summary: categorySummary,
      total_sek: Math.round(totalSek),
      total_sek_with_vat: Math.round(totalWithVat),
      estimated_days: estimatedDays,
      valid_until: getValidUntilDate()
    };
  }

  /**
   * Get fixed components that are always included
   */
  private getFixedComponents(): QuoteItem[] {
    const items: QuoteItem[] = [];

    // Machine transport
    const machineTransport = this.createQuoteItem(
      'Flytt av maskiner och verktyg',
      'Maskinflytt',
      2,
      'st'
    );
    if (machineTransport) items.push(machineTransport);

    // Site measurement
    const measurement = this.createQuoteItem(
      'Utmättning',
      'Maskinflytt',
      1,
      'st'
    );
    if (measurement) items.push(measurement);

    // Transport costs
    const transport = this.createQuoteItem(
      'Fraktkostnader',
      'Maskinflytt',
      1,
      'st'
    );
    if (transport) items.push(transport);

    return items;
  }

  /**
   * Get conditional components based on decision tree
   */
  private getConditionalComponents(formData: FormData): QuoteItem[] {
    const items: QuoteItem[] = [];

    // Decision 1: Curb requirements
    if (formData.kantsten_need === 'Ja' && formData.kantsten_langd) {
      items.push(...this.getCurbComponents(formData));
    }

    // Decision 2: Site preparation
    items.push(...this.getPreparationComponents(formData));

    // Decision 3: Material installation
    items.push(...this.getMaterialComponents(formData));

    // Decision 4: Grouting
    items.push(...this.getGroutingComponents(formData));

    // Decision 5: Cleanup (always included)
    items.push(...this.getCleanupComponents(formData));

    return items;
  }

  /**
   * Get curb-related components
   */
  private getCurbComponents(formData: FormData): QuoteItem[] {
    if (formData.kantsten_need !== 'Ja' || !formData.kantsten_langd || !formData.materialval_kantsten) {
      return [];
    }

    const componentName = formData.materialval_kantsten === 'Betongkantsten' 
      ? 'Kantstöd betong - mõtstöd betong - rak sten'
      : 'Kantstöd granit - mõtstöd betong - rak sten';

    const curbItem = this.createQuoteItem(
      componentName,
      'Stenläggning',
      formData.kantsten_langd,
      'lpm'
    );

    return curbItem ? [curbItem] : [];
  }

  /**
   * Get site preparation components
   */
  private getPreparationComponents(formData: FormData): QuoteItem[] {
    const items: QuoteItem[] = [];

    switch (formData.forberedelse) {
      case 'Området kräver lätt nivellering':
        const leveling = this.createQuoteItem(
          'Schakt för lätt nivellering', 
          'Schakt',
          formData.area,
          'm²'
        );
        if (leveling) items.push(leveling);
        break;

      case 'Området har inte förberetts än':
        if (formData.anvandning === 'Trafikyta') {
          // Traffic area preparation
          const excavation = this.createQuoteItem('Schakt 400mm djup', 'Schakt', formData.area, 'm²');
          const baseLayer = this.createQuoteItem('Anläggning och justering av bärlager vid trafikyta', 'Underarbete', formData.area, 'm²');
          const compaction = this.createQuoteItem('Packning av bärlager vid uppfart', 'Underarbete', formData.area, 'm²');
          const wasteRemoval = this.createQuoteItem(
            'Bortforsling av schaktmassor', 
            'Bortforsling',
            Math.max(1, Math.round(formData.area * 0.4 * 0.1)), // 400mm depth * 10% waste factor, minimum 1
            'm³'
          );

          [excavation, baseLayer, compaction, wasteRemoval]
            .filter(Boolean)
            .forEach(item => items.push(item!));

        } else if (formData.anvandning === 'Gångyta') {
          // Walkway preparation
          const vegetation = this.createQuoteItem(
            'Borttagning av markvegetation och jordmån inom område för stenläggning ≤ 200mm',
            'Schakt',
            formData.area,
            'm²'
          );
          const baseLayer = this.createQuoteItem('Anläggning och justering av bärlager vid gångar', 'Underarbete', formData.area, 'm²');
          const compaction = this.createQuoteItem('Packning av bärlager vid gångar', 'Underarbete', formData.area, 'm²');
          const wasteRemoval = this.createQuoteItem(
            'Bortforsling av schaktmassor',
            'Bortforsling', 
            Math.max(1, Math.round(formData.area * 0.2 * 0.1)), // 200mm depth * 10% waste factor, minimum 1
            'm³'
          );

          [vegetation, baseLayer, compaction, wasteRemoval]
            .filter(Boolean)
            .forEach(item => items.push(item!));
        }
        break;

      // 'Området är utgrävt och klart för stenläggning' - no additional preparation needed
    }

    return items;
  }

  /**
   * Get material installation components
   */
  private getMaterialComponents(formData: FormData): QuoteItem[] {
    const items: QuoteItem[] = [];

    switch (formData.materialval) {
      case 'Asfalt':
        const asphalt = this.createQuoteItem('Asfaltering', 'Stenläggning', formData.area, 'm²');
        if (asphalt) items.push(asphalt);
        break;

      case 'Marksten':
      case 'Betongplattor':
      case 'Smågatsten':
      case 'Storgatsten':
        // Stone installation package
        const baseFill = this.createQuoteItem('Fyllning och justering av stenflis', 'Underarbete', formData.area, 'm²');
        
        const materialMapping = {
          'Marksten': 'Beläggning av marksten',
          'Betongplattor': 'Beläggning av betongplattor',
          'Smågatsten': 'Beläggning av smågatsten',
          'Storgatsten': 'Beläggning av storgatsten'
        };
        
        const installation = this.createQuoteItem(
          materialMapping[formData.materialval], 
          'Stenläggning', 
          formData.area, 
          'm²'
        );
        const compaction = this.createQuoteItem('Packning av sten', 'Stenläggning', formData.area, 'm²');

        [baseFill, installation, compaction]
          .filter(Boolean)
          .forEach(item => items.push(item!));
        break;

      case 'Skiffer':
      case 'Granithällar':
        // Slab installation package
        const slabBaseFill = this.createQuoteItem('Fyllning och justering av stenflis', 'Underarbete', formData.area, 'm²');
        
        const slabMapping = {
          'Skiffer': 'Beläggning av skiffer',
          'Granithällar': 'Beläggning granithällar'
        };
        
        const slabInstallation = this.createQuoteItem(
          slabMapping[formData.materialval],
          'Stenläggning',
          formData.area,
          'm²'
        );

        [slabBaseFill, slabInstallation]
          .filter(Boolean)
          .forEach(item => items.push(item!));
        break;
    }

    return items;
  }

  /**
   * Get grouting components
   */
  private getGroutingComponents(formData: FormData): QuoteItem[] {
    const groutMapping = {
      'Flexibel hårdfog': 'Fogning med flexibel hårdfog',
      'Ögreshämande fogsand': 'Fogning med ogreshämande fogsand'
    };

    const groutItem = this.createQuoteItem(
      groutMapping[formData.fog],
      'Fogning',
      formData.area,
      'm²'
    );

    return groutItem ? [groutItem] : [];
  }

  /**
   * Get cleanup components (always included)
   */
  private getCleanupComponents(formData: FormData): QuoteItem[] {
    const items: QuoteItem[] = [];

    const cleanup = this.createQuoteItem(
      'Städning och bortforsling av byggavfall',
      'Bortforsling',
      1,
      'st'
    );
    if (cleanup) items.push(cleanup);

    return items;
  }

  /**
   * Create a quote item from component name
   */
  private createQuoteItem(
    componentName: string,
    category: QuoteItem['category'],
    quantity: number,
    unit: string
  ): QuoteItem | null {
    const component = findPricingComponent(this.pricing, componentName);
    
    if (!component) {
      console.warn(`Pricing component not found: ${componentName}`);
      return null;
    }

    const unitPrice = component['Unit Price'];
    const total = unitPrice * quantity;

    return {
      id: component.id,
      name: componentName,
      category,
      quantity,
      unit: component.Unit || unit,
      unit_price_sek: unitPrice,
      total_sek: total,
      labor_max: component.labor_max
    };
  }

  /**
   * Calculate estimated work days using labor_max from pricing components
   */
  private calculateWorkDays(items: QuoteItem[]): number {
    // Sum labor_max × quantity for all items that have labor_max
    const totalLaborDays = items
      .filter(item => item.labor_max && item.labor_max > 0)
      .reduce((sum, item) => sum + (item.labor_max! * item.quantity), 0);
    
    // If no labor_max data available, fall back to area-based estimation
    if (totalLaborDays === 0) {
      const totalArea = items
        .filter(item => item.unit === 'm²')
        .reduce((sum, item) => sum + item.quantity, 0);
      
      const estimatedDays = Math.ceil(totalArea / 50);
      return Math.max(1, Math.min(10, estimatedDays));
    }
    
    // Return calculated labor days, minimum 1 day, maximum 10 days
    return Math.max(1, Math.min(10, Math.ceil(totalLaborDays)));
  }

  /**
   * Calculate category summary
   */
  private calculateCategorySummary(items: QuoteItem[]): Record<string, number> {
    const summary: Record<string, number> = {};
    
    items.forEach(item => {
      if (!summary[item.category]) {
        summary[item.category] = 0;
      }
      summary[item.category] += item.total_sek;
    });

    return summary;
  }
}
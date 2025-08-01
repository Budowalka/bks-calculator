import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  arbetsmoment: string;
}

export interface LeadData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  full_address: string;
  street_address: string;
  postal_code: string;
  city: string;
}

export interface EstimateData {
  id: string;
  estimate_nr: number;
  status: string;
  created: string;
  valid_until: string;
  notes: string;
  total_amount: number;
  total_amount_vat: number;
  vat_amount: number;
  estimated_work_days: number;
  items: EstimateItem[];
  lead: LeadData | null;
}

/**
 * Generate HTML content for PDF from estimate data
 */
function generateHTMLContent(estimate: EstimateData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  // Function to clean category names by removing sort numbers
  const cleanCategoryName = (category: string): string => {
    // Remove pattern like "10 - ", "20 - ", "99 - " etc.
    return category.replace(/^\d+\s*-\s*/, '');
  };

  // Group items by arbetsmoment (work category)
  const groupedItems = estimate.items.reduce((groups, item) => {
    const category = cleanCategoryName(item.arbetsmoment || 'Övriga arbeten');
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, EstimateItem[]>);

  // Calculate totals by category
  const categoryTotals = Object.entries(groupedItems).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + item.line_total, 0),
    items
  }));

  const clientName = estimate.lead 
    ? `${estimate.lead.first_name} ${estimate.lead.last_name}`
    : 'Kund';

  const clientAddress = estimate.lead?.full_address || 'Adress';
  const clientPhone = estimate.lead?.phone || 'Telefon';
  const clientEmail = estimate.lead?.email || 'E-post';

  // Generate estimate table HTML
  const estimateTableHTML = categoryTotals.map(({ category, items, total }) => `
    <tr class="category-header">
      <td colspan="5">${category}</td>
    </tr>
    ${items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td>${item.unit}</td>
        <td class="text-right">${formatCurrency(item.unit_price)}</td>
        <td class="text-right">${formatCurrency(item.line_total)}</td>
      </tr>
    `).join('')}
    <tr class="category-total">
      <td colspan="4"><strong>Summa ${category}</strong></td>
      <td class="text-right"><strong>${formatCurrency(total)}</strong></td>
    </tr>
  `).join('');

  // BKS Logo - use full URL for Puppeteer to load
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bks-calculator.vercel.app';
  // const bksLogoUrl = "data:image/png;base64,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

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>BKS AB - Offert #${estimate.estimate_nr}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .header-table td {
            padding: 15px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          
          .header-table td:first-child {
            width: 50%;
          }
          
          h1 {
            color: #2c5530;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          h2 {
            color: #2c5530;
            font-size: 18px;
            margin: 25px 0 15px 0;
            border-bottom: 2px solid #2c5530;
            padding-bottom: 5px;
          }
          
          h3 {
            color: #2c5530;
            font-size: 16px;
            margin: 20px 0 10px 0;
          }
          
          .estimate-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .estimate-table th,
          .estimate-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          
          .estimate-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .category-header {
            background-color: transparent;
            color: #333;
            font-weight: bold;
            font-size: 16px;
          }
          
          .category-total {
            background-color: #e5e5e5;
            font-weight: bold;
          }
          
          .final-totals {
            background-color: #e8f5e8;
            font-weight: bold;
          }
          
          .text-right {
            text-align: right;
          }
          
          .greeting {
            margin: 20px 0;
            font-size: 16px;
          }
          
          p {
            margin-bottom: 15px;
            text-align: justify;
          }
          
          ul, ol {
            margin: 15px 0;
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 8px;
          }
          
          .contact-info {
            margin-top: 40px;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #2c5530;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .signature-section {
            margin-top: 50px;
            text-align: center;
          }
          
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .logo {
            max-width: 120px;
            height: auto;
          }
        </style>
      </head>
      <body>        
        <h1>Vackra och hållbara uteplatser</h1>
        
        <table class="header-table">
          <tr>
            <td>
              <strong>Beställare:</strong><br />
              ${clientName}<br />
              ${clientAddress}<br />
              ${clientPhone}<br />
              ${clientEmail}
            </td>
            <td>
              <strong>Entreprenör:</strong><br />
              BKS AB<br />
              Kungsgatan 29, 111 56 Stockholm<br />
              Org.nr: 559179-6700<br />
              0735757897<br />
              info@bksakeri.se<br />
              <br />
              Företaget innehar F-skattsedel samt allrisk- och ansvarsförsäkring i Gjensidige Försäkring
            </td>
          </tr>
        </table>

        <div class="greeting">
          Hej ${estimate.lead?.first_name || 'Kund'},
        </div>

        <p><strong>Välkommen till ditt nya stenprojekt med BKS AB!</strong></p>

        <p>I denna offert presenterar vi vårt sätt för att förverkliga din vision om en vacker och funktionell stenlagd uteplats. Baserat på vårt inledande samtal och platsbesök har vi skräddarsytt en lösning som möter dina specifika önskemål och behov.</p>

        <p>Här beskriver vi ingående vår arbetsprocess, från noggrann planering och materialval till grundarbete och hantverksmässig stenläggning. Du får också en detaljerad specifikation av valda produkter, en transparent prisbild samt information om garantier.</p>

        <p>Vårt mål är att du ska känna dig trygg och välinformerad genom hela processen. Vi hoppas att denna offert ger dig en tydlig bild av hur vi på BKS AB kan hjälpa dig att skapa uteplatsen du drömmer om. Tveka inte att höra av dig med frågor!</p>

        <p><strong>Låt oss tillsammans ta första steget mot förverkligandet av ditt stenprojekt!</strong></p>

        <h2>Arbetsprocess - från idé till färdigt resultat</h2>

        <h3>Detaljerad offert baserad på dina önskemål</h3>
        <p>Baserat på den kostnadsfria konsultationen och platsbesöket, där vi lyssnade på dina tankar och önskemål samt inspekterade ytan, har våra experter tagit fram denna detaljerade offert. Här presenterar vi våra rekommendationer kring lämpliga material och designlösningar, skräddarsydda för ditt projekt. Offerten har ett fastpris, så du slipper överraskningar längre fram.</p>

        <h3>Noggrann planering och materialval</h3>
        <p>När du accepterat offerten går vi vidare med noggrann planering. Vi stämmer av dina val av plattor, färg och mönster och beställer hem högkvalitativt material från välrenommerade leverantörer. Allt för att förverkliga din vision.</p>

        <h3>Grundarbete med fokus på hållbarhet</h3>
        <p>På utsatt datum börjar vårt team arbetet. Beroende på ytans beskaffenhet och förutsättningar anpassar vi grundarbetet:</p>

        <p><strong>Scenario 1: Ytan är förberedd för stenläggning</strong><br />
        Om ytan redan är förberedd kontrollerar vi först att lutningen är korrekt för god vattenavrinning. Vid behov justerar vi fallet med hjälp av laser och vattenpass. Därefter lägger vi ut ett lager av stenflis eller stenmjöl som ytskikt, för optimal dränering och bärighet.</p>

        <p><strong>Scenario 2: Ytan kräver fullständig preparation</strong><br />
        Om ytan däremot inte är förberedd, börjar vi med att gräva ut till rätt djup. Detta görs för hand, med kranbil eller grävmaskin, beroende på ytans storlek och åtkomlighet. Vi lägger sedan en fiberduk som separerar underlaget och förhindrar ogräs. Ovanpå detta fyller vi på med bergkross i lämplig fraktion som bärlager. Varje lager packas noggrant med vibroplatta för att skapa en stabil grund. Slutligen adderar vi ett ytskikt av stenflis, och på så sätt förbereder vi för stenläggning.</p>

        <p>Oavsett utgångsläge utför vi grundarbetet med omsorg och expertis. Vi använder alltid ändamålsenlig utrustning och beprövade metoder för att skapa bästa möjliga förutsättningar för din nya stenläggning. Detta grundarbete är avgörande för ett hållbart och långvarigt resultat.</p>

        <h3>Stenläggning med känsla för detaljer</h3>
        <p>Med en stabil grund på plats är det dags för våra hantverkare att lägga stenarna enligt det överenskomna mönstret. Detta görs med största precision och känsla för detaljer. Stenar tilldelas och ytterkanterna anpassas genom kapning för ett prydligt intryck. Plattorna sätts med distanser för jämna fogar som sedan fylls med specialanpassat fogmaterial. Vi använder moderna hjälpmedel men traditionell hantverksskicklighet är avgörande för ett gediget slutresultat.</p>

        <h3>Avslutande finish och kvalitetskontroll</h3>
        <p>I slutfasen finputsar vi ytan genom att sopa rent och tvätta bort eventuella fogrester. Vårt mål är att lämna över en fin stenläggning som överträffar dina förväntningar. Som ett sista steg gör vi en grundlig kvalitetsgenomgång tillsammans med dig som kund, för att säkerställa att allt är enligt önskemål.</p>

        <p>Genom hela processen, från offertförfrågan till avslutad stenläggning, sätter vi dina önskemål i centrum. Med gedigen erfarenhet, kvalitetsmaterial och beprövade metoder ser vi till att leverera resultat som överträffar förväntningarna. Låt BKS AB förverkliga visionen om din nya uteplats!</p>

        <div class="page-break"></div>

        <h2>Arbetets omfattning med pris</h2>

        <table class="estimate-table">
          <thead>
            <tr>
              <th>Beskrivning</th>
              <th>Kvantitet</th>
              <th>Enhet</th>
              <th>Pris/enhet</th>
              <th class="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            ${estimateTableHTML}
            <tr>
              <td colspan="5"></td>
            </tr>
            <tr class="final-totals">
              <td colspan="4"><strong>Summa exkl. moms</strong></td>
              <td class="text-right"><strong>${formatCurrency(estimate.total_amount)}</strong></td>
            </tr>
            <tr class="final-totals">
              <td colspan="4"><strong>Moms (25%)</strong></td>
              <td class="text-right"><strong>${formatCurrency(estimate.vat_amount)}</strong></td>
            </tr>
            <tr class="final-totals">
              <td colspan="4"><strong>Totalt inkl. moms</strong></td>
              <td class="text-right"><strong>${formatCurrency(estimate.total_amount_vat)}</strong></td>
            </tr>
          </tbody>
        </table>

        <p><strong>Beräknad arbetstid:</strong> ${estimate.estimated_work_days} arbetsdagar</p>
        <p><strong>Offerten gäller till:</strong> ${formatDate(estimate.valid_until)}</p>

        <h2>Dokumentation och kommunikation under projektets gång</h2>

        <p>På BKS AB tror vi på vikten av öppen kommunikation och transparens genom hela projektet. Från start till mål är du som kund involverad och informerad. Detta ger dig trygghet och insyn i hur arbetet fortskrider.</p>

        <p><strong>Innan projektstart:</strong></p>
        <ul>
          <li>Detaljerad offert med specifikationer och prisbild</li>
          <li>Tydlig tidplan</li>
          <li>Kontaktinformation till ansvarig projektledare</li>
        </ul>

        <p><strong>Under stenläggningen:</strong></p>
        <ul>
          <li>Regelbundna uppdateringar från projektledaren via telefon eller e-post</li>
          <li>Bilduppdateringar som visar arbetets framsteg, skickade till dig digitalt</li>
        </ul>

        <p><strong>Efter avslutat projekt:</strong></p>
        <ul>
          <li>Slutdokumentation med bilder på den färdiga stenläggningen</li>
          <li>Skötselråd och instruktioner för att bevara ytan i toppskick</li>
          <li>Garantibevis och information om vår eftermarknadsservice</li>
        </ul>

        <p><strong>Utöver detta dokumenterar vi även arbetet internt för kvalitetssäkring:</strong></p>

        <ul>
          <li>Dagliga checklistor för utfört arbete och använda material</li>
          <li>Egenkontroller enligt branschstandard</li>
          <li>Fotodokumentation av kritiska moment, t.ex. grundarbete och avvattningslösningar</li>
        </ul>

        <p>All denna dokumentation arkiveras digitalt och är tillgänglig för dig som kund även efter avslutat projekt. Du ska känna dig trygg i att arbetet är utfört enligt konstens alla regler och att du har full insyn i processen.</p>

        <p>Vi värdesätter kommunikation och är alltid bara ett telefonsamtal bort om du har frågor eller funderingar. Med BKS AB kan du känna dig trygg genom hela resan från idé till färdig stenläggning. Transparens är en av hörnstenarna i vår verksamhet.</p>

        <div class="page-break"></div>

        <h2>Övriga bestämmelser</h2>

        <h3>Förberedelse:</h3>
        <p>För att säkerställa en smidig start på ditt stenläggningsprojekt behöver vi att du som kund ser till att arbetsytan är fri från hinder. Detta innebär att flytta möbler, krukor eller andra föremål som kan stå i vägen. Vi behöver också tillgång till el och vatten i närheten av arbetsområdet. Om det finns särskilda önskemål eller förutsättningar att ta hänsyn till, ber vi dig att informera oss om detta i god tid före projektstart.</p>

        <h3>Verktyg:</h3>
        <p>För att säkerställa effektivitet och precision i vårt arbete använder vi specialanpassade verktyg och maskiner avsedda för stenläggning. Detta inkluderar plattlyft för ergonomisk hantering samt markvibrator och stampar för kompaktering av underlag. Våra hantverkare har tillgång till den utrustning som krävs för att utföra ett professionellt arbete och är väl förtrogen med dess användning.</p>

        <h3>Avfallshantering:</h3>
        <p>Vi på BKS AB strävar efter att minimera vårt miljöavtryck och hanterar allt avfall från projektet på ett ansvarsfullt sätt. Överblivet material som plattor, bergkross och stenmjöl återanvänds i mån av möjlighet i framtida projekt. Annat avfall som plast, kartong och övrigt byggmaterial sorteras och återvinns enligt gällande miljöföreskrifter. Som kund behöver du inte oroa dig för bortforsling av avfall då detta ingår i vårt åtagande.</p>

        <h3>Arbetsmiljö:</h3>
        <p>Säkerhet och trivsel på arbetsplatsen är viktigt för oss. Våra hantverkare följer gällande arbetsmiljöregler och använder föreskriven skyddsutrustning som hjälm, skyddsglasögon och handskar. Vi tillämpar ergonomiska arbetsmetoder för att minimera risken för förslitningsskador. Regelbundna arbetsplatsträffar hålls för att diskutera säkerhet och komma med förbättringsförslag. Vi tror på en öppen dialog och uppmuntrar både personal och kunder att påtala eventuella brister.</p>

        <h3>Transporter och lyft:</h3>
        <p>Allt material som krävs för ditt stenläggningsprojekt, inklusive plattor, bärlager och fogsand, transporteras till arbetsplatsen med företagets egna fordon. Våra fordon är anpassade för ändamålet och uppfüller gällande säkerhets- och utsläppskrav. Vid lossning använder vi kran eller truck beroende på förutsättningarna på plats. Lyft och förflyttning av tunga material sker med största försiktighet för att undvika skador.</p>

        <h3>Försäkring:</h3>
        <p>BKS AB har en heltäckande ansvarsförsäkring hos Gjensidige Försäkring som skyddar både oss och dig som kund vid eventuella skador eller olyckor i samband med vårt arbete. Försäkringen gäller för skador på personer, egendom och utfört arbete och ger dig som kund ett extra skydd vid oförutsedda händelser.</p>

        <h2>Hantering av oförutsedda problem eller hinder</h2>

        <p>Trots noggrann planering kan oförutsedda situationer uppstå under arbetets gång, t.ex:</p>
        <ul>
          <li>Upptäckt av sättningsskador eller andra problem med underlaget</li>
          <li>Extrema väderförhållanden som försenas eller hindrar arbetet</li>
          <li>Förseningar i materialleveranser från tredje part</li>
        </ul>

        <p>Om sådana omständigheter inträffar kommer vi omgående att kommunicera detta till dig som kund. Tillsammans finner vi den bästa lösningen för att komma vidare i projektet på ett smidigt sätt. Eventuella merkostnader till följd av oförutsedda hinder hanteras som tilläggsarbete efter godkännande från dig.</p>

        <h2>Ändringar och tilläggsarbeten</h2>

        <p>Vi strävar alltid efter att uppfylla dina önskemål och är flexibla för ändringar under projektets gång. Om du kommer på nya idéer eller vill göra tillägg utöver grundofferten har vi rutiner för att hantera detta:</p>
        <ul>
          <li>Meddela önskemålen till ansvarig projektledare.</li>
          <li>Vi tar fram en specifikation och prissättning för tilläggsarbetet.</li>
          <li>Efter ditt godkännande planerar vi in arbetet på lämpligaste sätt.</li>
          <li>Tilläggsarbetet faktureras separat efter utförande.</li>
        </ul>

        <p>Genom att ha en tydlig och transparent hantering av vad som ingår och inte ingår i offerten, samt hur vi hanterar avvikelser, skapar vi trygghet för dig som kund. Du ska veta vad du kan förvänta dig och inte behöva oroa dig för dolda kostnader.</p>

        <h2>Referenser</h2>

        <p>Våra tidigare kunder är de bästa ambassadörerna för vårt arbete. De har upplevt vår stenläggningsprocess från start till mål och kan ge dig en ärlig inblick i hur det är att samarbeta med oss. Genom att höra deras berättelser får du en god uppfattning om vår kompetens, service och kvalitet.</p>

        <p>Tveka inte att kontakta några av våra tidigare kunder för att höra deras omdömen. De kan ge dig värdefulla insikter och svar på frågor du kanske har inför ditt eget stenprojekt. Att höra någon annans positiva upplevelse kan ge extra trygghet när du fattar ditt beslut.</p>

        <p>Nedan finner du kontaktuppgifter till ett urval av våra tidigare kunder. Känn dig fri att kontakta dem!</p>

        <ol>
          <li><strong>Abbe</strong> - Bygg och Miljö - 0737280744</li>
          <li><strong>Rajaa</strong> - Söderby - 0737768162</li>
          <li><strong>Hadil</strong> - Uppsala - 0760062967</li>
          <li><strong>Maria</strong> - Farsta - 0737868856</li>
          <li><strong>Razvan</strong> - Asielbygg - 07320550031</li>
        </ol>

        <h2>Betalning</h2>

        <p><strong>Fakturering:</strong><br />
        Vi tillämpar följande faktureringsprocess för att göra det smidigt för dig som kund:</p>
        <ul>
          <li>30% av totalsumman faktureras vid projektstart och betalas innan arbetet påbörjas.</li>
          <li>30% faktureras när grundarbetet är slutfört och betalas inom 10 dagar.</li>
          <li>Resterande 40% faktureras vid godkänd slutbesiktning och betalas inom 10 dagar.</li>
        </ul>

        <p>Eventuella tilläggsarbeten faktureras separat efter utförande med 10 dagars betalningstid.</p>

        <h3>Betalningsvillkor:</h3>
        <ul>
          <li>Fakturor betalas inom 10 dagar från fakturadatum.</li>
          <li>Vid försenad betalning utgår dröjsmålsränta enligt gällande referensränta + 8%.</li>
          <li>BKS AB förbehåller sig äganderätten av allt material tills full betalning erlagts.</li>
        </ul>

        <h2>Garanti</h2>

        <p><strong>Garantitid:</strong></p>
        <ul>
          <li>På utfört arbete lämnar vi 2 års garanti.</li>
          <li>På material gäller respektive tillverkares garantier, generellt 2-5 år.</li>
        </ul>

        <p><strong>Garantivillkor:</strong></p>
        <ul>
          <li>Garantin omfattar arbetsutförande och materialkvalitet enligt branschstandard.</li>
          <li>Undantag från garantin är skador orsakade av yttre påverkan, bristande underhåll, onormalt slitage eller ändringar utförda av tredje part.</li>
          <li>För att garantin ska gälla skall skötselinstruktioner följas.</li>
        </ul>

        <h2>Försäkring</h2>

        <p>BKS AB har en ansvarsförsäkring hos Gjensidige Försäkring som täcker eventuella skador orsakade av vårt arbete upp till 10 Mkr. Vi är också fullt försäkrade om olyckor och skador på vår egen personal och utrustning. Du är trygg med oss!</p>

        <h2>Vi friskriver oss från</h2>

        <p><strong>Berg som kan förekomma vid grävning:</strong> Går det inte att gräva ner till den nivå som vi behöver på grund av att vi hittar berg så blir det en extra kostnad för det jobbet.</p>

        <p><strong>Ledningar:</strong> Du som kund är ansvarig för att visa var ledningar som är nedgrävda finns. Gräver vi bort något som inte har visats för oss kommer vi inte kunna återställa det utan kostnad.</p>

        <p><strong>Föroreningar i mark:</strong> Skulle det vara så att tippen gör ett stickprov på schaktmassorna och visar det att det är förorenat kommer vi att debitera extra för det.</p>

        <h2>Nästa steg</h2>

        <p>För att boka tjänsten och komma igång med ditt stenprojekt gör du så här:</p>
        <ul>
          <li>Acceptera offerten genom att svara på e-post eller ringa oss direkt.</li>
          <li>Välj önskat startdatum för projektet i samråd med vår projektledare.</li>
          <li>Projektering och materialleverans planeras in utifrån önskat startdatum.</li>
          <li>Underteckna och returnera Hantverkarformuläret som vårt kontrakt innan projektstart.</li>
          <li>Vi ses på plats för uppstartsgenomgång på utsatt datum!</li>
        </ul>

        <p>Denna offert är giltig i 30 dagar från dagens datum. Tveka inte att höra av dig om du har några frågor!</p>

        <div class="contact-info">
          <p><strong>Kontaktperson:</strong><br />
          Ramiro Botero, projektledare<br />
          Tel: 073 575 78 97<br />
          E-post: info@bksakeri.se<br />
          https://www.bksakeri.se</p>

          <div class="signature-section">
            <p>Vi ser fram emot att förverkliga ditt stenprojekt!</p>
            <p><strong>Med vänliga hälsningar,<br />
            Teamet på BKS AB</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate PDF from estimate data using Puppeteer
 */
export async function generateEstimatePDF(estimate: EstimateData): Promise<Buffer> {
  let browser;
  
  try {
    // Configure for Vercel serverless environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('PDF Generation environment:', { isProduction, nodeEnv: process.env.NODE_ENV });
    
    if (isProduction) {
      // Use @sparticuz/chromium for Vercel deployment
      console.log('Using @sparticuz/chromium for production');
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--hide-scrollbars',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Local development
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    const page = await browser.newPage();

    // Set longer timeout for image loading
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Generate HTML content
    const htmlContent = generateHTMLContent(estimate);

    // Set page content and wait for all resources to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit more for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Page content set, generating PDF...');

    // Generate PDF with options
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>BKS AB - Offert #${estimate.estimate_nr}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>Sida <span class="pageNumber"></span> av <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate filename for the PDF
 */
export function generatePDFFilename(estimate: EstimateData): string {
  const clientName = estimate.lead 
    ? `${estimate.lead.first_name}_${estimate.lead.last_name}`.replace(/\s+/g, '_')
    : 'kund';
  
  const date = new Date().toISOString().split('T')[0];
  
  return `BKS_Offert_${estimate.estimate_nr}_${clientName}_${date}.pdf`;
}
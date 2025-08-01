import React from 'react';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  arbetsmoment: string;
}

interface LeadData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  full_address: string;
  street_address: string;
  postal_code: string;
  city: string;
}

interface EstimateData {
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

interface OfferTemplateProps {
  estimate: EstimateData;
}

const OfferTemplate: React.FC<OfferTemplateProps> = ({ estimate }) => {
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

  // BKS Logo as base64 (your logo from the public images folder)
  const bksLogoBase64 = "data:image/png;base64,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";

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

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>BKS AB - Offert #{estimate.estimate_nr}</title>
        <style>{`
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
            background-color: #e5e5e5;
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
            max-width: 150px;
            height: auto;
          }
        `}</style>
      </head>
      <body>
        <div className="logo-container">
          <img src={bksLogoBase64} alt="BKS AB Logo" className="logo" />
        </div>
        
        <h1>Vackra och hållbara uteplatser</h1>
        
        <table className="header-table">
          <tr>
            <td>
              <strong>Beställare:</strong><br />
              {clientName}<br />
              {clientAddress}<br />
              {clientPhone}<br />
              {clientEmail}
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

        <div className="greeting">
          Hej {estimate.lead?.first_name || 'Kund'},
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

        <div className="page-break"></div>

        <h2>Arbetets omfattning med pris</h2>

        <table className="estimate-table">
          <thead>
            <tr>
              <th>Beskrivning</th>
              <th>Kvantitet</th>
              <th>Enhet</th>
              <th>Pris/enhet</th>
              <th className="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {categoryTotals.map(({ category, items, total }) => (
              <React.Fragment key={category}>
                <tr className="category-header">
                  <td colSpan={5}>{category}</td>
                </tr>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td className="text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
                <tr className="category-total">
                  <td colSpan={4}><strong>Summa {category}</strong></td>
                  <td className="text-right"><strong>{formatCurrency(total)}</strong></td>
                </tr>
              </React.Fragment>
            ))}
            <tr>
              <td colSpan={5}></td>
            </tr>
            <tr className="final-totals">
              <td colSpan={4}><strong>Summa exkl. moms</strong></td>
              <td className="text-right"><strong>{formatCurrency(estimate.total_amount)}</strong></td>
            </tr>
            <tr className="final-totals">
              <td colSpan={4}><strong>Moms (25%)</strong></td>
              <td className="text-right"><strong>{formatCurrency(estimate.vat_amount)}</strong></td>
            </tr>
            <tr className="final-totals">
              <td colSpan={4}><strong>Totalt inkl. moms</strong></td>
              <td className="text-right"><strong>{formatCurrency(estimate.total_amount_vat)}</strong></td>
            </tr>
          </tbody>
        </table>

        <p><strong>Beräknad arbetstid:</strong> {estimate.estimated_work_days} arbetsdagar</p>
        <p><strong>Offerten gäller till:</strong> {formatDate(estimate.valid_until)}</p>

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

        <div className="page-break"></div>

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

        <div className="contact-info">
          <p><strong>Kontaktperson:</strong><br />
          Ramiro Botero, projektledare<br />
          Tel: 073 575 78 97<br />
          E-post: info@bksakeri.se<br />
          https://www.bksakeri.se</p>

          <div className="signature-section">
            <p>Vi ser fram emot att förverkliga ditt stenprojekt!</p>
            <p><strong>Med vänliga hälsningar,<br />
            Teamet på BKS AB</strong></p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default OfferTemplate;
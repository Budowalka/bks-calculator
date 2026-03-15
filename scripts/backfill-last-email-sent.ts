/**
 * Jednorazowy skrypt backfill — ustawia Last Email Sent na datę utworzenia leada
 * dla leadów z Email Sequence Stage = 1 i pustym Last Email Sent.
 *
 * Uruchomienie:
 *   cd bks-calculator-app
 *   npx tsx scripts/backfill-last-email-sent.ts
 *
 * Wymaga env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID
 */

import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Brak AIRTABLE_API_KEY lub AIRTABLE_BASE_ID w env vars.');
  console.error('Ustaw je przed uruchomieniem, np.:');
  console.error('  AIRTABLE_API_KEY=... AIRTABLE_BASE_ID=... npx tsx scripts/backfill-last-email-sent.ts');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const LEAD_DATA_TABLE = 'tbljQFgvpPqYK3S8O';

async function backfill() {
  console.log('Szukam leadów z Email Sequence Stage = 1 i pustym Last Email Sent...');

  const records = await base(LEAD_DATA_TABLE)
    .select({
      filterByFormula: `AND(
        {Email Sequence Stage} = 1,
        {Last Email Sent} = ''
      )`,
      fields: ['Lead Email', 'Lead First Name', 'Last Email Sent'],
    })
    .all();

  console.log(`Znaleziono ${records.length} leadów do backfillu.`);

  if (records.length === 0) {
    console.log('Nic do zrobienia.');
    return;
  }

  // Airtable batch update (max 10 per batch)
  const batchSize = 10;
  let updated = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const updates = batch.map(record => {
      // Użyj daty utworzenia rekordu (Airtable dodaje to automatycznie)
      // Jeśli nie mamy Created, użyj bieżącej daty
      const createdTime = (record as unknown as { _rawJson: { createdTime: string } })._rawJson?.createdTime
        || new Date().toISOString();

      return {
        id: record.id,
        fields: {
          'Last Email Sent': createdTime,
        },
      };
    });

    await base(LEAD_DATA_TABLE).update(updates);
    updated += batch.length;
    console.log(`Zaktualizowano ${updated}/${records.length} leadów...`);
  }

  console.log(`Backfill zakończony. Zaktualizowano ${updated} leadów.`);
}

backfill().catch(err => {
  console.error('Backfill error:', err);
  process.exit(1);
});

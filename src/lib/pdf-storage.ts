// Simple in-memory storage for PDFs (for temporary serving)
// In production, you'd want to use a proper storage solution like AWS S3
export const pdfStorage = new Map<string, { buffer: Buffer; timestamp: number }>();

// Clean up old PDFs every 10 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  const storageSize = pdfStorage.size;
  let cleanedCount = 0;
  
  console.log(`[PDF Cleanup] Starting cleanup check. Current storage: ${storageSize} PDFs`);
  
  for (const [key, value] of pdfStorage.entries()) {
    if (now - value.timestamp > maxAge) {
      pdfStorage.delete(key);
      cleanedCount++;
      console.log(`[PDF Cleanup] Cleaned up expired PDF: ${key} (age: ${Math.round((now - value.timestamp) / 1000 / 60)} minutes)`);
    }
  }
  
  if (cleanedCount === 0) {
    console.log(`[PDF Cleanup] No expired PDFs found. ${pdfStorage.size} PDFs remain in storage.`);
  } else {
    console.log(`[PDF Cleanup] Cleanup complete. Removed ${cleanedCount} PDFs. ${pdfStorage.size} PDFs remain.`);
  }
}, 10 * 60 * 1000);

// Clear interval on process exit
process.on('exit', () => {
  clearInterval(cleanupInterval);
});

export function storePDF(filename: string, buffer: Buffer): void {
  const timestamp = Date.now();
  pdfStorage.set(filename, {
    buffer,
    timestamp
  });
  console.log(`[PDF Storage] Stored PDF: ${filename} (size: ${(buffer.length / 1024).toFixed(1)} KB, storage count: ${pdfStorage.size})`);
}

export function getPDF(filename: string): { buffer: Buffer; timestamp: number } | undefined {
  const pdf = pdfStorage.get(filename);
  if (pdf) {
    const ageMinutes = Math.round((Date.now() - pdf.timestamp) / 1000 / 60);
    console.log(`[PDF Storage] Retrieved PDF: ${filename} (age: ${ageMinutes} minutes, size: ${(pdf.buffer.length / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`[PDF Storage] PDF not found: ${filename}`);
  }
  return pdf;
}

export function cleanupOldPDF(filename: string): void {
  if (pdfStorage.has(filename)) {
    const pdf = pdfStorage.get(filename);
    const ageMinutes = pdf ? Math.round((Date.now() - pdf.timestamp) / 1000 / 60) : 0;
    pdfStorage.delete(filename);
    console.log(`[PDF Cleanup] Manually cleaned up PDF: ${filename} (age: ${ageMinutes} minutes, remaining: ${pdfStorage.size} PDFs)`);
  } else {
    console.log(`[PDF Cleanup] PDF not found for cleanup: ${filename}`);
  }
}
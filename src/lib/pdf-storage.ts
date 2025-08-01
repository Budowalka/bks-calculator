// Simple in-memory storage for PDFs (for temporary serving)
// In production, you'd want to use a proper storage solution like AWS S3
export const pdfStorage = new Map<string, { buffer: Buffer; timestamp: number }>();

// Clean up old PDFs every 10 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  for (const [key, value] of pdfStorage.entries()) {
    if (now - value.timestamp > maxAge) {
      pdfStorage.delete(key);
      console.log(`Cleaned up expired PDF: ${key}`);
    }
  }
}, 10 * 60 * 1000);

// Clear interval on process exit
process.on('exit', () => {
  clearInterval(cleanupInterval);
});

export function storePDF(filename: string, buffer: Buffer): void {
  pdfStorage.set(filename, {
    buffer,
    timestamp: Date.now()
  });
}

export function getPDF(filename: string): { buffer: Buffer; timestamp: number } | undefined {
  return pdfStorage.get(filename);
}

export function cleanupOldPDF(filename: string): void {
  if (pdfStorage.has(filename)) {
    pdfStorage.delete(filename);
    console.log(`Cleaned up old PDF: ${filename}`);
  }
}
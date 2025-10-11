export function parseCsvData(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];
  
  // Parse header
  const header = parseCSVLine(lines[0]);
  
  // Find column indices
  const darijaIndex = header.findIndex(h => h.toLowerCase() === 'darija' || h.toLowerCase().includes('n1'));
  const darijaArIndex = header.findIndex(h => h.toLowerCase() === 'darija_ar');
  const engIndex = header.findIndex(h => h.toLowerCase() === 'eng' || h.toLowerCase() === 'english');
  
  // Parse data rows
  const sentences = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length === 0) continue;
    
    const darija = darijaIndex >= 0 ? values[darijaIndex]?.trim() : '';
    const darijaAr = darijaArIndex >= 0 ? values[darijaArIndex]?.trim() : '';
    const english = engIndex >= 0 ? values[engIndex]?.trim() : '';
    
    // Only include if there's at least some darija text
    if (darija || darijaAr) {
      sentences.push({
        lineNumber: i + 1, // 1-indexed, including header
        darija: darija || '',
        darijaAr: darijaAr || '',
        english: english || '',
      });
    }
  }
  
  return sentences;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

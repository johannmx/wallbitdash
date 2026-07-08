/**
 * Fast date formatting helper to avoid the extremely slow and timezone-dependent
 * `new Date(tx.date + 'T00:00:00Z').toLocaleDateString('es-ES')` operation in render loops.
 * 
 * Input format: "YYYY-MM-DD"
 * Output format: "D/M/YYYY" (Spanish format matching es-ES locale)
 */
export const formatDateSpanish = (dateStr: string): string => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(month) || isNaN(day)) return dateStr;
  
  return `${day}/${month}/${year}`;
};

// Date formatting utility that handles YYYY-MM-DD and ISO dates cleanly without timezone shift

export function formatDate(dateVal) {
  if (!dateVal) return '—';

  // If already a YYYY-MM-DD string
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const cleanDate = dateVal.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, monthIndex, day);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return dateVal;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

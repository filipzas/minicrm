const pad = (value) => String(value).padStart(2, '0');

export const formatEuDate = (value) => {
  if (!value) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  const ymdMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
};

export const normalizeEuDate = (value) => {
  if (!value) return value || '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  const ymdMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  return value;
};

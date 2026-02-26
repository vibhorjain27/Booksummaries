export const nowIso = (): string => new Date().toISOString();

export const isNewDay = (lastIso: string, timezone: string): boolean => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const today = formatter.format(new Date());
  const last = formatter.format(new Date(lastIso));
  return today !== last;
};

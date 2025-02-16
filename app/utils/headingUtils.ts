export const generateHeadingId = (text: string, count: number = 1): string => {
  const baseId = text.toLowerCase().replace(/\s+/g, '-');
  return count > 1 ? `${baseId}-${count}` : baseId;
}; 
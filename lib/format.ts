import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function formatDate(date: string) {
  return format(parseISO(date), 'MMMM d, yyyy', { locale: enUS });
} 
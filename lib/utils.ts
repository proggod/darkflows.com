'use server';

import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { isBuildTime } from './buildUtils';

export async function formatDate(date: string) {
  return format(parseISO(date), 'MMMM d, yyyy', { locale: enUS });
}

export async function getMockDataServer<T>(mockData: T): Promise<T> {
  if (isBuildTime()) {
    return mockData;
  }
  return null as T;
} 
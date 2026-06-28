import { en } from './en';
import { gu } from './gu';
import { hi } from './hi';

export const translations = {
  en,
  gu,
  hi
};

export type LanguageCode = keyof typeof translations;
export type TranslationSchema = typeof en;

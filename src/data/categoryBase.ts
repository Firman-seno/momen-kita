import { BaseCategory, CategoryKey } from '../types';

/**
 * Maps every category to the "base" category that provides its curated music
 * library. The 4 core categories (birthday, sunatan, wedding, aqiqah) ship
 * their own royalty-free tracks; the 8 extended categories reuse a thematically
 * close library so every template still gets distinct, license-safe music.
 * Kept in its own module so both templates.ts and musicLibrary.ts can import it
 * without creating a circular dependency.
 */
export const CATEGORY_BASE: Record<CategoryKey, BaseCategory> = {
  birthday: 'birthday',
  sunatan: 'sunatan',
  wedding: 'wedding',
  aqiqah: 'aqiqah',
  education: 'wedding',
  religious: 'sunatan',
  tasyakuran: 'sunatan',
  gathering: 'birthday',
  business: 'birthday',
  anniversary: 'wedding',
  family: 'birthday',
  'doa-haul': 'sunatan',
};

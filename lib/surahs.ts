// Names (transliterated) for the surahs used in data/verses.json.
// The verses script fetches names from quran.com; this is the offline fallback.
export const SURAH_NAMES: Record<number, string> = {
  2: 'Al-Baqarah',
  3: 'Aal-Imran',
  8: 'Al-Anfal',
  11: 'Hud',
  12: 'Yusuf',
  13: "Ar-Ra'd",
  20: 'Taha',
  39: 'Az-Zumar',
  40: 'Ghafir',
  53: 'An-Najm',
  58: 'Al-Mujadila',
  65: 'At-Talaq',
  94: 'Ash-Sharh',
  96: "Al-'Alaq",
}
export const surahName = (ref: string) => SURAH_NAMES[Number(ref.split(':')[0])] ?? ''

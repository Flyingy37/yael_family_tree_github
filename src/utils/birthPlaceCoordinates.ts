/**
 * Approximate map coordinates for birth-place strings when Person.coordinates is null.
 * Longer / more specific patterns are checked first (substring match, case-insensitive).
 */
const PLACE_PATTERNS: Array<{ re: RegExp; lat: number; lng: number; label: string }> = [
  { re: /kurenets|kuraniec|kureniets|קורנץ|קורניץ/i, lat: 54.55, lng: 26.92, label: 'Kurenets, Minsk Governorate, Russian Empire' },
  { re: /radoshkovichi|רדושקוביץ/i, lat: 54.22, lng: 27.24, label: 'Radoshkovichi, Minsk Governorate, Russian Empire' },
  { re: /dolginovo|dolhinov|דולהינוב/i, lat: 54.64, lng: 27.48, label: 'Dolhinov, Minsk Governorate, Russian Empire' },
  { re: /danilovichi|דנילוביץ/i, lat: 54.29, lng: 28.09, label: 'Danilovichi, Minsk Governorate, Russian Empire' },
  { re: /sosenka|סוסנקה/i, lat: 52.0, lng: 23.6, label: 'Sosenka, Minsk Governorate, Russian Empire' },
  { re: /pleshch|פלשניץ/i, lat: 54.42, lng: 27.7, label: 'Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire' },
  { re: /mikashevichy/i, lat: 52.23, lng: 27.47, label: 'Mikashevichy, Minsk Governorate, Russian Empire' },
  { re: /pinsk/i, lat: 52.11, lng: 26.1, label: 'Pinsk, Minsk Governorate, Russian Empire' },
  { re: /minsk|מינסק/i, lat: 53.9, lng: 27.57, label: 'Minsk, Minsk Governorate, Russian Empire' },
  { re: /vilnius|vilna|wilno|ווילנ(?:ה|א)|וילנ(?:ה|א)/i, lat: 54.69, lng: 25.28, label: 'Vilnius, Lithuania' },
  { re: /kaunas|קובנ(?:ה|א)/i, lat: 54.9, lng: 23.9, label: 'Kaunas, Lithuania' },
  { re: /birž|birzai|birze/i, lat: 56.2, lng: 24.75, label: 'Biržai, Lithuania' },
  { re: /riga|ריגה/i, lat: 56.95, lng: 24.11, label: 'Riga, Latvia' },
  { re: /warsaw|warszawa|ורשה/i, lat: 52.23, lng: 21.01, label: 'Warsaw, Poland' },
  { re: /lublin/i, lat: 51.25, lng: 22.57, label: 'Lublin, Poland' },
  { re: /sochaczew/i, lat: 52.23, lng: 20.24, label: 'Sochaczew, Poland' },
  { re: /poznań|poznan|פוזנן/i, lat: 52.41, lng: 16.93, label: 'Poznań, Poland' },
  { re: /bucharest|bucuresti|בוקרשט/i, lat: 44.43, lng: 26.1, label: 'Bucharest, Romania' },
  { re: /panciu|פנצ/i, lat: 45.87, lng: 27.27, label: 'Panciu, Romania' },
  { re: /vinnytsia|ויניצה/i, lat: 49.23, lng: 28.47, label: 'Vinnytsia, Ukraine' },
  { re: /chernobyl|צ'רנוביל|צ׳רנוביל/i, lat: 51.28, lng: 30.22, label: 'Chernobyl area, Ukraine' },
  { re: /korostyshiv/i, lat: 50.32, lng: 29.06, label: 'Korostyshiv, Ukraine' },
  { re: /makariv/i, lat: 50.47, lng: 29.82, label: 'Makariv, Ukraine' },
  { re: /vienna|וינה|wien/i, lat: 48.21, lng: 16.37, label: 'Vienna, Austria' },
  { re: /worms|ורמס/i, lat: 49.63, lng: 8.36, label: 'Worms, Germany' },
  { re: /mainz|מיינץ/i, lat: 50.0, lng: 8.27, label: 'Mainz, Germany' },
  { re: /heilbronn|היילברון/i, lat: 49.14, lng: 9.22, label: 'Heilbronn, Germany' },
  { re: /troyes|טרואה/i, lat: 48.3, lng: 4.08, label: 'Troyes, France' },
  { re: /tel aviv|תל אביב/i, lat: 32.09, lng: 34.78, label: 'Tel Aviv, Israel' },
  { re: /jerusalem|ירושלים/i, lat: 31.77, lng: 35.23, label: 'Jerusalem, Israel' },
  { re: /haifa|חיפה/i, lat: 32.82, lng: 34.99, label: 'Haifa, Mandatory Palestine' },
  { re: /petah tikva|פתח תקווה/i, lat: 32.09, lng: 34.89, label: 'Petah Tikva, Israel' },
  { re: /kfar saba|כפר סבא|kefar sav/i, lat: 32.18, lng: 34.91, label: 'Kfar Saba, Israel' },
  { re: /netanya|נתניה/i, lat: 32.33, lng: 34.86, label: 'Netanya, Israel' },
  { re: /rehovot|רחובות/i, lat: 31.89, lng: 34.81, label: 'Rehovot, Israel' },
  { re: /hadera|חדרה/i, lat: 32.43, lng: 34.92, label: 'Hadera, Israel' },
  { re: /afikim|אפיקים/i, lat: 32.68, lng: 35.51, label: 'Afikim, Israel' },
  { re: /new york|brooklyn|manhattan|ניו יורק/i, lat: 40.71, lng: -74.01, label: 'New York area, USA' },
  { re: /boston|בוסטון/i, lat: 42.36, lng: -71.06, label: 'Boston, USA' },
  { re: /chicago|שיקגו/i, lat: 41.88, lng: -87.63, label: 'Chicago, USA' },
  { re: /detroit|דטרויט/i, lat: 42.33, lng: -83.05, label: 'Detroit, USA' },
  { re: /los angeles/i, lat: 34.05, lng: -118.24, label: 'Los Angeles, USA' },
  { re: /connecticut|קונטיקט|new haven|hartford|waterbury|bridgeport/i, lat: 41.6, lng: -72.7, label: 'Connecticut, USA' },
  { re: /bangor,?\s*maine|בנגור/i, lat: 44.8, lng: -68.78, label: 'Bangor, Maine, USA' },
  { re: /washington,?\s*d\.?c|district of columbia/i, lat: 38.91, lng: -77.04, label: 'Washington D.C., USA' },
  { re: /baltimore/i, lat: 39.29, lng: -76.61, label: 'Baltimore, USA' },
  { re: /houston/i, lat: 29.76, lng: -95.37, label: 'Houston, USA' },
  { re: /louisville/i, lat: 38.25, lng: -85.76, label: 'Louisville, USA' },
  { re: /liepaja|לייפאיה|libau/i, lat: 56.51, lng: 21.01, label: 'Liepāja, Latvia' },
  { re: /kosice|קושיצה|kassa/i, lat: 48.72, lng: 21.26, label: 'Košice, Slovakia' },
  { re: /krakes|קראקס/i, lat: 55.07, lng: 23.78, label: 'Krakės, Lithuania' },
  { re: /boguslav|בוגוסלב/i, lat: 49.54, lng: 30.87, label: 'Boguslav area, Ukraine' },
  { re: /borisov|barysaw|בוריסוב/i, lat: 54.23, lng: 28.5, label: 'Borisov, Minsk Governorate, Russian Empire' },
];

export function approximateCoordinatesForBirthPlace(
  birthPlace: string | null | undefined
): { lat: number; lng: number; label: string } | null {
  if (!birthPlace || !birthPlace.trim()) return null;
  const s = birthPlace.trim();
  for (const { re, lat, lng, label } of PLACE_PATTERNS) {
    if (re.test(s)) return { lat, lng, label };
  }
  return null;
}

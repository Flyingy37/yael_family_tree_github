import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface RawCanonical {
  ged_id: string;
  full_name: string;
  given_final: string;
  surname: string;
  surname_final: string;
  sex: string;
  birth_date: string;
  birth_place: string;
  fams: string;
  famc: string;
  titl: string;
  note: string;
  note_plain: string;
}

interface RawCurated {
  'Hops': string;
  'Relationship to Yael': string;
  'Full Name': string;
  'Birth Name': string;
  'Birth Year': string;
  'Birth City': string;
  'Generation': string;
  'Father Name': string;
  'Mother Name': string;
  'Spouse Name': string;
  'Children Names': string;
  'ID': string;
}

interface RawSurnameOrigin {
  Surname: string;
  Location: string;
  '\ufeffSurname'?: string;
}

interface SupplementalSignals {
  holocaustNames: Set<string>;
  partisanNames: Set<string>;
  loadedFiles: string[];
}

interface Person {
  id: string;
  fullName: string;
  givenName: string;
  surname: string;
  surnameFinal: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  generation: number | null;
  relationToYael: string | null;
  hops: number | null;
  dnaInfo: string | null;
  coordinates: [number, number] | null;
  familiesAsSpouse: string[];
  familyAsChild: string | null;
  title: string | null;
  note: string | null;
  note_plain: string | null;
  photoUrl: string | null;
  hebrewName: string | null;
  birthName: string | null;
  fatherName: string | null;
  motherName: string | null;
  spouseName: string | null;
  childrenNames: string | null;
  surnameOrigin: string | null;
  jewishLineage: string | null;
  migrationInfo: string | null;
  holocaustVictim: boolean;
  warCasualty: boolean;
  connectionPathCount: number | null;
  doubleBloodTie: boolean;
  tags: string[];
  story?: string | null;
}

const MANUAL_TAG_OVERRIDES: Record<string, string[]> = {
  // User-confirmed family annotation: grandfather Nahum/Nochim Alperovich
  '@I11@': ['Partisan'],
  // User-confirmed: maternal uncle appears in verified DNA matching evidence.
  '@I23@': ['DNA'], // Zeev Vladimir Alperovich
  // Requested notable public figures
  '@I2560@': ['Famous'], // Hayim Nahman Bialik
  '@I619@': ['Famous'], // Terry J. Dubrow
  '@I1085@': ['Famous'], // Terry J. Dubrow (second profile)
  '@I618@': ['Famous'], // Kevin Mark Dubrow (Riot)
  '@I124@': ['Famous'], // Hyman Isidor Kastrel — co-founder of Yiddish daily Frayhayt; editor of Funken
  // Heilprin rabbinical dynasty — direct ancestors of the Alperovich branch.
  // Source: user-confirmed chain (mh_identifiers #1504849 / #1504833 / #1504732 / #1504730 / #1503373)
  '@I3167@': ['Rabbi', 'Lineage'], // Zvulen Eliezer Ashkenazi-Heilprin (gen 15, Brisk) mh#1504849
  '@I3032@': ['Rabbi', 'Lineage'], // R' Moshe Ashkenazi ben Eliezer Heilprin (gen 14) mh#1504833
  '@I2855@': ['Rabbi', 'Lineage'], // Rabbi Eliezer Lipman Lazar Heilprin (gen 13, Tarnogrod) mh#1504732
  '@I2617@': ['Rabbi', 'Lineage'], // Rabbi Moshe Yehuda Selki Heilprin (gen 12, Poznań) mh#1504730
  '@I1746@': ['Lineage'],          // Abram Avraham Alperovich Heilprin (gen 10, Kurenets) mh#1503373
  // Confirmed DNA matches — FTDNA + Assif 23andMe Father's side (Alperovich/Kastrel pool).
  '@I376@': ['DNA'], // Chaim Herbert — Assif 23andMe Father's side confirmed
  '@I578@': ['DNA'], // Jonathan Herbert — FTDNA 150.8 cM ("Jonathan Sinai Herbert")
  '@I385@': ['DNA'], // Robert Michael Costrell — FTDNA 157.33 cM, J-FTF95213
  // User-confirmed MyHeritage DNA-match profile cluster (Oded paternal-side matches).
  '@I721@': ['DNA'], // Joseph/yushua Kaszinsky
  '@I724@': ['DNA'], // Gordon (mother)
  '@I500@': ['DNA'], // Joseph Gordon (brother)
  '@I831@': ['DNA'], // Albert Gordon (brother)
  '@I830@': ['DNA'], // Abraham E/abe Gozansky/Gordon
  // Vulis branch rabbinical ancestor.
  '@I1240@': ['Rabbi'], // R' Avrum Gershkov Vulis (1789) — confirmed by merged profiles @I1128@/@I1653@/@I4069@
  // Castro/Kastrel Sephardic root — Michael Castro (Spain, ~1660): story confirmed + Heritage tag
  '@I1296@': ['Heritage', 'Lineage'], // Michael Castro, Spain — Converso root, fled to S. France
  // Wolf Alperovitch: killed as partisan (text lives in birth_place pipe field; see extractTags haystack)
  '@I1081@': ['Partisan'],
  // Extended / unconnected rows (Krasne ghetto, Dolginovo) — apply when merged into data/canonical.csv
  '@I4154@': ['Partisan', 'Migration'], // Joseph Sosinski: Shoah survivor, partisan, aliya 1962
  '@I4151@': ['Heritage'], // Kopel Alperovits, Krasne ghetto (victim — see MANUAL_HOLOCAUST_VICTIM_OVERRIDES)
  '@I4150@': ['Heritage'], // Rashka, Krasne ghetto
};

// IDs where the note mentions DNA data but the person is NOT a verified DNA match to Yael.
const MANUAL_DNA_TAG_EXCLUDE = new Set<string>([
  '@I27@', // Ben Zeidman — has MyHeritage raw data but not a DNA match to Yael
]);

// People whose doubleBloodTie cannot be detected by the path-count algorithm alone,
// because the cousin marriage converges the two branches BEFORE they diverge again to Yael.
// Confirmed: Pesya Kostrell (@I35@) and Michael Alperovich (@I34@) are second cousins once
// removed (both descend from Leyb Alperovitch via Reuven→Yitzhak→Rose Lillian→Pesya
// and Meir→Yehuda→Michael) AND married each other.  Their children therefore carry
// double Alperovich blood from both parents.
const MANUAL_DOUBLE_BLOOD_TIE = new Set<string>([
  '@I34@', // Michael Alperovich — married his cousin Pesya Kostrell
  '@I35@', // Pesya Kostrell — married her cousin Michael; mother Rose Lillian was Alperovich
  '@I83@', // Rose Lillian Rocha Leah — born Alperovich (daughter of Yitzhak), married into Kastrel
  '@I201@', // Yitzhak Alperovich — his daughter Rose Lillian married into Kastrel, grandchild married back into Alperovich
  '@I11@', // Nachum (Nochim) Alperovich — son of Michael+Pesya cousin marriage, double Alperovich
  '@I53@', // Chana Knepf/Vulis — child of Michael+Pesya
  '@I54@', // Rachel Alperovitz — child of Michael+Pesya
  '@I55@', // Dvora Doba Alperovich — child of Michael+Pesya
  '@I56@', // Henia Alperovitch — child of Michael+Pesya
  '@I57@', // Rashka Alperovitch — child of Michael+Pesya
]);

const MANUAL_HOLOCAUST_VICTIM_OVERRIDES: Record<string, boolean> = {
  // User-confirmed branch examples around Nochim/Nachum Alperovich family.
  '@I34@': true, // Michael Alperovich (father)
  '@I35@': true, // Pesya Kastrol (mother)
  '@I54@': true, // Rachel Alperovich (sister)
  '@I56@': true, // Henia Alperovitch (sister)
  '@I57@': true, // Rashka Alperovitch (sister)
  '@I58@': false, // Ruven Duberstein - killed in battle (Russian army), not Shoah victim
  '@I59@': false, // Michael Duberstein - died as an infant, before Shoah
  // Krasne ghetto (enrich_family_tree / extended rows when merged into canonical)
  '@I4151@': true, // Kopel Alperovits
  '@I4150@': true, // Rashka (Krasne)
  '@I4154@': false, // Joseph Sosinski: survivor, partisan, aliya
};

const MANUAL_WAR_CASUALTY_OVERRIDES: Record<string, boolean> = {
  '@I58@': true, // Ruven (Ruve) Vladimirovich Duberstein - killed in battle (Russian army)
};

const MANUAL_BIRTHPLACE_OVERRIDES: Record<string, string> = {
  // Heilprin chain — birthplaces from mh_identifier data
  '@I3167@': 'Brisk (Brest-Litovsk), Grand Duchy of Lithuania',
  '@I2855@': 'Tarnogród, Poland',
  '@I2617@': 'Poznań, Poland',
  // User research note: likely origin from Belarus/Ukraine (Guzhinsky), while descendants are in Romania branch.
  '@I30@': 'Belarus or Ukraine (Guzhinsky origin)',
  // User-confirmed: Cilia Sara was born in Haifa during the British Mandate period.
  '@I12@': 'Haifa, British Mandate for Palestine',
  // Hyman Isidor Kastrel (@I124@): Geni + Congress for Jewish Culture lexicon (PDF, 2026-03-27)
  '@I124@': 'Kuraniec (Kurenets), Vileyka District, Minsk Region, Belarus',
};

// ── Birth-place normalisation ──────────────────────────────────────────────
// Maps raw CSV values (or prefix substrings) → canonical "City, Country" form.
// Keys are matched case-insensitively; first match wins (longest-key-first order).
const BIRTHPLACE_NORM: Array<[string, string]> = [
  // ── Kurenets variants ──────────────────────────────────────────────────
  ['kurenets, vileyka',           'Kurenets, Belarus'],
  ['kuraniec',                    'Kurenets, Belarus'],
  ['kureniets',                   'Kurenets, Belarus'],
  ['kurenets',                    'Kurenets, Belarus'],
  // ── Other Belarus towns ────────────────────────────────────────────────
  ['radoshkovichi',               'Radoshkovichi, Belarus'],
  ['dolginovo',                   'Dolginovo, Belarus'],
  ['pleshchanitsy',               'Pleshchanitsy, Belarus'],
  ['pleshchenitsy',               'Pleshchanitsy, Belarus'],
  ['danilovichi',                 'Danilovichi, Belarus'],
  ['sosenka',                     'Sosenka, Belarus'],
  ['mikashevichy',                'Mikashevichy, Belarus'],
  ['krivitz',                     'Krivitz, Belarus'],
  ['krivichi',                    'Krivichi, Belarus'],
  ['pinsk',                       'Pinsk, Belarus'],
  ['minsk',                       'Minsk, Belarus'],
  ['Lenin',                       'Lenin, Belarus'],  // village in Brest Oblast
  // ── Russia / Soviet variants ───────────────────────────────────────────
  ['russian federation',          'Russia'],
  ['russian empire',              'Russia'],
  ['russia, russian empire',      'Russia'],
  ['russia poland',               'Russia / Poland'],
  ['רוסיה',                       'Russia'],
  // ── Lithuania ─────────────────────────────────────────────────────────
  ['birze, lithuania',            'Birzai, Lithuania'],
  ['birzai',                      'Birzai, Lithuania'],
  ['birze',                       'Birzai, Lithuania'],
  ['adutiskis',                   'Adutiškis, Lithuania'],
  ['pasvalys',                    'Pasvalys, Lithuania'],
  ['vilnius',                     'Vilnius, Lithuania'],
  ['vilna',                       'Vilnius, Lithuania'],
  ['kaunas',                      'Kaunas, Lithuania'],
  // ── Latvia ────────────────────────────────────────────────────────────
  ['riga',                        'Riga, Latvia'],
  // ── Poland ────────────────────────────────────────────────────────────
  ['sochaczew, warsaw',           'Sochaczew, Poland'],
  ['sochaczew',                   'Sochaczew, Poland'],
  ['poznan',                      'Poznań, Poland'],
  ['tarnogrod',                   'Tarnogród, Poland'],
  ['brest-litovsk',               'Brest, Belarus'],
  ['brisk',                       'Brest, Belarus'],    // Brisk = Brest-Litovsk
  ['grodno',                      'Hrodna, Belarus'],
  ['mogilev',                     'Mogilev, Belarus'],
  ['vitebsk',                     'Vitebsk, Belarus'],
  ['bialystok',                   'Białystok, Poland'],
  ['lodz',                        'Łódź, Poland'],
  ['krakow',                      'Kraków, Poland'],
  ['lviv',                        'Lviv, Ukraine'],
  ['odessa',                      'Odesa, Ukraine'],
  ['kherson',                     'Kherson, Ukraine'],
  ['lublin',                      'Lublin, Poland'],
  ['warsaw',                      'Warsaw, Poland'],
  ['polin',                       'Poland'],
  // ── Ukraine ───────────────────────────────────────────────────────────
  ['vinnytsia',                   'Vinnytsia, Ukraine'],
  ['chernobyl',                   'Chernobyl, Ukraine'],
  ['korostyshiv',                 'Korostyshiv, Ukraine'],
  ['makariv',                     'Makariv, Ukraine'],
  // ── Romania ───────────────────────────────────────────────────────────
  ['bucuresti',                   'Bucharest, Romania'],
  ['bucharest',                   'Bucharest, Romania'],
  // ── Austria ───────────────────────────────────────────────────────────
  ['vienna',                      'Vienna, Austria'],
  // ── Germany ───────────────────────────────────────────────────────────
  ['worms',                       'Worms, Germany'],
  ['mainz',                       'Mainz, Germany'],
  // ── France ────────────────────────────────────────────────────────────
  ['troyes',                      'Troyes, France'],
  // ── Sweden ────────────────────────────────────────────────────────────
  ['sweden',                      'Sweden'],
  // ── UK ────────────────────────────────────────────────────────────────
  ['northumberland',              'Northumberland, UK'],
  // ── Israel ────────────────────────────────────────────────────────────
  ['kfar saba',                   'Kfar Saba, Israel'],
  ['kefar sava',                  'Kfar Saba, Israel'],
  ['kefar saba',                  'Kfar Saba, Israel'],
  ['petah tikva',                 'Petah Tikva, Israel'],
  ['petach tikva',                'Petah Tikva, Israel'],
  ['tel aviv',                    'Tel Aviv, Israel'],
  ['rehovot',                     'Rehovot, Israel'],
  ['afikim',                      'Afikim, Israel'],
  ['hadera',                      'Hadera, Israel'],
  ['haifa',                       'Haifa, Israel'],
  ['jerusalem',                   'Jerusalem, Israel'],
  ['netanya',                     'Netanya, Israel'],
  // ── USA: cities ───────────────────────────────────────────────────────
  ['bangor, maine',               'Bangor, Maine, USA'],
  ['bangor',                      'Bangor, Maine, USA'],   // only Bangor in this dataset
  ['new york city',               'New York, USA'],
  ['new york, united states',     'New York, USA'],
  ['new york',                    'New York, USA'],
  ['new haven, connecticut',      'New Haven, Connecticut, USA'],
  ['new haven',                   'New Haven, Connecticut, USA'],
  ['brooklyn',                    'Brooklyn, New York, USA'],
  ['bridgeport',                  'Bridgeport, Connecticut, USA'],
  ['hartford',                    'Hartford, Connecticut, USA'],
  ['waterbury',                   'Waterbury, Connecticut, USA'],
  ['louisville',                  'Louisville, Kentucky, USA'],
  ['detroit',                     'Detroit, Michigan, USA'],
  ['chicago',                     'Chicago, Illinois, USA'],
  ['houston',                     'Houston, Texas, USA'],
  ['boston',                      'Boston, Massachusetts, USA'],
  ['los angeles',                 'Los Angeles, California, USA'],
  ['baltimore',                   'Baltimore, Maryland, USA'],
  ['washington, d.c',             'Washington D.C., USA'],
  ['district of columbia',        'Washington D.C., USA'],
  ['washington',                  'Washington D.C., USA'],  // in this dataset = DC branch
  // ── USA: states ───────────────────────────────────────────────────────
  ['connecticut, united states',  'Connecticut, USA'],
  ['connecticut',                 'Connecticut, USA'],
  ['new jersey',                  'New Jersey, USA'],
  ['michigan',                    'Michigan, USA'],
  ['maryland',                    'Maryland, USA'],
  ['kentucky',                    'Kentucky, USA'],
  ['united states',               'USA'],
];

function normalizeBirthPlace(raw: string | null): string | null {
  if (!raw) return raw;
  const lower = raw.toLowerCase().trim();
  // Sort by key length descending so longest (most specific) match wins
  for (const [key, canonical] of BIRTHPLACE_NORM) {
    if (lower.includes(key.toLowerCase())) return canonical;
  }
  return raw.trim() || null;
}

const MANUAL_TITLE_APPEND_OVERRIDES: Record<string, string> = {
  // Source: Congress for Jewish Culture lexicon + Geni profile (PDFs, 2026-03-27)
  // Hyman Y. Kastrel/Costrell: journalist, co-founder of Frayhayt (NY Yiddish daily), communist.
  // Also known as Jack Robbins. Born 19 Oct 1890, Kuraniec Belarus. Died 25 Feb 1956.
  // Second great-uncle of Yael Zaidman-Livnat (Geni confirmed).
  '@I4149@': 'Journalist; co-founder of Frayhayt (NY Yiddish daily, 1922); edited Funken 1933–1935; Communist Party candidate NY 8th District 1934; AKA Jack Robbins. Source: Congress for Jewish Culture + Geni.',
  // Heilprin patriarchal ancestor: Abram Avraham Alperovich Heilprin.
  // His surname "Alperovich" = son of Alper/Eliezer Heilprin — the patronymic origin of the entire Alperovich branch.
  // Source: user-confirmed lineage data, mh_identifier #1503373.
  '@I1746@': 'Patriarch of the Alperovich branch. "Alperovich" = son of Alper (patronymic of Eliezer Heilprin). Born ~1660, Kurenets, Vileyka District, Grand Duchy of Lithuania; died ~1740, Kurenets. Direct ancestor: gen 10 to Yael. mh#1503373.',
  // Heilprin rabbinical dynasty titles
  '@I3167@': 'Zvulen Eliezer Ashkenazi-Heilprin. mh#1504849. Gen 15. Father of R\' Moshe (gen 14). Y-DNA note: Leon Hillman (FTDNA IN139620, 4 Steps, R-L47) lists "Zevulun Eliezer Heilprin b. before 1554" as his paternal ancestor — possible independent Y-line connection from Lanzmann branch to Heilprin.',
  '@I3032@': 'R\' Moshe Ashkenazi ben Eliezer Heilprin. mh#1504833. Gen 14. Poznań area.',
  '@I2855@': 'Rabbi Eliezer Lipman Lazar Heilprin. mh#1504732. Gen 13. Tarnogród.',
  '@I2617@': 'Rabbi Moshe Yehuda Selki Heilprin. mh#1504730. Gen 12. Poznań.',
  // JewishGen Worldwide Jewish Burial Registry matches (2026-03-29)
  '@I414@': 'Burial: Montrepose Cemetery, Kingston, New York. Death place: New Paltz, New York. Source: JewishGen Burial Registry.',
  '@I479@': 'Burial: Mount Sinai Memorial Parks and Mortuaries, Los Angeles. Source: JewishGen Burial Registry.',
  '@I258@': 'Burial: Montrepose Cemetery, Kingston, New York (also listed: Veteran Burials). Source: JewishGen Burial Registry.',
  // Confirmed DNA matches — annotations
  '@I376@': 'בן דוד/ה שני בהפרש דור — ענף אלפרוביץ׳-גורביץ׳. בן של Sinai Herbert + Sima Gurevitz Lerman (בת פראדה אלפרוביץ׳). מאושר DNA דרך 23andMe של אסיף (Father\'s side).',
  '@I578@': 'בן דוד/ה שלישי. בן של Chaim Herbert (@I376@). FTDNA 150.8 cM ("Jonathan Sinai Herbert"). DNA מאושר.',
  '@I385@': 'בן דוד/ה שני בהפרש דור — ענף קסטרל/קוסטרל. FTDNA 157.33 cM. Y-haplogroup J-FTF95213. מאשר שרשרת Castro→Kastrel→Costrell.',
  // MyHeritage SmartMatch annotations — מידע חדש זמין לעדכון ידני
  '@I244@': 'Louis Costrell (1915–2009). MyHeritage 10 SmartMatches — מידע חדש: אחים, תיאור, כתובת מפורטת, מקום קבורה.',
  '@I335@': 'Geula Vulis (Epstein) (נולדה 23 Nov 1920). MyHeritage 18 SmartMatches — מידע חדש: תאריך פטירה, מקום פטירה, קבורה, בן/בת זוג, ילדים.',
  '@I80@':  'Yehuda "Yudel" Alperovich (~1850–1917). אב-קדמון 4 דורות. MyHeritage 12 SmartMatches — מידע חדש: אחים.',
  '@I198@': 'Meir Alperovich (10 Nov 1819–17 Mar 1900). אב-קדמון 5 דורות. MyHeritage 15 SmartMatches — מידע חדש: מקום פטירה, מקום מגורים.',
  '@I349@': 'Reuven Alperovitch (~1823–~1890). אב-קדמון 6 דורות. MyHeritage 5 SmartMatches — מידע חדש: תמונה, עיסוק, מקום מגורים, השכלה.',
  // ── Lanzmann & Shvartz siblings ───────────────────────────────────────
  '@I48@': 'נולדה לנצמן. אחות של מרדכי מרקו לנצמן (@I9@). נישאה לפנחס (Pinhas). נולדה פוקשני 1 אוקטובר 1903.',
  '@I49@': 'אח של מינה לנצמן (לבית שוורץ). שם נעורים: שוורץ-דסקלו. נולד רומניה 1914. נפטר 17 מאי 1984, גבעת שמואל, ישראל. אשתו: שושנה "ג\'ני" שרנה דורון (לבית בוז\'ינרו / Bojunaru) — מאושר מ-Outline Descendant Report (Branch 944: "Shoshana Cernă Jeni Doron Dascaălu born Bojunaru"). נפטרה ח\' סיון תשמ"ט (11 יוני 1989), קבורה: חולון, ישראל.',
  // ── Lanzmann paternal branch DNA findings (IN131982) ───────────────────
  // Mina Lanzmann née Shvartz: 629 autosomal matches with Schwartz surname cluster.
  // Strongest: Nelson D. Schwartz 80.47 cM (3rd-5th cousin), T-CTS6507.
  // Schwartz variants in matches: Schwartz / Shvartz / Szwarc / Schwarz — Romania/Poland/Ukraine/Hungary.
  '@I10@': 'בת של אריה לייב שוורץ (דסקאלו) וחנה אווה שוורץ/שוורצ. קבורה: חולון, ישראל (מאושר MyHeritage). DNA (IN131982): 629 matches with Schwartz/Shvartz surname cluster. Strongest match: Nelson D. Schwartz (80.47 cM, 3rd-5th cousin, T-CTS6507). Confirms Shvartz maiden name and Ashkenazi Schwartz family network. Source: autosomal DNA 2026 + MyHeritage.',
  // Khava Svartz (mother of Mina) — Dascalu branch: 6 matches.
  // Strongest: Sergiu Peltz 69.71 cM (3rd-5th cousin, R-L1029) with Davidescu/Dascalu/Peltz (Romania).
  // Aviva Weiss 50.77 cM with Daskal/Dascal variants. David Twersky (Nadvorna Hasidic dynasty connection).
  '@I33@': 'DNA (IN131982): 6 matches with Dascalu/Daskal surname cluster. Strongest: Sergiu Peltz (69.71 cM, 3rd-5th cousin, R-L1029) with Davidescu/Dascalu/Peltz surnames from Romania. Also: Aviva Weiss (50.77 cM), Reem Descalo (32.81 cM). Dascalu = Romanian Jewish family name, Moldova/Panciu area. Source: autosomal DNA 2026.',
  // Arie Leib Shvartz (Dascaalu) — father of Mina Shvartz + Marcu Doron (Shvartz Dascalu)
  // Name confirmed: gravestone of Marcu Doron (בן אריה) + MyHeritage Mina profile (Child of Arie Leib Shvartz).
  // "Dascaalu/Dascalu" = Romanian title dascăl (teacher/cantor) — not a surname.
  '@I32@': 'שמו האמיתי אריה לייב שוורץ — מאושר מרישום בית העלמין (מצבת מרקו דורון: "בן אריה") וממידע MyHeritage (Mina: "Child of Arie Leib Shvartz"). "דסקאלו" = תואר ברומנית: dascăl = מורה/מלמד/חזן. DNA (IN131982): 6 התאמות עם Dascalu/Daskal/Descalo; Sergiu Peltz (69.71 cM, R-L1029) — משפחות יהודיות רומניות, אזור מולדובה. Source: DNA 2026 + BillionGraves + MyHeritage.',
  // Glanzman/Lanzmann connection — IMPORTANT: Y-DNA mismatch means connection is via female line
  // Steven Glanzman (76.96 cM, J-FGC9941) + David Glanzman (72.12 cM, J-FGC9941) — Vinnitsky/Vinnytsia, Ukraine
  // Oded Y-DNA = R-FGC8601 ≠ J-FGC9941 → connection is NOT direct paternal line
  // Conclusion: a Glanzman woman married into Lanzmann (or vice versa), or "Lanzmann" is a variant spelling only
  '@I9@': 'שרשרת האב: זבולון אליעזר היילפרין ~1525, פולין ← ... ← שלמה לנצמן ← מרדכי לנצמן (1889, פוקשני). נפטר 20 אוגוסט 1969. קבור: חולון, ישראל. DNA (IN131982): Steven Glanzman (76.96 cM) + David Glanzman (72.12 cM) — ancestry in Vinnytsia, Ukraine. Y-DNA J-FGC9941 ≠ עודד R-FGC8601 → קשר דרך אישה בשם Glanzman שנישאה ללנצמן (לא קו האב הישיר). שם "לנצמן" = כנראה Glanzman ללא G ראשונית (הסתגלות לרומנית). 7 התאמות Vinnitsky נוספות. ילדים (מ-MyHeritage): יהושע (אידור), אריה ליביו, שולה קרולינה (וירט), מרים (אמירון), צבי, שלמה שלמה. Source: IN131982 + IN139620 + MyHeritage, 2026.',
  // Shlomo Lanzman (father of Mordekhai) — Heilprin chain + Vinnitsky geographic cluster
  '@I30@': 'שרשרת האב: זבולון אליעזר היילפרין ~1525, פולין → ... → שלמה לנצמן (בלארוס/אוקראינה) → מרדכי לנצמן (פוקשני, רומניה). DNA: 7 התאמות Vinnitsky/Vinnytsia (IN131982) + Steven Glanzman (76.96 cM, Vinnytsia ancestry) — מצביעים על Vinnytsia, אוקראינה כמקור המשפחה. Bradley Gordon (R-FGC61409, 3 צעדים מעודד) = ענף אחי (Abraham Gozansky, בלארוס 1800s) שנשאר בבלארוס בזמן שלנצמן המשיך לרומניה. Source: IN131982 + IN139620, 2026.',
  // mtDNA HV5a — Sofia Duberstein (bat Bashet Ginzburg) is Yael's earliest known maternal mt ancestor per MyHeritage tree.
  // Source: Adam Cherson email Aug 2024. Adam's grandmother (Zoila Benyakonski) also HV5a, difference of 1.
  // Adam's earliest mt ancestor: Miriam Khrszn (bat Itteh), Dieveniskes, SW Vilna — related but connection unclear.
  '@I37@': 'mtDNA anchor: earliest known maternal mt-line ancestor (HV5a) per MyHeritage tree. Identified by Adam Cherson (NY) whose grandmother Zoila Benyakonski shares HV5a with 1 difference. Adam\'s mt line leads to Miriam Khrszn (bat Itteh), Dieveniskes, SW Vilna — same HV5a subgroup but connection unresolved (Aug 2024).',
  // Y-DNA Q-M242 for Zeev Alperovich (Yael's maternal uncle) — as of Aug 2024
  // Adam Cherson recommends upgrading to BY700 for deeper research.
  // Possible connection to R' Judah Aryeh Leib Maggid of Vilna (Q-FT340368, below M242).
  // FTDNA project: Alperovich of Kurenets — admin: Jenny Rappaport.
  '@I23@': 'Y-DNA: Q-Y2197 (sub-clade of Q-M242; FTDNA IN131982 match list 2025 confirms Q-Y2197). Adam Cherson recommends upgrade to BY700 for deeper Alperovich research. Possible connection to R\' Judah Aryeh Leib Maggid of Vilna (Q-FT340368). FTDNA project "Alperovich of Kurenets" — admin: Jenny Rappaport. ✅ Confirmed: Fred Harber (108 cM, 3rd-5th cousin) shares Q-Y2197 — independent confirmation of Alperovich Y-haplogroup. Source: Adam Cherson email Aug 2024 + IN131982 match list 2025.',
  '@I6@': 'DNA matches note: Abraham Guzhinsky appears in Oded match lists (paternal branch evidence).',
  '@I618@': 'Music note: Kevin Mark DuBrow, associated with the heavy metal band Riot.',
  '@I30@': 'Research note: family origin linked to Abraham Guzhinsky; likely Belarus/Ukraine.',
  '@I721@': 'MyHeritage profile note: Joseph/Yushua Kaszinsky. Birth: Poland. Family context includes Gordon maternal line.',
  '@I724@': 'MyHeritage profile note: Gordon (mother line linked to Joseph/Yushua Kaszinsky profile).',
  '@I500@': 'MyHeritage profile note: Joseph Gordon identified as sibling in the Kaszinsky/Gordon profile cluster.',
  '@I831@': 'MyHeritage profile note: Albert Gordon (b. 1911, Poland) identified as sibling in the Kaszinsky/Gordon profile cluster.',
  '@I830@': 'MyHeritage profile note: Abraham E/abe Gozansky/Gordon. Military service marker: Gozansky/Gordon. Y-DNA: Bradley Gordon (FTDNA IN139620, 3 Steps, R-FGC61409) lists "Abraham Gozansky 1800s (Y)" as earliest known paternal ancestor — directly confirming Gozansky/Lanzmann paternal line origin in Belarus.',
};

const MANUAL_MIGRATION_INFO_OVERRIDES: Record<string, string> = {
  // User-confirmed branch history for Cilia Sara Duberstein:
  // family migrated from Belarus (Pleshchenitsy area), she was born in Haifa,
  // then the family returned to Belarus around 1930.
  '@I12@': 'Born in Haifa (British Mandate). Family origin in Belarus (Pleshchenitsy area), with return to Belarus around 1930.',
  // Joseph Sosinski: aliya after Shoah (enrich note)
  '@I4154@': 'Immigrated to Israel in 1962 after surviving the Shoah and partisan activity.',
};

/**
 * Historical narratives — shown in the "Story" modal in PersonDetailPanel.
 * Source: document "The Alperowitzes, the Fines and the Costrells" (Joshua Kastrel letters, 1988).
 */
const MANUAL_STORY_OVERRIDES: Record<string, string> = {
  // Michael Miguel Castro (~1660, Spain) — Sephardic root; Rashi book will.
  '@I1296@': `מיגל קסטרו נמלט מספרד לדרום צרפת כדי לחיות כיהודי חופשי לאחר שבדורות קודמים נאלצה המשפחה לאמץ נצרות. בספר רש"י עתיק ששמרה המשפחה, כתב מיגל הקדשה בספרדית בה ביקש מצאצאיו להוסיף את שמותיהם ונדודיהם לאותו דף — כדי לשמור על רצף השושלת שנאלצה לחיות כקתולית בספרד.

(מקור: מכתבי יהושע קסטרל, 1988)`,

  // Chivia Alperovitz (Fine) — mother of the Fine children; endogamy note.
  '@I786@': `חיביה אלפרוביץ' הייתה בתם של ראובן ושושה אסתר אלפרוביץ' מסוסנקה, כפר יהודי קטן ליד קורנץ (בלארוס). היא התחתנה עם שמעון פיין, וביחד גידלו שישה ילדים: בשה (בסי), מרי, סם, מאיר, לאזא ורחל-לאה.

משפחת אלפרוביץ' הייתה משפחת כוהנים גאה, שנהגה בנישואין פנים-משפחתיים (אנדוגמיה) — אחותה מרקה נישאה לדוד שלה מאישה אלפרוביץ'. חיביה הייתה דמות מרכזית בחיי הקהילה, שבניה ובנותיה פרשו לדרכים שונות — ממהפכנים עד אמנים.

(מקור: מכתבי יהושע קסטרל, 1988)`,

  // Mary Alpert (née Fine/Alperovitz) — visited Leo Tolstoy at Yasnaya Polyana 1905.
  '@I1060@': `מרי עבדה בילדותה במפעל גפרורים בבוריסוב. בצעירותה חיה בבית דודה בטולה באווירה תרבותית ורוחנית עשירה. היא נהגה לנסוע בימי ראשון ליסנאיה פוליאנה — אחוזתו של הסופר הגדול לב טולסטוי — ולעמוד בפתח ולהקשיב לשיחות הסופר עם הסטודנטים והמבקרים.

מרי הייתה עדה למהפכת 1905 ולדיכוי הדמים של הסטודנטים בכיכר העיר. ניסיונות חייה הופכו אותה לאחת הנשים המרתקות בסיפור המשפחה.

(מקור: מכתבי יהושע קסטרל, 1988)`,

  // Myer Fine — died of malnutrition after being caught reading secular books.
  '@I1137@': `מאיר למד לימודי קודש אך התעניין בסתר במדע ובספרות "חיצונית". כשדודתו הדתית הקיצונית תפסה אותו קורא ספרי מדע שנחשבו "טרפים" — היא הורתה לכל בעלי הבתים בעיירה להפסיק להאכיל אותו.

מנהג "ימי אכילה" היה נפוץ בעיירות: ילדים שנשלחו ללמוד היו אוכלים מדי יום בבית משפחה אחרת. כשנשללה ממנו זכות זו, נחלש מאיר מרעב, חלה בדלקת ריאות ומת בצעירותו — קורבן לקנאות דתית ולניכור חברתי.

(מקור: מכתבי יהושע קסטרל, 1988)`,

  // Rachel-Leah Fine — shot by Tsarist troops age 14; revolutionary martyr.
  '@I1140@': `🎖️ רחל-לאה הייתה פעילה נלהבת בתנועה המהפכנית ברוסיה הצארית. היא הייתה בת 14 בלבד כשעלתה על הבמה בכיכר העיר ונשאה נאום פוליטי נלהב נגד משטר הצאר.

חיילי הצאר פתחו עליה ועל הקהל באש. רחל-לאה נפלה במקום. היא נחשבת לגיבורת המשפחה — סמל האמונה במהפכה ובחירות, ומותה עיצב את הזהות הפוליטית של אחיה ואחיותיה לאורך שנים.

(מקור: מכתבי יהושע קסטרל, 1988)`,
};

const MANUAL_PERSON_FIELD_OVERRIDES: Record<string, Partial<Pick<Person, 'fullName' | 'surname' | 'surnameFinal' | 'relationToYael'>>> = {
  // Requested display naming: include both Livnat and Zaidman on Yael.
  '@I1@': { fullName: 'Yael Livnat Zaidman', surname: 'Livnat', surnameFinal: 'Zaidman' },
  // User-confirmed: Arie Livnat's birth name was Liviu Leib Lanzmann (canonical spelling) before Hebraization to Livnat.
  '@I4@': { surname: 'Lanzmann', surnameFinal: 'Livnat', relationToYael: 'אבא (אריה ליבנת)' }, // Arie (Liviu) Livnat, born Lanzmann
  // ── Lanzmann surname standardisation ─────────────────────────────────────
  // CSV has "Lanzman" or "Lantzman" variants; canonical spelling is "Lanzmann".
  '@I9@':   { fullName: 'Mordekhai Marcu Lanzmann', surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Mordekhai 'Marcu' Lanzmann (1889–1969) — MyHeritage confirms Romanian given name 'Marcu'
  '@I18@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Shlomo Lanzmann
  '@I19@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Yehoshua Lanzmann
  '@I20@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Zvi Lanzmann
  '@I30@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Shlomo Lanzmann (Guzhinsky origin)
  '@I31@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Mali Lanzmann
  '@I38@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Gil Lanzmann
  '@I39@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Yaron Lanzmann (CSV: Lantzman)
  '@I40@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Noam Lanzmann (CSV: Lantzman)
  '@I41@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Avi Lanzmann
  '@I73@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Malka Lanzmann
  '@I74@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Lori Lanzmann
  '@I88@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Shmulik Lanzmann (CSV: Lantzman)
  '@I89@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Matan Lanzmann
  '@I90@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Shoham Lanzmann
  '@I91@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Eyal Lanzmann (CSV: Lantzman)
  '@I92@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Dana Lanzmann (CSV: Lantzman)
  '@I94@':  { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Rony Lanzmann (CSV: Lantzman)
  '@I162@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Nava Lanzmann
  '@I164@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' }, // Adi Lanzmann (CSV: Lantzman)
  // User-confirmed surname history in close family branch.
  '@I22@': { surname: 'Lanzmann', surnameFinal: 'Amiron' }, // Mirriam Mali Amiron (nee Lanzmann)
  '@I47@': { surname: 'Amiron', surnameFinal: 'Kfir' }, // Hava Kfir (nee Amiron)
  '@I102@': { surname: 'Kfir', surnameFinal: 'Horvitz' }, // Michal Horvitz (nee Kfir)
  '@I114@': { surname: 'Vulis', surnameFinal: 'Levi' }, // Ester Levi (nee Vulis)
  '@I218@': { fullName: 'Boaz Bar Levi', surname: 'Levi', surnameFinal: 'Bar Levi' }, // Son listed as Boaz Bar Levi (formerly Levi)
  '@I10@': { fullName: 'Mina Lanzmann', surname: 'Shvartz', surnameFinal: 'Lanzmann' }, // Mina Lanzmann (nee Shvartz)
  '@I49@': { fullName: 'Marcu Doron', surname: 'Shvartz Dascalu', surnameFinal: 'Doron' }, // Marcu Doron (formerly Shvartz Dascalu) — brother of Mina Lanzmann née Shvartz
  '@I48@': { fullName: 'Cherna Lanzmann Pinhas', surname: 'Lanzmann', surnameFinal: 'Pinhas' }, // Cherna née Lanzmann, married Pinhas — sister of Mordekhai Lanzmann
  // @I32@ = Rabbi Dascaalu — real name confirmed from gravestone (Marcu Doron "בן אריה") + MyHeritage profile of Mina (Shvartz).
  // Father's name: Arie Leib Shvartz. "Dascaalu" = title dascăl (Romanian: teacher/cantor). Surname: Shvartz.
  '@I32@': { fullName: 'Arie Leib Shvartz (Dascaalu)', surname: 'Shvartz', surnameFinal: 'Shvartz' },
  // @I786@ Chivia — GEDCOM stores married name Kappelowitz; birth name was Alperovitz.
  '@I786@': { fullName: 'Chivia Alperovitz Fine', surname: 'Alperovitz', surnameFinal: 'Fine' },
  '@I163@': { fullName: 'Yael Lanzmann', surname: 'Shipper', surnameFinal: 'Lanzmann' }, // Yael Lanzmann (nee Shipper)
  '@I77@': { fullName: 'Mordechay Amiron', surname: 'Tekotzino', surnameFinal: 'Amiron' }, // Mordechay Amiron (formerly Tekotzino)
  // User-confirmed: Avrum should be in Vulis surname cluster.
  '@I1240@': { surname: 'Vulis', surnameFinal: 'Vulis' },
  // Yehudit was born Bialik (parents: Israel Dov Ber Bialik & Michal Mania Bialik, niece of Chaim Nachman Bialik).
  // GEDCOM incorrectly stores her married name (Kastrel) as birth surname.
  '@I1392@': { fullName: 'Yehudit Bialik', surname: 'Bialik', surnameFinal: 'Kastrel' },
  // Heilprin rabbinical dynasty — corrected full names from user-provided mh_identifier data.
  '@I3167@': { fullName: 'Zvulen Eliezer Ashkenazi-Heilprin', surname: 'Heilprin', surnameFinal: 'Heilprin' }, // mh#1504849
  '@I3032@': { fullName: "R' Moshe Ashkenazi ben Eliezer Heilprin", surname: 'Heilprin', surnameFinal: 'Heilprin' }, // mh#1504833
  '@I2855@': { fullName: 'Rabbi Eliezer Lipman Lazar Heilprin', surname: 'Heilprin', surnameFinal: 'Heilprin' }, // mh#1504732
  '@I2617@': { fullName: 'Rabbi Moshe Yehuda Selki Heilprin', surname: 'Heilprin', surnameFinal: 'Heilprin' }, // mh#1504730
  '@I1746@': { fullName: 'Abram Avraham Alperovich Heilprin', surname: 'Alperovich', surnameFinal: 'Alperovich' }, // mh#1503373
  // Hyman Isidor Kastrel (born Costrell/Kastrol): GEDCOM has shortened name and misspelled surname.
  // Known as Chaim Hyman; also Jack Robbins, Herman. Co-founder of Yiddish daily Frayhayt.
  '@I124@': { fullName: 'Hyman Isidor Kastrel', surname: 'Kastrel', surnameFinal: 'Kastrel' },
  // Children of Oded Livnat-Tal: GEDCOM has surname "Livnat" but their family name is Livnat-Tal.
  '@I13@': { fullName: 'Liri Livnat-Tal', surname: 'Livnat-Tal', surnameFinal: 'Livnat-Tal' },
  '@I14@': { fullName: 'Dylan Livnat-Tal', surname: 'Livnat-Tal', surnameFinal: 'Livnat-Tal' },
  // ── Relations to Yael: Nachum Alperovich's siblings (Yael's great-aunts/uncles) ──
  // Nachum (@I11@) = Yael's maternal grandfather; his siblings are Yael's great-aunts/uncles
  '@I53@': { relationToYael: 'דודה רבא (אחות של סבא נחום)' },   // Chana Knepf/Vulis
  '@I54@': { relationToYael: 'דודה רבא (אחות של סבא נחום)' },   // Rachel Alperovitz
  '@I55@': { relationToYael: 'דודה רבא (אחות של סבא נחום)' },   // Dvora Doba Alperovich
  '@I56@': { relationToYael: 'דודה רבא (אחות של סבא נחום)' },   // Henia Alperovitch
  '@I57@': { relationToYael: 'דודה רבא (אחות של סבא נחום)' },   // Rashka Alperovitch
  '@I11@': { relationToYael: 'סבא מטעם אמא (נחום אלפרוביץ׳)' },   // Nachum Alperovich = Yael's maternal grandfather
  // Michael & Pesya (Nachum's parents = Yael's great-great-grandparents)
  '@I34@': { relationToYael: 'סבא רבא (אבי סבא נחום)' },         // Michael Alperovich
  '@I35@': { relationToYael: 'סבתא רבא (אמא של סבא נחום)' },     // Pesya Kostrell/Alperovich
  // ── Yael: parents, siblings, maternal uncle Zeev + his son Assif (user-confirmed) ──
  '@I5@': { relationToYael: 'אמא (פולה ליבנת לבית אלפרוביץ׳)' },
  '@I6@': { relationToYael: 'אח (עודד ליבנת-טל)' },
  '@I7@': { relationToYael: 'אחות (עירית ליבנת)' },
  '@I23@': { relationToYael: 'דוד (אח של אמא; בן נחום אלפרוביץ׳)' },
  '@I50@': { relationToYael: 'בן דוד (בן זאב אלפרוביץ׳)' },
  // GEDCOM errors: married surname stored as birth surname, or children listed under wrong surname.
  '@I1392@': { fullName: 'Yehudit Bialik', surname: 'Bialik', surnameFinal: 'Kastrel' },
  '@I13@': { fullName: 'Liri Livnat-Tal', surname: 'Livnat-Tal', surnameFinal: 'Livnat-Tal' },
  '@I14@': { fullName: 'Dylan Livnat-Tal', surname: 'Livnat-Tal', surnameFinal: 'Livnat-Tal' },
  // Standardize Lanzman/Lantzman spellings to Lanzmann (canonical form in this tree).
  '@I9@': { fullName: 'Mordekhai Marcu Lanzmann', surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I18@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I19@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I20@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I30@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I31@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I38@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I39@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I40@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I41@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I73@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I74@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I88@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I89@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I90@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I91@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I92@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I94@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I162@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  '@I164@': { surname: 'Lanzmann', surnameFinal: 'Lanzmann' },
  // Hyman Isidor Kastrel: fix GEDCOM surname Kastrol and display name.
  '@I124@': { fullName: 'Hyman Isidor Kastrel', surname: 'Kastrel', surnameFinal: 'Kastrel' },
};

const MANUAL_MERGE_TO_PRIMARY: Record<string, string> = {
  // High-confidence Vulis duplicates (same full name, matching branch context).
  '@I849@': '@I1239@', // Shulim Shakhna Vulis
  '@I1635@': '@I1234@', // David Vulis
  // Avrum Vulis cluster: duplicate profiles from partial/alternate sources.
  '@I1128@': '@I1240@', // Avrum Gershkov* M'skvira -> Avrum (1789) in Vulis branch
  '@I1653@': '@I1240@', // Avrum Vulis M'skvira -> Avrum (1789) in Vulis branch
  '@I4069@': '@I1240@', // R' Avrum Gershkov ... Vulis -> Avrum (1789) in Vulis branch
};

const SUPPLEMENTAL_RTF_FILES = [
  'part_1.rtf',
  'part_2.rtf',
  'part_3.rtf',
  'part_4.rtf',
  'part_5.rtf',
  'part_6.rtf',
  'part_8.rtf',
  'paet_7.rtf',
  'part_7.rtf',
];

interface Family {
  id: string;
  spouses: string[];
  children: string[];
}

// Parse GEDCOM-style dates like "13 FEB 1973"
function parseGedcomDate(raw: string): string | null {
  if (!raw || raw.trim() === '') return null;
  const value = raw.trim();

  // Normalize placeholder full dates (01.01.YYYY / 1 JAN YYYY) to just year.
  const dottedPlaceholder = value.match(/^0?1[./-]0?1[./-](\d{4})$/);
  if (dottedPlaceholder) return dottedPlaceholder[1];

  const gedcomPlaceholder = value.match(/^0?1\s+JAN\s+(\d{4})$/i);
  if (gedcomPlaceholder) return gedcomPlaceholder[1];

  return value;
}

// Extract fields from note_plain
function extractFromNotes(notePlain: string) {
  const decodeHtmlEntities = (value: string): string =>
    value
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

  // Some sources contain escaped HTML fragments like "&lt;/p&gt;&lt;p&gt;".
  // Decode + strip tags before extracting structured fields.
  const normalized = decodeHtmlEntities(notePlain || '');
  const clean = normalized
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const gen = clean.match(/Generation:\s*(-?\d+)/);
  const rel = clean.match(/Relationship to Yael:\s*(.+?)(?:\s*Generation|\s*Epithet|\s*Note:|$)/i);
  const coords = clean.match(/Epithet:\s*\[([0-9.-]+),\s*([0-9.-]+)\]/);

  // Collect DNA info
  const dnaPatterns = [
    /mtDNA Haplogroup:\s*[^\s].*?(?=\s*(?:Autosomal|Y-DNA|DNA Cluster|Epithet|$))/,
    /Y-DNA Haplogroup:\s*[^\s].*?(?=\s*(?:Autosomal|mtDNA|DNA Cluster|Epithet|$))/,
    /Autosomal DNA:\s*[^\s].*?(?=\s*(?:mtDNA|Y-DNA|DNA Cluster|Epithet|$))/,
    /DNA Cluster:\s*[^\s].*?(?=\s*(?:mtDNA|Y-DNA|Autosomal|Epithet|$))/,
  ];
  const dnaInfoParts: string[] = [];
  for (const pat of dnaPatterns) {
    const m = clean.match(pat);
    if (m) dnaInfoParts.push(m[0].trim());
  }

  return {
    generation: gen ? parseInt(gen[1], 10) : null,
    relationToYael: rel
      ? rel[1]
          .replace(/[<>]/g, ' ')
          .replace(/\s*<\/?[a-z]*$/i, '')
          .replace(/\s*\/$/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : null,
    coordinates: coords ? [parseFloat(coords[1]), parseFloat(coords[2])] as [number, number] : null,
    dnaInfo: dnaInfoParts.length > 0 ? dnaInfoParts.join(' | ') : null,
  };
}

// Split pipe-separated date/place fields (birth | death | burial)
function splitPipeField(value: string): { birth: string | null; death: string | null } {
  if (!value) return { birth: null, death: null };
  const parts = value.split(' | ').map(s => s.trim());
  return {
    birth: parts[0] || null,
    death: parts[1] || null,
  };
}

function normalizeNameForLookup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSurnameKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[^a-z\u0590-\u05ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rtfToRoughPlainText(rtf: string): string {
  return rtf
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\u-?\d+\??/g, ' ')
    .replace(/\\[a-zA-Z]+\d*\s?/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNamePrefix(fragment: string): string | null {
  const m = fragment.match(/([A-Z][A-Za-z .,'()\-]{2,90})\s+(?:was|perished|died|escaped|joined)/);
  if (!m) return null;
  const candidate = m[1].trim();
  if (candidate.length < 3) return null;
  return candidate;
}

function loadSupplementalSignals(): SupplementalSignals {
  const holocaustNames = new Set<string>();
  const partisanNames = new Set<string>();
  const loadedFiles: string[] = [];

  const home = process.env.HOME || '';
  const downloadsDir = join(home, 'Downloads');

  for (const filename of SUPPLEMENTAL_RTF_FILES) {
    const path = join(downloadsDir, filename);
    if (!existsSync(path)) continue;
    loadedFiles.push(filename);

    const raw = readFileSync(path, 'utf-8');
    const plain = rtfToRoughPlainText(raw);
    const fragments = plain.split(/[.!?]/).map(s => s.trim()).filter(Boolean);

    for (const fragment of fragments) {
      const lower = fragment.toLowerCase();
      const name = extractNamePrefix(fragment);
      if (!name) continue;
      const normalizedName = normalizeNameForLookup(name);
      if (!normalizedName) continue;

      if (
        lower.includes('perished') ||
        lower.includes('murdered') ||
        lower.includes('holocaust') ||
        lower.includes('shoah') ||
        lower.includes('nazis')
      ) {
        holocaustNames.add(normalizedName);
      }

      if (
        lower.includes('partisan') ||
        lower.includes('partisans') ||
        lower.includes('resistance')
      ) {
        partisanNames.add(normalizedName);
      }
    }
  }

  return { holocaustNames, partisanNames, loadedFiles };
}

function loadSurnameOriginsMap(): Map<string, string> {
  const map = new Map<string, string>();
  const home = process.env.HOME || '';
  const surnamesPath = join(home, 'Downloads', 'surnames.csv');
  if (!existsSync(surnamesPath)) return map;

  const raw = readFileSync(surnamesPath, 'utf-8');
  const rows: RawSurnameOrigin[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  for (const row of rows) {
    const surnameRaw = row.Surname || row['\ufeffSurname'] || '';
    const location = (row.Location || '').trim();
    if (!location) continue;
    const variants = surnameRaw
      .split('/')
      .map(v => normalizeSurnameKey(v))
      .filter(Boolean);
    for (const variant of variants) {
      if (!map.has(variant)) map.set(variant, location);
    }
  }

  return map;
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function removeKohenMarkers(value: string): { clean: string; hasKohenMarker: boolean } {
  if (!value) return { clean: '', hasKohenMarker: false };

  const original = value;
  let clean = value;

  // Remove token variants like: Ha-Cohen / Ha Cohen / ha_cohen
  clean = clean.replace(/\bha[-_\s]?cohen\b/gi, ' ');
  // Remove Hebrew marker: הכהן
  clean = clean.replace(/\bהכהן\b/g, ' ');

  clean = normalizeSpaces(clean);
  return { clean, hasKohenMarker: clean !== normalizeSpaces(original) };
}

function isHolocaustVictim(row: RawCanonical): boolean {
  const haystack = [
    row.full_name,
    row.given_final,
    row.surname,
    row.surname_final,
    row.titl,
    row.note,
    row.note_plain,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    haystack.includes('perished in the shoah') ||
    haystack.includes('murdered in the shoah') ||
    haystack.includes('victim of the shoah') ||
    haystack.includes('murdered in the holocaust') ||
    haystack.includes('holocaust victim') ||
    haystack.includes('נספה בשואה') ||
    haystack.includes('נרצח בשואה')
  );
}

function extractYear(value: string | null): number | null {
  if (!value) return null;
  const m = value.match(/(\d{4})/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

function isLikelyHolocaustVictimByDateAndRegion(
  row: RawCanonical,
  birthDate: string | null,
  deathDate: string | null,
  birthPlace: string | null
): boolean {
  const birthYear = extractYear(birthDate);
  const deathYear = extractYear(deathDate);

  // Also extract the embedded death year from the raw birth_date field when the pipe
  // separator has no surrounding spaces (canonical.csv format: "1 JAN 1880|9 SEP 1942").
  // splitPipeField requires " | " so these are not parsed into deathDate automatically.
  let embeddedDeathYear: number | null = null;
  const rawBd = row.birth_date || '';
  const pipeIdx = rawBd.indexOf('|');
  if (pipeIdx >= 0) {
    embeddedDeathYear = extractYear(rawBd.slice(pipeIdx + 1));
  }

  const effectiveDeathYear = deathYear ?? embeddedDeathYear;

  const placeHaystack = [
    birthPlace || '',
    row.birth_place || '',
    row.note_plain || '',
    row.note || '',
    row.titl || '',
  ]
    .join(' ')
    .toLowerCase();

  // Eastern-Europe and major Shoah geographies represented in this dataset.
  // Excludes Western allied countries (USA, UK, Canada, Australia) to avoid false positives.
  const hasShoahRegion =
    /kurenets|kureniets|vileyka|vilna|wilno|minsk|byelorussian|belarus|bielarus|poland|lithuania|ukraine|radoshkovichi|latvia|riga|romania|transnistria|auschwitz|treblinka|sobibor|belzec|majdanek|chelmno|ghetto|warsaw|lodz|krakow|lviv|lwow|lww|vilnius|kaunas|dvinsk|daugavpils|birzai|ostland|reichskommissariat/.test(
      placeHaystack
    );

  if (!hasShoahRegion) return false;

  // Strong signal: explicit death during WWII / Shoah years (1939–1945).
  if (effectiveDeathYear !== null && effectiveDeathYear >= 1939 && effectiveDeathYear <= 1945) return true;

  // Secondary signal: only a single wartime date exists (often imported as birthDate by source formatting).
  if (
    !deathDate &&
    embeddedDeathYear === null &&
    birthYear !== null &&
    birthYear >= 1939 &&
    birthYear <= 1945
  )
    return true;

  return false;
}

function isWarCasualty(row: RawCanonical): boolean {
  const haystack = [row.titl, row.note, row.note_plain, row.full_name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    haystack.includes('killed in battle') ||
    haystack.includes('killed in action') ||
    haystack.includes('fell in battle') ||
    haystack.includes('army') ||
    haystack.includes('military') ||
    haystack.includes('russian army') ||
    haystack.includes('נהרג בקרב') ||
    haystack.includes('נפל בקרב')
  );
}

function hasManualBooleanOverride(map: Record<string, boolean>, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(map, id);
}

function normalizePlaceForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[^a-z\u0590-\u05ff0-9,\s-]/g, ' ')
    .replace(/,+/g, ',')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/g, '')
    .trim();
}

function placeCoreTokens(value: string): Set<string> {
  const normalized = normalizePlaceForCompare(value);
  const stopwords = new Set([
    'district', 'region', 'province', 'governorate', 'gubernia', 'guberniya',
    'oblast', 'uyezd', 'empire', 'mandate', 'british', 'occupied', 'former', 'fmr',
    'center', 'north', 'south', 'east', 'west',
    // Hebrew generic location words
    'מחוז', 'אזור', 'נפה', 'פלך', 'אימפריה', 'מנדט',
  ]);

  return new Set(
    normalized
      .split(/[,\s-]+/)
      .map(token => token.trim())
      .filter(token => token.length >= 3 && !stopwords.has(token))
  );
}

function isLikelySamePlace(a: string, b: string): boolean {
  const na = normalizePlaceForCompare(a);
  const nb = normalizePlaceForCompare(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  const ta = placeCoreTokens(a);
  const tb = placeCoreTokens(b);
  if (ta.size === 0 || tb.size === 0) return false;

  let common = 0;
  for (const token of ta) {
    if (tb.has(token)) common += 1;
  }
  const coverageA = common / ta.size;
  const coverageB = common / tb.size;
  return common >= 2 && (coverageA >= 0.8 || coverageB >= 0.8);
}

function extractMigrationInfo(
  birthPlace: string | null,
  deathPlace: string | null,
  notePlain: string,
  note: string,
  title: string
): string | null {
  const parts: string[] = [];

  const hasPlaceTransition =
    birthPlace &&
    deathPlace &&
    !isLikelySamePlace(birthPlace, deathPlace);
  if (hasPlaceTransition) {
    parts.push(`From ${birthPlace} to ${deathPlace}`);
  }

  const noteHaystack = [notePlain, note, title].filter(Boolean).join(' ');
  const fragments = noteHaystack
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(Boolean);
  const migrationKeywords =
    /(immigrat|emigrat|migrat|aliyah|aliya|moved to|arrived|settled|relocated|עלה|עלייה|היגר|היגרה|הגירה)/i;
  const keywordHits = fragments
    .filter(fragment => migrationKeywords.test(fragment))
    .slice(0, 2);

  for (const hit of keywordHits) {
    if (!parts.includes(hit)) parts.push(hit);
  }

  if (parts.length === 0) return null;
  return parts.join(' | ');
}

function hasVerifiedDnaMatchEvidence(row: RawCanonical, dnaInfo: string | null): boolean {
  const haystack = [
    row.full_name,
    row.titl,
    row.note,
    row.note_plain,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const dnaSignal =
    !!dnaInfo ||
    /(?:mtdna|y-dna|autosomal dna|haplogroup|dna cluster|dna anchor|\bdna\b|דנא)/i.test(haystack);
  if (!dnaSignal) return false;

  // Keep DNA labels only when they are clearly tied to user match sources.
  const sourceAnchors = /(?:\byael\b|\boded\b|\bassif\b|myheritage|ftdna|familytreedna|in131982|23andme|you\.23andme\.com|dna match|match list|matching)/i;
  if (!sourceAnchors.test(haystack)) return false;

  // Avoid generic educational/background genetics text that is not person-level match evidence.
  const genericContext =
    /(?:how it works|paternal haplogroup report|references|the genetics of|population|chromosome tree|haplogroup [a-z]-)/i;
  const explicitPersonLink =
    /(?:match status|in tree|relative_name|profile_url|segments_shared|percent_dna_shared|assif|oded|yael|myheritage|ftdna|in131982|you\.23andme\.com)/i;
  if (genericContext.test(haystack) && !explicitPersonLink.test(haystack)) return false;

  return true;
}

function extractTags(
  row: RawCanonical,
  hasVerifiedDnaEvidence: boolean,
  supplementalPartisan: boolean,
  migrationInfo: string | null
): string[] {
  const tags = new Set<string>();
  const haystack = [
    row.full_name,
    row.titl,
    row.note,
    row.note_plain,
    row.birth_place,
    row.birth_date,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (hasVerifiedDnaEvidence) {
    tags.add('DNA');
  }

  if (haystack.includes('myheritage') || haystack.includes('heritage')) {
    tags.add('Heritage');
  }

  if (
    haystack.includes('partisan') ||
    haystack.includes('partisans') ||
    haystack.includes('resistance movement') ||
    haystack.includes('resistance') ||
    haystack.includes('פרטיזן') ||
    haystack.includes('פרטיזנים') ||
    haystack.includes('מחתרת') ||
    haystack.includes('הצטרף לפרטיזנים') ||
    haystack.includes('ניצול שואה ופרטיזן')
  ) {
    tags.add('Partisan');
  }

  if (supplementalPartisan) {
    tags.add('Partisan');
  }

  if (
    /\brabbi\b/i.test(haystack) ||
    /\brav\b/i.test(haystack) ||
    /\br'\b/i.test(haystack) ||
    haystack.includes('רבי') ||
    haystack.includes('הרב') ||
    haystack.includes('רב ')
  ) {
    tags.add('Rabbi');
  }

  const hasRabbinicLineageMarker =
    /\babd\b/i.test(haystack) ||
    /\bav beit din\b/i.test(haystack) ||
    /\bav bet din\b/i.test(haystack) ||
    /\bmaharam\b/i.test(haystack) ||
    /\bmahara\b/i.test(haystack) ||
    /\bmaharal\b/i.test(haystack) ||
    /\bmaharsha\b/i.test(haystack) ||
    /\bmaharil\b/i.test(haystack) ||
    /\brashi\b/i.test(haystack) ||
    /\brambam\b/i.test(haystack) ||
    /\brashba\b/i.test(haystack) ||
    /\brabbeinu\b/i.test(haystack) ||
    /\bgaon\b/i.test(haystack) ||
    haystack.includes('אב"ד') ||
    haystack.includes('מהר');

  if (hasRabbinicLineageMarker) {
    tags.add('Famous');
    // Mark as Rabbi when title-style rabbinic honorifics are present.
    if (
      /\babd\b/i.test(haystack) ||
      /\bav beit din\b/i.test(haystack) ||
      /\bav bet din\b/i.test(haystack) ||
      /\bmaharam\b/i.test(haystack) ||
      /\bmaharal\b/i.test(haystack) ||
      /\bmaharsha\b/i.test(haystack) ||
      /\bmaharil\b/i.test(haystack) ||
      /\brabbeinu\b/i.test(haystack) ||
      /\bgaon\b/i.test(haystack) ||
      haystack.includes('אב"ד') ||
      haystack.includes('מהר')
    ) {
      tags.add('Rabbi');
    }
  }

  if (
    haystack.includes('direct ancestor') ||
    haystack.includes('ancestor') ||
    haystack.includes('אב-קדמון') ||
    haystack.includes('ייחוס')
  ) {
    tags.add('Lineage');
  }

  if (migrationInfo) {
    tags.add('Migration');
  }

  const manualTags = MANUAL_TAG_OVERRIDES[row.ged_id] || [];
  for (const tag of manualTags) {
    if (tag) tags.add(tag);
  }

  return Array.from(tags).sort();
}

function normalizeForDedup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s'".,;:()\-_/]+/g, ' ')
    .trim();
}

function isMeaningfulPersonName(value: string): boolean {
  const n = normalizeForDedup(value);
  if (!n) return false;
  if (/^child \d+/.test(n)) return false;
  if (/^(unknown|fnu|lnu|none|n\/a)$/i.test(n)) return false;
  return n.length >= 3;
}

function nonEmptyStringCount(values: Array<string | null | undefined>): number {
  let count = 0;
  for (const v of values) {
    if (v && v.trim() !== '') count += 1;
  }
  return count;
}

function personQualityScore(person: Person): number {
  return (
    nonEmptyStringCount([
      person.fullName,
      person.givenName,
      person.surnameFinal,
      person.birthDate,
      person.deathDate,
      person.birthPlace,
      person.relationToYael,
      person.dnaInfo,
      person.title,
      person.hebrewName,
      person.birthName,
      person.fatherName,
      person.motherName,
      person.spouseName,
      person.childrenNames,
      person.jewishLineage,
    ]) +
    person.familiesAsSpouse.length +
    (person.familyAsChild ? 1 : 0) +
    person.tags.length
  );
}

function pickPrimaryPerson(cluster: Person[]): Person {
  const sorted = [...cluster].sort((a, b) => {
    const byScore = personQualityScore(b) - personQualityScore(a);
    if (byScore !== 0) return byScore;
    return a.id.localeCompare(b.id);
  });
  return sorted[0];
}

function preferLonger(base: string | null, incoming: string | null): string | null {
  if (!base && !incoming) return null;
  if (!base) return incoming;
  if (!incoming) return base;
  return incoming.length > base.length ? incoming : base;
}

function mergeDnaInfo(base: string | null, incoming: string | null): string | null {
  if (!base) return incoming;
  if (!incoming) return base;
  if (base === incoming) return base;
  const parts = new Set(
    `${base} | ${incoming}`
      .split(' | ')
      .map(p => p.trim())
      .filter(Boolean)
  );
  return Array.from(parts).join(' | ');
}

function mergePersons(primary: Person, duplicate: Person): Person {
  const familySet = new Set<string>([...primary.familiesAsSpouse, ...duplicate.familiesAsSpouse]);
  const tagSet = new Set<string>([...primary.tags, ...duplicate.tags]);

  return {
    ...primary,
    fullName: preferLonger(primary.fullName, duplicate.fullName) || primary.fullName,
    givenName: preferLonger(primary.givenName, duplicate.givenName) || primary.givenName,
    surname: preferLonger(primary.surname, duplicate.surname) || primary.surname,
    surnameFinal: preferLonger(primary.surnameFinal, duplicate.surnameFinal) || primary.surnameFinal,
    birthDate: preferLonger(primary.birthDate, duplicate.birthDate),
    deathDate: preferLonger(primary.deathDate, duplicate.deathDate),
    birthPlace: preferLonger(primary.birthPlace, duplicate.birthPlace),
    generation: primary.generation ?? duplicate.generation,
    relationToYael: preferLonger(primary.relationToYael, duplicate.relationToYael),
    hops: primary.hops !== null && duplicate.hops !== null
      ? Math.min(primary.hops, duplicate.hops)
      : (primary.hops ?? duplicate.hops),
    dnaInfo: mergeDnaInfo(primary.dnaInfo, duplicate.dnaInfo),
    coordinates: primary.coordinates || duplicate.coordinates,
    familiesAsSpouse: Array.from(familySet),
    familyAsChild: primary.familyAsChild || duplicate.familyAsChild,
    title: preferLonger(primary.title, duplicate.title),
    hebrewName: preferLonger(primary.hebrewName, duplicate.hebrewName),
    birthName: preferLonger(primary.birthName, duplicate.birthName),
    fatherName: preferLonger(primary.fatherName, duplicate.fatherName),
    motherName: preferLonger(primary.motherName, duplicate.motherName),
    spouseName: preferLonger(primary.spouseName, duplicate.spouseName),
    childrenNames: preferLonger(primary.childrenNames, duplicate.childrenNames),
    jewishLineage: preferLonger(primary.jewishLineage, duplicate.jewishLineage),
    migrationInfo: preferLonger(primary.migrationInfo, duplicate.migrationInfo),
    holocaustVictim: primary.holocaustVictim || duplicate.holocaustVictim,
    warCasualty: primary.warCasualty || duplicate.warCasualty,
    connectionPathCount:
      primary.connectionPathCount !== null && duplicate.connectionPathCount !== null
        ? Math.max(primary.connectionPathCount, duplicate.connectionPathCount)
        : (primary.connectionPathCount ?? duplicate.connectionPathCount),
    doubleBloodTie: primary.doubleBloodTie || duplicate.doubleBloodTie,
    tags: Array.from(tagSet).sort(),
  };
}

function isMissingSurname(value: string | null | undefined): boolean {
  if (!value) return true;
  const normalized = normalizeForDedup(value);
  if (!normalized) return true;
  return /^(unknown|fnu|lnu|none|n\/a|na|-+)$/i.test(normalized);
}

function pickMostCommonSurname(candidates: string[]): string | null {
  const counts = new Map<string, { value: string; count: number }>();
  for (const raw of candidates) {
    const normalized = normalizeForDedup(raw);
    if (!normalized || isMissingSurname(raw)) continue;
    const current = counts.get(normalized);
    if (current) {
      current.count += 1;
    } else {
      counts.set(normalized, { value: raw.trim(), count: 1 });
    }
  }
  if (counts.size === 0) return null;
  return Array.from(counts.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.value.length - a.value.length;
    })[0].value;
}

function enrichMissingSurnames(persons: Person[], families: Family[]): Person[] {
  const personById = new Map(persons.map(person => [person.id, person]));
  const familyById = new Map(families.map(family => [family.id, family]));

  return persons.map(person => {
    const hasSurname = !isMissingSurname(person.surname);
    const hasSurnameFinal = !isMissingSurname(person.surnameFinal);
    if (hasSurname && hasSurnameFinal) return person;

    // If one surname field exists, copy it to the missing field.
    if (hasSurname && !hasSurnameFinal) {
      return { ...person, surnameFinal: person.surname.trim() };
    }
    if (!hasSurname && hasSurnameFinal) {
      return { ...person, surname: person.surnameFinal.trim() };
    }

    const parentCandidates: string[] = [];
    const spouseCandidates: string[] = [];

    const parentFamily = person.familyAsChild ? familyById.get(person.familyAsChild) : null;
    if (parentFamily) {
      for (const parentId of parentFamily.spouses) {
        const parent = personById.get(parentId);
        if (!parent) continue;
        if (!isMissingSurname(parent.surnameFinal)) parentCandidates.push(parent.surnameFinal);
        else if (!isMissingSurname(parent.surname)) parentCandidates.push(parent.surname);
      }
    }

    for (const famId of person.familiesAsSpouse) {
      const family = familyById.get(famId);
      if (!family) continue;
      for (const spouseId of family.spouses) {
        if (spouseId === person.id) continue;
        const spouse = personById.get(spouseId);
        if (!spouse) continue;
        if (!isMissingSurname(spouse.surnameFinal)) spouseCandidates.push(spouse.surnameFinal);
        else if (!isMissingSurname(spouse.surname)) spouseCandidates.push(spouse.surname);
      }
    }

    const inferredSurname =
      pickMostCommonSurname(parentCandidates) ||
      pickMostCommonSurname(spouseCandidates);

    if (!inferredSurname) return person;
    return {
      ...person,
      surname: inferredSurname,
      surnameFinal: inferredSurname,
    };
  });
}

function enrichConnectivitySignals(persons: Person[], families: Family[], rootPersonId: string): Person[] {
  const adjacency = new Map<string, Set<string>>();
  for (const person of persons) {
    adjacency.set(person.id, new Set<string>());
  }

  for (const family of families) {
    // Use blood-line edges only (parent <-> child) for kinship-path counting.
    // This avoids inflating path counts through spouse/sibling shortcuts.
    for (const parentId of family.spouses) {
      if (!adjacency.has(parentId)) continue;
      for (const childId of family.children) {
        if (!adjacency.has(childId)) continue;
        adjacency.get(parentId)!.add(childId);
        adjacency.get(childId)!.add(parentId);
      }
    }

    // Add direct sibling blood links (same parents/family) so sibling relation
    // is represented as one kinship step instead of two alternative parent routes.
    const visibleChildren = family.children.filter(id => adjacency.has(id));
    for (let i = 0; i < visibleChildren.length; i += 1) {
      for (let j = i + 1; j < visibleChildren.length; j += 1) {
        const a = visibleChildren[i];
        const b = visibleChildren[j];
        adjacency.get(a)!.add(b);
        adjacency.get(b)!.add(a);
      }
    }
  }

  const dist = new Map<string, number>();
  const shortestPathCount = new Map<string, number>();
  const queue: string[] = [];
  const MAX_PATHS = 99;

  if (adjacency.has(rootPersonId)) {
    dist.set(rootPersonId, 0);
    shortestPathCount.set(rootPersonId, 1);
    queue.push(rootPersonId);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDistance = dist.get(current)!;
    const currentCount = shortestPathCount.get(current)!;
    for (const neighbor of adjacency.get(current) || []) {
      if (!dist.has(neighbor)) {
        dist.set(neighbor, currentDistance + 1);
        shortestPathCount.set(neighbor, currentCount);
        queue.push(neighbor);
        continue;
      }

      // Count additional shortest paths only.
      if (dist.get(neighbor) === currentDistance + 1) {
        const next = Math.min(MAX_PATHS, (shortestPathCount.get(neighbor) || 0) + currentCount);
        shortestPathCount.set(neighbor, next);
      }
    }
  }

  return persons.map(person => {
    const pathCount = shortestPathCount.get(person.id) || 0;
    const doubleBloodTie = pathCount >= 2 || MANUAL_DOUBLE_BLOOD_TIE.has(person.id);
    const tags = new Set(person.tags);
    if (doubleBloodTie) {
      tags.add('DoubleBloodTie');
    } else {
      tags.delete('DoubleBloodTie');
    }
    return {
      ...person,
      connectionPathCount: pathCount > 0 ? pathCount : null,
      doubleBloodTie,
      tags: Array.from(tags).sort(),
    };
  });
}

function deduplicatePersons(persons: Person[], families: Family[]): {
  persons: Person[];
  families: Family[];
  mergedCount: number;
} {
  const idRemap = new Map<string, string>();
  const mergedByPrimary = new Map<string, Person>();
  const personByOriginalId = new Map(persons.map(p => [p.id, p]));

  const resolveId = (id: string): string => {
    let current = id;
    while (idRemap.has(current)) {
      current = idRemap.get(current)!;
    }
    return current;
  };

  const getResolvedPerson = (id: string): Person | undefined => {
    const resolved = resolveId(id);
    return mergedByPrimary.get(resolved) || personByOriginalId.get(resolved);
  };

  const mergeClusterByIds = (ids: string[]) => {
    const uniqueResolvedIds = Array.from(new Set(ids.map(resolveId)));
    if (uniqueResolvedIds.length < 2) return;

    const clusterPersons = uniqueResolvedIds
      .map(id => getResolvedPerson(id))
      .filter(Boolean) as Person[];
    if (clusterPersons.length < 2) return;

    const primary = pickPrimaryPerson(clusterPersons);
    let merged = primary;
    for (const candidate of clusterPersons) {
      if (candidate.id === primary.id) continue;
      idRemap.set(candidate.id, primary.id);
      merged = mergePersons(merged, candidate);
    }
    mergedByPrimary.set(primary.id, merged);
  };

  const runMergePass = (keyBuilder: (person: Person) => string | null) => {
    const clusters = new Map<string, string[]>();

    for (const person of persons) {
      const resolvedId = resolveId(person.id);
      const resolvedPerson = getResolvedPerson(resolvedId);
      if (!resolvedPerson) continue;
      const key = keyBuilder(resolvedPerson);
      if (!key) continue;

      if (!clusters.has(key)) clusters.set(key, []);
      const arr = clusters.get(key)!;
      if (!arr.includes(resolvedId)) arr.push(resolvedId);
    }

    for (const ids of clusters.values()) {
      if (ids.length > 1) mergeClusterByIds(ids);
    }
  };

  // Pass 1: exact full name + sex + full birth date.
  runMergePass(person => {
    if (!person.fullName || !person.sex || !person.birthDate) return null;
    if (!isMeaningfulPersonName(person.fullName)) return null;
    return [
      normalizeForDedup(person.fullName),
      person.sex,
      person.birthDate,
    ].join('|');
  });

  // Pass 2 (aggressive): exact full name + sex, even without full date.
  runMergePass(person => {
    if (!person.fullName || !person.sex) return null;
    if (!isMeaningfulPersonName(person.fullName)) return null;
    return [
      normalizeForDedup(person.fullName),
      person.sex,
    ].join('|');
  });

  // Pass 3: given name + surname + sex + birth year (captures punctuation/format variants).
  runMergePass(person => {
    if (!person.sex) return null;
    const given = normalizeForDedup(person.givenName || '');
    const surname = normalizeForDedup(person.surnameFinal || person.surname || '');
    const year = person.birthDate?.match(/\d{4}/)?.[0] || '';
    if (!given || !surname || !year) return null;
    if (!isMeaningfulPersonName(given) || !isMeaningfulPersonName(surname)) return null;
    return [given, surname, person.sex, year].join('|');
  });

  // Apply explicit manual merges for known branches with fuzzy/partial identity records.
  for (const [duplicateId, requestedPrimaryId] of Object.entries(MANUAL_MERGE_TO_PRIMARY)) {
    const duplicateResolved = resolveId(duplicateId);
    const primaryResolved = resolveId(requestedPrimaryId);
    if (duplicateResolved === primaryResolved) continue;
    if (!personByOriginalId.has(duplicateResolved) || !personByOriginalId.has(primaryResolved)) continue;

    idRemap.set(duplicateResolved, primaryResolved);
    const currentPrimary = mergedByPrimary.get(primaryResolved) || personByOriginalId.get(primaryResolved)!;
    const incomingDuplicate = mergedByPrimary.get(duplicateResolved) || personByOriginalId.get(duplicateResolved)!;
    mergedByPrimary.set(primaryResolved, mergePersons(currentPrimary, incomingDuplicate));
  }

  const personById = new Map<string, Person>();
  for (const person of persons) {
    const resolved = resolveId(person.id);
    if (resolved !== person.id) continue;
    personById.set(resolved, mergedByPrimary.get(resolved) || person);
  }

  const dedupedFamilies = families.map(family => {
    const spouses = Array.from(new Set(family.spouses.map(resolveId)));
    const children = Array.from(new Set(family.children.map(resolveId)));
    return { ...family, spouses, children };
  });

  return {
    persons: Array.from(personById.values()),
    families: dedupedFamilies,
    mergedCount: idRemap.size,
  };
}

function buildGraph() {
  console.log('Building family graph...');
  const supplementalSignals = loadSupplementalSignals();
  const surnameOrigins = loadSurnameOriginsMap();
  if (supplementalSignals.loadedFiles.length > 0) {
    console.log(
      `Loaded supplemental RTF sources: ${supplementalSignals.loadedFiles.join(', ')}`
    );
  }

  // Read canonical CSV — fall back to sample data when the private file is absent (e.g. Vercel / CI)
  const canonicalPath = join(ROOT, 'data/canonical.csv');
  const canonicalFallbackPath = join(ROOT, 'data/sample/canonical.sample.csv');
  let canonicalRaw: string;
  if (existsSync(canonicalPath)) {
    canonicalRaw = readFileSync(canonicalPath, 'utf-8');
  } else if (existsSync(canonicalFallbackPath)) {
    console.log('data/canonical.csv not found — using sample data from data/sample/canonical.sample.csv');
    canonicalRaw = readFileSync(canonicalFallbackPath, 'utf-8');
  } else {
    console.log('Neither data/canonical.csv nor data/sample/canonical.sample.csv found — writing empty graph');
    mkdirSync(join(ROOT, 'public'), { recursive: true });
    writeFileSync(join(ROOT, 'public/family-graph.json'), JSON.stringify({ persons: [], families: [], rootPersonId: '' }));
    return;
  }
  const canonicalRows: RawCanonical[] = parse(canonicalRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  // Read curated CSV (optional — enriches hops, generation, Hebrew names, relationships)
  const curatedByName = new Map<string, RawCurated>();
  const curatedPath = join(ROOT, 'data/curated.csv');
  if (existsSync(curatedPath)) {
    const curatedRaw = readFileSync(curatedPath, 'utf-8');
    const curatedAllRows = parse(curatedRaw, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as string[][];

    // The first row is a title, second row is headers, rest is data
    const curatedHeaders = curatedAllRows[1];
    const curatedData: RawCurated[] = curatedAllRows.slice(2).map(row => {
      const obj: Record<string, string> = {};
      curatedHeaders.forEach((h: string, i: number) => {
        obj[h] = row[i] || '';
      });
      return obj as unknown as RawCurated;
    });

    for (const row of curatedData) {
      const name = row['Full Name'].toLowerCase().trim();
      if (name) curatedByName.set(name, row);
    }
    console.log(`Loaded curated.csv: ${curatedByName.size} enriched records`);
  } else {
    console.log('curated.csv not found — skipping enrichment (hops, generation, Hebrew names will be null)');
  }

  // Build persons
  const persons: Person[] = [];
  const familyMap = new Map<string, Family>();

  for (const row of canonicalRows) {
    const dates = splitPipeField(row.birth_date);
    const places = splitPipeField(row.birth_place);
    const notes = extractFromNotes(row.note_plain || '');

    const sex = row.sex === 'M' ? 'M' : row.sex === 'F' ? 'F' : 'U';
    const famsArr = row.fams ? row.fams.split('|').map(s => s.trim()).filter(Boolean) : [];
    const famcVal = row.famc ? row.famc.split('|')[0].trim() || null : null;

    // Try to match with curated data
    const nameLower = row.full_name.toLowerCase().trim();
    const curated = curatedByName.get(nameLower);

    const fullNameNormalized = removeKohenMarkers(row.full_name);
    const givenNameNormalized = removeKohenMarkers(row.given_final);
    const surnameNormalized = removeKohenMarkers(row.surname);
    const surnameFinalNormalized = removeKohenMarkers(row.surname_final);

    const hasKohenMarker =
      fullNameNormalized.hasKohenMarker ||
      givenNameNormalized.hasKohenMarker ||
      surnameNormalized.hasKohenMarker ||
      surnameFinalNormalized.hasKohenMarker;
    const surnameOrigin =
      surnameOrigins.get(normalizeSurnameKey(surnameFinalNormalized.clean)) ||
      surnameOrigins.get(normalizeSurnameKey(surnameNormalized.clean)) ||
      null;

    const autoHolocaustVictim =
      isHolocaustVictim(row) ||
      isLikelyHolocaustVictimByDateAndRegion(
        row,
        parseGedcomDate(dates.birth || ''),
        parseGedcomDate(dates.death || ''),
        places.birth
      ) ||
      supplementalSignals.holocaustNames.has(normalizeNameForLookup(fullNameNormalized.clean));
    const holocaustVictim = hasManualBooleanOverride(MANUAL_HOLOCAUST_VICTIM_OVERRIDES, row.ged_id)
      ? MANUAL_HOLOCAUST_VICTIM_OVERRIDES[row.ged_id]
      : autoHolocaustVictim;

    const autoWarCasualty = isWarCasualty(row);
    const warCasualty = hasManualBooleanOverride(MANUAL_WAR_CASUALTY_OVERRIDES, row.ged_id)
      ? MANUAL_WAR_CASUALTY_OVERRIDES[row.ged_id]
      : autoWarCasualty;
    const autoMigrationInfo = extractMigrationInfo(
      places.birth,
      places.death,
      row.note_plain || '',
      row.note || '',
      row.titl || ''
    );
    const migrationInfo = MANUAL_MIGRATION_INFO_OVERRIDES[row.ged_id] || autoMigrationInfo;

    const resolvedBirthPlace = MANUAL_BIRTHPLACE_OVERRIDES[row.ged_id] || normalizeBirthPlace(places.birth);
    const titleAppend = MANUAL_TITLE_APPEND_OVERRIDES[row.ged_id];
    const resolvedTitle = titleAppend
      ? [row.titl || '', titleAppend].filter(Boolean).join(' | ')
      : (row.titl || null);

    const manualTags = MANUAL_TAG_OVERRIDES[row.ged_id] || [];
    const manualDnaTagged = manualTags.includes('DNA');
    const verifiedDnaEvidence =
      !MANUAL_DNA_TAG_EXCLUDE.has(row.ged_id) &&
      (manualDnaTagged || hasVerifiedDnaMatchEvidence(row, notes.dnaInfo));
    const resolvedDnaInfo = verifiedDnaEvidence ? notes.dnaInfo : null;

    const person: Person = {
      id: row.ged_id,
      fullName: fullNameNormalized.clean,
      givenName: givenNameNormalized.clean,
      surname: surnameNormalized.clean,
      surnameFinal: surnameFinalNormalized.clean,
      sex,
      birthDate: parseGedcomDate(dates.birth || ''),
      deathDate: parseGedcomDate(dates.death || ''),
      note: row.note?.trim() || null,
      note_plain: row.note_plain?.trim() || null,
      photoUrl: null,
      birthPlace: resolvedBirthPlace,
      generation: notes.generation,
      relationToYael: curated ? curated['Relationship to Yael'] : notes.relationToYael,
      hops: curated ? parseInt(curated['Hops'], 10) || null : null,
      dnaInfo: resolvedDnaInfo,
      coordinates: notes.coordinates,
      familiesAsSpouse: famsArr,
      familyAsChild: famcVal,
      title: resolvedTitle,
      hebrewName: curated ? curated['Full Name'] : null,
      birthName: curated ? curated['Birth Name'] || null : null,
      fatherName: curated ? curated['Father Name'] || null : null,
      motherName: curated ? curated['Mother Name'] || null : null,
      spouseName: curated ? curated['Spouse Name'] || null : null,
      childrenNames: curated ? curated['Children Names'] || null : null,
      surnameOrigin,
      jewishLineage: hasKohenMarker ? 'כהן' : null,
      migrationInfo,
      holocaustVictim,
      warCasualty,
      connectionPathCount: null,
      doubleBloodTie: false,
      tags: extractTags(
        row,
        verifiedDnaEvidence,
        supplementalSignals.partisanNames.has(normalizeNameForLookup(fullNameNormalized.clean)),
        migrationInfo
      ),
      story: MANUAL_STORY_OVERRIDES[row.ged_id] || null,
    };

    // Holocaust tag: add after person is built so holocaustVictim flag is available.
    // extractTags() runs without holocaustVictim context; this ensures the tag is always
    // present when the boolean is true (whether from text detection or manual override).
    if (person.holocaustVictim && !person.tags.includes('Holocaust')) {
      person.tags = [...person.tags, 'Holocaust'].sort();
    }

    persons.push(person);

    // Build family entries from fams
    for (const famId of famsArr) {
      if (!familyMap.has(famId)) {
        familyMap.set(famId, { id: famId, spouses: [], children: [] });
      }
      const fam = familyMap.get(famId)!;
      if (!fam.spouses.includes(row.ged_id)) {
        fam.spouses.push(row.ged_id);
      }
    }

    // Build family entries from famc
    if (famcVal) {
      if (!familyMap.has(famcVal)) {
        familyMap.set(famcVal, { id: famcVal, spouses: [], children: [] });
      }
      const fam = familyMap.get(famcVal)!;
      if (!fam.children.includes(row.ged_id)) {
        fam.children.push(row.ged_id);
      }
    }
  }

  const families = Array.from(familyMap.values());
  const deduped = deduplicatePersons(persons, families);
  const surnameEnriched = enrichMissingSurnames(deduped.persons, deduped.families);

  const enrichedPersons = enrichConnectivitySignals(surnameEnriched, deduped.families, '@I1@')
    .map(person => {
      const overrides = MANUAL_PERSON_FIELD_OVERRIDES[person.id];
      return overrides ? { ...person, ...overrides } : person;
    });

  const graph = {
    persons: enrichedPersons,
    families: deduped.families,
    rootPersonId: '@I1@',
  };

  // Write output
  mkdirSync(join(ROOT, 'public'), { recursive: true });
  const outputPath = join(ROOT, 'public/family-graph.json');
  writeFileSync(outputPath, JSON.stringify(graph));

  console.log(
    `Built graph: ${deduped.persons.length} persons, ${deduped.families.length} families (merged ${deduped.mergedCount} duplicates)`
  );
  console.log(`Output: ${outputPath}`);
}

buildGraph();

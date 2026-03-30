/** Narrative archive tree data (same structure as previously kept in App.jsx). */
import type { ArchiveTreeNode } from './archiveTreeNode';
import { assif23andmeFathersBranch } from './assif23andmeArchiveNodes';
import { censusReportArchiveRoot } from './censusReportArchiveNodes';
import {
  ginzburgDobersteinUnderVladimir,
  TZILA_GINZBURG_MEMOIR_FULL_STORY,
  TZILA_GINZBURG_MEMOIR_TITLE,
} from './ginzburgDobersteinArchiveNodes';
import { juliusGenealogyDatasetReportRoot } from './juliusGenealogyDatasetReportNodes';
import { lithuaniaAlperDirectoryArchiveNode } from './lithuaniaAlperDirectoryArchiveNode';
import { genealogyIndexerVilnaKostrelRoot } from './genealogyIndexerVilnaKostrelArchiveNode';
import { joshuaKastrollLettersDetailedRoot } from './joshuaKastrollLettersDetailedArchiveNodes';
import { familyPdfWebSourcesRoot } from './familyPdfWebSourcesArchiveNodes';
import { franceCastSurnameResearchLeadsRoot } from './franceCastSurnameResearchLeadsArchiveNode';
import { heilprinMyHeritageFisherSuggestionsRoot } from './heilprinMyHeritageFisherSuggestionsArchiveNode';
import { zaidmanFridmanBialaPodlaskaRoot } from './zaidmanFridmanBialaPodlaskaArchiveNodes';
import {
  dubershteinRomaniaHaifa1925AndIgraNode,
  elisDubersteinChicago1894Node,
} from './dubershteinPrimarySourcesArchiveNodes';
import { herbertMyHeritageSiteRoot } from './herbertMyHeritageSiteArchiveNode';

const BRANCH_NOTE =
  "הדגשה: התפתחות Castro → Kastroll (ליטא) → Alperovitz / Gurevich; בארה\"ב ענף Costrell מאותו שורש. ממיגל קסטרו (שורש ספרדי-צרפתי) השם התגלגל ל-Kastroll בליטא; צורות היסטוריות (Kastrel, Kastrell, Castrell) בצומת האיות. " +
  "שושלת עתיקה ששורשיה בעיר היילבורן (Heilbronn) שבגרמניה. לאורך הדורות והנדודים למזרח אירופה, השם התגלגל לגרסאות שונות: הלפרין (Halperin), היילפרוביץ', אלפרוביץ', אלפרט (Alpert) והיילפרט. במאה ה-19 פוצל השם מקו Kastroll ל-Alperovitz ול-Gurevich כדי להתחמק מגיוס לצבא הצאר.";

const ETYMOLOGY_LINE =
  'Halperin ו־Alperovitz (ואלפרט/היילפרט) הן התפתחויות פונטיות מאותו שורש משפחתי מגרמניה.';

const DNA_COSTRELL_BRANCH_NOTE =
  "הקשר ההיסטורי לקסטרל ו-de Castro מאומת באמצעות התאמת DNA משמעותית (157 cM) ל-Robert M. Costrell.";

const MIGUEL_NOTE = 'אנוס מספרד שנמלט לצרפת. השאיר צוואה בספר רש"י עתיק.';

const MIGUEL_STORY =
  'נמלט מספרד לדרום צרפת אחרי המהפכה הצרפתית. השאיר צוואה בספר רש"י עתיק שבו ביקש מצאצאיו לתעד את נדודיהם כדי לשמור על רצף השושלת.';

const MARY_FINE_STORY =
  'בצעירותה נהגה לנסוע בימי ראשון ליסנאיה פוליאנה, לעמוד בפתח האחוזה ולהקשיב לשיחות של לב טולסטוי עם הסטודנטים.';

const RACHEL_LEAH_FINE_STORY =
  'פעילה פוליטית נגד שלטון הצאר. נורתה על ידי חיילים בגיל 14 בזמן שנשאה נאום פוליטי באסיפה חשאית.';

const HERZL_ALPEROVITZ_REVENGE_BOARDS_STORY =
  'הבריח תחמושת לפרטיזנים על ידי הסתרתה בתוך חריצים בלוחות עץ שהושלכו מעל חומת מחנה וילייקה.';

const MYER_FINE_STORY =
  "מאיר למד לימודי קודש אך התעניין במדע. כשדודתו הדתית הקיצונית תפסה אותו קורא ספרי מדע 'טרפים', היא הורתה למשפחות בעיירה להפסיק להאכיל אותו (מנהג 'ימי אכילה'). הוא נחלש מרעב, חלה בדלקת ריאות ונפטר בצעירותו.";

const FOLKOFF_ALPEROVITZ_2026_REPORT_LEAD =
  "דוח קשרי משפחה (ינואר 2026), לבראדלי פולקוף: מסביר את הקשר בין משפחת פולקוף (Folkoff / Falkov / פלקוב) למשפחת אלפרוביץ' מבלארוס. " +
  "הקשר דרך רבקה אפלבאום, שנישאה ליעקב פולקוף (סבא-רבא), ובתו של נתן כהן אלפרוביץ' מסוסנקה. " +
  "ממצא מרכזי: סבתא-רבתא רבתא רבקה אפלבאום (לימים רבקה פולקוף) - בת נתן כהן אלפרוביץ'. " +
  "רקע DNA: פנייה של יעל לאדם צ'רסון (נכד נחום אלפרוביץ'); mtDNA HV5a.1; הערות על פער גנטי של 1 והבדלים גיאוגרפיים (מינסק מול דיבנישוק) - קשר ישיר דורש נתונים נוספים. " +
  "Y-DNA: המלצה על בדיקה מתקדמת (BY700), אפשרות קשר ל-Q-FT340368 מול מגיד מווילנה - בדיקה מול פרויקט אלפרוביץ' ב-FTDNA. " +
  "Family Finder: התאמות עם פאלקוב, פיאלקוב, פיאלקוביץ', פאלקוביץ', פאלקובסקי. " +
  "מקורות: GEDCOM MyHeritage זיידמן (אפריל 2025), עץ Folkoff MyHeritage, FTDNA Family Finder, גיליון מאסטר, הגירה ומפקד.";

const ENTITY_RESOLUTION_STORY =
  "משפחת אלפרוביץ' מתוארת כשורת כהונה במקורות שונים; אנדוגמיה בשבט יכולה להסביר חלק מריכוז ה-DNA המשותף. שינוי שמות אסטרטגי (כדי שלא יירשמו כבנים לאותה משפחה אחת ויימנע גיוס ארוך לצבא הצאר) יוצר אתגר של Entity Resolution: אותה משפחה ביולוגית תחת מזהים שונים - Kastroll, Alperovitz, Gurevich (עברית: קסטרל, אלפרוביץ', גורביץ'). החיפוש החכם בארכיון מאחד כינויים.";

const NAME_SPLIT_STORY =
  "לפי מכתב יהושע קסטרל: לסבו היו אחים ששינו את שם המשפחה ל-Gurevich ול-Alperovitz מהסיבה שלא לשרת את הצאר שנים עשר שנה. (במקור לעיתים Gurevitsch.) זה אותו שורש ביולוגי, שמות שונים ברישום.";

const JEHOSHUA_GRANDSON_STORY =
  "יהושע קסטרל (Joshua Kastroll; בחתימות במכתבים לעיתים Kastrel), הנכד, כתב מתל אביב מכתבים ל-Michael Castroll (11.12.1983), ל-Robert Costrell (27.5.1987 ו-25.6.1988), לדן (6.5.1986), ולריקי ובוב קסטרל (25.6.1988). בהם מסלול השם Castro / Kastroll / Castrell / Costrell, דבורה וספר הרש\"י, נדידת יהודה, ביוגרפיה (ליבאו 1908, סראטוב, ריגה, עלייה 1936), קווי K מול C בארה\"ב, ובונד/קומוניסטים. מקור עיקרי לנרטיב; צומת \"כרונולוגיה מלאה\" בארכיון. AlpertsAndCohens31 בדרייב משלים.";

const ORTHOGRAPHY_KASTREL_STORY =
  "לפי מכתב יהושע קסטרל ל-Robert Costrell (יוני 1988): כשמשפחת Castro הראשונה התיישבה במחוז וילנה הרשויות המקומיות הוסיפו אות L לשם והחליפו C ב-K (כי C ברוסית נהגית ts), וכך נוצר Kastroll (לעיתים Kastrol באיות ישן). לאחד הדודים שחי בלונדון שנים רבות היה האיות Castrell עם C. סבו של הכותב, יהושע, שינה לעיתים לאיות עם e (Kastrell). הכותב אינו בטוח למה, אך משער שמטרת הייתה להתחמק משנים עשר שנה שירות בצבא צאר רוסיה. בארכיון: שם משפחה אחיד באנגלית לענף זה - Kastroll, למעט ציטוטים היסטוריים.";

const JOSHUA_KASTREL_LETTERS_COMPENDIUM_STORY =
  "תמצית ממכתבי Joshua Kastroll (במקור לעיתים Kastrel): (1) הוא אינו זוכר את כל שמות צאצאי מיגל שהשאירו הערות בדפי ספר עתיק, אך זוכר שבנו יהודה גר בפראג ואז עבר למחוז וילנה; בהקדשה ציין שהגיע לאחר מלחמות נפוליאון, כנראה סביב 1820. (2) לדעתו, אבי סבו היה Samuel Kastroll; לו עשרה אחים ואחיות (שמותיהם לא נזכרו). (3) אחים של הסב שינו שם ל-Gurevich ול-Alperovitz כדי לא לשרת את הצאר שנים עשר שנה (במקור לעיתים Gurevitsch). (4) ספר ההקדשה של מיגל נשמר אצל סבתו דבורה, אלמנת יהושע, נולדה בקורנץ - יהושע תיק במכתב מאוחר ל-Sosenka - כ-Alperovitz; ראה את הספר רק בנוכחותה, פעמיים. (5) פירוט איות היסטוריים - ראו צומת \"איות\". [הערות 5-7 במקורות משפחתיים: מכתבים ל-Michael Castroll 11.12.1983; ל-Robert Costrell 27.5.1987 ו-25.6.1988.]";

const MOSHE_AHARON_STORY =
  'משה-אהרן אלפרוביץ\', אחיו של יהושע קסטרל (הזקן), היה קומוניסט. נרצח בבלגיה ב-1925 על ידי מהגר רוסי מהמחנה ה"לבן" (אנטי-בולשביקי), לפי המסמך המשפחתי.';

const MARKEL_FAMILY_STRUCTURE_NOTE =
  'לפי הפירוט המעודכן: Markel Alperovitz הוא אב לשרה, חוה, לאה, משה, נדיה, רחל-לאה, ראובן, בסי ומרי - כולם אחים. המסמך אינו מפורט בכל הקשרים.';

const REUBEN_SIBLING_STORY =
  "ראובן אלפרוביץ' (Reuben): לפי המבנה המעודכן הוא אח של שרה, חוה, לאה, משה, נדיה, רחל-לאה, בסי ומרי (בנם/בתם של Markel). בנרטיב ישן יותר בארכיון הופיע ראובן כאב לענף סוסנקה - יש להצלב במקורות. תיאורי כהונה וסוסנקה עשויים להתאים למשפחה בכלל או לדור אחר.";

const DEBORAH_STORY =
  "דבורה אלפרוביץ': סבתו של יהושע הכותב, אלמנת יהושע קסטרל (הזקן). נולדה בקורנץ; במכתב מאוחר יותר תיק יהושע את מקום הלידה ל-Sosenka, כ-Alperovitz. היא שמרה על ספר עתיק עם הקדשת מיגל קסטרו; הרשתה לראות את הספר רק בנוכחותה, והכותב ראהו פעמיים. (שנת לידה 1845 ממקורות אחרים - להצלבה.) במבנה Markel-אב: קשר דורות לראובן דורש אימות.";

const ELIYAHU_STORY =
  "אליהו אלפרוביץ': אחיה של דבורה. בנו משה אלפרוביץ' מטאלין (Talin) נספה בשואה - לפי המסמך המשפחתי.";

const EDWARD_ANDERS_NASA_STORY =
  'ד"ר אדוארד אנדרס (נולד Alperovitch): מדען בעל שם עולמי בנאס"א; ניתח סלעי ירח ממשימות אפולו. ניצול שואה שתיעד למעלה מ-7,000 קורבנות בלטביה.\n\n' +
  `${ETYMOLOGY_LINE} שרד לאחר שאמו אריקה התחזתה לארית; היגר לארה"ב ב-1949 והפך לפרופסור לכימיה באוניברסיטת שיקגו (כולל מחקר מטאוריטים).`;

/** GEDCOM anchors and IR-* summaries (from docs/identity_resolution_notes.md + canonical.csv). */
const CHIVIA_BRANCH_GEDCOM_NOTE =
  "ב-GEDCOM (לאחר parse-ged): Chivia Kappelowitz @I786@ ב-fams @F350@; ילדים עם famc @F350@ כוללים את Sam/Myer/Laza/Rachel-Leah Fine (@I1136@-@I1140@), Shimon Fine (@I1228@), וכן Mary Alpert (@I1060@) ו-Bessie Alpert (@I1058@). יש להצליב עם הסיפור המשפחתי (מרי פיין וכו') כי השמות בשדות שונים.";

/** Castro–Kastrol–Alperovitz narrative path (chips on archive cards). */
const SEPHARDIC_ROUTE_TAGS = ['הנתיב הספרדי', 'The Sephardic Route'] as const;

const PESIA_ALPEROVITZ_KASTROL_STORY =
  "פסיה מייצגת את המעבר הלשוני והמשפחתי בין השם הספרדי המקורי קסטרו/קסטרול לבין השם אלפרוביץ' שאומץ במזרח אירופה.";

export const familyData: ArchiveTreeNode = {
  id: 'root',
  name: 'Family archive',
  children: [
    {
      id: 'livnat_direct_line',
      name: 'ענף ישיר: Castro–Alperovitz (אמא) · Heilprin–Lanzman (אבא) · דוברשטיין · פרידמן-ביאלה (חתן)',
      note: 'מבנה אבות (צאצאים למעלה, שורשים למטה): קו ספרדי-אשכנזי מצד אמא; קו היילפרין-לנצמן מצד אבא; ענף מחקר דוברשטיין; קו פרידמן-זיידמן מביאלה-פודלסקה (צד חתן, ללא קשר לקסטרו).',
      children: [
        {
          id: 'father',
          name: 'אריה (ליביו) ליבנת / Arie Livnat',
          note:
            'שושלת אבהית מאומתת (Y-DNA R-FGC8601) למשפחת היילפרין. השם לנצמן אומץ ברומניה.',
          isDNAVerified: true,
          children: [
            {
              id: 'mina_lantzman_schwartz',
              name: 'Mina Lanzman (Schwartz / Dascalu) / מינה לנצמן',
              note: 'אימו של אריה. בת הרב אריה לייב שוורץ (דסקלו) וחוה. מקור: Panciu (פנצ\'ו), רומניה.',
            },
            {
              id: 'shlioma_lantsman',
              name: 'Shlioma Lanzman / שלומיא לנצמן',
              birth: '1804',
              birthPlace: 'Boguslavishki',
              note:
                'אב קדמון בקו הלנצמן; קישור לדורות היילפרין דרך האבות בעץ (אברהם למטה). ' +
                'התאמה חזקה ל-FamilySearch Family Tree (למשל מזהה PHFH-865): לידה סביב 1804; ראש משק ב-boguslavishki / Bagaslaviskis, מחוז וילנה, 30.4.1834 ו-14.1.1851; בן לאברם לנצמן. ' +
                'לפי אותו פרופיל: בן זוג מירקה (Merka); ילדים המוצעים שם: דוד יודל לנצמן (~1820), רוכא חיה (Landesman; ב-FS לעיתים סימון מין שגוי - להצלב במקור). ' +
                'לא למזג אוטומטית פרופילים אחרים בשם דומה: למשל שלומיא לנצמן ~1837 באושומיר (הורים גרשון ומלכה) או לידה 1840 בקישינב (אב שמואל לנדסמן) - אנשים שונים.',
              children: [
                {
                  id: 'abram_lantsman',
                  name: 'Abram Lanzman / אברהם לנצמן',
                  birth: '1748',
                  birthPlace: 'Vilna',
                  note:
                    'נפטר ב-1832. וילנה. לפי FamilySearch (אותו ענף): אביו של שלומיא; אחים המוזכרים שם: לייבה לנצמן (1797-1834), מובשה לנצמן - להשלים מול רישומי LitvakSIG / רשימות רוויזיה.',
                  children: [
                    {
                      id: 'zevulun_eliezer_heilprin',
                      name: 'Zevulun Eliezer Heilprin / הרב זבולון אליעזר היילפרין',
                      birth: '1554',
                      birthPlace: 'פולין / ליטא',
                      note:
                        'שורש רבני (המאה ה-16). מאומת גנטית: Y-DNA Haplogroup R-FGC8601. קשר למשפחת לנצמן-ליבנת. הצעות עץ MyHeritage (A. Fisher) על דורות נוספים - ראו צומת נפרד תחת אריה; לא למזג אוטומטית.',
                      isDNAVerified: true,
                    },
                  ],
                },
              ],
            },
            heilprinMyHeritageFisherSuggestionsRoot,
          ],
        },
        {
          id: 'nahum_cilia_family',
          name: "נחום וצילה - סבא וסבתא מצד אמא",
          children: [
            {
              id: 'nahum_alperovitz',
              name: "נחום אלפרוביץ' / Nahum Alperovitz",
              note:
                "אם: פסיה אלפרוביץ' (לבית קסטרול). סבא מצד אמא; אביהם של פולה וזאב. פסיה - חוליה מקשרת לשורת קסטרול ולהתאמת DNA ל-Robert M. Costrell (157 cM). שורת כהונה (כהנים). לפי המסמכים: חבר המחתרת היהודית בקורניץ.",
              isDNAVerified: true,
              isHero: true,
              tags: [...SEPHARDIC_ROUTE_TAGS],
              children: [
                {
                  id: 'pesia_alperovitz_kastrol',
                  name: "פסיה אלפרוביץ' (לבית קסטרול) / Pesia Alperovitz (née Kastrol) · Pesia Kastrol",
                  note:
                    'אמו של נחום. החוליה המקשרת המאשרת את השם קסטרול (Kastrol) כגרסה מוקדמת. בזכותה הוכח הקשר הגנטי לענף קוסטרל בארה"ב.',
                  story: PESIA_ALPEROVITZ_KASTROL_STORY,
                  isDNAVerified: true,
                  tags: [...SEPHARDIC_ROUTE_TAGS],
                  children: [
                    {
                      id: 'samuel_kastroll',
                      name: 'Samuel Kastroll / שמואל קסטרול',
                      note:
                        "בנו של יהודה. לפי המסמך: אב ל-11 ילדים (שמואל ועשרה אחים ואחיות). חלקם שינו ל-Alperovitz או ל-Gurevich (גורביץ'; במקורות: Gurvitch, Gurevitsch) כדי שלא יירשמו כבני משפחה אחת ויימנע גיוס ארוך לצבא הצאר.",
                      isDNAVerified: true,
                      tags: [...SEPHARDIC_ROUTE_TAGS],
                      children: [
                        {
                          id: 'yehuda_kastrol_vilna',
                          name: 'Yehuda Kastroll / יהודה קסטרול',
                          birth: '1820',
                          birthPlace: 'Vilna',
                          note:
                            'בנו של מיגל. לפי מכתבי Joshua Kastroll: פראג, אחר כך מחוז וילנה אחרי מלחמות נפוליאון (~1820). שינוי איות Castro→Kastroll - ראו צומת "איות" בארכיון הנרטיבי.',
                          isDNAVerified: true,
                          tags: [...SEPHARDIC_ROUTE_TAGS],
                          children: [
                            {
                              id: 'miguel_castro_spain',
                              name: 'Miguel Castro / מיגל קסטרו',
                              birth: '1660',
                              birthPlace: 'Spain',
                              note: MIGUEL_NOTE,
                              storyTitle: 'השורש הספרדי',
                              fullStory: MIGUEL_STORY,
                              isDNAVerified: true,
                              tags: [...SEPHARDIC_ROUTE_TAGS],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'vladimir_sofia',
              name: 'ולדימיר דוברשטיין וסופיה גינזבורג',
              note:
                'Vladimir Dubershtein & Sofia Ginzburg. ילדים: ראובן (1920), מיכאל (נפטר בפולין כתינוק), אמה (בשאטה) מאירסון, צילה (1926 חיפה - בענף למעלה), וולה (1928 תל אביב). ולדימיר - קופאי בנק בפלשניץ; מורה לעברית; קשר לדלגינובה במלחמה. ענף גינזבורג-ליאנדרס ומחקר DNA למטה. רשימת עולים אניה רומניה לחיפה 20.4.1925: "זאב" דוברשטין גיל 30 עם רעיה וילדים ראובן ובתיה אסתר - ראו צומת מקורות; סביר שזאב = ולדימיר בשם עברי במסמך העלייה.',
              children: [
                {
                  id: 'reuven_dubershtein',
                  name: 'ראובן דוברשטיין',
                  note:
                    'אחיה של צילה. נהרג ב-1942 בשירותו בצבא האדום. מופיע ברשימת עולים אניה רומניה לחיפה 20.4.1925, גיל 5, משפחת דוברשטין (יחד עם זאב וחוליה ובתיה אסתר).',
                  children: [
                    {
                      id: 'alex_dubershtein_research',
                      name: 'Alex Dubershtein (Dubrow) / אלכס דוברשטיין',
                      note:
                        '🔍 Research Target (Alex Dubrow): היגר לארה"ב 1944. התאמה פוטנציאלית ל-Ace Dubrow (1.54%).',
                      isResearchTarget: true,
                    },
                  ],
                },
                dubershteinRomaniaHaifa1925AndIgraNode,
                elisDubersteinChicago1894Node,
                {
                  id: 'michael_doberstein_infant',
                  name: 'מיכאל דוברשטיין (~1922)',
                  note: 'נפטר בפולין לפני גיל שנתיים (לפי מסורת משפחתית).',
                  isVictim: true,
                },
                {
                  id: 'ema_besheta_meirson',
                  name: 'אמה (בשאטה) דוברשטיין - מאירסון',
                  birth: '1924',
                  birthPlace: 'בלארוס',
                  note:
                    'אחות צילה; נישאה לאנשל מאירסון. קו מארק מאירסון ותמונות משפחתיות - ראו צומת במחקר גינזבורג. מוצע: ברשימת עולים 20.4.1925 מופיעה "בתיה אסתר" גיל 1 באותה משפחת דוברשטין כמו ראובן וזאב - להצלב כשם מלא/כינוי לאמה.',
                },
                {
                  id: 'volia_doberstein_axelrod',
                  name: 'וולה (ולנטינה) דוברשטיין / אקסלרוד',
                  birth: '1928',
                  birthPlace: 'תל אביב',
                  note: 'אחות צילה; נישאה ליצחק אקסלרוד (רימה, זינה וצאצאים).',
                },
                ...ginzburgDobersteinUnderVladimir,
              ],
            },
            {
              id: 'tzila_dubershtein',
              name: 'צילה שרה דוברשטיין-גינזבורג (גינזבורג-ליאנדרס)',
              note:
                'קו אמהי מאומת דרך באשאטה ליאנדרס. חיבור גנטי לדניאל גינזבורג (158 cM). mtDNA Haplogroup HV5a; השושלת האימהית הישירה מהפזורה הצפונית (בלארוס/ליטא). עדות הישרדות מפלשניץ ודלגינובה - פתחו את הסיפור המלא. מקור PDF נוסף: צומת "סבתא צילה - סיפור משפחתי" תחת מקורות PDF.',
              storyTitle: TZILA_GINZBURG_MEMOIR_TITLE,
              fullStory: TZILA_GINZBURG_MEMOIR_FULL_STORY,
              isDNAVerified: true,
              isSurvivor: true,
              highlightStoryCard: true,
              tags: ['Pleshchenitsy', 'Dalginovo', 'Holocaust survivor', 'Duberstein'],
            },
            {
              id: 'siblings_pola_zeev',
              name: 'ילדיהם: פולה וזאב',
              children: [
                {
                  id: 'pola',
                  name: "פולה (פולינה) ליבנת לבית אלפרוביץ'",
                  note: 'אמא של יעל; אחות לזאב.',
                },
                {
                  id: 'zeev_alperovitz',
                  name: "זאב אלפרוביץ'",
                  note: "אחיה של פולה. מאומת כדוד דרך התאמת DNA קרובה ביותר (1,728 cM) ליעל ולבנו אסיף.",
                  isDNAVerified: true,
                },
              ],
            },
          ],
        },
        zaidmanFridmanBialaPodlaskaRoot,
      ],
    },
    {
      id: 'alperovitz_branch',
      name: "משפחת אלפרוביץ' / קסטרל",
      note: `${BRANCH_NOTE} ${DNA_COSTRELL_BRANCH_NOTE}`,
      isDNAVerified: true,
      children: [
        {
          id: 'archive_crossref_main_line',
          name: 'הערה: המסלול המרכזי Castro–Alperovitz',
          note: 'ענף נחום אלפרוביץ\' בעץ הישיר למעלה: מיגל קסטרו, יהודה קסטרול, שמואל קסטרול, פסיה (לבית קסטרול) כאם נחום, והקישור ל-Robert Costrell (157 cM). תג "הנתיב הספרדי" מסמן את השרשרת. כאן: סיפורים משלימים וענפים נוספים.',
        },
        familyPdfWebSourcesRoot,
        herbertMyHeritageSiteRoot,
        {
          id: 'kurenets_sosenka_levitan_krivitsky',
          name: 'קורניץ / סוסנקה – רשת לויטן וקריביצקי',
          note:
            'קשרי נישואין מתועדים עם משפחות לויטן (Levitan) וקריביצקי (Krivitsky). ענפים היגרו לשיבויגן, ויסקונסין (Sheboygan, Wisconsin). לחיפוש: השתמשו גם באיותים לועזיים במילון החיפוש החכם.',
          tags: ['Levitan–Krivitsky', 'Sheboygan'],
        },
        lithuaniaAlperDirectoryArchiveNode,
        genealogyIndexerVilnaKostrelRoot,
        {
          id: 'doc_entity_resolution_dna',
          name: 'אנדוגמיה, כהונה ו-Entity Resolution (מהמסמך)',
          note: 'למה רואים שמות שונים לאותו שורש ביולוגי, ואיך החיפוש החכם מאחד אותם.',
          story: ENTITY_RESOLUTION_STORY,
        },
        {
          id: 'doc_section_1_castro_kastrel',
          name: '1. שושלת קסטרו-קסטרל (השורש הספרדי והנדידה)',
          note:
            'לפי מכתבי Joshua Kastroll (1983, 1987, 1988; במקור לעיתים Kastrel) ומסמכים משלימים: ספר עתיק והקדשות, פראג ומחוז וילנה אחרי נפוליאון, שינויי איות מול הצאר. AlpertsAndCohens31 בדרייב משלים.',
          children: [
            {
              id: 'doc_joshua_kastrel_letters_compendium',
              name: 'מכתבי Joshua Kastroll: תמצית (1983-1988)',
              note:
                'ציטוטים וסיכום ממכתבים ל-Michael Castroll (11.12.1983) ול-Robert Costrell (27.5.1987, 25.6.1988). יש גם מכתבים לדן ולריקי/בוב - ראו צומת הבא.',
              story: JOSHUA_KASTREL_LETTERS_COMPENDIUM_STORY,
            },
            joshuaKastrollLettersDetailedRoot,
            {
              id: 'I_CASTRO_1',
              name: 'Miguel Castro / מיגל קסטרו',
              birth: '~1660',
              birthPlace: 'קסטיליה / טולדו, ספרד',
              note:
                'אב קדמון; יהודי אנוס (Converso). ' + MIGUEL_NOTE,
              storyTitle: 'השורש הספרדי',
              fullStory: MIGUEL_STORY,
            },
            {
              id: 'doc_yehuda_kastrol_narrative',
              name: 'Yehuda Kastroll / יהודה קסטרול',
              birth: '~1820 (הגעה לאזור וילנה)',
              note:
                'בנו של מיגל. במכתב: גר בפראג, אחר כך עבר למחוז וילנה; בהקדשה בדפי הספר ציין שהגיע למחוז אחרי מלחמות נפוליאון, כנראה סביב 1820. פרטים נוספים על שאר ההקדשות לא נזכרו בזיכרון הכותב.',
            },
            {
              id: 'doc_samuel_kastroll_narrative',
              name: 'Samuel Kastroll / שמואל קסטרול',
              note:
                'לפי מכתב הכותב (אינו בטוח לחלוטין): אבי סבו היה Samuel Kastroll, ולו עשרה אחים ואחיות - שמותיהם לא נזכרו. כאן מוצג כבנו של יהודה בהתאם למבנה הדורות בארכיון.',
            },
            {
              id: 'doc_name_split_gurevitsch',
              name: "הפיצול: Gurevich ו-Alperovitz (גורביץ' ואלפרוביץ'; 12 שנה לצאר)",
              note:
                "לפי המכתב: אחים של הסב שינו ל-Gurevich ול-Alperovitz כדי לא לשרת את הצאר שנים עשר שנה (במקור לעיתים Gurevitsch).",
              story: NAME_SPLIT_STORY,
            },
            {
              id: 'doc_orthography_kastroll_castrell',
              name: 'איות Kastrol / Kastroll / Castrell / Kastrell (רשויות ולונדון)',
              note: 'לפי מכתב יוני 1988 ל-Robert Costrell (הערה 7 במקור).',
              story: ORTHOGRAPHY_KASTREL_STORY,
            },
            franceCastSurnameResearchLeadsRoot,
            {
              id: 'doc_yehoshua_kastrel_elder',
              name: 'יהושע קסטרל (הזקן) / Yehoshua Kastroll',
              note:
                'סבו של הכותב; לעיתים איות Kastrell עם e (אולי כדי להתחמק משנים עשר שנה שירות בצבא הצאר). בארכיון: Yehoshua Kastroll. נשוי לדבורה אלפרוביץ\'. דוד בלונדון: Castrell עם C.',
            },
            {
              id: 'doc_yehuda_leib_kastrel',
              name: 'Yehuda Leib Kastroll / יהודה-לייב קסטרל',
              note: 'בנו של יהושע קסטרל (הזקן).',
            },
            {
              id: 'jehoshua_costrell',
              name: 'Joshua Kastroll / יהושע קסטרל (הנכד, כותב המכתב)',
              birth: '1908',
              birthPlace: 'Libau (Liepāja), Latvia',
              note:
                'הנכד, כותב המכתב מתל אביב (1983-1988). לפי מכתב 6.5.1986: נולד בליבאו 1908, מלחמה ראשונה בסראטוב, חזרה לליבאו 1919, ריגה 1933, עלייה 1936. אביו נולד בקורניץ 1876; משפחה נספתה בשואה. פתחו "כרונולוגיה מלאה" לפרטי המכתבים.',
              story: JEHOSHUA_GRANDSON_STORY,
            },
            {
              id: 'doc_moshe_aharon_alperovitz',
              name: "משה-אהרן אלפרוביץ'",
              note: 'אחיו של יהושע קסטרל (הזקן). קומוניסט.',
              story: MOSHE_AHARON_STORY,
            },
          ],
        },
        {
          id: 'doc_section_2_markel_alperovitz_family',
          name: "2. משפחת Markel Alperovitz (פירוט קשרים מעודכן)",
          note:
            `${MARKEL_FAMILY_STRUCTURE_NOTE} סותר נרטיב קודם בארכיון בו ראובן תואר כאב לענף. דבורה ואליהו - ענף קשור לקסטרל; יש להצלב דורות. המסמך אינו מפורט בכל הקשרים.`,
          children: [
            {
              id: 'doc_alperovich_equals_alperovitz',
              name: 'Alperovich = Alperovitz',
              note:
                'במסמך ובמקורות: Alperovich ו-Alperovitz הם איותים לאותה משפחה. החיפוש החכם בארכיון כולל את שני הצורות.',
            },
            {
              id: 'markel_alperovitz_patriarch',
              name: 'Markel Alperovitz / מרקל אלפרוביץ\' (אב)',
              note:
                'לפי הפירוט המעודכן: אביהם של Sarah, Chava, Leah, Moshe, Nadya, Rachel-Leah, Reuben, Bessie ו-Mary Alperovitz - כולם אחים.',
              children: [
                {
                  id: 'sarah_alperovitz_doc',
                  name: 'Sarah Alperovitz / שרה אלפרוביץ\'',
                  note: 'בת Markel; אחות לשאר הילדים ברשימה.',
                },
                {
                  id: 'chava_alperovitz_doc',
                  name: 'Chava Alperovitz / חוה אלפרוביץ\'',
                  note:
                    'בת Markel. בנרטיב קודם הוצגה עם Simon Fine כהורה למרי - סותר את המבנה המעודכן; ראו סעיף פיין למטה.',
                },
                {
                  id: 'leah_alperovitz_doc',
                  name: 'Leah Alperovitz / לאה אלפרוביץ\'',
                  birth: '1867 (לפי רישום קודם)',
                  note: 'בת Markel לפי המבנה המעודכן.',
                },
                {
                  id: 'moshe_alperovitz_markel_son',
                  name: 'Moshe Alperovitz / משה אלפרוביץ\'',
                  note:
                    'בן Markel לפי הפירוט המעודכן. להבדיל ממשה-אהרן (ענף קסטרל) וממיישה (נרטיב אנדוגמיה ישן) - יש להפריד לפי הקשר.',
                },
                {
                  id: 'nadya_alperovitz_doc',
                  name: 'Nadya Alperovitz / נדיה אלפרוביץ\'',
                  note: 'בת Markel לפי הפירוט המעודכן.',
                },
                {
                  id: 'rachel_leah_fine',
                  name: 'Rachel-Leah Alperovitz / רחל-לאה אלפרוביץ\'',
                  note:
                    'בת Markel. במסמך: האחות הצעירה של בסי; מהפכנית. 🎗️ נורתה על ידי חיילי הצאר (ראו סיפור מלא).',
                  storyTitle: 'המהפכנית הצעירה',
                  fullStory: RACHEL_LEAH_FINE_STORY,
                  isVictim: true,
                },
                {
                  id: 'doc_reuben_alperovitz',
                  name: 'Reuben Alperovitz / ראובן אלפרוביץ\'',
                  birthPlace: 'Sosenka (הקשר המקומי במקורות)',
                  note:
                    'בן Markel; אח לשרה, חוה, לאה, משה, נדיה, רחל-לאה, בסי ומרי. Alperovich = Alperovitz.',
                  story: REUBEN_SIBLING_STORY,
                },
                {
                  id: 'bessie_alperovitz_doc',
                  name: 'Bessie Alperovitz / בסי אלפרוביץ\'',
                  note:
                    'בת Markel. במסמך: תפקיד מרכזי בהגירת המשפחה לאמריקה, תמכה באחים; קרובה לאחותה מרי שעקבה אחריה. לא נישאה ל-Reuben Costrell (ראו ענף Costrell). ב-GEDCOM: לעיתים Bessie Alpert @I1058@.',
                },
                {
                  id: 'bertha_alperovitz_markel',
                  name: 'Bertha Fine (née Alperovitz) / ברטה פיין לבית אלפרוביץ\'',
                  note:
                    'בת Markel. נשואה ל-Simon Fine - חיבור בין משפחות Alperovitz ו-Fine. במסמך: אישיות חזקה, זיכרון מפורט לאירועים.',
                },
                {
                  id: 'mary_fine',
                  name: 'Mary Alperovitz / מרי אלפרוביץ\'',
                  note:
                    'בת Markel; אחות לבסי. הנרטיב על טולסטוי ו-1905 נשמר; הגירה לאמריקה בעקבות בסי אחרי חיסכון - במסמך.',
                  storyTitle: 'הביקור אצל טולסטוי',
                  fullStory: MARY_FINE_STORY,
                },
                {
                  id: 'herzl_alperovitz_markel_son',
                  name: 'Herzl Alperovitz / הרצל אלפרוביץ\'',
                  note:
                    'בן Markel לפי הרחבת הנרטיב; סיפור "לוחות הנקמה" והברחת תחמושת - בכרטיס הסיפור.',
                  storyTitle: 'לוחות הנקמה',
                  fullStory: HERZL_ALPEROVITZ_REVENGE_BOARDS_STORY,
                },
              ],
            },
            {
              id: 'doc_distant_relatives_alperovitz',
              name: 'קרובי משפחה (דור לא מפורט)',
              note: 'לפי המסמך: קרובים למשפחת Alperovitz; ייתכן סבא או קרוב אחר - לא כילדי Markel.',
              children: [
                {
                  id: 'sosonka_alperovitz_relative',
                  name: 'Sosonka Alperovitz',
                  note:
                    'קרוב משפחה; אולי סבא או קרוב אחר. לא כבן/בת ישירים של Markel ברשימת האחים.',
                },
                {
                  id: 'elizya_alperovitz_relative',
                  name: 'Elizya Alperovitz',
                  note:
                    'קרוב משפחה נוסף; אולי סבא או קרוב אחר. להבדיל מאליהו אלפרוביץ\' (ענף דבורה) - אם אותה דמות יש למזג לאחר אימות.',
                },
                {
                  id: 'yankev_alperovitz_relative',
                  name: 'Yankev Alperovitz / יענקל אלפרוביץ\'',
                  note: 'קרוב משפחה; אולי סבא או קרוב אחר - לא ברשימת אחי Markel.',
                },
              ],
            },
            {
              id: 'legacy_merke_maishe_narrative',
              name: "נרטיב ישן: מרקה (Merke) ומיישה (מחקר המשך)",
              note:
                "בארכיון קודם: מרקה בת ראובן, נישואי דוד. סותר את המבנה Markel-אב. נשמר לחקירה ולהתאמה ל-GEDCOM.",
              isResearchTarget: true,
              children: [
                {
                  id: 'merke_alperovitz',
                  name: "Merke Alperovitz (ארכיון ישן)",
                  note: 'לא ממוזג עם Markel האב ללא החלטת מחקר.',
                },
                {
                  id: 'maishe_alperovitz_uncle',
                  name: "Maishe Alperovitz (ארכיון ישן)",
                  note: 'דוד/בעל בנרטיב הישן.',
                },
              ],
            },
            {
              id: 'doc_sosha_esther_narrative',
              name: 'סושה אסתר (נרטיב קודם + GEDCOM)',
              note:
                'בנרטיב הישן: אשת ראובן כשראובן היה אב. במבנה המעודכן ראובן אח; קשר לסושה אסתר דורש עדכון ממקור. IR-002 ב-GEDCOM: @I362@.',
            },
            {
              id: 'doc_deborah_alperovitz',
              name: 'Deborah Alperovitz / דבורה אלפרוביץ\'',
              birth: '1845',
              note:
                'אלמנת יהושע; שמרה על ספר מיגל; קורנץ / Sosenka במכתבים. ראו סיפור מלא.',
              story: DEBORAH_STORY,
            },
            {
              id: 'doc_eliyahu_alperovitz',
              name: 'Eliyahu Alperovitz / אליהו אלפרוביץ\'',
              note:
                'אחיה של דבורה. להבדיל מ-Elizya Alperovitz ברשימת "קרובים" - אם אותה דמות איחוד ידני.',
              story: ELIYAHU_STORY,
              isVictim: true,
            },
          ],
        },
        {
          id: 'doc_section_3_fine_revolutionary',
          name: '3. Alperovitz · Fine · Costrell (נישואין, הגירה, בירורים)',
          note:
            'לפי המסמך: ברטה אלפרוביץ\' נשואה ל-Simon Fine; בסי ומרי והגירה לאמריקה; רחל-לאה אחות צעירה של בסי; Reuben Costrell לא נישא לבסי (נשוי ל-Maizie). מאיר פיין - נרטיב נפרד. סידור נישואין ושידוכים בקהילה היהודית ברוסיה כרקע.',
          children: [
            {
              id: 'simon_bertha_fine_couple',
              name: 'נישואי Simon Fine ו-Bertha (לבית Alperovitz)',
              note:
                'חיבור משפחות Alperovitz ו-Fine. Simon Fine: מתואר כאדם טוב ועדין, עבד קשה לפרנס את משפחתו. Bertha Fine (née Alperovitz): אישיות חזקה, יכולת לשחזר אירועים בפירוט. פרטי לידה ואחים: צומת ברטה תחת Markel בענף 2.',
            },
            {
              id: 'doc_costrell_reuben_bessie_clarification',
              name: 'Costrell: Reuben, Maizie, ובסי (בירור)',
              note:
                'הפרדה חשובה: Reuben Costrell הוזכר כמועמד לנישואין לבסי אלפרוביץ - במסמך אושר שלא נישאו. Reuben Costrell נשוי לאישה אחרת בשם Maizie. זה אינו Reuben Alperovitz האח של בסי (ענף מרקל).',
              children: [
                {
                  id: 'reuben_costrell_maizie',
                  name: 'Reuben Costrell & Maizie',
                  note: 'נישואין מאושרים במסמך; לא קשור לבסי אלפרוביץ כבן זוג.',
                },
                {
                  id: 'bessie_not_married_reuben_costrell',
                  name: 'בסי אלפרוביץ ו-Reuben Costrell',
                  note: 'לא היו נשואים; שידוך/שמועה שסולקה במסמך.',
                },
              ],
            },
            {
              id: 'doc_themes_migration_marriage',
              name: 'נושאים במסמך (רקע)',
              note:
                'נישואין מסורתיים ושידוכים בקהילה היהודית ברוסיה; הגירה לאמריקה וקשיים (תרבות, כלכלה); הקשר הפוליטי והמהפכות; שימור זהות מול שילוב בתרבות חדשה; סיפורים אישיים של חוסן (בסי, מרי, רחל-לאה).',
            },
            {
              id: 'narrative_conflict_chiva_simon',
              name: 'סתירת נרטיב: חוה + סיימון',
              note:
                'בנרטיב קודם: חוה אלפרוביץ\' ושמעון פיין כהורים למרי, מאיר ורחל-לאה. במבנה Markel-אב מרי ורחל-לאה בנות Markel; Simon נשוי לברטה. יש לאחד לאחר בדיקת מקור ראשוני.',
              isResearchTarget: true,
            },
            {
              id: 'chivia_alperovitz_fine_branch',
              name: 'מאיר פיין (נרטיב) + GEDCOM',
              note: `מאיר: סיפור "ימי אכילה" נשמר. הורים לא פורטו במלואם במבנה המעודכן. ${CHIVIA_BRANCH_GEDCOM_NOTE}`,
              children: [
                {
                  id: 'myer_fine',
                  name: 'Myer Fine / מאיר פיין',
                  note:
                    'נספה בשל קונפליקט דתי/לימודי. קשר למשפחת Markel/Simon-Bertha - להשלמה מהמסמך.',
                  story: MYER_FINE_STORY,
                  isVictim: true,
                },
              ],
            },
          ],
        },
        {
          id: 'repo_extractions_identity_gedcom',
          name: 'חילוץ מ-docs/identity_resolution_notes.md ומ-GEDCOM',
          note:
            'סיכומי זיהוי (IR) מהמסמך בריפו, ומזהי אנשים מקובץ canonical.csv (אותו מקור כמו build-graph). לא להחליף מחקר שורה-שורה ב-Gramps.',
          children: [
            {
              id: 'ir_001_two_fradas',
              name: 'IR-001: שתי פרידות אלפרוביץ (נפתר)',
              note:
                "שתי נשים שונות בשם Frada Alperovich: (1) פרידה קסטרל, אשת מאיר אלפרוביץ' @I199@ / @I3761@, בת למשפחת הורים @F69@; (2) פרידה (פריידל) ~1870 @I120@, אשת יהודה \"יודל\", ילדות @F16@. פער דורות ~37 שנים; אין למזג.",
            },
            {
              id: 'ir_002_sosha_esther',
              name: 'IR-002: סושה אסתר קסטרל (זמני)',
              note:
                '@I362@ Sosha Esther Kastrel - מוצגת כהורה ב-@F69@ לצד פסיה קסטרול; שני הורים נקבה באותה משפחה מעלה חשד לארטיפקט ייבוא. ממתין לאימות ממקורות חיצוניים. דוח פולקוף 2026 מציין סושה אסתר כרעיה לראובן בקו סוסנקה - יש להצלב.',
              isResearchTarget: true,
            },
            {
              id: 'ir_003_kurenets_labels',
              name: 'IR-003: וריאנטים של קורנץ (נפתר)',
              note:
                'Kurenets, Kureniets, Kurenets (Kureniets), מחוז וילייקה / גוברניה וילנה וכו\' - אותו יישוב; נרמול תווית בלבד (קואורדינטות ~54.52°N, 26.92°E במסמך).',
            },
            {
              id: 'nachum_robert_costrell_ged',
              name: 'Nahum Costrell, קורנץ, ו-DNA (GEDCOM)',
              note:
                '@I82@ ב-GEDCOM: Nachum Costrell; בארכיון: Nahum Costrell. קורנץ; Batch3: שוחט בקורנץ סביב 1900, אב ל-Solomon Costrell לפי סיכום משפחת Costrell. התאמת ענף ל-Robert M. Costrell @I385@ (FTDNA FF 2026-02-02): ~157.33 cM, בלוק ארוך ~47.61 cM, טווח 2C-3C; שמות אבות-קדמון: Costrell/Castroll/de Castro/Kastrul/Kastroll.',
              isDNAVerified: true,
            },
            {
              id: 'pesia_kastrel_ged',
              name: 'פסיה קסטרל / Pesia Kastrol · Costrell (GEDCOM)',
              note:
                '@I348@ Pesia Kastrel, נולדה ~1813; Batch3: פסיה Costrell (וריאנט), בת לנחום Costrell; הורה ב-@F69@; אחים מהמשפחה כוללים יהושע קסטרל @I409@. החוליה המקשרת המאשרת את השם קסטרול (Kastrol) כגרסה מוקדמת; בזכות קו זה הוכח הקשר הגנטי לענף קוסטרל בארה"ב.',
              isDNAVerified: true,
            },
            {
              id: 'part2_kurenets_shochet_costrell_line',
              name: 'חלק 2: שוחט קורניץ – נחום קסטרול (Castrol) וענף Costrell',
              note: `${ETYMOLOGY_LINE} לפי מסמך משפחת אלפרוביץ' חלק 2; צומת ל-Nachum Costrell @I82@ ב-GEDCOM.`,
              children: [
                {
                  id: 'nachum_castrol_kurenets_shochet',
                  name: 'Nachum Castrol / נחום קסטרול',
                  note: `${ETYMOLOGY_LINE} השוחט של קורניץ (the shochet of Kurenets).`,
                  children: [
                    {
                      id: 'hyman_costrell_communist',
                      name: 'Hyman Costrell / היימן קוסטרל',
                      note:
                        `${ETYMOLOGY_LINE} פעיל קומוניסטי. נשוי ל-Bessie Alpert; בתם Dorothy.`,
                    },
                    {
                      id: 'solomon_costrell_nachum_son',
                      name: 'Solomon Costrell / סולומון קוסטרל',
                      note: `${ETYMOLOGY_LINE} בן נחום; ענף Costrell.`,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'heilbronn_origin',
          name: 'מוצא היילבורן, גרמניה (Heilbronn Origin)',
          note:
            `📍 ${ETYMOLOGY_LINE} מיילבורן יוצאת המסלול המשפחתי: משם נדידה מערבה דרך צרפת וספרד, ואחר כך חזרה והתיישבות באזור וילנה, ליטא ובלארוס.`,
        },
        {
          id: 'kastrel_alperovitz_connection',
          name: "קשר Kastroll - Alperovitz - Gurevich (קסטרל - אלפרוביץ' - גורביץ')",
          note:
            "במאה ה-19 חלק מהאחים לקו Kastroll שינו את שמם ל-Alperovitz ול-Gurevich (עברית גורביץ'; וריאנטים מתועדים: Gurvitch, Gurevitsch) כטקטיקת הישרדות מול גיוס כפוי לצבא הצאר. בארצות הברית התפתח גם Costrell - ענף אמריקאי מאותו שורש.",
        },
        {
          id: 'part2_nasa_edward_anders_line',
          name: 'חלק 2: קו נאס"א – ישראל, אדולף אבא, ד"ר אדוארד אנדרס',
          note: `${ETYMOLOGY_LINE} לפי מסמך משפחת אלפרוביץ' חלק 2.`,
          children: [
            {
              id: 'israel_alperovitz_gabbai_kurenets',
              name: "ישראל אלפרוביץ' / Israel Alperovitz",
              note: `${ETYMOLOGY_LINE} גבאי בבית הכנסת של קורניץ (Kurenets).`,
            },
            {
              id: 'adolf_aba_alperovitz_victim',
              name: "אדולף אבא אלפרוביץ' / Adolf Aba Alperovitz",
              note: `${ETYMOLOGY_LINE} נספתה בשואה.`,
              isVictim: true,
            },
            {
              id: 'edward_anders_alperovitch_nasa',
              name: 'Dr. Edward Anders (born Alperovitch) / ד"ר אדוארד אנדרס',
              birth: '1926',
              birthPlace: 'Liepaja',
              note:
                `${ETYMOLOGY_LINE} ניצול שואה. פרופסור לכימיה; שיתוף פעולה עם נאס"א וניתוח סלעי ירח מאפולו. סיפור מלא בכפתור.`,
              story: EDWARD_ANDERS_NASA_STORY,
              isSurvivor: true,
              isDNAVerified: true,
            },
          ],
        },
        {
          id: 'I_PARTISAN_1',
          name: 'Leizer Alperovitz',
          birth: '1939',
          note:
            `${ETYMOLOGY_LINE} 🎖️🌲 ניצול שואה גיבור. בהיותו בן 4 חמק ליער נארוץ' כאשר הוריו נתפסו ונרצחו. חבר לפרטיזנים ושרד את המלחמה.`,
          isSurvivor: true,
          isHero: true,
        },
        {
          id: 'part2_sosinski_dolhinov_partisan',
          name: "חלק 2: משפחת סוסינסקי – פרטיזן דולהינוב",
          note: `${ETYMOLOGY_LINE} לפי מסמך משפחת אלפרוביץ' חלק 2.`,
          children: [
            {
              id: 'chaika_rafael_sosinski_parents',
              name: "חייקה אלפרוביץ' ורפאל סוסינסקי / Chaika Alperovitz & Rafael Sosinski",
              note: 'הורים ליוסף.',
              children: [
                {
                  id: 'joseph_sosinski_dolhinov_partisan',
                  name: 'Joseph Sosinski / יוסף סוסינסקי',
                  note:
                    `${ETYMOLOGY_LINE} פרטיזן ביערות דולהינוב (Dolhinov), אחר כך חייל בצבא האדום. עלה לישראל ב-1962.`,
                  isHero: true,
                  isSurvivor: true,
                },
              ],
            },
          ],
        },
        {
          id: 'krakes_martyrs_part5',
          name: "נספי קרקס (Krakes) – חלק 5: משפחת ד\"ר בוריס אלפרוביץ'",
          note:
            'לפי מסמך משפחת אלפרוביץ\' חלק 5: משפחה שנרצחה בקרקס, ליטא, 1941. להלן שלושה צמתים נפרדים (בוריס, סוניה, דוד) לסימון 🕯️ בארכיון.',
          children: [
            {
              id: 'dr_boris_alperovitch_krakes',
              name: 'Dr. Boris Alperovitch / ד"ר בוריס אלפרוביץ\'',
              birthPlace: 'Krakes, Lithuania',
              note:
                'רופא. נרצח ב-1941 בקרקס (Krakes), ליטא (murdered 1941), על ידי משתפי פעולה מקומיים. ' +
                ETYMOLOGY_LINE,
              isVictim: true,
            },
            {
              id: 'sonia_kotliar_alperovitch_krakes',
              name: "Sonia Alperovitch (née Kotliar) / סוניה אלפרוביץ' (לבית קוטליאר)",
              birthPlace: 'Krakes, Lithuania',
              note:
                'מורה. נרצחה ב-1941 בקרקס (Krakes), ליטא (murdered 1941), על ידי משתפי פעולה מקומיים. ' +
                'Entity resolution: משפחת הלידה גם כ-Kotler / קוטלר (איותים משפחתיים קרובים לקוטליאר). ' +
                ETYMOLOGY_LINE,
              isVictim: true,
              tags: ['Kotliar', 'Kotler', 'קוטליאר'],
            },
            {
              id: 'david_alperovitz_krakes',
              name: "David Alperovitz / דוד אלפרוביץ'",
              birthPlace: 'Krakes, Lithuania',
              note:
                'בנם של בוריס וסוניה. נרצח ב-1941 בקרקס יחד עם הוריו. לפי המסמך היה גם ילד שני קטן במשפחה (מקס, גיל ~6). ' +
                ETYMOLOGY_LINE,
              isVictim: true,
            },
          ],
        },
        {
          id: 'valeria_halperova',
          name: 'ולריה הלפרובה (רבקה)',
          birth: '1920',
          birthPlace: 'Kosice, Czechoslovakia',
          note:
            `${ETYMOLOGY_LINE} 🎗️🕊️ ניצולת שואה. שרדה את גטו קושיצה ואת מחנות אושוויץ, שטוטהוף וריגה. שוחררה על ידי צבא ארה"ב.`,
          isSurvivor: true,
        },
        {
          id: 'yosef_binyamin_hannah_alperovich',
          name: "Yosef, Binyamin & Hannah Alperovitz / יוסף בנימין וחנה אלפרוביץ'",
          birth: '1845',
          birthPlace: 'Dolhinov',
          note:
            `${ETYMOLOGY_LINE} אבות 'הענף האמריקאי'. ילדיהם (כמו סמואל ואיזידור) היגרו לארה"ב והתיישבו בסיילם, מסצ'וסטס.`,
        },
        {
          id: 'yosef_alperovitz_kupershtooch_photo',
          name: "יוסף אלפרוביץ' וזאב קופרשטוך (תצלום היסטורי)",
          note:
            "במסמכים: תמונה של זאב קופרשטוך לצד יוסף אלפרוביץ'. ב-DNA: השם Kupershtooch לא מופיע במפורש ברשימת אסיף (23andMe); ייתכן שצאצאים נושאים שמות משפחה אמריקאיים. כדאי לחפש ב-23andMe תחת Shared Matches עם Marilyn Engel או Robert Costrell שמות הקשורים לווילייקה.",
          isResearchTarget: true,
        },
        {
          id: 'holocaust_memorial_documented_victims',
          name: 'נספי שואה – לפי מסמכים משפחתיים (🕯️)',
          note: 'כרטיסי זיכרון (isVictim) בארכיון; להצלבה עם GEDCOM ומקורות.',
          children: [
            {
              id: 'moshe_alperovitz_tallin_estonia',
              name: "משה אלפרוביץ' / Moshe Alperovitz (Tallinn)",
              birth: '~1880',
              birthPlace: 'Sosenka; מ-1921 טאלין, אסטוניה',
              note:
                "בנו של אליהו אלפרוביץ'; נכדו של אברהם גדליהו. התגאה בייחוס הכהונה. נספה בשואה (Tallin / אסטוניה).",
              isVictim: true,
            },
            {
              id: 'elia_chaya_hillman_zagare',
              name: 'אליה הילמן וחיה שורה (אלקישקי) / Elia Hillman & Chaya Sora Elkishky (Zagare)',
              birthPlace: 'Zagare (אליה 1875; חיה שורה 1877)',
              note: 'נספו בשואה. אליה הילמן - זכרון לפי מסמכים; זאגר (Zagare).',
              isVictim: true,
            },
            {
              id: 'chaim_zalman_alperovitz_vilejka',
              name: "חיים זלמן אלפרוביץ' / Chaim Zalman Alperovitz (Vilejka)",
              birth: '1903',
              birthPlace: 'Kurenets',
              note: 'נרצח במחנה וילייקה (Vilejka), 1943.',
              isVictim: true,
            },
            {
              id: 'cira_alperovitz_kurenets',
              name: "צירה אלפרוביץ' / Cira Alperovitz",
              birth: '1912',
              birthPlace: 'Kurenets',
              note: 'נספתה בקורניץ, 1942.',
              isVictim: true,
            },
            {
              id: 'malka_alperovitz_kurenets',
              name: "מלכה אלפרוביץ' / Malka Alperovitz",
              birth: '1910',
              birthPlace: 'Kurenets',
              note: 'נספתה בקורניץ, 1942.',
              isVictim: true,
            },
            {
              id: 'freida_alperovitz_globokie',
              name: "פריידה אלפרוביץ' / Freida Alperovitz",
              birth: '1888',
              birthPlace: 'Kurenets',
              note: 'נספתה בגלוביקי (Globokie), 1943.',
              isVictim: true,
            },
          ],
        },
        {
          id: 'engel_dunilovichi_dna_branch',
          name: "ענף דונילוביץ' – משפחת אנגל (מאומת DNA)",
          note:
            "לפי רשימת התאמות DNA של אסיף (23andMe): Marilyn Engel מופיעה כבת דודה מדרגה שנייה (כ-3 דורות) עם כ-0.95% DNA משותף. במסמך \"חלק 4\": איזידור מאיר אנגל ונחמה אלפרוביץ'. הקשר לענף אנגל ולדונילוביץ' אינו רק נרטיב היסטורי אלא גם עובדה גנטית.",
          isDNAVerified: true,
          children: [
            {
              id: 'shneur_zalman_rifka_feldman',
              name: "שניאור זלמן אלפרוביץ' וריבקה פלדמן / Shneur Zalman Alperovitz & Rifka Feldman",
              note: 'הורים לנחמה (1883) ולשישה ילדים נוספים לפי המסמך; משפחה מדונילוביץ\'. Alperovich = Alperovitz.',
              children: [
                {
                  id: 'nechama_alperovich_engel',
                  name: "נחמה אלפרוביץ' / Nechama Alperovich",
                  birth: '1883',
                  birthPlace: 'Dunilovichi',
                  note:
                    "נולדה בדונילוביץ'. נישאה לאיזידור מאיר אנגל (Isidore Meier Engel). חיו באנטוורפן, בלגיה, סביב 1913. לפי המסמך: ילדים כולל רגינה ומקס דויד.",
                  isDNAVerified: true,
                  children: [
                    {
                      id: 'isidore_meier_engel',
                      name: 'Isidore Meier Engel / איזידור מאיר אנגל',
                      note: 'בעלה של נחמה; מופיע ב"חלק 4" במסמכים המשפחתיים.',
                      children: [
                        {
                          id: 'marilyn_engel_dna',
                          name: 'Marilyn Engel / מרילין אנגל',
                          note:
                            '🧬 DNA Match: 0.95%. Confirms the link between Alperovitz and Engel families. (23andMe / אסיף; ~בת דודה מדרגה שנייה, כ-3 דורות.)',
                          isDNAVerified: true,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        censusReportArchiveRoot,
        assif23andmeFathersBranch,
        juliusGenealogyDatasetReportRoot,
        {
          id: 'folkoff_polkoff_alperovitz_report_2026',
          name: "דוח קשרי משפחה: פולקוף - אלפרוביץ' (ינואר 2026)",
          note: FOLKOFF_ALPEROVITZ_2026_REPORT_LEAD,
          tags: ['Folkoff', 'Sosenka', 'Bangor', 'Applebaum'],
          isResearchTarget: true,
          children: [
            {
              id: 'reuben_sosha_sosenka_folkoff_line',
              name: "ראובן אלפרוביץ' וסושה אסתר – קו סוסנקה (דוח פולקוף)",
              birth: '1824 / ~1823',
              birthPlace: 'Sosenka, Belarus (מחוז מינסק)',
              note:
                "לפי הדוח לבראדלי פולקוף: ראובן אלפרוביץ' (1824-1890) ואשתו סושה אסתר (~1823) מסוסנקה; הורים לנתן כהן אלפרוביץ'. יש להצלב עם מבנה Markel-אב ועם IR-002 (סושה אסתר ב-GEDCOM) - אותו שם דורש אימות ישות; ראו גם צומת Reuben Alperovitz (מרקל) בארכיון.",
            },
            {
              id: 'nathan_cohen_alperovitz_bangor',
              name: "נתן כהן אלפרוביץ' / Nathan Cohen Alperovitz",
              birth: 'אוקטובר 1844',
              birthPlace: 'Sosenka, Belarus',
              note:
                'לפי הדוח: היגר לארה"ב, התיישב בבנגור, מיין. הגיע לבוסטון ב-9 במרץ 1888 (בגיל 43). נפטר ב-1 בפברואר 1901 בבנגור. אב לרבקה אפלבאום (פולקוף).',
            },
            {
              id: 'rebecca_applebaum_folkoff',
              name: 'רבקה אפלבאום / רבקה פולקוף · Rebecca Applebaum (Folkoff)',
              note:
                "בת נתן כהן אלפרוביץ'. נישאה ליעקב פולקוף; הקשר בין משפחות אלפרוביץ' ופולקוף.",
            },
            {
              id: 'jacob_folkoff_patriarch',
              name: 'יעקב פולקוף (פאלקוב) / Jacob Folkoff',
              birth: '~1874',
              birthPlace: 'רוסיה',
              note:
                'לפי הדוח: מקור המשפחה פלקוב/פיאלקוב; הגירה לארה"ב, פנסילבניה ומישיגן. נשוי לרבקה אפלבאום.',
            },
            {
              id: 'folkoff_descendants_brief_2026',
              name: 'צאצאי פולקוף (תקציר מהדוח)',
              note:
                'קו ישיר: יעקב ורבקה → רובין מאייר פולקוף (1917, בלארוס/ברה"מ) ושרה פולקוף (גרנט, 1923, ברסט) → לורנס פולקוף (1949) ולינדה (קלינטון, 1952) → בראדלי, קנת, אריקה פולקוף.',
            },
            {
              id: 'folkoff_related_branches_note',
              name: 'משפחות קשורות (מהדוח)',
              note:
                "כהן: צאצאי נתן כהן אלפרוביץ' במיין ומרילנד. קוסטרל/קסטרל: רוז ליליאן קאסטרל מקורניץ ונישואין לענף אלפרוביץ'. גרנט: שרה פולקוף לבית גרנט, ברסט. קלימשטיין: דרך לינדה קלינטון.",
            },
          ],
        },
        {
          id: 'moshe_beila_alperovitz',
          name: "חלק 2: עין שמר – משה, ביילה (זיידל), נחמיה, חיה סטירל",
          note: `${ETYMOLOGY_LINE} לפי מסמך משפחת אלפרוביץ' חלק 2. מירה: נכדה; טביעה בילדותה בבריכת קיבוץ עין שמר.`,
          children: [
            {
              id: 'moshe_alperovich_ein_shemer',
              name: "משה אלפרוביץ' / Moshe Alperovich",
              note: `${ETYMOLOGY_LINE} קו קורניץ ועין שמר.`,
            },
            {
              id: 'beila_zaidel_alperovich_victim',
              name: "ביילה אלפרוביץ' (זיידל) / Beila (Zaidel) Alperovich",
              note: `${ETYMOLOGY_LINE} נרצחה ב-1942. 🕯️`,
              isVictim: true,
            },
            {
              id: 'nechemia_alperovich_ein_shemer',
              name: "Nechemia Alperovich / נחמיה אלפרוביץ'",
              birth: '1912',
              note:
                `${ETYMOLOGY_LINE} 1912-2011. חבר קיבוץ עין שמר; מהנדס, למד בטכניון. Member of Kibbutz Ein Shemer; engineer, studied at Technion.`,
            },
            {
              id: 'chaia_stirel_alperovitz_victim',
              name: "חיה סטירל אלפרוביץ' / Chaia Stirel Alperovitz",
              note: `${ETYMOLOGY_LINE} נרצחה בקורניץ, 1942. 🕯️`,
              isVictim: true,
            },
            {
              id: 'michle_kuznitz_victim',
              name: 'Michle Kuznitz / מיכלה קוזניץ',
              note: `${ETYMOLOGY_LINE} קורבן שואה. 🕯️`,
              isVictim: true,
            },
            {
              id: 'mira',
              name: "מירה אלפרוביץ'",
              birthPlace: 'Israel',
              note:
                `${ETYMOLOGY_LINE} נכדתו של משה אלפרוביץ'. טרגדיה משפחתית: טבעה בילדותה בבריכה של קיבוץ עין שמר.`,
            },
          ],
        },
      ],
    },
  ],
};

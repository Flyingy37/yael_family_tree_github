/** Narrative archive tree data (same structure as previously kept in App.jsx). */
import type { ArchiveTreeNode } from './archiveTreeNode';

const BRANCH_NOTE =
  "הדגשה: התפתחות Castro → Kastrel/Costrell → אלפרוביץ'. ממיגל קסטרו (שורש ספרדי-צרפתי) השם התגלגל לקסטרול/קסטרל בליטא; בארצות הברית מופיע לעיתים Costrell כענף מאותו שורש קסטרל. " +
  "שושלת עתיקה ששורשיה בעיר היילבורן (Heilbronn) שבגרמניה. לאורך הדורות והנדודים למזרח אירופה, השם התגלגל לגרסאות שונות: הלפרין (Halperin), היילפרוביץ', אלפרוביץ', אלפרט (Alpert) והיילפרט. במאה ה-19 פוצל השם מ'קסטרל' ל'אלפרוביץ' ו'גורביץ' כדי להתחמק מגיוס לצבא הצאר.";

const ETYMOLOGY_LINE =
  'Halperin ו־Alperovitz (ואלפרט/היילפרט) הן התפתחויות פונטיות מאותו שורש משפחתי מגרמניה.';

const DNA_COSTRELL_BRANCH_NOTE =
  "הקשר ההיסטורי לקסטרל ו-de Castro מאומת באמצעות התאמת DNA משמעותית (157 cM) ל-Robert M. Costrell.";

const MIGUEL_NOTE = 'אנוס מספרד שנמלט לצרפת. השאיר צוואה בספר רש"י עתיק.';

const MIGUEL_STORY =
  "מיגל קסטרו נמלט מספרד לדרום צרפת לאחר המהפכה הצרפתית כדי לחיות כיהודי חופשי. בספר רש\"י עתיק נכתבה הקדשה בספרדית ובה ביקש מצאצאיו לתעד שמות ונדודים בדפים; לפי מכתב יהושע קסטרל לא זוכר הכותב את כל שמות הצאצאים שהשאירו הערות בדפי הספר, אך זוכר בבירור את יהודה (פראג, אחר כך מחוז וילנה).";

const MARY_FINE_STORY =
  'מרי עבדה בילדותה במפעל גפרורים בבוריסוב. בצעירותה חיה בבית דודה בטולה באווירה תרבותית. בימי ראשון נהגה לנסוע ליאסנאיה פוליאנה (Yasnaya Polyana), לעמוד בפתח האחוזה ולהקשיב לשיחות של לב טולסטוי עם הסטודנטים; ביקור בולט ב-1905. הייתה עדה למהפכת 1905 ולדיכוי דמים של סטודנטים בכיכר העיר. לפי המסמך: קרובה מאוד לאחותה בסי; עלתה לאמריקה בעקבותיה אחרי שחסכה כסף למסע.';

const RACHEL_LEAH_FINE_STORY =
  'רחל-לאה הייתה פעילה בתנועה המהפכנית ברוסיה. היא נורתה על ידי חיילי הצאר כשהייתה בת 14 או 16 בלבד, בזמן שנשאה נאום פוליטי נלהב נגד המשטר.';

const MYER_FINE_STORY =
  "מאיר למד לימודי קודש אך התעניין במדע. כשדודתו הדתית הקיצונית תפסה אותו קורא ספרי מדע 'טרפים', היא הורתה למשפחות בעיירה להפסיק להאכיל אותו (מנהג 'ימי אכילה'). הוא נחלש מרעב, חלה בדלקת ריאות ונפטר בצעירותו.";

const ENTITY_RESOLUTION_STORY =
  "משפחת אלפרוביץ' מתוארת כשורת כהונה במקורות שונים; אנדוגמיה בשבט יכולה להסביר חלק מריכוז ה-DNA המשותף. שינוי שמות אסטרטגי (כדי שלא יירשמו כבנים לאותה משפחה אחת ויימנע גיוס ארוך לצבא הצאר) יוצר אתגר של Entity Resolution: אותה משפחה ביולוגית תחת מזהים שונים - קסטרל, אלפרוביץ', גורביץ'. החיפוש החכם בארכיון מאחד כינויים.";

const NAME_SPLIT_STORY =
  "לפי מכתב יהושע קסטרל: לסבו היו אחים ששינו את שם המשפחה ל-Gurevitsch ול-Alperovitz מהסיבה שלא לשרת את הצאר שנים עשר שנה. זה אותו שורש ביולוגי, שמות שונים ברישום.";

const JEHOSHUA_GRANDSON_STORY =
  "יהושע קסטרל (Joshua Kastrel), הנכד, כתב ממקלטו את המכתבים ל-Michael Castroll (11 בדצמבר 1983) ול-Robert Costrell (27 במאי 1987 ו-25 ביוני 1988). בהם הוא מסכם את מסלול השם Castro/Kastrol/Kastroll/Kastrell/Castrell, את דבורה וספר הרש\"י, ואת נדידת יהודה; אלה מקור עיקרי לנרטיב כאן. מסמך AlpertsAndCohens31 בדרייב משלים.";

const ORTHOGRAPHY_KASTREL_STORY =
  "לפי מכתב יהושע קסטרל ל-Robert Costrell (יוני 1988): כשמשפחת Castro הראשונה התיישבה במחוז וילנה הרשויות המקומיות הוסיפו אות L לשם והחליפו C ב-K (כי C ברוסית נהגית ts), וכך נוצר Kastroll או Kastrol. לאחד הדודים שחי בלונדון שנים רבות היה האיות Castrell עם C. סבו של הכותב, יהושע, שינה את השם ל-Kastrell עם e במקום o; הכותב אינו בטוח למה, אך משער שמטרת הייתה להתחמק משנים עשר שנה שירות בצבא צאר רוסיה.";

const JOSHUA_KASTREL_LETTERS_COMPENDIUM_STORY =
  "תמצית ממכתבי Joshua Kastrel (איות השם משתנה במכתבים): (1) הוא אינו זוכר את כל שמות צאצאי מיגל שהשאירו הערות בדפי ספר עתיק, אך זוכר שבנו יהודה גר בפראג ואז עבר למחוז וילנה; בהקדשה ציין שהגיע לאחר מלחמות נפוליאון, כנראה סביב 1820. (2) לדעתו, אבי סבו היה Samuel Kastroll; לו עשרה אחים ואחיות (שמותיהם לא נזכרו). (3) אחים של הסב שינו שם ל-Gurevitsch ול-Alperovitz כדי לא לשרת את הצאר שנים עשר שנה. (4) ספר ההקדשה של מיגל נשמר אצל סבתו דבורה, אלמנת יהושע, נולדה בקורנץ - יהושע תיק במכתב מאוחר ל-Sosenka - כ-Alperovitz; ראה את הספר רק בנוכחותה, פעמיים. (5) פירוט איות Kastrol/Kastroll/Castrell/Kastrell והסבר הרשויות - ראו צומת נפרד. [הערות 5-7 במקורות משפחתיים: מכתבים ל-Michael Castroll 11.12.1983; ל-Robert Costrell 27.5.1987 ו-25.6.1988.]";

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

/** GEDCOM anchors and IR-* summaries (from docs/identity_resolution_notes.md + canonical.csv). */
const CHIVIA_BRANCH_GEDCOM_NOTE =
  "ב-GEDCOM (לאחר parse-ged): Chivia Kappelowitz @I786@ ב-fams @F350@; ילדים עם famc @F350@ כוללים את Sam/Myer/Laza/Rachel-Leah Fine (@I1136@-@I1140@), Shimon Fine (@I1228@), וכן Mary Alpert (@I1060@) ו-Bessie Alpert (@I1058@). יש להצליב עם הסיפור המשפחתי (מרי פיין וכו') כי השמות בשדות שונים.";

export const familyData: ArchiveTreeNode = {
  id: 'root',
  name: 'Family archive',
  children: [
    {
      id: 'livnat_direct_line',
      name: 'ענף ישיר: Castro–Alperovitz (אמא) · Heilprin–Lanzman (אבא) · דוברשטיין',
      note: 'מבנה אבות (צאצאים למעלה, שורשים למטה): קו ספרדי-אשכנזי מצד אמא; קו היילפרין-לנצמן מצד אבא; ענף מחקר דוברשטיין.',
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
              name: 'Shlioma Lantsman / שלומיא לנצמן',
              birth: '1804',
              birthPlace: 'Boguslavishki',
              note: 'אב קדמון בקו הלנצמן; קישור לדורות היילפרין דרך הצאצאים.',
              children: [
                {
                  id: 'abram_lantsman',
                  name: 'Abram Lantsman / אברהם לנצמן',
                  birth: '1748',
                  birthPlace: 'Vilna',
                  note: 'נפטר ב-1832. וילנה.',
                  children: [
                    {
                      id: 'zevulun_eliezer_heilprin',
                      name: 'Zevulun Eliezer Heilprin / הרב זבולון אליעזר היילפרין',
                      birth: '1554',
                      birthPlace: 'פולין / ליטא',
                      note:
                        'שורש רבני (המאה ה-16). מאומת גנטית: Y-DNA Haplogroup R-FGC8601. קשר למשפחת לנצמן-ליבנת.',
                      isDNAVerified: true,
                    },
                  ],
                },
              ],
            },
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
                "סבא מצד אמא; אביהם של פולה וזאב. מאומת ב-DNA: התאמה ל-Robert M. Costrell (157 cM). שורת כהונה (כהנים) מאימו דבורה. ענף Castro–Kastrol–אלפרוביץ' מפורט בצאצאים.",
              isDNAVerified: true,
              children: [
                {
                  id: 'samuel_kastroll',
                  name: 'Samuel Kastroll / שמואל קסטרול',
                  note:
                    "בנו של יהודה. לפי המסמך: אב ל-11 ילדים (שמואל ועשרה אחים ואחיות). חלקם שינו לאלפרוביץ' או גורביץ' כדי שלא יירשמו כבני משפחה אחת ויימנע גיוס ארוך לצבא הצאר.",
                  children: [
                    {
                      id: 'yehuda_kastrol_vilna',
                      name: 'Yehuda Kastrol / יהודה קסטרול',
                      birth: '1820',
                      birthPlace: 'Vilna',
                      note:
                        'בנו של מיגל. לפי מכתבי Joshua Kastrel: פראג, אחר כך מחוז וילנה אחרי מלחמות נפוליאון (~1820). שינוי איות Castro→Kastrol/Kastroll - ראו צומת "איות" בארכיון הנרטיבי.',
                      children: [
                        {
                          id: 'miguel_castro_spain',
                          name: 'Miguel Castro / מיגל קסטרו',
                          birth: '1660',
                          birthPlace: 'Spain',
                          note: MIGUEL_NOTE,
                          story: MIGUEL_STORY,
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
              note: 'Vladimir Dubershtein & Sofia Ginzburg - הורים של צילה; ענף מחקר לקרובי משפחה מצד דוברשטיין.',
              children: [
                {
                  id: 'reuven_dubershtein',
                  name: 'ראובן דוברשטיין',
                  note: 'אחיה של צילה. נהרג ב-1942 בשירותו בצבא האדום.',
                  children: [
                    {
                      id: 'alex_dubershtein_research',
                      name: 'Alex Dubershtein (Dubrow) / אלכס דוברשטיין',
                      note: '🔍 Research Target: Migrated to USA 1944. Potential match to Ace Dubrow (1.54%).',
                      isResearchTarget: true,
                    },
                  ],
                },
              ],
            },
            {
              id: 'tzila_dubershtein',
              name: 'צילה שרה דוברשטיין-גינזבורג (גינזבורג-ליאנדרס)',
              note:
                'קו אמהי מאומת דרך באשאטה ליאנדרס. חיבור גנטי לדניאל גינזבורג (158 cM). mtDNA Haplogroup HV5a; השושלת האימהית הישירה מהפזורה הצפונית (בלארוס/ליטא).',
              isDNAVerified: true,
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
          note: 'ענף נחום אלפרוביץ\' בעץ הישיר למעלה מרכז את מיגל קסטרו, יהודה קסטרול, שמואל קסטרול והקישור ל-Robert Costrell (157 cM). כאן: סיפורים משלימים וענפים נוספים.',
        },
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
            'לפי מכתבי Joshua Kastrel (1983, 1987, 1988) ומסמכים משלימים: ספר עתיק והקדשות, פראג ומחוז וילנה אחרי נפוליאון, שינויי איות מול הצאר. AlpertsAndCohens31 בדרייב משלים.',
          children: [
            {
              id: 'doc_joshua_kastrel_letters_compendium',
              name: 'מכתבי Joshua Kastrel: תמצית (1983-1988)',
              note:
                'ציטוטים וסיכום ממכתבים ל-Michael Castroll (11.12.1983) ול-Robert Costrell (27.5.1987, 25.6.1988). הערות 5-7 במקורות משפחתיים מתייחסות אליהם.',
              story: JOSHUA_KASTREL_LETTERS_COMPENDIUM_STORY,
            },
            {
              id: 'I_CASTRO_1',
              name: 'Miguel Castro / מיגל קסטרו',
              birth: '~1660',
              birthPlace: 'קסטיליה / טולדו, ספרד',
              note:
                'אב קדמון; יהודי אנוס (Converso). ' + MIGUEL_NOTE,
              story: MIGUEL_STORY,
            },
            {
              id: 'doc_yehuda_kastrol_narrative',
              name: 'Yehuda Kastrol / יהודה קסטרול',
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
              name: "הפיצול: גורביץ' ואלפרוביץ' (12 שנה לצאר)",
              note:
                "לפי המכתב: אחים של הסב שינו ל-Gurevitsch ול-Alperovitz כדי לא לשרת את הצאר שנים עשר שנה.",
              story: NAME_SPLIT_STORY,
            },
            {
              id: 'doc_orthography_kastroll_castrell',
              name: 'איות Kastrol / Kastroll / Castrell / Kastrell (רשויות ולונדון)',
              note: 'לפי מכתב יוני 1988 ל-Robert Costrell (הערה 7 במקור).',
              story: ORTHOGRAPHY_KASTREL_STORY,
            },
            {
              id: 'doc_yehoshua_kastrel_elder',
              name: 'יהושע קסטרל (הזקן) / Yehoshua Kastrell',
              note:
                'סבו של הכותב; שינה את השם ל-Kastrell עם e במקום o (אולי כדי להתחמק משנים עשר שנה שירות בצבא הצאר). נשוי לדבורה אלפרוביץ\'. דוד בלונדון: Castrell עם C.',
            },
            {
              id: 'doc_yehuda_leib_kastrel',
              name: 'יהודה-לייב קסטרל',
              note: 'בנו של יהושע קסטרל (הזקן).',
            },
            {
              id: 'jehoshua_costrell',
              name: 'יהושע קסטרל (הנכד, כותב המכתב)',
              birth: '~1905',
              birthPlace: 'תל אביב (מכתב 1988)',
              note:
                'הנכד, כותב המכתב מתל אביב (1988) - המקור המרכזי לנרטיב; קיימים גם סיכומים מסביבות 1983. אביו נולד בקורניץ ב-1876; משפחה קרובה נספתה בשואה.',
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
                  story: RACHEL_LEAH_FINE_STORY,
                  isVictim: true,
                  highlightStoryCard: true,
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
                  story: MARY_FINE_STORY,
                  highlightStoryCard: true,
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
                '@I362@ Sosha Esther Kastrel - מוצגת כהורה ב-@F69@ לצד פסיה קסטרול; שני הורים נקבה באותה משפחה מעלה חשד לארטיפקט ייבוא. ממתין לאימות ממקורות חיצוניים.',
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
              name: 'Nachum Costrell, קורנץ, ו-DNA (GEDCOM)',
              note:
                '@I82@ Nachum Costrell, קורנץ; Batch3: שוחט בקורנץ סביב 1900, אב ל-Solomon Costrell לפי סיכום משפחת Costrell. התאמת ענף ל-Robert M. Costrell @I385@ (FTDNA FF 2026-02-02): ~157.33 cM, בלוק ארוך ~47.61 cM, טווח 2C-3C; שמות אבות-קדמון: Costrell/Castroll/de Castro/Kastrul/Kastrel.',
              isDNAVerified: true,
            },
            {
              id: 'pesia_kastrel_ged',
              name: 'פסיה קסטרל / Costrell (GEDCOM)',
              note:
                '@I348@ Pesia Kastrel, נולדה ~1813; Batch3: פסיה Costrell (וריאנט), בת לנחום Costrell; הורה ב-@F69@; אחים מהמשפחה כוללים יהושע קסטרל @I409@.',
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
          name: "קשר קסטרל - אלפרוביץ' / גורביץ'",
          note:
            "במאה ה-19, חלק מהאחים למשפחת קסטרל שינו את שמם לאלפרוביץ' (Alperovitz) ולגורביץ' (Gurvitch) כטקטיקה של הישרדות כדי להתחמק מגיוס כפוי לצבא הצאר הרוסי. בארצות הברית התפתחה גם צורת השם Costrell - ענף אמריקאי מאותו שורש קסטרל.",
        },
        {
          id: 'I_ANDERS_1',
          name: 'Edward Anders (Alperovitz)',
          birth: '1926',
          birthPlace: 'Liepaja',
          note:
            `${ETYMOLOGY_LINE} 🕊️ ניצול שואה. שרד לאחר שאמו אריקה התחזתה לארית. היגר לארה"ב ב-1949 והפך לפרופסור בעל שם עולמי לכימיה באוניברסיטת שיקגו (חקר מטאוריטים עבור נאס"א).`,
          isSurvivor: true,
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
          id: 'boris_sonia_alperovitz',
          name: "ד\"ר בוריס וסוניה אלפרוביץ'",
          birthPlace: 'Krakes, Lithuania',
          note:
            `${ETYMOLOGY_LINE} 🕯️✡️ סוניה (לבית קוטליאר) הייתה מורה ובוריס היה רופא. נספו בקרקס (ליטא) ב-1941 יחד עם ילדיהם הקטנים דוד (10) ומקס (6).`,
          isVictim: true,
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
          name: "יוסף בנימין וחנה אלפרוביץ'",
          birth: '1845',
          birthPlace: 'Dolhinov',
          note:
            `${ETYMOLOGY_LINE} אבות 'הענף האמריקאי'. ילדיהם (כמו סמואל ואיזידור) היגרו לארה"ב והתיישבו בסיילם, מסצ'וסטס.`,
        },
        {
          id: 'moshe_beila_alperovitz',
          name: "משה וביילה אלפרוביץ'",
          note: `${ETYMOLOGY_LINE} משה היה סבה של מירה. אשתו הייתה ביילה לבית זיידל.`,
          children: [
            {
              id: 'mira',
              name: "מירה אלפרוביץ'",
              birthPlace: 'Israel',
              note:
                `${ETYMOLOGY_LINE} נכדתו של משה אלפרוביץ'. טרגדיה משפחתית: טבעה בילדותה בבריכה של קיבוץ עין שמר.`,
            },
          ],
        },
        {
          id: 'nechama_alperovich_engl',
          name: "נחמה אלפרוביץ' (אנגל)",
          birth: '1883',
          birthPlace: 'Dunilovichi',
          note:
            `${ETYMOLOGY_LINE} בתם של שניאור זלמן אלפרוביץ' ורבקה פלדמן. נישאה לאיזידור מאיר אנגל (חיו באנטוורפן). חלק מאחיה היגרו לפילדלפיה.`,
        },
      ],
    },
  ],
};

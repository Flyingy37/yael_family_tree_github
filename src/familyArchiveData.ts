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
  "מיגל קסטרו נמלט מספרד לדרום צרפת לאחר המהפכה הצרפתית כדי לחיות כיהודי חופשי. בספר רש\"י עתיק ששמרה דבורה אלפרוביץ', כתב מיגל הקדשה בספרדית בה ביקש מצאצאיו להוסיף את שמותיהם ונדודיהם לדף, כדי לשמור על רצף השושלת שנאלצה לחיות כקתולית בספרד.";

const MARY_FINE_STORY =
  'מרי עבדה בילדותה במפעל גפרורים בבוריסוב. בצעירותה חיה בבית דודה בטולה באווירה תרבותית. בימי ראשון נהגה לנסוע ליאסנאיה פוליאנה (Yasnaya Polyana), לעמוד בפתח האחוזה ולהקשיב לשיחות של לב טולסטוי עם הסטודנטים; ביקור בולט ב-1905. הייתה עדה למהפכת 1905 ולדיכוי דמים של סטודנטים בכיכר העיר.';

const RACHEL_LEAH_FINE_STORY =
  'רחל-לאה הייתה פעילה בתנועה המהפכנית ברוסיה. היא נורתה על ידי חיילי הצאר כשהייתה בת 14 או 16 בלבד, בזמן שנשאה נאום פוליטי נלהב נגד המשטר.';

const MYER_FINE_STORY =
  "מאיר למד לימודי קודש אך התעניין במדע. כשדודתו הדתית הקיצונית תפסה אותו קורא ספרי מדע 'טרפים', היא הורתה למשפחות בעיירה להפסיק להאכיל אותו (מנהג 'ימי אכילה'). הוא נחלש מרעב, חלה בדלקת ריאות ונפטר בצעירותו.";

const ENTITY_RESOLUTION_STORY =
  "לפי המסמך: משה וראובן אלפרוביץ' היו כהנים, ואנדוגמיה בשבט יכולה להסביר חלק מריכוז ה-DNA המשותף בבדיקות. שינוי שמות אסטרטגי (כדי שלא יירשמו כבנים לאותה משפחה אחת ויימנע גיוס ארוך לצבא הצאר) יוצר אתגר קלאסי של Entity Resolution: אותה משפחה ביולוגית תחת מזהים שונים - קסטרל, אלפרוביץ', גורביץ'. מנגנון החיפוש החכם בארכיון מאחד את הכינויים הלטיניים והעבריים לחיפוש אחד.";

const NAME_SPLIT_STORY =
  "הפיצול הגדול במאה ה-19: אחים שינו לגורביץ' (Gurevitsch) ולאלפרוביץ' כדי שלא יירשמו יחד כבני משפחה אחת ויימנע מהם גיוס של שנים רבות לצבא הצאר. זה אותו שורש ביולוגי, שמות שונים ברישום.";

const JEHOSHUA_GRANDSON_STORY =
  "יהושע קסטרל (הנכד) כתב מ-תל אביב את המכתבים והסיכומים על מקור המשפחה (מיגל קסטרו ועד ליטא וההגירה). המכתב מ-1988 משמש כאן כמקור מרכזי לנרטיב; גם מסמך AlpertsAndCohens31 בדרייב משלים את התמונה.";

const MOSHE_AHARON_STORY =
  'משה-אהרן אלפרוביץ\', אחיו של יהושע קסטרל (הזקן), היה קומוניסט. נרצח בבלגיה ב-1925 על ידי מהגר רוסי מהמחנה ה"לבן" (אנטי-בולשביקי), לפי המסמך המשפחתי.';

const REUBEN_SOSENKA_STORY =
  "ראובן אלפרוביץ' (Reuben): סוחר עצים מסוסנקה (Sosenka), משפחת כהנים. נשוי לסושה אסתר. ילדיו לפי הסיכום: שרה, חיווה (פיין), מרקה, נתן, יענקל, שמחה, לאה (1867). דבורה (1845) אחותו, אשת יהושע קסטרל הזקן, שמרה על ספר הרש\"י הספרדי.";

const DEBORAH_STORY =
  "דבורה אלפרוביץ': נולדה 1845, אחותו של ראובן. אשת יהושע קסטרל (הזקן). שמרה על ספר הרש\"י העתיק שבו מופיעה הקדשת מיגל קסטרו - עוגן פיזי בין ענף הכהונה לענף הקסטרל.";

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
                        'בנו של מיגל. לפי המסמך חי בפראג ועבר למחוז וילנה (בלארוס) סביב 1820, אחרי מלחמות נפוליאון. השלטונות הרוסיים תיארו הוספת "L" ושינוי איות (C ל-K): Castro → Kastrol.',
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
          note: 'לפי AlpertsAndCohens31 ומכתבי יהושע קסטרל (1988): אנוס, שחרור בצרפת אחרי ~1789, נדידה מזרחה, פיצול שמות מול גיוס.',
          children: [
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
                'בנו של מיגל. לפי המסמך חי בפראג ועבר למחוז וילנה (בלארוס) סביב 1820, אחרי מלחמות נפוליאון. השלטונות הרוסיים הוסיפו "L" לשם ושינו איות (C ל-K): קסטרול.',
            },
            {
              id: 'doc_samuel_kastroll_narrative',
              name: 'Samuel Kastroll / שמואל קסטרול',
              note: 'בנו של יהודה. אב ל-11 ילדים (שמואל ועשרה אחים ואחיות) לפי המסמך.',
            },
            {
              id: 'doc_name_split_gurevitsch',
              name: "הפיצול הגדול: גורביץ' ואלפרוביץ'",
              note:
                "חלק מהאחים שינו לגורביץ' (Gurevitsch) ולאלפרוביץ' כדי שלא יירשמו כבנים לאותה משפחה אחת ויימנע מהם גיוס ארוך לצבא הצאר.",
              story: NAME_SPLIT_STORY,
            },
            {
              id: 'doc_yehoshua_kastrel_elder',
              name: 'יהושע קסטרל (הזקן)',
              note:
                'נכדו של יהודה לפי המסמך הנרטיבי. שינה O ל-E בשם המשפחה (Kastrell). נשוי לדבורה אלפרוביץ\'.',
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
          id: 'doc_section_2_sosenka_cohanim',
          name: "2. שושלת אלפרוביץ' (משפחת הכהנים מסוסנקה)",
          note: 'סוחרי עץ, כהונה; נישואי קרובים לשמירה על "טוהר" השבט לפי המסמך.',
          children: [
            {
              id: 'doc_reuben_alperovitz',
              name: "Reuben Alperovitz / ראובן אלפרוביץ'",
              birthPlace: 'Sosenka',
              note:
                'סוחר עצים. משפחת כהנים (Cohanim). במסמך באנגלית: Reuben Alperovitz. Alperovich ו-Alperovitz - אותו שם משפחה (תעתיקים).',
              story: REUBEN_SOSENKA_STORY,
            },
            {
              id: 'doc_sosha_esther_narrative',
              name: 'סושה אסתר (רעיית ראובן, במסמך)',
              note:
                'במסמך המשפחתי: אשת ראובן. להבדיל: ברישום GEDCOM יש סוגיה מבנית סביב @I362@ (ראו IR-002 בחילוץ הטכני).',
            },
            {
              id: 'doc_alperovich_equals_alperovitz',
              name: 'Alperovich = Alperovitz',
              note:
                'במסמך ובמקורות: Alperovich ו-Alperovitz הם איותים לאותה משפחה. החיפוש החכם בארכיון כולל את שני הצורות.',
            },
            {
              id: 'doc_reuben_children_english_roster',
              name: "ילדי ראובן - רישום אנגלי (מניעת כפילויות)",
              note:
                'רשימת השמות מהמסמך באנגלית. מרי, רחל-לאה ומרקה (Markel) מוזגו לשמות בצמתים בענף פיין ובאנדוגמיה - בלי צומת כפול. חוה וסיימון בענף ההורים.',
              children: [
                {
                  id: 'sarah_alperovitz_doc',
                  name: 'Sarah Alperovitz / שרה אלפרוביץ\'',
                  note: 'בת ראובן לפי המסמך באנגלית.',
                },
                {
                  id: 'chava_alperovitz_doc',
                  name: 'Chava Alperovitz / חוה אלפרוביץ\'',
                  note:
                    'במסמך באנגלית. זהות ל-Chivia / חיווה (אלפרוביץ\') פיין - הפרטים והילדים בענף "שושלת פיין" למטה; לא נוספה כפילות שם.',
                },
                {
                  id: 'leah_alperovitz_doc',
                  name: 'Leah Alperovitz / לאה אלפרוביץ\'',
                  birth: '1867',
                  note: 'בת ראובן לפי המסמך (שנת לידה 1867 ברשימה העברית).',
                },
                {
                  id: 'moshe_alperovitz_disambig',
                  name: 'Moshe Alperovitz / משה אלפרוביץ\' (פירוש שמות)',
                  note:
                    'במסמך מופיע "Moshe Alperovitz" - כמה דמויות שונות בארכיון: משה (מיישה) דודה של מרקה (ענף אנדוגמיה), משה-אהרן אחי יהושע הזקן, ובן משה מטאלין (שואה) תחת אליהו. יש להצליב לפי הקשר.',
                },
                {
                  id: 'nadya_alperovitz_doc',
                  name: 'Nadya Alperovitz / נדיה אלפרוביץ\'',
                  note:
                    'במסמך באנגלית. ייתכן תעתיק/כינוי לנתן (Nathan) מהרשימה העברית "נתן"; לא ממוזג אוטומטית - לאימות במקור.',
                },
                {
                  id: 'bessie_alperovitz_doc',
                  name: 'Bessie Alperovitz / בסי אלפרוביץ\'',
                  note:
                    'במסמך באנגלית. ב-GEDCOM מופיעה לעיתים Bessie Alpert @I1058@ (famc @F350@) - להצלבה; לא אותה דמות כמו מרי פיין.',
                },
                {
                  id: 'sosonka_alperovitz_disambig',
                  name: 'Sosonka Alperovitz (בירור)',
                  note:
                    'מופיע במסמך. סביר שזו טעות או בלבול עם Sosenka (סוסנקה) כשם מקום, לא שם משפחה של אדם. לא מוגדר כאן כבן/בת משפחה נפרדת עד לאימות.',
                },
                {
                  id: 'yankev_alperovitz_doc',
                  name: 'Yankev Alperovitz / יענקל אלפרוביץ\'',
                  note: 'בן ראובן לפי המסמך באנגלית; Yankev = יעקב (יענקל) ברשימה העברית.',
                },
                {
                  id: 'simcha_alperovitz_doc',
                  name: 'Simcha Alperovitz / שמחה אלפרוביץ\'',
                  note:
                    'מופיע ברשימת ילדי ראובן בעברית; לא ברשימה האנגלית שקיבלנו - נוסף לשלמות מול אותה רשימה.',
                },
              ],
            },
            {
              id: 'merke_maishe_endogamy',
              name: "נישואי מרקה (Merke) למיישה (Maishe) אלפרוביץ' (דודה)",
              note:
                "בת ראובן; נישאה לדודה משה. לפי המסמך: אנדוגמיה לשמירה על טוהר כהונה בשבט. שני הצדדים מתחת לאיחוד - קו עץ אנכי.",
              children: [
                {
                  id: 'merke_alperovitz',
                  name: "Merke / Markel Alperovitz / מרקה אלפרוביץ'",
                  note:
                    "בת ראובן; נישואי קרובים למיישה אלפרוביץ' (כהן). במסמך באנגלית גם Markel Alperovitz.",
                },
                {
                  id: 'maishe_alperovitz_uncle',
                  name: "Maishe / Moshe Alperovitz (דוד) / משה אלפרוביץ'",
                  note:
                    "דודה של מרקה; כהן לפי המסמך. בעלה. במסמך באנגלית Moshe Alperovitz - הקשר הזה (דוד נשוי לבת).",
                },
              ],
            },
            {
              id: 'doc_deborah_alperovitz',
              name: 'דבורה אלפרוביץ\'',
              birth: '1845',
              note:
                'אחותו של ראובן. אשת יהושע קסטרל (הזקן). שמרה על ספר הרש"י וההקדשה הספרדית של מיגל.',
              story: DEBORAH_STORY,
            },
            {
              id: 'doc_eliyahu_alperovitz',
              name: 'Eliyahu / Elizya Alperovitz / אליהו אלפרוביץ\'',
              note:
                'אחיה של דבורה. במסמך באנגלית לעיתים Elizya Alperovitz - ייתכן תעתיק לאותה דמות; לא נוסף צומת נפרד.',
              story: ELIYAHU_STORY,
              isVictim: true,
            },
          ],
        },
        {
          id: 'doc_section_3_fine_revolutionary',
          name: '3. שושלת פיין - הענף המהפכני',
          note: 'מחיווה בת ראובן ושמעון פיין; כרטיסי סיפור למרי ורחל-לאה (כפתור מודגש).',
          children: [
            {
              id: 'chivia_shimon_fine_parents',
              name: 'Chava Alperovitz & Simon Fine / חיווה אלפרוביץ\' ושמעון (Simon) פיין',
              note:
                'חיווה (Chava / Chivia) Alperovitz: בת ראובן. Simon Fine / שמעון פיין - בן זוג. הורים למרי, מאיר, רחל-לאה (ומשפחה רחבה ב-GEDCOM).',
            },
            {
              id: 'bertha_fine_doc',
              name: 'Bertha Fine / ברטה פיין',
              note:
                'מופיעה במסמך באנגלית. יש לקבוע קשר משפחתי מדויק (אחות, בת וכו\') מול שמעון וחיווה - להשלמה מהמקור.',
            },
            {
              id: 'chivia_alperovitz_fine_branch',
              name: 'ילדי חיווה ושמעון (Fine)',
              note: `מרי, רחל-לאה ומאיר - כרטיסי סיפור. ${CHIVIA_BRANCH_GEDCOM_NOTE}`,
              children: [
                {
                  id: 'mary_fine',
                  name: 'Mary Alperovitz Fine / מרי אלפרוביץ\' פיין',
                  note:
                    'במסמך באנגלית Mary Alperovitz; נשואה/ידועה כמרי פיין. ביקרה אצל לב טולסטוי ב-1905; חלק מהנרטיב המהפכני.',
                  story: MARY_FINE_STORY,
                  highlightStoryCard: true,
                },
                {
                  id: 'rachel_leah_fine',
                  name: 'Rachel-Leah Alperovitz Fine / רחל-לאה אלפרוביץ\' פיין',
                  note:
                    '🎗️ מהפכנית צעירה, נורתה על ידי חיילי הצאר. במסמך באנגלית גם Rachel-Leah Alperovitz (שם נעורים/רישום).',
                  story: RACHEL_LEAH_FINE_STORY,
                  isVictim: true,
                  highlightStoryCard: true,
                },
                {
                  id: 'myer_fine',
                  name: 'Myer Fine / מאיר פיין',
                  note: 'נספה בשל קונפליקט דתי/לימודי (סנקציות "ימי אכילה").',
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

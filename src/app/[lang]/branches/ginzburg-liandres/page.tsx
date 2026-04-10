import { Link } from 'react-router-dom';
import { useFamilyData } from '../../../../hooks/useFamilyData';
import { useLang } from '../../layout';
import {
  EVIDENCE_TYPE_ORDER,
  type BranchEvidenceItem,
  getCanonicalGinzburgLiandresDisplayName,
  getGinzburgLiandresBranchEvidence,
  getGinzburgLiandresBranchSummary,
  getGinzburgLiandresRelationshipOverlay,
  type EvidenceType,
} from '../../../../branches/ginzburgLiandres';
import { ArchivalCard } from '../../../../components/ArchivalCard';
import { BranchEvidenceCard } from '../../../../components/BranchEvidenceCard';
import { RelationshipChip } from '../../../../components/RelationshipChip';

function PersonName({
  personId,
  fallback,
  href,
}: {
  personId: string | null;
  fallback: string;
  href?: string;
}) {
  if (!personId || !href) {
    return <span className="font-medium text-stone-800">{fallback}</span>;
  }
  return (
    <Link to={href} className="font-medium text-stone-800 underline decoration-stone-300 underline-offset-4 hover:text-stone-950">
      {fallback}
    </Link>
  );
}

function formatRelationshipLabel(value: string): string {
  return value.replace(/-/g, ' ');
}

function translateEvidenceItem(item: BranchEvidenceItem, isHebrew: boolean, branchUrlBase?: string): BranchEvidenceItem {
  if (!isHebrew) {
    if (item.type !== 'video-testimony') return item;
    return {
      ...item,
      url: item.url || (branchUrlBase ? `${branchUrlBase}#${item.id}` : undefined),
    } as BranchEvidenceItem;
  }

  const copy: Record<string, Partial<BranchEvidenceItem>> = {
    'maternal-line-mtdna': {
      title: 'עוגן mtDNA לקו האימהי',
      description:
        'Sofia היא נקודת העיגון האימהית המוקדמת בסיכום הנוכחי, ושכבת התצוגה משמרת את השרשרת Basia -> Sofia -> Tzila Cilia -> Pola -> Yael.',
      note: 'ראיה חלקית. רמז ה-mtDNA תומך בקו האימהי אך אינו פותר לבדו את כל החיבורים ההיסטוריים.',
      source: 'עוגן mtDNA לקו האימהי',
    },
    'daniel-ginzburg-dna': {
      title: 'רמז DNA לאשכול שם המשפחה Ginzburg-Liandres',
      description:
        'הערות ההתאמה מציינות את Landres / Liandres בתוך אשכול שם המשפחה Ginzburg, ולכן שכבת התצוגה מאחדת וריאנטים מבלי לפצל זהויות תצוגה נפרדות.',
      note: 'רמז הקשרי. הוא תומך בקיבוץ וריאנטים של שם המשפחה, אך אינו מספיק לבדו לשחזור מלא של הענף.',
      source: 'רמז DNA לאשכול השם',
    },
    'cilia-migration-note': {
      title: 'הערת הגירה ל-Cilia / Tzila',
      description:
        'המידע הקיים מציין לידה בחיפה בתקופת המנדט הבריטי, מוצא משפחתי מאזור Pleshchenitsy וחזרה לבלרוס סביב 1930.',
      note: 'נשמר כהערת מחקר. יש לקרוא אותו כהקשר ארכיוני, לא כהוכחה עצמאית.',
      source: 'הערת הגירה',
    },
    'cilia-myheritage-summary': {
      title: 'סיכום עדכון MyHeritage ל-Cilia Sara Duberstein',
      description:
        'סיכום ביקורת מקומית מציין עדכון נוסף הקשור לאחים עבור Cilia Sara Duberstein (Alperovitch), הסבתא האימהית בהקשר ענפי זה.',
      note: 'זהו סיכום של מסמך מחקר משני, לא רשומת המקור הראשונית.',
      source: 'סיכום MyHeritage',
    },
    'ev-image-aharon-military-portrait': {
      title: 'דיוקן משויך ל־Aharon Ginzburg',
      description: 'דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Aharon Ginzburg.',
      note: 'יש לשמור כצילום פורטרט של Aharon Ginzburg.',
      source: 'חומרי Ginzburg שהועלו',
    },
    'ev-image-berl-yakov-ginzburg-1944': {
      title: 'דיוקן משויך ל־Yankel Berl Ginzburg',
      description: 'דיוקן ארכיוני משופר המשויך לפי הזיהוי המשפחתי ל־Yankel Berl Ginzburg.',
      note: 'הזיהוי נשמר כמשוער עד לאישור נוסף מתוך כתובת מתוארכת, כיתוב בצד האחורי או תיעוד משפחתי עצמאי.',
      source: 'שם קובץ בארכיון המשפחתי והקשר מחקרי ענפי',
    },
    'ev-image-zinaida-dubershtein-ginzburg-portrait': {
      title: 'דיוקן משויך ל־Dr. Zinaida Zina Dubershtein (Ginzburg)',
      description: 'דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Dr. Zinaida Zina Dubershtein (Ginzburg).',
      note: 'הזיהוי נשאר לפי ייחוס משפחתי עד להתאמה עם כתובת מתוארכת או מקור מקביל.',
      source: 'ארכיון משפחתי',
    },
    'ev-image-zinaida-dubershtein-ginzburg-portrait-alt': {
      title: 'דיוקן חלופי משויך ל־Dr. Zinaida Zina Dubershtein (Ginzburg)',
      description: 'גרסה חלופית של דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Dr. Zinaida Zina Dubershtein (Ginzburg).',
      note: 'יש להתייחס לשתי הגרסאות כאותו נושא רק אם הארכיון המשפחתי מאשר שהן מתייחסות לאותו אדם.',
      source: 'ארכיון משפחתי',
    },
    'ev-image-cilia-two-person-portrait': {
      title: 'דיוקן של Tzila Cilia Duberstein Alperovitz עם תינוק',
      description: 'צילום זוגי שבו Cilia מופיעה עם תינוק. הזיהוי של המבוגר חזק; זהות התינוק נשמרת כמשוערת.',
      note: 'יש לשמור את זהות התינוק כמשוערת עד להתאמה חזקה יותר של הצילום.',
      source: 'חומרי Ginzburg שהועלו',
    },
    'ev-image-ginzburg-family-1946-annotated': {
      title: 'תצלום משפחתי מסומן של Ginzburg',
      description: 'תצלום משפחתי מסומן מתוך סט חומרי Ginzburg לשנת 1946.',
      note: 'סימוני ההערה הם חלק מהתמונה המקורית; חלק מהזיהויים נותרים פרשניים.',
      source: 'חומרי Ginzburg שהועלו',
    },
    'ev-image-ginzburg-family-1946-clean': {
      title: 'תצלום משפחתי נקי של Ginzburg',
      description: 'גרסה נקייה של התצלום המשפחתי מתוך אותו סט חומרי Ginzburg לשנת 1946.',
      note: 'השתמשו בגרסה זו כנקודת ייחוס לא מסומנת של אותו מבנה משפחתי.',
      source: 'חומרי Ginzburg שהועלו',
    },
    'ev-image-ginzburg-family-annotated-group': {
      title: 'תצלום משפחתי מסומן של Ginzburg',
      description: 'תצלום משפחתי עם שורות זיהוי בכתב יד ושמות שנוספו מאוחר יותר לצורך זיהוי עבודה.',
      note: 'זהו צילום מחקרי מסומן. יש להתייחס לזיהויים האישיים כאל תוויות עבודה משפחתיות, אלא אם יאומתו בכיתוב מקורי או במקור מקביל.',
      source: 'תצלום הפניה מסומן מתוך הארכיון המשפחתי',
    },
    'ev-image-ginzburg-duberstein-family-group-identified': {
      title: 'צילום משפחתי קבוצתי מזוהה של משפחת Ginzburg–Duberstein',
      description: 'צילום משפחתי קבוצתי עם זיהוי משפחתי מפורט של בני ובנות משפחות Ginzburg, Duberstein, Meirson ו־Charny.',
      note: 'הזיהוי סופק על ידי המשפחה. יש להתייחס אליו כזיהוי עבודה משפחתי, אלא אם יאומת בכיתוב מקורי או במקור מקביל.',
      source: 'ארכיון משפחתי עם זיהוי שסופק על ידי המשפחה',
    },
    'ev-image-ginzburg-family-group-1946-a': {
      title: 'צילום משפחתי של משפחת Ginzburg, בלארוס שלאחר המלחמה (גרסה א)',
      description: 'צילום משפחתי נקי מהתקופה שלאחר המלחמה, שנשמר ללא שכבת הכיתוב בכתב יד.',
      note: 'יש להשתמש בתמונה יחד עם הגרסה המסומנת לצורך תמיכה בזיהוי; אין להפוך הנחות על מיקום בתמונה לעובדות גנאלוגיות חד-משמעיות ללא אימות נפרד.',
      source: 'ארכיון משפחתי',
    },
    'ev-image-ginzburg-family-group-1946-b': {
      title: 'צילום משפחתי של משפחת Ginzburg, בלארוס שלאחר המלחמה (גרסה ב)',
      description: 'גרסה נוספת של צילום משפחתי קבוצתי מאותו הקשר משפחתי רחב שלאחר המלחמה.',
      note: 'יש לשמור את הזיהוי ברמת אדם כמשוער אלא אם הוא מעוגן בגרסה המסומנת או במקור נוסף.',
      source: 'ארכיון משפחתי',
    },
    'ev-document-yankel-berl-ginzburg-autobiography': {
      title: 'מסמך אוטוביוגרפי סרוק המקושר ל-Yankel Berl Ginzburg',
      description: 'סריקה ארכיונית של טופס ביוגרפי או אוטוביוגרפי ברוסית הכולל מידע משפחתי ופרטי הורים.',
      note: 'המסמך הוא ראיה ראשונית כפריט ארכיוני, אך כל תמלול או פרשנות ממנו צריכים להישאר ניתנים לבדיקה נפרדת.',
      source: 'סריקת מסמך מארכיון משפחתי',
    },
    'ev-image-tzila-family-testimony-scan': {
      title: 'עמוד סרוק מעדות משפחת Tzila',
      description: 'עמוד עדות סרוק בעברית, המשמר את הסיפור המשפחתי כצילום מסמך.',
      note: 'יש להתייחס אליו כצילום של ראיה תיעודית, לא כתמלול.',
      source: 'חומרי Ginzburg שהועלו',
    },
    'ev-image-cilia-alperovitz-liri-livnat-tal': {
      title: 'Tzila Cilia Alperovitz née Dubershtein עם Liri Livnat-Tal',
      description: 'צילום משפחתי מאוחר שבו נראית Tzila Cilia Alperovitz née Dubershtein מחזיקה את Liri Livnat-Tal.',
      note: 'צילום משפחתי מודרני מארכיון הקו האימהי.',
      source: 'ארכיון משפחתי',
    },
    'ev-image-isaak-ginzburg-1936': {
      title: 'דיוקן משויך ל־Iche Isaak Ginzburg',
      description: 'דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Iche Isaak Ginzburg.',
      note: 'השנה משקפת את הזיהוי המשפחתי הקיים.',
      source: 'ארכיון משפחתי',
    },
    'ev-image-tzila-prewar-class-photo-1941': {
      title: 'צילום כיתה לפני הפלישה הנאצית, משויך ל־Tzila Alperovitz née Dubershtein',
      description: 'צילום כיתה מסיום כיתה ח׳, מהתקופה שלפני הפלישה הנאצית, עם זיהוי משפחתי של Tzila Alperovitz née Dubershtein בפינה הימנית התחתונה, עם צמות.',
      note: 'הזיהוי נשאר משפחתי ומשוער; לפי הערות המשפחה, כ-חצי מחברותיה לכיתה נספו במהלך המלחמה בבלארוס.',
      source: 'הערת ארכיון משפחתי',
    },
    'ev-image-tzila-dubershtein-class-photo-pre-1941': {
      title: 'צילום כיתה לפני הפלישה הנאצית, משויך ל־Tzila Alperovitz née Dubershtein',
      description: 'צילום כיתה מסיום כיתה ח׳, מהתקופה שלפני הפלישה הנאצית, עם זיהוי משפחתי של Tzila Alperovitz née Dubershtein בפינה הימנית התחתונה, עם צמות.',
      note: 'הזיהוי נשאר משפחתי ומשוער; לפי הערות המשפחה, כ-חצי מחברותיה לכיתה נספו במהלך המלחמה בבלארוס.',
      source: 'ארכיון משפחתי עם הערת זיהוי מאוחרת',
    },
    'raw-family-structure': {
      title: 'הפניה מבנית לגרף המשפחה',
      description:
        'חבילת הענף שומרת את הגרף הגולמי כפי שהוא, ומעליו מוסיפה תיקוני תצוגה עבור מזהי המשפחה F19 / F71 לצורך סדר בני זוג ופרשנות אחים למחצה.',
      source: 'גרף המשפחה הגולמי',
    },
    'livnat-report-cross-reference': {
      title: 'הפניה צולבת מדוח Livnat לשמות Ginzburg ו-Duberstein',
      description:
        'הדוח כולל צורות שם מקבילות כגון Bashete Basia Ginzburg, Sofia Soshe Duberstein ו-Gershon Grigory Ginzburg, ולכן הוא תומך בקיבוץ וריאנטים לפי כינוי.',
      note: 'שימושי כהפניה לשמות וריאנטים; אין להתייחס אליו כמקור היסטורי ראשוני בפני עצמו.',
      source: 'דוח Livnat',
    },
    'ev-video-tzila-duberstein-01': {
      title: 'עדות מצולמת: מבנה משפחת דוברשטיין',
      description:
        'עדות מצולמת על Vladimir Duberstein, Sofia Duberstein וילדיהם: Ruven/Rube, Michael, Bashata Ema, Tzila Sara Tzipora ו־Vola.',
      note: 'עדות בעל־פה; עמימות ניסוח נשמרת במכוון.',
      source: 'תמלול עדות משפחת Tzila',
    },
    'ev-video-tzila-duberstein-02': {
      title: 'עדות מצולמת: מלחמה, בריחה וסיפור הבנק',
      description:
        'עדות מצולמת על תפקידו של Vladimir בבנק, ניסיונות הבריחה, ההפצצות, בריחת המשפחה והקשר לגטו Pleshchenitsy.',
      note: 'יש לשמור את רצף האירועים כעדות עד לאימות נוסף.',
      source: 'תמלול עדות משפחת Tzila',
    },
    'ev-video-tzila-ginzburg-01': {
      title: 'עדות מצולמת: ענף Ginzburg',
      description:
        'עדות מצולמת על Leiba Ginzburg, נשותיו, שיוך הילדים לענף Bashata, ובית Gershon–Fania Feigl.',
      note: 'נשמרות כאן עמימויות סביב נשות הבית, שיוך הילדים ושמות חוזרים.',
      source: 'תמלול עדות משפחת Tzila',
    },
    'ev-video-tzila-photo-memory-01': {
      title: 'עדות מצולמת: זיכרון התמונה המשפחתית',
      description:
        'זיכרון של תצלום משפחתי שבו Tzila מופיעה לצד אחותה, כנראה Ema Meirson née Duberstein.',
      note: 'שימושי לקישור זהויות, אך נשמר כאן כקירוב בלבד.',
      source: 'תמלול עדות משפחת Tzila',
    },
  };

  const translated = {
    ...item,
    ...(copy[item.id] || {}),
  } as BranchEvidenceItem;
  if (translated.type === 'video-testimony') {
    return {
      ...translated,
      title: translated.shortTitleHe || translated.title,
      url: translated.url || (branchUrlBase ? `${branchUrlBase}#${translated.id}` : translated.url),
    };
  }
  return translated;
}

export default function GinzburgLiandresBranchPage() {
  const { persons } = useFamilyData();
  const { lang } = useLang();
  const isHebrew = lang === 'he';
  const summary = getGinzburgLiandresBranchSummary();
  const branchEvidence = getGinzburgLiandresBranchEvidence();
  const rootHusband = persons.get(summary.rootCouple.husbandId) || null;
  const rootWife = persons.get(summary.rootCouple.wifeId) || null;
  const gershon = persons.get('@I132@') || null;

  const renderPersonLabel = (personId: string | null, fallback: string) => {
    if (!personId) return fallback;
    const person = persons.get(personId);
    return person ? getCanonicalGinzburgLiandresDisplayName(person) : fallback;
  };

  const ui = isHebrew
    ? {
        treeLink: 'עץ המשפחה',
        title: 'ענף Ginzburg-Liandres',
        firstMarriageSentence: 'נישואין ראשונים: אישה לא ידועה (השם הפרטי ושם הנעורים אינם ידועים).',
        firstMarriageChild: 'הילדה הידועה מנישואין אלה: Eti Ginzburg Charny.',
        intro:
          'תצוגת ענף תמציתית למשפחת Ginzburg-Liandres, עם שמות אנגליים מנורמלים, כללי הצגה מתועדים, ומבנה ארכיוני נקי.',
        rootCouple: 'הזוג המרכזי',
        firstMarriage: 'נישואין ראשונים',
        secondMarriage: 'נישואין שניים',
        thirdMarriage: 'נישואין שלישיים',
        firstMarriageTag: 'אישה לא ידועה',
        secondMarriageTag: 'צאצאים ביולוגיים',
        thirdMarriageTag: 'שלב־משפחה',
        thirdMarriageNote:
          'שכבת ההצגה מתעדת את Esther Lipschitz כאישה שלישית, אך בגרף הגולמי עדיין אין רשומת אדם קנונית מקושרת עבורה.',
        maternalLine: 'הקו האימהי',
        maternalChain: 'שרשרת אימהית',
        borisovBranch: 'ענף בוריסוב',
        gershonLine: 'קו Gershon',
        borisovSummary:
          'האשכול הזה מדגיש את ענף בוריסוב, עם התמקדות בקו Gershon ובהקשר המנורמל הקרוב אליו.',
        evidence: 'תיעוד',
        evidenceFirst: 'תיעוד תחילה',
        relationshipSummary: 'סיכום יחסים',
        presentationRules: 'כללי הצגה',
        typeEmptyLabels: {
        'family-photo': 'אין תצלום משפחתי נוסף בחבילת הענף.',
        portrait: 'אין דיוקן נוסף ברמת הענף בשלב זה.',
        'annotated-photo': 'אין תצלום מסומן נוסף ברמת הענף בשלב זה.',
        'document-scan': 'אין מסמך סרוק נוסף ברמת הענף בשלב זה.',
        testimony: 'אין עדות נוספת ברמת הענף בשלב זה.',
        'video-testimony': 'אין עדות וידאו נוספת ברמת הענף בשלב זה.',
        document: 'אין מסמך ענפי נוסף מעבר לסיכום המחקר.',
        'dna-clue': 'אין רמז DNA נוסף ברמת הענף.',
        'external-tree-reference': 'אין הפניה חיצונית נוספת ברמת הענף.',
        } as const,
      }
    : {
        treeLink: 'Family Tree',
        title: 'Ginzburg-Liandres',
        firstMarriageSentence: 'First marriage: unknown wife (given name and maiden name unknown).',
        firstMarriageChild: 'Known child from this marriage: Eti Ginzburg Charny.',
        intro:
          'A concise branch view for the Ginzburg-Liandres family, using normalized English names and documented presentation rules.',
        rootCouple: 'Root couple',
        firstMarriage: 'First marriage',
        secondMarriage: 'Second marriage',
        thirdMarriage: 'Third marriage',
        firstMarriageTag: 'Unknown wife',
        secondMarriageTag: 'Biological children',
        thirdMarriageTag: 'Stepfamily',
        thirdMarriageNote:
          'Presentation correction layer only: branch display records Esther Lipschitz as a third-wife identity, but the current raw graph does not yet contain a canonical linked person record for her.',
        maternalLine: 'Maternal line',
        maternalChain: 'Maternal chain',
        borisovBranch: 'Borisov branch',
        gershonLine: 'Gershon line',
        borisovSummary:
          'This cluster highlights the Borisov-side grouping, centered here on the Gershon line and its immediate normalized branch context.',
        evidence: 'Evidence',
        evidenceFirst: 'Evidence-first',
        relationshipSummary: 'Relationship summary',
        presentationRules: 'Presentation rules',
        typeEmptyLabels: {
        'family-photo': 'No family photo is attached to this branch package yet.',
        portrait: 'No portrait is attached at branch level yet.',
        'annotated-photo': 'No annotated photo is attached at branch level yet.',
        'document-scan': 'No scanned document is attached at branch level yet.',
        testimony: 'No additional testimony is attached at branch level yet.',
        'video-testimony': 'No additional video testimony is attached at branch level yet.',
        document: 'No further branch document is attached beyond the current research summary.',
        'dna-clue': 'No additional DNA clue is attached at branch level yet.',
        'external-tree-reference': 'No further external tree or research reference is attached at branch level.',
        } as const,
      };

  const evidenceByType = EVIDENCE_TYPE_ORDER.map((type) => ({
    type,
    items: branchEvidence.filter((item) => item.type === type),
  }));
  const relationshipSummary = isHebrew
    ? [
        'Eti Ginzburg Charny מוצגת כאחות למחצה של Sofia, Gershon, Aharon, Yankel Berl ו־Isaak.',
        'שמות הלידה נשמרים גלויים בתצוגה ואינם מוחלפים על ידי שמות נישואין.',
        'וריאנטים של כינויים מאוחדים בתור כינויים חלופיים, ולא כאנשים נפרדים.',
        'Druzia Lyandres נשמרת בחבילת הענף כאמו של Basia לצורך רצף הקו האימהי, אף שהגרף הגולמי עדיין אינו מכיל רשומת אדם קנונית ומקושרת עבורה.',
      ]
    : summary.relationshipSummary;
  const localizedStepchildren = isHebrew
    ? 'שלושת הילדים החורגים ממשפחת Esther Lipschitz נשמרים בתצוגה כילדים חורגים ולא כילדים ביולוגיים.'
    : null;

  return (
    <div className="atlas-page h-full overflow-auto" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-8">
          <Link to={`/${lang}/tree`} className="atlas-link text-sm">
            {ui.treeLink}
          </Link>
          <h1 className="mt-3 text-4xl text-stone-800 font-display-en">{ui.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            {ui.intro}
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="atlas-panel rounded-[1.75rem] p-6">
            <div className="atlas-kicker mb-4">{ui.rootCouple}</div>
            <div className="flex flex-col items-center text-center">
              <div className="atlas-pill rounded-full px-5 py-2 text-sm text-[var(--atlas-text)]">
                <PersonName
                  personId={rootHusband?.id || null}
                  fallback={renderPersonLabel(rootHusband?.id || null, 'Arie-Leib Ginzburg')}
                  href={rootHusband ? `/${lang}/person/${encodeURIComponent(rootHusband.id)}` : undefined}
                />
              </div>
              <div className="archival-connector-v h-8 my-2" />
              <div className="atlas-node-dot" />
              <div className="archival-connector-v h-8 my-2" />
              <div className="atlas-pill rounded-full px-5 py-2 text-sm text-[rgb(128,95,76)]">
                <PersonName
                  personId={rootWife?.id || null}
                  fallback={renderPersonLabel(rootWife?.id || null, 'Basia Liandres')}
                  href={rootWife ? `/${lang}/person/${encodeURIComponent(rootWife.id)}` : undefined}
                />
              </div>
            </div>

            <div className="atlas-divider my-8" />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {summary.familyStructure.map((family) => (
                <ArchivalCard
                  key={family.label}
                  title={
                    family.label === 'First marriage'
                      ? ui.firstMarriage
                      : family.label === 'Second marriage'
                        ? ui.secondMarriage
                        : ui.thirdMarriage
                  }
                  variant="atlas"
                  eyebrow={
                    <RelationshipChip
                      label={
                        isHebrew
                          ? family.label === 'First marriage'
                            ? ui.firstMarriageTag
                            : family.label === 'Second marriage'
                              ? ui.secondMarriageTag
                              : ui.thirdMarriageTag
                          : formatRelationshipLabel(family.relationshipType)
                      }
                      variant="atlas"
                      tone={family.label === 'Second marriage' ? 'rose' : family.label === 'Third marriage' ? 'violet' : 'stone'}
                    />
                  }
                >
                  {family.label === 'First marriage' ? (
                    <div className="space-y-1.5">
                      <p className="text-sm leading-6 text-[var(--atlas-text)]">{ui.firstMarriageSentence}</p>
                      <p className="text-xs text-stone-500">{ui.firstMarriageChild}</p>
                    </div>
                  ) : (
                    <>
                      <p>{family.spouseLabel}</p>
                      {'note' in family && family.note ? (
                        <p className="mt-2 text-xs text-stone-500">
                          {isHebrew && family.label === 'Third marriage'
                            ? ui.thirdMarriageNote
                            : family.note}
                        </p>
                      ) : null}
                    </>
                  )}
                  {'children' in family && family.children ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {family.children.map((id) => {
                        return (
                          <Link
                            key={id}
                            to={`/${lang}/person/${encodeURIComponent(id)}`}
                            className="atlas-pill rounded-full px-2.5 py-1 text-xs text-[var(--atlas-text)]"
                          >
                            {renderPersonLabel(id, id)}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                  {'stepchildren' in family && family.stepchildren ? (
                    <div className="mt-3 space-y-1">
                      {family.stepchildren.map((line) => (
                        <p key={line} className="text-xs text-stone-500">{localizedStepchildren || line}</p>
                      ))}
                    </div>
                  ) : null}
                </ArchivalCard>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <ArchivalCard title={ui.maternalLine} variant="atlas" eyebrow={<RelationshipChip label={ui.maternalChain} tone="violet" variant="atlas" />}>
              <div className="space-y-2">
                {summary.maternalLine.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-center gap-3">
                    <div className="atlas-node-dot flex-shrink-0" />
                    <div className="flex-1">
                      <PersonName
                        personId={item.personId}
                        fallback={renderPersonLabel(item.personId, item.label)}
                        href={item.personId ? `/${lang}/person/${encodeURIComponent(item.personId)}` : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ArchivalCard>

            <ArchivalCard title={ui.borisovBranch} variant="atlas" eyebrow={<RelationshipChip label={ui.gershonLine} tone="lime" variant="atlas" />}>
              <p className="text-sm leading-6 text-stone-600">
                {ui.borisovSummary}
              </p>
              <div className="mt-4 space-y-3">
                {gershon ? (
                  <div className="atlas-card-subtle rounded-2xl px-4 py-3">
                    <Link to={`/${lang}/person/${encodeURIComponent(gershon.id)}`} className="atlas-link text-sm font-medium">
                      {getCanonicalGinzburgLiandresDisplayName(gershon)}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(getGinzburgLiandresRelationshipOverlay(gershon.id)?.relationshipChips || ['Borisov cluster']).map((chip) => (
                        <RelationshipChip key={chip} label={chip} tone="lime" variant="atlas" />
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {summary.borisovBranchIds
                    .filter((id) => id !== '@I132@')
                    .map((id) => (
                      <Link
                        key={id}
                        to={`/${lang}/person/${encodeURIComponent(id)}`}
                        className="atlas-pill rounded-full px-2.5 py-1 text-xs text-[var(--atlas-text)]"
                      >
                        {renderPersonLabel(id, id)}
                      </Link>
                    ))}
                </div>
              </div>
            </ArchivalCard>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ArchivalCard title={ui.evidence} variant="atlas" eyebrow={<RelationshipChip label={ui.evidenceFirst} tone="rose" variant="atlas" />}>
            <div className="space-y-3">
              {evidenceByType.map(({ type, items }) => (
                <div key={type} className="atlas-card-subtle rounded-2xl px-3 py-2">
                  {items.length > 0 ? (
                    <div className="mt-1.5 space-y-2">
                      {items.map((item) => {
                        const displayItem = translateEvidenceItem(item, isHebrew, `/${lang}/branches/ginzburg-liandres`);
                        return (
                          <BranchEvidenceCard
                            key={item.id}
                            item={displayItem}
                            language={lang}
                            variant="atlas"
                            compact
                            resolvePersonLabel={(personId) => renderPersonLabel(personId, personId)}
                            resolvePersonHref={(personId) => `/${lang}/person/${encodeURIComponent(personId)}`}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-stone-500">{ui.typeEmptyLabels[type]}</p>
                  )}
                </div>
              ))}
            </div>
          </ArchivalCard>

          <ArchivalCard title={ui.relationshipSummary} variant="atlas" eyebrow={<RelationshipChip label={ui.presentationRules} tone="violet" variant="atlas" />}>
            <ul className="space-y-2">
              {relationshipSummary.map((line) => (
                <li key={line} className="text-sm leading-6 text-stone-600">
                  {line}
                </li>
              ))}
            </ul>
          </ArchivalCard>
        </section>
      </div>
    </div>
  );
}

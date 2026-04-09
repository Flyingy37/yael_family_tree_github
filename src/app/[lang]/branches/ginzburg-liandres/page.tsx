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

function translateEvidenceItem(item: BranchEvidenceItem, isHebrew: boolean): BranchEvidenceItem {
  if (!isHebrew || item.type === 'video-testimony') return item;

  const copy: Record<string, Partial<BranchEvidenceItem>> = {
    'maternal-line-mtdna': {
      title: 'עוגן mtDNA לקו האימהי',
      description:
        'Sofia נחשבת כאן לנקודת העיגון האימהית המוקדמת ביותר בסיכום הנוכחי, ושכבת התצוגה משמרת את השרשרת Basia -> Sofia -> Tzila Cilia -> Pola -> Yael.',
      note: 'ראיה חלקית בלבד. רמז ה-mtDNA תומך במסגרת הקו האימהי אך אינו פותר לבדו כל קשר היסטורי ביניים.',
    },
    'daniel-ginzburg-dna': {
      title: 'רמז DNA לאשכול שם המשפחה Ginzburg-Liandres',
      description:
        'הערות ההתאמה מציינות את Landres / Liandres בתוך אשכול שם המשפחה Ginzburg, ולכן שכבת התצוגה יכולה לאחד וריאנטים מבלי לפצל זהויות תצוגה נפרדות.',
      note: 'רמז הקשרי בלבד. הוא תומך בקיבוץ וריאנטים של שם המשפחה, אך אינו מספיק לבדו לשחזור מלא של הענף.',
    },
    'cilia-migration-note': {
      title: 'הערת הגירה ל-Cilia / Tzila',
      description:
        'המידע הקיים מציין לידה בחיפה בתקופת המנדט הבריטי, מוצא משפחתי מאזור Pleshchenitsy, וחזרה לבלרוס סביב 1930.',
      note: 'נשמר כטיפוס הערת מחקר מן שכבת הנתונים הקיימת. יש לקרוא אותו כהקשר ארכיוני, לא כהוכחה עצמאית.',
    },
    'cilia-myheritage-summary': {
      title: 'סיכום עדכון MyHeritage ל-Cilia Sara Duberstein',
      description:
        'סיכום ביקורת מקומית מציין עדכון אחד נוסף הקשור לאחים עבור Cilia Sara Duberstein (Alperovitch), הסבתא האימהית בהקשר ענפי זה.',
      note: 'זהו סיכום מסמך מחקר משני, לא רשומת המקור הראשונית עצמה.',
    },
    'raw-family-structure': {
      title: 'הפניה מבנית לגרף המשפחה',
      description:
        'חבילת הענף שומרת את הגרף הגולמי כפי שהוא, ומעליו מוסיפה תיקוני תצוגה עבור מזהי המשפחה F19 / F71 לצורך סדר בני זוג ופרשנות אחים למחצה.',
    },
    'livnat-report-cross-reference': {
      title: 'הפניה צולבת מדוח Livnat לשמות Ginzburg ו-Duberstein',
      description:
        'הדוח שנוצר כולל צורות שם מקבילות כגון Bashete Basia Ginzburg, Sofia Soshe Duberstein ו-Gershon Grigory Ginzburg, ולכן הוא תומך בקיבוץ וריאנטים לפי כינוי.',
      note: 'שימושי כהפניה לשמות וריאנטים; אין להתייחס אליו כמקור היסטורי ראשוני בפני עצמו.',
    },
  };

  return {
    ...item,
    ...(copy[item.id] || {}),
  } as BranchEvidenceItem;
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
        intro:
          'תצוגת ענף תמציתית למשפחת Ginzburg-Liandres, עם שמות אנגליים מנורמלים, כללי הצגה מתועדים, ומבנה ארכיוני נקי.',
        rootCouple: 'הזוג המרכזי',
        firstMarriage: 'נישואין ראשונים',
        secondMarriage: 'נישואין שניים',
        thirdMarriage: 'נישואין שלישיים',
        firstMarriageTag: 'בן/בת זוג לא ידוע/ה',
        secondMarriageTag: 'צאצאים ביולוגיים',
        thirdMarriageTag: 'שלב־משפחה',
        firstMarriageNote: 'תיקון תצוגה בלבד: במידע הגולמי מופיע "First wife Ginzburg". שם הלידה נותר לא ידוע.',
        thirdMarriageNote:
          'שכבת ההצגה מתעדת את Esther Lipschitz כאישה שלישית, אך בגרף הגולמי עדיין אין רשומת אדם קנונית מקושרת עבורה.',
        maternalLine: 'הקו האימהי',
        maternalChain: 'שרשרת אימהית',
        borisovBranch: 'ענף בוריסוב',
        gershonLine: 'קו Gershon',
        borisovSummary:
          'האשכול הזה מדגיש את ענף בוריסוב, עם התמקדות בקו Gershon ובהקשר המנורמל הקרוב אליו.',
        evidence: 'ראיות',
        evidenceFirst: 'ראיות תחילה',
        relationshipSummary: 'סיכום יחסים',
        presentationRules: 'כללי הצגה',
        typeEmptyLabels: {
          'family-photo': 'עדיין אין תצלום משפחתי מצורף לחבילת הענף.',
          testimony: 'עדיין אין בלוק עדות נוסף ברמת הענף מעבר להערות הקיימות.',
          'video-testimony': 'עדיין אין עדות וידאו נוספת ברמת הענף מעבר לסט העדויות המוכנס.',
          document: 'אין מסמך ענפי נוסף מעבר לסיכום המחקר הקיים.',
          'dna-clue': 'אין רמז DNA נוסף מעבר לרשומות חבילת הענף הקיימות.',
          'external-tree-reference': 'אין בשלב זה הפניה חיצונית נוספת ברמת הענף.',
        } as const,
      }
    : {
        treeLink: 'Family Tree',
        title: 'Ginzburg-Liandres',
        intro:
          'A concise branch view for the Ginzburg-Liandres family, using normalized English names and documented presentation rules.',
        rootCouple: 'Root couple',
        firstMarriage: 'First marriage',
        secondMarriage: 'Second marriage',
        thirdMarriage: 'Third marriage',
        firstMarriageTag: 'Unknown spouse',
        secondMarriageTag: 'Biological children',
        thirdMarriageTag: 'Stepfamily',
        firstMarriageNote: 'Display correction only: raw data currently uses "First wife Ginzburg". Maiden name remains unknown.',
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
          testimony: 'No additional testimony block is attached at branch level beyond current notes.',
          'video-testimony': 'No additional video testimony is attached at branch level beyond the seeded Tzila testimony set.',
          document: 'No further branch document is attached beyond the current research summary.',
          'dna-clue': 'No additional DNA clue is attached beyond the current branch package entries.',
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
                  <p>{family.spouseLabel}</p>
                  {'note' in family && family.note ? (
                    <p className="mt-2 text-xs text-stone-500">
                      {isHebrew && family.label === 'First marriage'
                        ? ui.firstMarriageNote
                        : isHebrew && family.label === 'Third marriage'
                          ? ui.thirdMarriageNote
                          : family.note}
                    </p>
                  ) : null}
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
            <div className="space-y-4">
              {evidenceByType.map(({ type, items }) => (
                <div key={type} className="atlas-card-subtle rounded-2xl px-4 py-3">
                  {items.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {items.map((item) => {
                        const displayItem = translateEvidenceItem(item, isHebrew);
                        return (
                          <BranchEvidenceCard
                            key={item.id}
                            item={displayItem}
                            language={lang}
                            variant="atlas"
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

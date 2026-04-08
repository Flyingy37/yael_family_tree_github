import { Link } from 'react-router-dom';
import { useFamilyData } from '../../../../hooks/useFamilyData';
import { useLang } from '../../layout';
import {
  EVIDENCE_TYPE_ORDER,
  getCanonicalGinzburgLiandresDisplayName,
  getGinzburgLiandresBranchEvidence,
  getGinzburgLiandresBranchSummary,
  getGinzburgLiandresRelationshipOverlay,
  type EvidenceType,
} from '../../../../branches/ginzburgLiandres';
import { ArchivalCard } from '../../../../components/ArchivalCard';
import { EvidenceBadge } from '../../../../components/EvidenceBadge';
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

export default function GinzburgLiandresBranchPage() {
  const { persons } = useFamilyData();
  const { lang } = useLang();
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

  const evidenceByType = EVIDENCE_TYPE_ORDER.map((type) => ({
    type,
    items: branchEvidence.filter((item) => item.type === type),
  }));

  const confidenceLabels: Record<string, string> = {
    direct: 'Direct',
    partial: 'Partial',
    contextual: 'Contextual',
  };

  const typeEmptyLabels: Record<EvidenceType, string> = {
    'family-photo': 'No family photo is attached to this branch package yet.',
    testimony: 'No additional testimony block is attached at branch level beyond current notes.',
    document: 'No further branch document is attached beyond the current research summary.',
    'dna-clue': 'No additional DNA clue is attached beyond the current branch package entries.',
    'external-tree-reference': 'No further external tree or research reference is attached at branch level.',
  };

  return (
    <div className="atlas-page h-full overflow-auto" dir="ltr">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-8">
          <Link to={`/${lang}/tree`} className="atlas-link text-sm">
            Family Tree
          </Link>
          <h1 className="mt-3 text-4xl text-stone-800 font-display-en">Ginzburg-Liandres</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            A concise branch view for the Ginzburg-Liandres family, using normalized English names and documented presentation rules.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="atlas-panel rounded-[1.75rem] p-6">
            <div className="atlas-kicker mb-4">Root couple</div>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full border border-[rgba(130,120,104,0.22)] bg-[rgba(252,250,246,0.98)] px-5 py-2 text-sm text-[var(--atlas-text)]">
                <PersonName
                  personId={rootHusband?.id || null}
                  fallback={renderPersonLabel(rootHusband?.id || null, 'Arie-Leib Ginzburg')}
                  href={rootHusband ? `/${lang}/person/${encodeURIComponent(rootHusband.id)}` : undefined}
                />
              </div>
              <div className="archival-connector-v h-8 my-2" />
              <div className="atlas-node-dot" />
              <div className="archival-connector-v h-8 my-2" />
              <div className="rounded-full border border-[rgba(181,150,132,0.28)] bg-[rgba(244,239,232,0.95)] px-5 py-2 text-sm text-[rgb(128,95,76)]">
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
                  title={family.label}
                  variant="atlas"
                  eyebrow={
                    <RelationshipChip
                      label={formatRelationshipLabel(family.relationshipType)}
                      variant="atlas"
                      tone={family.label === 'Second marriage' ? 'rose' : family.label === 'Third marriage' ? 'violet' : 'stone'}
                    />
                  }
                >
                  <p>{family.spouseLabel}</p>
                  {'note' in family && family.note ? <p className="mt-2 text-xs text-stone-500">{family.note}</p> : null}
                  {'children' in family && family.children ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {family.children.map((id) => {
                        return (
                          <Link
                            key={id}
                            to={`/${lang}/person/${encodeURIComponent(id)}`}
                            className="rounded-full border border-[rgba(130,120,104,0.18)] bg-[rgba(252,250,246,0.92)] px-2.5 py-1 text-xs text-[var(--atlas-text)] hover:bg-[rgba(248,244,236,0.98)]"
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
                        <p key={line} className="text-xs text-stone-500">{line}</p>
                      ))}
                    </div>
                  ) : null}
                </ArchivalCard>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <ArchivalCard title="Maternal line" variant="atlas" eyebrow={<RelationshipChip label="Maternal chain" tone="violet" variant="atlas" />}>
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

            <ArchivalCard title="Borisov branch" variant="atlas" eyebrow={<RelationshipChip label="Gershon line" tone="lime" variant="atlas" />}>
              <p className="text-sm leading-6 text-stone-600">
                This cluster highlights the Borisov-side grouping, centered here on the Gershon line and its immediate normalized branch context.
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
                        className="rounded-full border border-[rgba(130,120,104,0.18)] bg-[rgba(252,250,246,0.92)] px-2.5 py-1 text-xs text-[var(--atlas-text)] hover:bg-[rgba(248,244,236,0.98)]"
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
          <ArchivalCard title="Evidence" variant="atlas" eyebrow={<RelationshipChip label="Evidence-first" tone="rose" variant="atlas" />}>
            <div className="space-y-4">
              {evidenceByType.map(({ type, items }) => (
                <div key={type} className="atlas-card-subtle rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <EvidenceBadge type={type} variant="atlas" />
                  </div>
                  {items.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="border-t border-[rgba(130,120,104,0.12)] pt-3 first:border-t-0 first:pt-0">
                          <div className="text-sm font-medium text-[var(--atlas-text)]">{item.title}</div>
                          <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <RelationshipChip label={confidenceLabels[item.confidence]} tone="stone" variant="atlas" />
                            <span className="text-xs text-stone-500">{item.source}</span>
                          </div>
                          {item.note ? (
                            <p className="mt-2 text-xs text-stone-500">{item.note}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-stone-500">{typeEmptyLabels[type]}</p>
                  )}
                </div>
              ))}
            </div>
          </ArchivalCard>

          <ArchivalCard title="Relationship summary" variant="atlas" eyebrow={<RelationshipChip label="Presentation rules" tone="violet" variant="atlas" />}>
            <ul className="space-y-2">
              {summary.relationshipSummary.map((line) => (
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

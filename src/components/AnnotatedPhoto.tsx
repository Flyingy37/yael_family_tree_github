import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RelationshipChip } from './RelationshipChip';
import type { ImageEvidenceItem } from '../types/genealogy';
import {
  getEvidenceFamilyBranchKeys,
  getFamilyBranchMeta,
  useFamilyColorLegend,
  type FamilyBranchKey,
} from './FamilyColorLegend';

type Props = {
  item: ImageEvidenceItem;
  language: 'en' | 'he';
  variant?: 'default' | 'atlas';
  compact?: boolean;
  resolvePersonLabel?: (personId: string) => string;
  resolvePersonHref?: (personId: string) => string | null | undefined;
};

function buildBranchLabel(branchKey: FamilyBranchKey, language: 'en' | 'he') {
  const meta = getFamilyBranchMeta(branchKey);
  return language === 'he' ? meta.labelHe : meta.labelEn;
}

export function AnnotatedPhoto({
  item,
  language,
  variant = 'atlas',
  compact = false,
  resolvePersonLabel,
  resolvePersonHref,
}: Props) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const isHebrew = language === 'he';
  const legend = useFamilyColorLegend();
  const branchKeys = getEvidenceFamilyBranchKeys(item.id);
  const selectedKey = legend?.activeKey || null;
  const matchesSelected = !selectedKey || branchKeys.includes(selectedKey);
  const shouldDim = Boolean(selectedKey && !matchesSelected);
  const yearText = typeof item.year === 'number' ? String(item.year) : item.yearApprox || null;
  const previewMaxHeight = compact ? 'max-h-44' : 'max-h-56';
  const displayTitle = isHebrew && item.titleHe ? item.titleHe : item.title;
  const displayDescription = isHebrew && item.descriptionHe ? item.descriptionHe : item.description;
  const displayNote = isHebrew && item.noteHe ? item.noteHe : item.note;

  const labels = isHebrew
    ? {
        relatedPeople: 'אנשים קשורים',
        tentativeIdentifications: 'זיהויים משוערים',
        relatedPlaces: 'מקומות קשורים',
        openImage: 'הצג תמונה גדולה',
        hideImage: 'הסתר תמונה גדולה',
        year: 'שנה',
        approxYear: 'שנה משוערת',
        source: 'מקור',
      }
    : {
        relatedPeople: 'Related people',
        tentativeIdentifications: 'Tentative identifications',
        relatedPlaces: 'Related places',
        openImage: 'Open larger image',
        hideImage: 'Hide larger image',
        year: 'Year',
        approxYear: 'Approx. year',
        source: 'Source',
      };

  const confidenceLabels = isHebrew
    ? {
        direct: 'תיעוד ישיר',
        partial: 'תיעוד חלקי',
        contextual: 'תיעוד הקשרי',
      }
    : {
        direct: 'Direct',
        partial: 'Partial',
        contextual: 'Contextual',
      };

  const personLink = (personId: string) => {
    const label = resolvePersonLabel?.(personId) || personId;
    const href = resolvePersonHref?.(personId);
    if (!href) {
      return <span className="font-medium text-[var(--atlas-text)]">{label}</span>;
    }
    return (
      <Link to={href} className="atlas-link font-medium">
        {label}
      </Link>
    );
  };

  const renderPills = (personIds: string[], displayOnlyNames: string[]) => {
    if (personIds.length === 0 && displayOnlyNames.length === 0) return null;
    const displayNamesAreTentative = item.confidence !== 'direct';
    const resolvedLabels = new Set(
      personIds
        .map((personId) => (resolvePersonLabel?.(personId) || personId).trim().toLowerCase())
        .filter(Boolean)
    );
    const visibleDisplayNames = displayOnlyNames.filter((label) => !resolvedLabels.has(label.trim().toLowerCase()));
    const hasLinkedPeople = personIds.length > 0;
    const showRelatedPeopleSection =
      hasLinkedPeople || (visibleDisplayNames.length > 0 && !displayNamesAreTentative);
    return (
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {showRelatedPeopleSection ? (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
              {labels.relatedPeople}
            </div>
            <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
              {personIds.map((personId) => (
                <span
                  key={personId}
                  className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]"
                >
                  {personLink(personId)}
                </span>
              ))}
              {(hasLinkedPeople || !displayNamesAreTentative) && visibleDisplayNames.length > 0
                ? visibleDisplayNames.map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]"
                    >
                      {label}
                    </span>
                  ))
                : null}
            </div>
          </>
        ) : null}
        {!hasLinkedPeople && visibleDisplayNames.length > 0 && displayNamesAreTentative ? (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
              {labels.tentativeIdentifications}
            </div>
            <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
              {visibleDisplayNames.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="atlas-pill rounded-full border-dashed px-2 py-0.5 text-[10px] italic text-stone-500"
                >
                  {label}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const renderPlacePills = (placeIds: string[]) => {
    if (placeIds.length === 0) return null;
    return (
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
          {labels.relatedPlaces}
        </div>
        <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
          {placeIds.map((placeId) => (
            <span key={placeId} className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]">
              {placeId}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={[
        'space-y-2 rounded-2xl border p-3 transition-all duration-200',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0.18))]',
        matchesSelected ? 'border-[rgba(146,133,116,0.16)]' : 'border-[rgba(146,133,116,0.1)]',
        shouldDim ? 'opacity-55 saturate-75' : 'opacity-100',
        matchesSelected && selectedKey ? 'shadow-[0_12px_30px_-28px_rgba(91,82,66,0.35)]' : '',
      ].join(' ')}
      data-branch-keys={branchKeys.join(',')}
      data-highlighted={matchesSelected ? 'true' : 'false'}
    >
      <div className="space-y-1.5">
        <p className={compact ? 'text-xs leading-5 text-[var(--atlas-text)]' : 'text-sm leading-6 text-[var(--atlas-text)]'}>
          {displayDescription}
        </p>
      </div>

      <div className="space-y-2">
        <div className="overflow-hidden rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.46)]">
          <img
            src={item.assetPath}
            alt={displayTitle}
            className={`w-full object-contain bg-[rgba(255,255,255,0.42)] ${previewMaxHeight}`}
            loading="lazy"
            decoding="async"
          />
        </div>
        {branchKeys.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {branchKeys.map((branchKey) => {
              const meta = getFamilyBranchMeta(branchKey);
              const isActive = selectedKey === branchKey;
              return (
                <span
                  key={branchKey}
                  className={[
                    'atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]',
                    isActive ? `border ${meta.ringClass} bg-white/70` : 'border-dashed border-[rgba(146,133,116,0.15)]',
                  ].join(' ')}
                >
                  {buildBranchLabel(branchKey, language)}
                </span>
              );
            })}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsImageOpen((value) => !value)}
          className={`atlas-link inline-flex text-xs ${compact ? 'leading-5' : 'leading-6'}`}
          aria-expanded={isImageOpen}
        >
          {isImageOpen ? labels.hideImage : labels.openImage}
        </button>
        {isImageOpen ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.46)]">
            <img
              src={item.assetPath}
              alt={item.title}
              className="w-full max-h-[70vh] object-contain bg-[rgba(255,255,255,0.42)]"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
      </div>

      <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <RelationshipChip
          label={confidenceLabels[item.confidence]}
          tone={item.confidence === 'direct' ? 'lime' : item.confidence === 'partial' ? 'stone' : 'rose'}
          variant={variant}
        />
        {yearText ? (
          <span className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>
            {item.year ? labels.year : labels.approxYear}: {yearText}
          </span>
        ) : null}
        <span className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>
          {labels.source}: {item.source}
        </span>
      </div>

      {renderPills(item.relatedPersonIds || [], item.relatedPersonDisplayNames || [])}
      {renderPlacePills(item.relatedPlaceIds || [])}

      {displayNote ? <p className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>{displayNote}</p> : null}
    </div>
  );
}

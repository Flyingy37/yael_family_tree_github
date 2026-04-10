import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArchivalCard } from './ArchivalCard';
import { EvidenceBadge } from './EvidenceBadge';
import { RelationshipChip } from './RelationshipChip';
import type { BranchEvidenceItem } from '../branches/ginzburgLiandres';
import type { ImageEvidenceItem } from '../types/genealogy';

type Props = {
  item: BranchEvidenceItem;
  language: 'en' | 'he';
  variant?: 'default' | 'atlas';
  compact?: boolean;
  defaultEmbedOpen?: boolean;
  resolvePersonLabel?: (personId: string) => string;
  resolvePersonHref?: (personId: string) => string | null | undefined;
};

function truncateTranscript(transcript: string, limit: number = 220): string {
  const normalized = transcript.trim();
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit).trimEnd()}…`;
}

export function BranchEvidenceCard({
  item,
  language,
  variant = 'atlas',
  compact = false,
  defaultEmbedOpen = false,
  resolvePersonLabel,
  resolvePersonHref,
}: Props) {
  const [isEmbedOpen, setIsEmbedOpen] = useState(defaultEmbedOpen);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const isHebrew = language === 'he';
  const isImageEvidence =
    item.type === 'family-photo' ||
    item.type === 'portrait' ||
    item.type === 'annotated-photo' ||
    item.type === 'document-scan';
  const labels = isHebrew
    ? {
        speaker: 'דובר/ת',
        relatedPeople: 'אנשים קשורים',
        relatedPlaces: 'מקומות קשורים',
        tentativeIdentifications: 'זיהויים משוערים',
        topics: 'נושאים',
        language: 'שפה',
        year: 'שנה',
        approxYear: 'שנה משוערת',
        openImage: 'הצג תמונה גדולה',
        hideImage: 'הסתר תמונה גדולה',
        transcript: 'תמלול',
        watchOnYoutube: 'צפייה ב-YouTube',
        showEmbed: 'הצג נגן מוטמע',
        hideEmbed: 'הסתר נגן מוטמע',
        noUrl: 'אין קישור וידאו מצורף עדיין.',
        noTranscript: 'אין תמלול מצורף עדיין.',
        source: 'מקור',
      }
    : {
        speaker: 'Speaker',
        relatedPeople: 'Related people',
        relatedPlaces: 'Related places',
        tentativeIdentifications: 'Tentative identifications',
        topics: 'Topics',
        language: 'Language',
        year: 'Year',
        approxYear: 'Approx. year',
        openImage: 'Open larger image',
        hideImage: 'Hide larger image',
        transcript: 'Transcript',
        watchOnYoutube: 'Watch on YouTube',
        showEmbed: 'Show embedded player',
        hideEmbed: 'Hide embedded player',
        noUrl: 'No video URL is attached yet.',
        noTranscript: 'No transcript is attached yet.',
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

  const languageLabels = isHebrew
    ? {
        he: 'עברית',
        en: 'אנגלית',
        mixed: 'מעורב',
      }
    : {
        he: 'Hebrew',
        en: 'English',
        mixed: 'Mixed',
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

  const personPill = (personId: string) => {
    const label = resolvePersonLabel?.(personId) || personId;
    const href = resolvePersonHref?.(personId);
    if (!href) {
      return (
        <span key={personId} className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]">
          {label}
        </span>
      );
    }
    return (
      <Link
        key={personId}
        to={href}
        className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]"
      >
        {label}
      </Link>
    );
  };

  const textPill = (label: string, key: string) => (
    <span
      key={key}
      className="atlas-pill rounded-full border-dashed px-2 py-0.5 text-[10px] italic text-stone-500"
    >
      {label}
    </span>
  );

  const displayTitle = item.type === 'video-testimony' && isHebrew && item.shortTitleHe ? item.shortTitleHe : item.title;

  const formatYear = (image: ImageEvidenceItem) => {
    if (typeof image.year === 'number') return String(image.year);
    if (image.yearApprox) return image.yearApprox;
    return null;
  };

  const renderRelatedPeople = (personIds: string[], displayOnlyNames: string[]) => {
    if (personIds.length === 0 && displayOnlyNames.length === 0) return null;
    return (
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {personIds.length > 0 ? (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
              {labels.relatedPeople}
            </div>
            <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
              {personIds.map(personPill)}
            </div>
          </>
        ) : null}
        {displayOnlyNames.length > 0 ? (
          <>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
              {labels.tentativeIdentifications}
            </div>
            <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
              {displayOnlyNames.map((label, index) => textPill(label, `display-${index}`))}
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const renderImageEvidence = () => {
    if (!isImageEvidence) return null;
    const imageItem = item as ImageEvidenceItem;
    const relatedPersonIds = imageItem.relatedPersonIds || [];
    const relatedPlaceIds = imageItem.relatedPlaceIds || [];
    const relatedPersonDisplayNames = imageItem.relatedPersonDisplayNames || [];
    const yearText = formatYear(imageItem);
    const previewMaxHeight = compact ? 'max-h-44' : 'max-h-56';

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p>{item.description}</p>

        <div className="space-y-2">
          <div className="atlas-card-subtle overflow-hidden rounded-2xl border border-[var(--atlas-border)]">
              <img
              src={imageItem.assetPath}
              alt={imageItem.title}
              className={`w-full object-contain bg-[rgba(255,255,255,0.45)] ${previewMaxHeight}`}
              loading="lazy"
              decoding="async"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsImageOpen((value) => !value)}
            className={`atlas-link inline-flex text-xs ${compact ? 'leading-5' : 'leading-6'}`}
            aria-expanded={isImageOpen}
          >
            {isImageOpen ? labels.hideImage : labels.openImage}
          </button>
          {isImageOpen ? (
            <div className="atlas-card-subtle overflow-hidden rounded-2xl border border-[var(--atlas-border)]">
              <img
                src={imageItem.assetPath}
                alt={imageItem.title}
                className="w-full max-h-[70vh] object-contain bg-[rgba(255,255,255,0.45)]"
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

        {renderRelatedPeople(relatedPersonIds, relatedPersonDisplayNames)}

        {relatedPlaceIds.length > 0 ? (
          <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
              {labels.relatedPlaces}
            </div>
            <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
              {relatedPlaceIds.map((placeId) => (
                <span key={placeId} className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]">
                  {placeId}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {item.note ? <p className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>{item.note}</p> : null}
      </div>
    );
  };

  const renderVideoTestimony = () => {
    if (item.type !== 'video-testimony') return null;
    const transcript = item.transcript?.trim() || '';
    const excerpt = transcript ? truncateTranscript(transcript, compact ? 140 : 220) : '';
    const relatedPersonIds = item.relatedPersonIds || [];
    const relatedPlaceIds = item.relatedPlaceIds || [];
    const topics = item.topics || [];
    const openVideoLink = item.url ? (
      item.url.startsWith('/') ? (
        <Link to={item.url} className={compact ? 'atlas-link inline-flex text-xs' : 'atlas-link inline-flex text-sm'}>
          {labels.watchOnYoutube}
        </Link>
      ) : (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className={compact ? 'atlas-link inline-flex text-xs' : 'atlas-link inline-flex text-sm'}
        >
          {labels.watchOnYoutube}
        </a>
      )
    ) : (
      <p className="text-xs text-stone-500">{labels.noUrl}</p>
    );

    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p>{item.description}</p>

        <div className={`${compact ? 'space-y-1.5' : 'space-y-2'} text-sm text-[var(--atlas-text)]`}>
          <div className={`flex flex-wrap items-start ${compact ? 'gap-1.5' : 'gap-2'}`}>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">{labels.speaker}</span>
            <div>{personLink(item.speakerPersonId)}</div>
          </div>

          {relatedPersonIds.length > 0 ? (
            <div className={`flex flex-wrap items-start ${compact ? 'gap-1.5' : 'gap-2'}`}>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">{labels.relatedPeople}</span>
              <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>{relatedPersonIds.map(personPill)}</div>
            </div>
          ) : null}

          {relatedPlaceIds.length > 0 ? (
            <div className={`flex flex-wrap items-start ${compact ? 'gap-1.5' : 'gap-2'}`}>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">{labels.relatedPlaces}</span>
              <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
                {relatedPlaceIds.map((placeId) => (
                  <span key={placeId} className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]">
                    {placeId}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {topics.length > 0 ? (
            <div className={`flex flex-wrap items-start ${compact ? 'gap-1.5' : 'gap-2'}`}>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">{labels.topics}</span>
              <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
                {topics.map((topic) => (
                  <RelationshipChip key={topic} label={topic} tone="violet" variant={variant} />
                ))}
              </div>
            </div>
          ) : null}

          <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">{labels.language}</span>
            <RelationshipChip label={languageLabels[item.language]} tone="stone" variant={variant} />
          </div>
        </div>

        <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
          <RelationshipChip
            label={confidenceLabels[item.confidence]}
            tone={item.confidence === 'direct' ? 'lime' : item.confidence === 'partial' ? 'stone' : 'rose'}
            variant={variant}
          />
          <span className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>{labels.source}: {item.source}</span>
        </div>

        <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
          {openVideoLink}

          {item.embedUrl ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsEmbedOpen((value) => !value)}
                className={`atlas-link inline-flex text-xs ${compact ? 'leading-5' : 'leading-6'}`}
                aria-expanded={isEmbedOpen}
              >
                {isEmbedOpen ? labels.hideEmbed : labels.showEmbed}
              </button>
              {isEmbedOpen ? (
                <div className="atlas-card-subtle overflow-hidden rounded-2xl border border-[var(--atlas-border)]">
                  <div className="aspect-video">
                    <iframe
                      src={item.embedUrl}
                      title={item.title}
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {transcript ? (
            <details className={`atlas-card-subtle rounded-2xl ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
              <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
                <span>{labels.transcript}</span>
                <span className={`${compact ? 'ml-1.5' : 'ml-2'} text-[11px] normal-case tracking-normal text-stone-600`}>{excerpt}</span>
              </summary>
              <p className={`mt-3 whitespace-pre-wrap ${compact ? 'text-xs leading-5' : 'text-sm leading-6'} text-stone-600`}>{transcript}</p>
            </details>
          ) : (
            <p className="text-xs text-stone-500">{labels.noTranscript}</p>
          )}
        </div>

        {item.note ? <p className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>{item.note}</p> : null}
      </div>
    );
  };

  const renderGenericEvidence = () => (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <p>{item.description}</p>
      <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <RelationshipChip
          label={confidenceLabels[item.confidence]}
          tone={item.confidence === 'direct' ? 'lime' : item.confidence === 'partial' ? 'stone' : 'rose'}
          variant={variant}
        />
        <span className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>{labels.source}: {item.source}</span>
      </div>
      {item.note ? <p className={compact ? 'text-[11px] text-stone-500' : 'text-xs text-stone-500'}>{item.note}</p> : null}
    </div>
  );

  return (
    <div id={item.id} className="scroll-mt-24">
      <ArchivalCard
        title={displayTitle}
        variant={variant}
        eyebrow={<EvidenceBadge type={item.type} variant={variant} language={language} />}
      >
        {isImageEvidence ? renderImageEvidence() : item.type === 'video-testimony' ? renderVideoTestimony() : renderGenericEvidence()}
      </ArchivalCard>
    </div>
  );
}
